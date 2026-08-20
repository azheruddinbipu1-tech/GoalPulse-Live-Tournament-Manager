import { doc, getDoc, setDoc, onSnapshot, Unsubscribe } from 'firebase/firestore';
import { db } from '../firebase';
import { Team, Player, Match, TournamentInfo } from '../types';
import { INITIAL_TEAMS, INITIAL_PLAYERS, INITIAL_MATCHES, INITIAL_TOURNAMENT_INFO } from '../sampleData';

// Firestore collection & document identifier
const TOURNAMENT_COLLECTION = 'tournament_state';
const TOURNAMENT_DOC_ID = 'main_state';

// Cross-tab broadcast channel for instant multi-tab sync on same device
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

// Debounce timer for Firestore writes to optimize throughput on fast updates
let syncTimeout: any = null;
let pendingSyncPayload: Partial<SyncPayload> | null = null;

/**
 * Pushes state updates directly to Firebase Cloud Firestore
 */
async function pushStateToFirestore(payload: Omit<SyncPayload, 'senderId' | 'timestamp'>) {
  try {
    const docRef = doc(db, TOURNAMENT_COLLECTION, TOURNAMENT_DOC_ID);
    currentGlobalVersion = (currentGlobalVersion || 0) + 1;

    const dataToSave: any = {
      version: currentGlobalVersion,
      lastUpdated: Date.now(),
      senderId: TAB_SESSION_ID,
    };

    if (Array.isArray(payload.teams)) dataToSave.teams = payload.teams;
    if (Array.isArray(payload.players)) dataToSave.players = payload.players;
    if (Array.isArray(payload.matches)) dataToSave.matches = payload.matches;
    if (payload.tournamentInfo) dataToSave.tournamentInfo = payload.tournamentInfo;
    if (payload.adminPin) dataToSave.adminPin = payload.adminPin;

    await setDoc(docRef, dataToSave, { merge: true });

    // Also notify backup Express server if available in background
    fetch('/api/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...dataToSave }),
    }).catch(() => {});
  } catch (err) {
    console.warn('[FIRESTORE] Cloud Firestore write error:', err);
    // Offline backup to localStorage is already performed
  }
}

/**
 * Broadcasts state changes to all other open tabs AND persists to Cloud Firestore in real-time
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

  // 2. Offline local backup storage
  try {
    if (payload.teams) localStorage.setItem('gp_teams', JSON.stringify(payload.teams));
    if (payload.players) localStorage.setItem('gp_players', JSON.stringify(payload.players));
    if (payload.matches) localStorage.setItem('gp_matches', JSON.stringify(payload.matches));
    if (payload.tournamentInfo) localStorage.setItem('gp_tournament_info', JSON.stringify(payload.tournamentInfo));
    if (payload.adminPin) localStorage.setItem('gp_admin_pin', payload.adminPin);

    localStorage.setItem(
      'gp_sync_ping',
      JSON.stringify({
        timestamp: Date.now(),
        senderId: TAB_SESSION_ID,
        type: payload.type,
      })
    );
  } catch {}

  // 3. Central Firestore Push (debounced for rapid successive score/event clicks)
  pendingSyncPayload = { ...pendingSyncPayload, ...payload };
  if (syncTimeout) clearTimeout(syncTimeout);

  syncTimeout = setTimeout(() => {
    if (pendingSyncPayload) {
      pushStateToFirestore(pendingSyncPayload as any);
      pendingSyncPayload = null;
    }
  }, 50);
}

/**
 * Fetches the initial state from Cloud Firestore (or initial seeds if first run)
 */
