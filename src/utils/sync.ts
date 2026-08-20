import { Team, Player, Match, TournamentInfo } from '../types';

// Channel for instant Cross-Tab / Multi-Window Realtime Synchronization
const SYNC_CHANNEL_NAME = 'npl_tournament_sync_channel';

export interface SyncPayload {
  type: 'SYNC_ALL' | 'UPDATE_TEAMS' | 'UPDATE_PLAYERS' | 'UPDATE_MATCHES' | 'UPDATE_INFO' | 'UPDATE_PIN';
  teams?: Team[];
  players?: Player[];
  matches?: Match[];
  tournamentInfo?: TournamentInfo;
  adminPin?: string;
  senderId: string;
  timestamp: number;
  version?: number;
}

// Generate unique sender ID per browser tab session
export const TAB_SESSION_ID = `tab-${Math.random().toString(36).substring(2, 9)}-${Date.now()}`;

let broadcastChannel: BroadcastChannel | null = null;
try {
  if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
    broadcastChannel = new BroadcastChannel(SYNC_CHANNEL_NAME);
  }
} catch {
  broadcastChannel = null;
}

// Track current state version locally
let currentGlobalVersion = 0;

// Debounce timer for server sync to avoid spamming on high-frequency changes
let syncTimeout: any = null;
let pendingSyncPayload: Partial<SyncPayload> | null = null;

/**
 * Sends state to central server so ALL public viewers and users on ANY device get updated instantly
 */
async function pushStateToServer(payload: Omit<SyncPayload, 'senderId' | 'timestamp'>) {
  try {
    const response = await fetch('/api/sync', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...payload,
        senderId: TAB_SESSION_ID,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      if (data.version) {
        currentGlobalVersion = data.version;
      }
    }
  } catch (err) {
    console.warn('[SYNC] Server push error (will retry on next event):', err);
  }
}

/**
 * Broadcasts state changes to all other open tabs AND persists to the centralized server for public viewers
 */
export function broadcastStateChange(payload: Omit<SyncPayload, 'senderId' | 'timestamp'>) {
  const fullPayload: SyncPayload = {
    ...payload,
    senderId: TAB_SESSION_ID,
    timestamp: Date.now(),
  };

  // 1. Instant local BroadcastChannel for open tabs on the same machine
  if (broadcastChannel) {
    try {
      broadcastChannel.postMessage(fullPayload);
    } catch (e) {
      console.warn('BroadcastChannel failed:', e);
    }
  }

  // 2. Backup trigger via localStorage for older browsers
  try {
    localStorage.setItem(
      'gp_sync_ping',
      JSON.stringify({
        timestamp: Date.now(),
        senderId: TAB_SESSION_ID,
        type: payload.type,
      })
    );
  } catch {}

  // 3. Central Server Push: Queue and flush to `/api/sync` so all public viewers on ANY mobile/PC get the update immediately
  pendingSyncPayload = { ...pendingSyncPayload, ...payload };
  if (syncTimeout) clearTimeout(syncTimeout);
  
  syncTimeout = setTimeout(() => {
    if (pendingSyncPayload) {
      pushStateToServer(pendingSyncPayload as any);
      pendingSyncPayload = null;
    }
  }, 100);
}

/**
 * Fetches the latest global state from the server on startup or reconnection
 */
export async function fetchInitialServerState(): Promise<Partial<SyncPayload> | null> {
  try {
    const res = await fetch('/api/state');
    if (!res.ok) return null;
    const data = await res.json();
    if (data && data.version) {
      currentGlobalVersion = data.version;
      return {
        type: 'SYNC_ALL',
        teams: data.teams && data.teams.length > 0 ? data.teams : undefined,
        players: data.players && data.players.length > 0 ? data.players : undefined,
        matches: data.matches && data.matches.length > 0 ? data.matches : undefined,
        tournamentInfo: data.tournamentInfo || undefined,
        adminPin: data.adminPin || undefined,
        version: data.version,
        senderId: 'server-initial',
        timestamp: data.lastUpdated || Date.now(),
      };
    }
  } catch (err) {
    console.warn('[SYNC] Error fetching initial server state:', err);
  }
  return null;
}

/**
 * Subscribes to real-time updates from Server (SSE stream) + Polling fallback + Cross-tab BroadcastChannel
 */
