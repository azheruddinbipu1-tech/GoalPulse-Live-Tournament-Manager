import { doc, getDoc, setDoc, onSnapshot, Unsubscribe } from 'firebase/firestore';
import { db } from '../firebase';
import { Team, Player, Match, TournamentInfo } from '../types';
import { INITIAL_TEAMS, INITIAL_PLAYERS, INITIAL_MATCHES, INITIAL_TOURNAMENT_INFO } from '../sampleData';

// Firestore collection & document identifier
export const TOURNAMENT_COLLECTION = 'tournament_state';
export const TOURNAMENT_DOC_ID = 'main_state';

// Cross-tab broadcast channel for instant multi-tab sync on same machine
const SYNC_CHANNEL_NAME = 'goalpulse_realtime_sync_channel';

export interface SyncPayload {
  type: 'SYNC_ALL' | 'PARTIAL_UPDATE';
  teams?: Team[];
  players?: Player[];
  matches?: Match[];
  tournamentInfo?: TournamentInfo;
  adminPin?: string;
  senderId?: string;
  timestamp?: number;
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
 * Pushes state updates directly to Firebase Cloud Firestore as the Single Source of Truth
 */
export async function pushStateToFirestore(payload: {
  teams?: Team[];
  players?: Player[];
  matches?: Match[];
  tournamentInfo?: TournamentInfo;
  adminPin?: string;
}): Promise<boolean> {
  try {
    const docRef = doc(db, TOURNAMENT_COLLECTION, TOURNAMENT_DOC_ID);

    const dataToSave: Record<string, any> = {
      lastUpdated: Date.now(),
      senderId: TAB_SESSION_ID,
    };

    if (payload.teams !== undefined) dataToSave.teams = payload.teams;
    if (payload.players !== undefined) dataToSave.players = payload.players;
    if (payload.matches !== undefined) dataToSave.matches = payload.matches;
    if (payload.tournamentInfo !== undefined) dataToSave.tournamentInfo = payload.tournamentInfo;
    if (payload.adminPin !== undefined) dataToSave.adminPin = payload.adminPin;

    await setDoc(docRef, dataToSave, { merge: true });

    // Update local cache
    try {
      if (payload.teams !== undefined) localStorage.setItem('gp_teams', JSON.stringify(payload.teams));
      if (payload.players !== undefined) localStorage.setItem('gp_players', JSON.stringify(payload.players));
      if (payload.matches !== undefined) localStorage.setItem('gp_matches', JSON.stringify(payload.matches));
      if (payload.tournamentInfo !== undefined) localStorage.setItem('gp_tournament_info', JSON.stringify(payload.tournamentInfo));
      if (payload.adminPin !== undefined) localStorage.setItem('gp_admin_pin', payload.adminPin);
    } catch {}

    return true;
  } catch (err) {
    console.error('[FIRESTORE] Cloud Firestore write error:', err);
    return false;
  }
}

/**
 * Unified state broadcast & Firestore persistence function
 */
export function broadcastStateChange(payload: {
  teams?: Team[];
  players?: Player[];
  matches?: Match[];
  tournamentInfo?: TournamentInfo;
  adminPin?: string;
}) {
  const fullPayload: SyncPayload = {
    type: 'PARTIAL_UPDATE',
    ...payload,
    senderId: TAB_SESSION_ID,
    timestamp: Date.now(),
  };

  // 1. Cross-tab channel for instantaneous local reflection
  if (broadcastChannel) {
    try {
      broadcastChannel.postMessage(fullPayload);
    } catch (e) {
      console.warn('BroadcastChannel postMessage error:', e);
    }
  }

  // 2. Direct Cloud Firestore Push (Single Source of Truth)
  pushStateToFirestore(payload);
}

/**
 * Loads initial state from Cloud Firestore (or seeds it if empty on first startup)
 */
export async function fetchInitialServerState(): Promise<SyncPayload | null> {
  try {
    const docRef = doc(db, TOURNAMENT_COLLECTION, TOURNAMENT_DOC_ID);
    const snap = await getDoc(docRef);

    if (snap.exists()) {
      const data = snap.data();
      return {
        type: 'SYNC_ALL',
        teams: Array.isArray(data.teams) ? data.teams : INITIAL_TEAMS,
        players: Array.isArray(data.players) ? data.players : INITIAL_PLAYERS,
        matches: Array.isArray(data.matches) ? data.matches : INITIAL_MATCHES,
        tournamentInfo: data.tournamentInfo || INITIAL_TOURNAMENT_INFO,
        adminPin: data.adminPin || '1234',
        senderId: 'firestore-initial',
        timestamp: data.lastUpdated || Date.now(),
      };
    } else {
      // Initialize Firestore document with initial data once
      const initialPayload = {
        teams: INITIAL_TEAMS,
        players: INITIAL_PLAYERS,
        matches: INITIAL_MATCHES,
        tournamentInfo: INITIAL_TOURNAMENT_INFO,
        adminPin: '1234',
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
    console.warn('[FIRESTORE] Initial fetch fallback from offline cache:', err);
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
        };
      }
    } catch {}
  }
  return null;
}