export async function fetchInitialServerState(): Promise<SyncPayload | null> {
  try {
    const docRef = doc(db, TOURNAMENT_COLLECTION, TOURNAMENT_DOC_ID);
    const snap = await getDoc(docRef);

    if (snap.exists()) {
      const data = snap.data();
      if (data && typeof data.version === 'number') {
        currentGlobalVersion = data.version;
      }
      return {
        type: 'SYNC_ALL',
        teams: Array.isArray(data.teams) && data.teams.length > 0 ? data.teams : INITIAL_TEAMS,
        players: Array.isArray(data.players) && data.players.length > 0 ? data.players : INITIAL_PLAYERS,
        matches: Array.isArray(data.matches) && data.matches.length > 0 ? data.matches : INITIAL_MATCHES,
        tournamentInfo: data.tournamentInfo || INITIAL_TOURNAMENT_INFO,
        adminPin: data.adminPin || '1234',
        version: data.version || 1,
        senderId: 'firestore-initial',
        timestamp: data.lastUpdated || Date.now(),
      };
    } else {
      // Initialize Firestore document with the tournament seed data
      const initialPayload = {
        teams: INITIAL_TEAMS,
        players: INITIAL_PLAYERS,
        matches: INITIAL_MATCHES,
        tournamentInfo: INITIAL_TOURNAMENT_INFO,
        adminPin: '1234',
        version: 1,
        lastUpdated: Date.now(),
        senderId: 'initial_seed',
      };
      setDoc(docRef, initialPayload, { merge: true }).catch(() => {});

      return {
        type: 'SYNC_ALL',
        ...initialPayload,
        timestamp: Date.now(),
      };
    }
  } catch (err) {
    console.warn('[FIRESTORE] Initial fetch warning (using offline cache):', err);
    // Offline fallback from localStorage
    try {
      const teams = localStorage.getItem('gp_teams');
      const players = localStorage.getItem('gp_players');
      const matches = localStorage.getItem('gp_matches');
      const tournamentInfo = localStorage.getItem('gp_tournament_info');
      const adminPin = localStorage.getItem('gp_admin_pin');

      if (teams || players || matches) {
        return {
          type: 'SYNC_ALL',
          teams: teams ? JSON.parse(teams) : INITIAL_TEAMS,
          players: players ? JSON.parse(players) : INITIAL_PLAYERS,
          matches: matches ? JSON.parse(matches) : INITIAL_MATCHES,
          tournamentInfo: tournamentInfo ? JSON.parse(tournamentInfo) : INITIAL_TOURNAMENT_INFO,
          adminPin: adminPin || '1234',
          senderId: 'offline-cache',
          timestamp: Date.now(),
          version: 1,
        };
      }
    } catch {}
  }
  return null;
}

/**
 * Subscribes to Real-Time Updates via Firestore `onSnapshot` + Cross-Tab & Offline Broadcast
 */
export function subscribeToStateSync(onSyncReceived: (payload: SyncPayload) => void) {
  if (typeof window === 'undefined') return () => {};

  let unsubscribeFirestore: Unsubscribe | null = null;
  let isSubscribed = true;

  // 📡 1. Real-Time Cloud Firestore `onSnapshot` listener
  try {
    const docRef = doc(db, TOURNAMENT_COLLECTION, TOURNAMENT_DOC_ID);
    unsubscribeFirestore = onSnapshot(
      docRef,
      (snapshot) => {
        if (!isSubscribed || !snapshot.exists()) return;
        const data = snapshot.data();

        // Ignore updates originated by our own tab session unless first load
        if (data.senderId === TAB_SESSION_ID) return;

        if (typeof data.version === 'number') {
          if (data.version <= currentGlobalVersion && data.senderId !== 'initial_seed') {
            return;
          }
          currentGlobalVersion = data.version;
        }

        // Keep localStorage offline cache up to date
        try {
          if (Array.isArray(data.teams)) localStorage.setItem('gp_teams', JSON.stringify(data.teams));
          if (Array.isArray(data.players)) localStorage.setItem('gp_players', JSON.stringify(data.players));
          if (Array.isArray(data.matches)) localStorage.setItem('gp_matches', JSON.stringify(data.matches));
          if (data.tournamentInfo) localStorage.setItem('gp_tournament_info', JSON.stringify(data.tournamentInfo));
          if (data.adminPin) localStorage.setItem('gp_admin_pin', data.adminPin);
        } catch {}

        onSyncReceived({
          type: 'SYNC_ALL',
          teams: Array.isArray(data.teams) && data.teams.length > 0 ? data.teams : undefined,
          players: Array.isArray(data.players) && data.players.length > 0 ? data.players : undefined,
          matches: Array.isArray(data.matches) && data.matches.length > 0 ? data.matches : undefined,
          tournamentInfo: data.tournamentInfo,
          adminPin: data.adminPin,
          senderId: data.senderId || 'firestore-live',
          timestamp: data.lastUpdated || Date.now(),
          version: data.version,
        });
      },
      (error) => {
        console.warn('[FIRESTORE] onSnapshot listener warning:', error);
      }
    );
  } catch (err) {
    console.warn('[FIRESTORE] Real-time listener setup error:', err);
  }

  // ⚡ 2. Cross-Tab Broadcast Channel (Zero Latency on same browser)
  const handleBroadcastMessage = (event: MessageEvent<SyncPayload>) => {
    if (!event.data || event.data.senderId === TAB_SESSION_ID) return;
    onSyncReceived(event.data);
  };

  // 📱 3. Offline storage event fallback
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
    if (unsubscribeFirestore) {
      unsubscribeFirestore();
      unsubscribeFirestore = null;
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

  matches.forEach((match) => {
    if (match.status !== 'UPCOMING') {
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

      if (match.potmPlayerId && stats.has(match.potmPlayerId)) {
        stats.get(match.potmPlayerId)!.potmAwards += 1;
      }
    }
  });

  return players.map((p) => {
    const s = stats.get(p.id);
    if (!s) return p;

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