export function subscribeToStateSync(onSyncReceived: (payload: SyncPayload) => void) {
  if (typeof window === 'undefined') return () => {};

  let eventSource: EventSource | null = null;
  let pollInterval: any = null;
  let isSubscribed = true;

  // 📡 1. Real-Time Server-Sent Events (SSE) stream for instant updates across all devices
  function setupSSE() {
    try {
      if (typeof EventSource !== 'undefined') {
        eventSource = new EventSource('/api/stream');

        eventSource.onmessage = (event) => {
          if (!isSubscribed || !event.data) return;
          try {
            const data = JSON.parse(event.data);
            if (data.senderId === TAB_SESSION_ID) return; // ignore our own broadcast
            
            if (data.version && data.version <= currentGlobalVersion && data.senderId !== 'initial_sync') {
              return;
            }

            if (data.version) {
              currentGlobalVersion = data.version;
            }

            onSyncReceived({
              type: 'SYNC_ALL',
              teams: data.teams,
              players: data.players,
              matches: data.matches,
              tournamentInfo: data.tournamentInfo,
              adminPin: data.adminPin,
              senderId: data.senderId || 'sse-server',
              timestamp: data.lastUpdated || Date.now(),
              version: data.version,
            });
          } catch (e) {
            console.error('[SSE] Parse error:', e);
          }
        };

        eventSource.onerror = () => {
          // If SSE encounters temporary issue, it automatically tries to reconnect.
        };
      }
    } catch (e) {
      console.warn('[SSE] Setup failed, relying on fast polling:', e);
    }
  }

  setupSSE();

  // 🔄 2. Fast Polling Fallback (every 2.5 seconds) to ensure 100% reliability across all network conditions
  pollInterval = setInterval(async () => {
    if (!isSubscribed) return;
    try {
      const res = await fetch(`/api/state?v=${currentGlobalVersion}`);
      if (res.ok) {
        const data = await res.json();
        if (data.changed && data.version > currentGlobalVersion) {
          currentGlobalVersion = data.version;
          onSyncReceived({
            type: 'SYNC_ALL',
            teams: data.teams,
            players: data.players,
            matches: data.matches,
            tournamentInfo: data.tournamentInfo,
            adminPin: data.adminPin,
            senderId: 'poll-server',
            timestamp: data.lastUpdated || Date.now(),
            version: data.version,
          });
        }
      }
    } catch {}
  }, 2500);

  // ⚡ 3. Cross-Tab Broadcast Channel (Zero Latency on same device)
  const handleBroadcastMessage = (event: MessageEvent<SyncPayload>) => {
    if (!event.data || event.data.senderId === TAB_SESSION_ID) return;
    onSyncReceived(event.data);
  };

  const handleStorageEvent = (event: StorageEvent) => {
    if (!event.key || !event.newValue) return;

    if (
      event.key === 'gp_teams' ||
      event.key === 'gp_players' ||
      event.key === 'gp_matches' ||
      event.key === 'gp_tournament_info' ||
      event.key === 'gp_admin_pin' ||
      event.key === 'gp_sync_ping'
    ) {
      try {
        const teams = JSON.parse(localStorage.getItem('gp_teams') || '[]');
        const players = JSON.parse(localStorage.getItem('gp_players') || '[]');
        const matches = JSON.parse(localStorage.getItem('gp_matches') || '[]');
        const tournamentInfo = JSON.parse(localStorage.getItem('gp_tournament_info') || '{}');
        const adminPin = localStorage.getItem('gp_admin_pin') || '1234';

        onSyncReceived({
          type: 'SYNC_ALL',
          teams,
          players,
          matches,
          tournamentInfo,
          adminPin,
          senderId: 'storage-event',
          timestamp: Date.now(),
        });
      } catch (e) {
        console.error('Storage sync error:', e);
      }
    }
  };

  if (broadcastChannel) {
    broadcastChannel.addEventListener('message', handleBroadcastMessage);
  }
  window.addEventListener('storage', handleStorageEvent);

  return () => {
    isSubscribed = false;
    if (eventSource) {
      eventSource.close();
      eventSource = null;
    }
    if (pollInterval) {
      clearInterval(pollInterval);
      pollInterval = null;
    }
    if (broadcastChannel) {
      broadcastChannel.removeEventListener('message', handleBroadcastMessage);
    }
    window.removeEventListener('storage', handleStorageEvent);
  };
}

/**
 * Cascades Player edits across Match Events, POTM, and Squads everywhere
 */
