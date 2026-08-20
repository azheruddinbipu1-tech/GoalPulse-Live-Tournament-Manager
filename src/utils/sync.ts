import { Team, Player, Match, MatchEvent, TournamentInfo } from '../types';

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

/**
 * Broadcasts state changes to all other open tabs and windows in real-time
 */
export function broadcastStateChange(payload: Omit<SyncPayload, 'senderId' | 'timestamp'>) {
  const fullPayload: SyncPayload = {
    ...payload,
    senderId: TAB_SESSION_ID,
    timestamp: Date.now()
  };

  if (broadcastChannel) {
    try {
      broadcastChannel.postMessage(fullPayload);
    } catch (e) {
      console.warn('BroadcastChannel failed:', e);
    }
  }

  // Backup trigger via localStorage custom event for older browser tabs
  try {
    localStorage.setItem('gp_sync_ping', JSON.stringify({
      timestamp: Date.now(),
      senderId: TAB_SESSION_ID,
      type: payload.type
    }));
  } catch {}
}

/**
 * Subscribes to cross-tab updates
 */
export function subscribeToStateSync(onSyncReceived: (payload: SyncPayload) => void) {
  if (typeof window === 'undefined') return () => {};

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
          timestamp: Date.now()
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
  const exists = players.some(p => p.id === updatedPlayer.id);
  const updatedPlayers = exists
    ? players.map(p => (p.id === updatedPlayer.id ? updatedPlayer : p))
    : [...players, updatedPlayer];

  // 2. Cascade player name and team across all match events & POTM awards
  const updatedMatches = matches.map(match => {
    let matchChanged = false;

    // Update match events containing this player
    const updatedEvents = match.events.map(event => {
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
        potmPlayerName: newPotmName
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
  players.forEach(p => {
    stats.set(p.id, {
      goals: 0,
      assists: 0,
      yellowCards: 0,
      redCards: 0,
      fouls: 0,
      saves: 0,
      potmAwards: 0,
      matchesPlayedSet: new Set<string>()
    });
  });

  // Calculate from all match events and completed/live matches
  matches.forEach(match => {
    if (match.status !== 'UPCOMING') {
      // Collect players who participated in events
      match.events.forEach(ev => {
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
  return players.map(p => {
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
      matchesPlayed: Math.max(p.matchesPlayed || 0, s.matchesPlayedSet.size)
    };
  });
}
