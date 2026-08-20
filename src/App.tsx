import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Team, 
  Player, 
  Match, 
  MatchEvent, 
  StandingRow, 
  MatchStatus,
  TournamentInfo
} from './types';
import { 
  INITIAL_TEAMS, 
  INITIAL_PLAYERS, 
  INITIAL_MATCHES, 
  INITIAL_TOURNAMENT_INFO,
  DEMO_TEAMS, 
  DEMO_PLAYERS, 
  DEMO_MATCHES 
} from './sampleData';
import { Navbar, TabType } from './components/Navbar';
import { LiveMatchView } from './components/LiveMatchView';
import { StandingsView } from './components/StandingsView';
import { LeaderboardView } from './components/LeaderboardView';
import { ClubsBudgetView } from './components/ClubsBudgetView';
import { TournamentInfoView } from './components/TournamentInfoView';
import { AdminHubView } from './components/AdminHubView';
import { AdminPinModal } from './components/AdminPinModal';
import { InstallAppModal } from './components/InstallAppModal';
import { 
  broadcastStateChange, 
  subscribeToStateSync, 
  cascadePlayerUpdate,
  recalculatePlayerStatsFromMatches,
  fetchInitialServerState,
  SyncPayload
} from './utils/sync';

export const App: React.FC = () => {
  // Navigation
  const [activeTab, setActiveTab] = useState<TabType>('LIVE');
  const [showInstallModal, setShowInstallModal] = useState<boolean>(false);
  const [lastSyncTime, setLastSyncTime] = useState<number>(Date.now());
  const [isFirestoreLoaded, setIsFirestoreLoaded] = useState<boolean>(false);

  // Core Tournament State (Persisted in Cloud Firestore as Single Source of Truth)
  const [teams, setTeams] = useState<Team[]>(() => {
    try {
      const saved = localStorage.getItem('gp_teams');
      return saved ? JSON.parse(saved) : INITIAL_TEAMS;
    } catch {
      return INITIAL_TEAMS;
    }
  });

  const [players, setPlayers] = useState<Player[]>(() => {
    try {
      const saved = localStorage.getItem('gp_players');
      return saved ? JSON.parse(saved) : INITIAL_PLAYERS;
    } catch {
      return INITIAL_PLAYERS;
    }
  });

  const [matches, setMatches] = useState<Match[]>(() => {
    try {
      const saved = localStorage.getItem('gp_matches');
      return saved ? JSON.parse(saved) : INITIAL_MATCHES;
    } catch {
      return INITIAL_MATCHES;
    }
  });

  const [tournamentInfo, setTournamentInfo] = useState<TournamentInfo>(() => {
    try {
      const saved = localStorage.getItem('gp_tournament_info');
      return saved ? JSON.parse(saved) : INITIAL_TOURNAMENT_INFO;
    } catch {
      return INITIAL_TOURNAMENT_INFO;
    }
  });

  const [selectedMatchId, setSelectedMatchId] = useState<string>(() => {
    return matches[0]?.id || '';
  });

  // Admin & Security State
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [adminPin, setAdminPin] = useState<string>(() => {
    return localStorage.getItem('gp_admin_pin') || '1234';
  });
  const [showPinModal, setShowPinModal] = useState<boolean>(false);

  // 🔄 Real-time Firestore onSnapshot listener for instant multi-device sync
  useEffect(() => {
    const unsubscribe = subscribeToStateSync((payload: SyncPayload) => {
      if (payload.teams !== undefined) setTeams(payload.teams);
      if (payload.players !== undefined) setPlayers(payload.players);
      if (payload.matches !== undefined) setMatches(payload.matches);
      if (payload.tournamentInfo !== undefined) setTournamentInfo(payload.tournamentInfo);
      if (payload.adminPin !== undefined) setAdminPin(payload.adminPin);
      if (payload.timestamp) setLastSyncTime(payload.timestamp);
      setIsFirestoreLoaded(true);
    });

    return () => unsubscribe();
  }, []);

  // Keep selectedMatchId valid
  useEffect(() => {
    if (!matches.some(m => m.id === selectedMatchId) && matches.length > 0) {
      setSelectedMatchId(matches[0].id);
    }
  }, [matches, selectedMatchId]);

  // Unified Broadcast & Firestore write trigger
  const triggerGlobalSync = useCallback((updates: {
    teams?: Team[];
    players?: Player[];
    matches?: Match[];
    tournamentInfo?: TournamentInfo;
    adminPin?: string;
  }) => {
    broadcastStateChange(updates);
    setLastSyncTime(Date.now());
  }, []);

  // Calculate Standings Table Dynamically with 100% precision
  const standings = useMemo<StandingRow[]>(() => {
    const statsMap = new Map<string, StandingRow>();

    teams.forEach(t => {
      statsMap.set(t.id, {
        teamId: t.id,
        teamName: t.name,
        shortName: t.shortName,
        logoUrl: t.logoUrl,
        played: 0,
        won: 0,
        drawn: 0,
        lost: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        goalDifference: 0,
        points: 0,
        form: []
      });
    });

    matches.forEach(m => {
      if (m.status !== 'UPCOMING') {
        const home = statsMap.get(m.homeTeamId);
        const away = statsMap.get(m.awayTeamId);

        if (home && away) {
          home.played += 1;
          away.played += 1;

          home.goalsFor += m.homeScore;
          home.goalsAgainst += m.awayScore;
          away.goalsFor += m.awayScore;
          away.goalsAgainst += m.homeScore;

          home.goalDifference = home.goalsFor - home.goalsAgainst;
          away.goalDifference = away.goalsFor - away.goalsAgainst;

          if (m.homeScore > m.awayScore) {
            home.won += 1;
            home.points += 3;
            home.form.push('W');
            away.lost += 1;
            away.form.push('L');
          } else if (m.homeScore < m.awayScore) {
            away.won += 1;
            away.points += 3;
            away.form.push('W');
            home.lost += 1;
            home.form.push('L');
          } else {
            home.drawn += 1;
            home.points += 1;
            home.form.push('D');
            away.drawn += 1;
            away.points += 1;
            away.form.push('D');
          }
        }
      }
    });

    return Array.from(statsMap.values()).sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
      return b.goalsFor - a.goalsFor;
    });
  }, [teams, matches]);

  // ⚽ Add Event & Increment Scores / Player Stats
  const handleAddEvent = (eventData: Omit<MatchEvent, 'id' | 'timestamp'>) => {
    const newEvent: MatchEvent = {
      ...eventData,
      id: `ev-${Date.now()}`,
      timestamp: Date.now()
    };

    // 1. Update Match score and append event
    const updatedMatches = matches.map(m => {
      if (m.id === newEvent.matchId) {
        let updatedHomeScore = m.homeScore;
        let updatedAwayScore = m.awayScore;

        if (newEvent.type === 'GOAL' || newEvent.type === 'PENALTY_GOAL') {
          if (newEvent.teamId === m.homeTeamId) updatedHomeScore += 1;
          else if (newEvent.teamId === m.awayTeamId) updatedAwayScore += 1;
        } else if (newEvent.type === 'OWN_GOAL') {
          if (newEvent.teamId === m.homeTeamId) updatedAwayScore += 1;
          else if (newEvent.teamId === m.awayTeamId) updatedHomeScore += 1;
        }

        return {
          ...m,
          homeScore: updatedHomeScore,
          awayScore: updatedAwayScore,
          events: [...m.events, newEvent]
        };
      }
      return m;
    });

    // 2. Update Player stats (Goals, Assists, Cards, Fouls, Saves)
    const updatedPlayers = players.map(p => {
      if (p.id === newEvent.playerId) {
        let g = p.goals;
        let a = p.assists;
        let y = p.yellowCards;
        let r = p.redCards;
        let f = p.fouls;
        let s = p.saves;

        if (newEvent.type === 'GOAL' || newEvent.type === 'PENALTY_GOAL') g += 1;
        if (newEvent.type === 'ASSIST') a += 1;
        if (newEvent.type === 'YELLOW_CARD') y += 1;
        if (newEvent.type === 'RED_CARD' || newEvent.type === 'SECOND_YELLOW_RED') r += 1;
        if (newEvent.type === 'FOUL') f += 1;
        if (newEvent.type === 'SAVE') s += 1;

        return { ...p, goals: g, assists: a, yellowCards: y, redCards: r, fouls: f, saves: s };
      }

      if (newEvent.assistPlayerId && p.id === newEvent.assistPlayerId) {
        return { ...p, assists: p.assists + 1 };
      }

      return p;
    });

    setMatches(updatedMatches);
    setPlayers(updatedPlayers);
    triggerGlobalSync({ matches: updatedMatches, players: updatedPlayers });
  };

  // 🗑️ Delete Event & Automatic Score Rollback (Score & Player Rollback)
  const handleDeleteEvent = (matchId: string, eventId: string) => {
    const targetMatch = matches.find(m => m.id === matchId);
    const targetEvent = targetMatch?.events.find(e => e.id === eventId);
    if (!targetMatch || !targetEvent) return;

    // 1. Rollback Match Score and remove event
    const updatedMatches = matches.map(m => {
      if (m.id === matchId) {
        let rolledHomeScore = m.homeScore;
        let rolledAwayScore = m.awayScore;

        if (targetEvent.type === 'GOAL' || targetEvent.type === 'PENALTY_GOAL') {
          if (targetEvent.teamId === m.homeTeamId) rolledHomeScore = Math.max(0, rolledHomeScore - 1);
          else if (targetEvent.teamId === m.awayTeamId) rolledAwayScore = Math.max(0, rolledAwayScore - 1);
        } else if (targetEvent.type === 'OWN_GOAL') {
          if (targetEvent.teamId === m.homeTeamId) rolledAwayScore = Math.max(0, rolledAwayScore - 1);
          else if (targetEvent.teamId === m.awayTeamId) rolledHomeScore = Math.max(0, rolledHomeScore - 1);
        }

        return {
          ...m,
          homeScore: rolledHomeScore,
          awayScore: rolledAwayScore,
          events: m.events.filter(e => e.id !== eventId)
        };
      }
      return m;
    });

    // 2. Rollback Player stats (Goals, Assists, Cards, Fouls, Saves)
    const updatedPlayers = players.map(p => {
      if (p.id === targetEvent.playerId) {
        let g = p.goals;
        let a = p.assists;
        let y = p.yellowCards;
        let r = p.redCards;
        let f = p.fouls;
        let s = p.saves;

        if (targetEvent.type === 'GOAL' || targetEvent.type === 'PENALTY_GOAL') g = Math.max(0, g - 1);
        if (targetEvent.type === 'ASSIST') a = Math.max(0, a - 1);
        if (targetEvent.type === 'YELLOW_CARD') y = Math.max(0, y - 1);
        if (targetEvent.type === 'RED_CARD' || targetEvent.type === 'SECOND_YELLOW_RED') r = Math.max(0, r - 1);
        if (targetEvent.type === 'FOUL') f = Math.max(0, f - 1);
        if (targetEvent.type === 'SAVE') s = Math.max(0, s - 1);

        return { ...p, goals: g, assists: a, yellowCards: y, redCards: r, fouls: f, saves: s };
      }

      if (targetEvent.assistPlayerId && p.id === targetEvent.assistPlayerId) {
        return { ...p, assists: Math.max(0, p.assists - 1) };
      }

      return p;
    });

    setMatches(updatedMatches);
    setPlayers(updatedPlayers);
    triggerGlobalSync({ matches: updatedMatches, players: updatedPlayers });
  };

  // Match Status & Clock updater
  const handleUpdateMatchStatus = (
    matchId: string, 
    status: MatchStatus, 
    minute: number, 
    isClockRunning: boolean
  ) => {
    const updatedMatches = matches.map(m => {
      if (m.id === matchId) {
        return { ...m, status, currentMinute: minute, isClockRunning };
      }
      return m;
    });
    setMatches(updatedMatches);
    triggerGlobalSync({ matches: updatedMatches });
  };

  // Match Story updater
  const handleUpdateMatchStory = (matchId: string, story: string) => {
    const updatedMatches = matches.map(m => m.id === matchId ? { ...m, matchStoryNotes: story } : m);
    setMatches(updatedMatches);
    triggerGlobalSync({ matches: updatedMatches });
  };

  // Reset Match Score
  const handleResetMatchScore = (matchId: string) => {
    const updatedMatches = matches.map(m => m.id === matchId ? { ...m, homeScore: 0, awayScore: 0, events: [] } : m);
    const updatedPlayers = recalculatePlayerStatsFromMatches(players, updatedMatches);
    setMatches(updatedMatches);
    setPlayers(updatedPlayers);
    triggerGlobalSync({ matches: updatedMatches, players: updatedPlayers });
  };

  // ✏️ Edit Match Details
  const handleEditMatch = (updatedMatch: Match) => {
    const updatedMatches = matches.map(m => m.id === updatedMatch.id ? updatedMatch : m);
    const updatedPlayers = recalculatePlayerStatsFromMatches(players, updatedMatches);
    setMatches(updatedMatches);
    setPlayers(updatedPlayers);
    triggerGlobalSync({ matches: updatedMatches, players: updatedPlayers });
  };

  // 🗑️ Delete Match
  const handleDeleteMatch = (matchId: string) => {
    const updatedMatches = matches.filter(m => m.id !== matchId);
    const updatedPlayers = recalculatePlayerStatsFromMatches(players, updatedMatches);
    setMatches(updatedMatches);
    setPlayers(updatedPlayers);
    triggerGlobalSync({ matches: updatedMatches, players: updatedPlayers });
  };

  // Team & Player Cascading CRUD
  const handleSaveTeam = (teamToSave: Team) => {
    const exists = teams.some(t => t.id === teamToSave.id);
    const updatedTeams = exists
      ? teams.map(t => (t.id === teamToSave.id ? teamToSave : t))
      : [...teams, teamToSave];
    
    setTeams(updatedTeams);
    triggerGlobalSync({ teams: updatedTeams });
  };

  const handleDeleteTeam = (teamId: string) => {
    const updatedTeams = teams.filter(t => t.id !== teamId);
    const updatedPlayers = players.filter(p => p.teamId !== teamId);
    const updatedMatches = matches.filter(m => m.homeTeamId !== teamId && m.awayTeamId !== teamId);
    
    setTeams(updatedTeams);
    setPlayers(updatedPlayers);
    setMatches(updatedMatches);
    triggerGlobalSync({ teams: updatedTeams, players: updatedPlayers, matches: updatedMatches });
  };

  const handleSavePlayer = (playerToSave: Player) => {
    // Cascades name, team and role changes to all match events and POTM awards
    const { updatedPlayers, updatedMatches } = cascadePlayerUpdate(playerToSave, players, matches);
    
    // Also re-verify if this player is captain/icon in their team
    const updatedTeams = teams.map(t => {
      if (t.id === playerToSave.teamId) {
        return {
          ...t,
          captainPlayerId: playerToSave.isCaptain ? playerToSave.id : (t.captainPlayerId === playerToSave.id ? undefined : t.captainPlayerId),
          iconPlayerId: playerToSave.isIconPlayer ? playerToSave.id : (t.iconPlayerId === playerToSave.id ? undefined : t.iconPlayerId)
        };
      }
      return t;
    });

    setPlayers(updatedPlayers);
    setMatches(updatedMatches);
    setTeams(updatedTeams);
    triggerGlobalSync({ players: updatedPlayers, matches: updatedMatches, teams: updatedTeams });
  };

  const handleDeletePlayer = (playerId: string) => {
    const updatedPlayers = players.filter(p => p.id !== playerId);
    const updatedTeams = teams.map(t => ({
      ...t,
      captainPlayerId: t.captainPlayerId === playerId ? undefined : t.captainPlayerId,
      iconPlayerId: t.iconPlayerId === playerId ? undefined : t.iconPlayerId
    }));
    
    // Remove player from match events and POTM
    const updatedMatches = matches.map(m => ({
      ...m,
      potmPlayerId: m.potmPlayerId === playerId ? undefined : m.potmPlayerId,
      potmPlayerName: m.potmPlayerId === playerId ? undefined : m.potmPlayerName,
      events: m.events.filter(e => e.playerId !== playerId && e.assistPlayerId !== playerId)
    }));

    setPlayers(updatedPlayers);
    setTeams(updatedTeams);
    setMatches(updatedMatches);
    triggerGlobalSync({ players: updatedPlayers, teams: updatedTeams, matches: updatedMatches });
  };

  // Create match
  const handleCreateMatch = (newMatch: Match) => {
    const updatedMatches = [newMatch, ...matches];
    setMatches(updatedMatches);
    setSelectedMatchId(newMatch.id);
    triggerGlobalSync({ matches: updatedMatches });
  };

  const handleCreateMatchFromData = (data: {
    homeTeamId: string;
    awayTeamId: string;
    venue: string;
    matchDate: string;
    round: string;
    status: MatchStatus;
    homeScore?: number;
    awayScore?: number;
  }) => {
    const newMatch: Match = {
      id: `match-${Date.now()}`,
      homeTeamId: data.homeTeamId,
      awayTeamId: data.awayTeamId,
      homeScore: data.homeScore || 0,
      awayScore: data.awayScore || 0,
      status: data.status,
      currentMinute: 0,
      addedMinutes: 0,
      isClockRunning: false,
      venue: data.venue,
      matchDate: data.matchDate,
      round: data.round,
      matchStoryNotes: '',
      events: []
    };
    const updatedMatches = [newMatch, ...matches];
    setMatches(updatedMatches);
    setSelectedMatchId(newMatch.id);
    triggerGlobalSync({ matches: updatedMatches });
  };

  const handleUpdateTournamentInfo = (newInfo: TournamentInfo) => {
    setTournamentInfo(newInfo);
    triggerGlobalSync({ tournamentInfo: newInfo });
  };

  const handleUpdateAdminPin = (newPin: string) => {
    setAdminPin(newPin);
    triggerGlobalSync({ adminPin: newPin });
  };

  // Reset / Clear All Data to Clean Slate
  const handleResetData = () => {
    setTeams([]);
    setPlayers([]);
    setMatches([]);
    setSelectedMatchId('');
    localStorage.removeItem('gp_teams');
    localStorage.removeItem('gp_players');
    localStorage.removeItem('gp_matches');
    triggerGlobalSync({ teams: [], players: [], matches: [] });
  };

  // Load Demo Data for testing
  const handleLoadDemoData = () => {
    setTeams(DEMO_TEAMS);
    setPlayers(DEMO_PLAYERS);
    setMatches(DEMO_MATCHES);
    setSelectedMatchId(DEMO_MATCHES[0].id);
    triggerGlobalSync({ teams: DEMO_TEAMS, players: DEMO_PLAYERS, matches: DEMO_MATCHES });
  };

  const liveMatchesCount = matches.filter(
    m => m.status === 'LIVE_1ST_HALF' || m.status === 'LIVE_2ND_HALF' || m.status === 'EXTRA_TIME'
  ).length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-emerald-500 selection:text-white pb-16 md:pb-8">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isAdmin={isAdmin}
        onToggleAdmin={() => {
          if (isAdmin) {
            setIsAdmin(false);
          } else {
            setShowPinModal(true);
          }
        }}
        onOpenInstallModal={() => setShowInstallModal(true)}
        liveMatchCount={liveMatchesCount}
        lastSyncTime={lastSyncTime}
      />

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-6 flex-1">
        {activeTab === 'LIVE' && (
          <LiveMatchView
            matches={matches}
            teams={teams}
            players={players}
            selectedMatchId={selectedMatchId}
            onSelectMatch={setSelectedMatchId}
            isAdmin={isAdmin}
            onAddEvent={handleAddEvent}
            onDeleteEvent={handleDeleteEvent}
            onUpdateMatchStatus={handleUpdateMatchStatus}
            onUpdateMatchStory={handleUpdateMatchStory}
            onResetMatchScore={handleResetMatchScore}
            onEditMatch={handleEditMatch}
            onCreateMatch={handleCreateMatchFromData}
            onDeleteMatch={handleDeleteMatch}
            onNavigateToClubs={() => setActiveTab('CLUBS')}
            tournamentInfo={tournamentInfo}
          />
        )}

        {activeTab === 'STANDINGS' && (
          <StandingsView 
            standings={standings} 
            isAdmin={isAdmin}
            onNavigateToClubs={() => setActiveTab('CLUBS')}
          />
        )}

        {activeTab === 'LEADERBOARD' && (
          <LeaderboardView players={players} teams={teams} />
        )}

        {activeTab === 'CLUBS' && (
          <ClubsBudgetView
            teams={teams}
            players={players}
            isAdmin={isAdmin}
            onSaveTeam={handleSaveTeam}
            onDeleteTeam={handleDeleteTeam}
            onSavePlayer={handleSavePlayer}
            onDeletePlayer={handleDeletePlayer}
          />
        )}

        {activeTab === 'INFO' && (
          <TournamentInfoView
            info={tournamentInfo}
            onUpdateInfo={handleUpdateTournamentInfo}
            isAdmin={isAdmin}
          />
        )}

        {activeTab === 'ADMIN' && (
          <AdminHubView
            isAdmin={isAdmin}
            adminPin={adminPin}
            onUpdatePin={handleUpdateAdminPin}
            onToggleAdmin={() => {
              if (isAdmin) {
                setIsAdmin(false);
              } else {
                setShowPinModal(true);
              }
            }}
            matches={matches}
            teams={teams}
            players={players}
            onCreateMatch={handleCreateMatch}
            onEditMatch={handleEditMatch}
            onDeleteMatch={handleDeleteMatch}
            onResetData={handleResetData}
            onLoadDemoData={handleLoadDemoData}
            onNavigateToMatch={(id) => {
              setSelectedMatchId(id);
              setActiveTab('LIVE');
            }}
          />
        )}
      </main>

      {/* Admin Security PIN Modal */}
      <AdminPinModal
        isOpen={showPinModal}
        onClose={() => setShowPinModal(false)}
        onSuccess={() => {
          setIsAdmin(true);
          setShowPinModal(false);
        }}
        verifyPin={(pin) => pin === adminPin}
      />

      {/* Install Mobile App Modal */}
      <InstallAppModal
        isOpen={showInstallModal}
        onClose={() => setShowInstallModal(false)}
      />

      {/* Floating Bottom Quick Install Banner for Mobile */}
      <div className="fixed bottom-3 left-3 right-3 sm:hidden z-30 flex items-center justify-between p-3 rounded-2xl bg-slate-900/95 backdrop-blur-md border border-emerald-500/40 shadow-2xl">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-sm">
            ⚽
          </div>
          <div>
            <p className="text-xs font-black text-white">NPL অ্যাপ যোগ করুন</p>
            <p className="text-[10px] text-slate-400">হোমস্ক্রিন থেকে দ্রুত অ্যাক্সেস</p>
          </div>
        </div>
        <button
          onClick={() => setShowInstallModal(true)}
          className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-md transition-all active:scale-95 cursor-pointer"
        >
          ইনস্টল করুন 📲
        </button>
      </div>
    </div>
  );
};