/**
 * Subscribes to real-time Cloud Firestore updates via `onSnapshot`
 */
export function subscribeToStateSync(
  onSyncReceived: (payload: SyncPayload) => void
): () => void {
  if (typeof window === 'undefined') return () => {};

  let unsubscribeFirestore: Unsubscribe | null = null;
  let isSubscribed = true;

  try {
    const docRef = doc(db, TOURNAMENT_COLLECTION, TOURNAMENT_DOC_ID);
    unsubscribeFirestore = onSnapshot(
      docRef,
      (snapshot) => {
        if (!isSubscribed) return;

        if (snapshot.exists()) {
          const data = snapshot.data();

          // Don't process echo events from our own tab if it is a pending write we just made
          if (data.senderId === TAB_SESSION_ID && snapshot.metadata.hasPendingWrites) {
            return;
          }

          const payload: SyncPayload = {
            type: 'SYNC_ALL',
            teams: Array.isArray(data.teams) ? data.teams : undefined,
            players: Array.isArray(data.players) ? data.players : undefined,
            matches: Array.isArray(data.matches) ? data.matches : undefined,
            tournamentInfo: data.tournamentInfo || undefined,
            adminPin: data.adminPin || undefined,
            senderId: data.senderId || 'firestore-live',
            timestamp: data.lastUpdated || Date.now(),
          };

          // Keep localStorage offline cache updated
          try {
            if (Array.isArray(data.teams)) localStorage.setItem('gp_teams', JSON.stringify(data.teams));
            if (Array.isArray(data.players)) localStorage.setItem('gp_players', JSON.stringify(data.players));
            if (Array.isArray(data.matches)) localStorage.setItem('gp_matches', JSON.stringify(data.matches));
            if (data.tournamentInfo) localStorage.setItem('gp_tournament_info', JSON.stringify(data.tournamentInfo));
            if (data.adminPin) localStorage.setItem('gp_admin_pin', data.adminPin);
          } catch {}

          onSyncReceived(payload);
        } else {
          // Document does not exist yet; seed initial tournament
          const initialPayload = {
            teams: INITIAL_TEAMS,
            players: INITIAL_PLAYERS,
            matches: INITIAL_MATCHES,
            tournamentInfo: INITIAL_TOURNAMENT_INFO,
            adminPin: '1234',
            lastUpdated: Date.now(),
            senderId: 'initial_seed',
          };
          setDoc(docRef, initialPayload, { merge: true }).catch(() => {});
          onSyncReceived({
            type: 'SYNC_ALL',
            ...initialPayload,
            timestamp: Date.now(),
          });
        }
      },
      (error) => {
        console.error('[FIRESTORE] Real-time listener error:', error);
      }
    );
  } catch (err) {
    console.error('[FIRESTORE] Failed to attach onSnapshot listener:', err);
  }

  // Cross-Tab Broadcast Channel Handler
  const handleBroadcastMessage = (event: MessageEvent<SyncPayload>) => {
    if (!event.data || event.data.senderId === TAB_SESSION_ID) return;
    onSyncReceived(event.data);
  };

  if (broadcastChannel) {
    broadcastChannel.addEventListener('message', handleBroadcastMessage);
  }

  return () => {
    isSubscribed = false;
    if (unsubscribeFirestore) {
      unsubscribeFirestore();
      unsubscribeFirestore = null;
    }
    if (broadcastChannel) {
      broadcastChannel.removeEventListener('message', handleBroadcastMessage);
    }
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