export function cascadePlayerUpdate(
  updatedPlayer: Player,
  players: Player[],
  matches: Match[]
): { updatedPlayers: Player[]; updatedMatches: Match[] } {
  // 1. Update player in players list
  const exists = players.some((p) => p.id === updatedPlayer.id);
  const updatedPlayers = exists
    ? players.map((p) => (p.id === updatedPlayer.id ? updatedPlayer : p))
    : [...players, updatedPlayer];

  // 2. Cascade player name and team across all match events & POTM awards
  const updatedMatches = matches.map((match) => {
    let matchChanged = false;

    // Update match events containing this player
    const updatedEvents = match.events.map((event) => {
      let evChanged = false;
      let newEvent = { ...event };

      if (event.playerId === updatedPlayer.id) {
        newEvent.playerName = updatedPlayer.name;
        newEvent.teamId = updatedPlayer.teamId;
        evChanged = true;
      }
      if (event.assistPlayerId === updatedPlayer.id) {
        newEvent.assistPlayerName = updatedPlayer.name;
        evChanged = true;
      }
      if (event.subOutPlayerId === updatedPlayer.id) {
        newEvent.subOutPlayerName = updatedPlayer.name;
        evChanged = true;
      }

      if (evChanged) matchChanged = true;
      return newEvent;
    });

    // Update POTM name if this player is POTM
    let newPotmName = match.potmPlayerName;
    if (match.potmPlayerId === updatedPlayer.id) {
      newPotmName = updatedPlayer.name;
      matchChanged = true;
    }

    if (matchChanged) {
      return {
        ...match,
        events: updatedEvents,
        potmPlayerName: newPotmName,
      };
    }
    return match;
  });

  return { updatedPlayers, updatedMatches };
}

/**
 * Re-evaluates player statistics from all match events to ensure 100% mathematical integrity across all tabs
 */
export function recalculatePlayerStatsFromMatches(players: Player[], matches: Match[]): Player[] {
  // Map of stats by player ID
  const stats = new Map<
    string,
    {
      goals: number;
      assists: number;
      yellowCards: number;
      redCards: number;
      fouls: number;
      saves: number;
      potmAwards: number;
      matchesPlayedSet: Set<string>;
    }
  >();

  // Initialize for all existing players
  players.forEach((p) => {
    stats.set(p.id, {
      goals: 0,
      assists: 0,
      yellowCards: 0,
      redCards: 0,
      fouls: 0,
      saves: 0,
      potmAwards: 0,
      matchesPlayedSet: new Set<string>(),
    });
  });

  // Calculate from all match events and completed/live matches
  matches.forEach((match) => {
    if (match.status !== 'UPCOMING') {
      // Collect players who participated in events
      match.events.forEach((ev) => {
        if (ev.playerId && stats.has(ev.playerId)) {
          const s = stats.get(ev.playerId)!;
          s.matchesPlayedSet.add(match.id);

          if (ev.type === 'GOAL' || ev.type === 'PENALTY_GOAL') {
            s.goals += 1;
          } else if (ev.type === 'YELLOW_CARD') {
            s.yellowCards += 1;
          } else if (ev.type === 'RED_CARD' || ev.type === 'SECOND_YELLOW_RED') {
            s.redCards += 1;
          } else if (ev.type === 'FOUL') {
            s.fouls += 1;
          } else if (ev.type === 'SAVE') {
            s.saves += 1;
          }
        }

        if (ev.assistPlayerId && stats.has(ev.assistPlayerId)) {
          const s = stats.get(ev.assistPlayerId)!;
          s.assists += 1;
          s.matchesPlayedSet.add(match.id);
        }
      });

      // POTM count
      if (match.potmPlayerId && stats.has(match.potmPlayerId)) {
        stats.get(match.potmPlayerId)!.potmAwards += 1;
      }
    }
  });

  // Apply to players (retaining purchasePrice, position, bio, etc.)
  return players.map((p) => {
    const s = stats.get(p.id);
    if (!s) return p;

    // Use calculated values, with fallback to current if greater (in case manually inputted)
    return {
      ...p,
      goals: Math.max(p.goals || 0, s.goals),
      assists: Math.max(p.assists || 0, s.assists),
      yellowCards: Math.max(p.yellowCards || 0, s.yellowCards),
      redCards: Math.max(p.redCards || 0, s.redCards),
      fouls: Math.max(p.fouls || 0, s.fouls),
      saves: Math.max(p.saves || 0, s.saves),
      potmAwards: Math.max(p.potmAwards || 0, s.potmAwards),
      matchesPlayed: Math.max(p.matchesPlayed || 0, s.matchesPlayedSet.size),
    };
  });
}

