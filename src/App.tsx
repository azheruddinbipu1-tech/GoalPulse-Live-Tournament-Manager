import React, { useState, useEffect, useMemo } from 'react';
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

export const App: React.FC = () => {
  // Navigation
  const [activeTab, setActiveTab] = useState<TabType>('LIVE');
  const [showInstallModal, setShowInstallModal] = useState<boolean>(false);

  // Core Tournament State (Persisted in localStorage, defaults to empty clean state)
  const [teams, setTeams] = useState<Team[]>(() => {
    const saved = localStorage.getItem('gp_teams');
    return saved ? JSON.parse(saved) : INITIAL_TEAMS;
  });

  const [players, setPlayers] = useState<Player[]>(() => {
    const saved = localStorage.getItem('gp_players');
    return saved ? JSON.parse(saved) : INITIAL_PLAYERS;
  });

  const [matches, setMatches] = useState<Match[]>(() => {
    const saved = localStorage.getItem('gp_matches');
    return saved ? JSON.parse(saved) : INITIAL_MATCHES;
  });

  const [tournamentInfo, setTournamentInfo] = useState<TournamentInfo>(() => {
    const saved = localStorage.getItem('gp_tournament_info');
    return saved ? JSON.parse(saved) : INITIAL_TOURNAMENT_INFO;
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

  // Sync to LocalStorage
  useEffect(() => {
    localStorage.setItem('gp_teams', JSON.stringify(teams));
  }, [teams]);

  useEffect(() => {
    localStorage.setItem('gp_players', JSON.stringify(players));
  }, [players]);

  useEffect(() => {
    localStorage.setItem('gp_matches', JSON.stringify(matches));
  }, [matches]);

  useEffect(() => {
    localStorage.setItem('gp_tournament_info', JSON.stringify(tournamentInfo));
  }, [tournamentInfo]);

  useEffect(() => {
    localStorage.setItem('gp_admin_pin', adminPin);
  }, [adminPin]);

  // Keep selectedMatchId valid
  useEffect(() => {
    if (!matches.some(m => m.id === selectedMatchId) && matches.length > 0) {
      setSelectedMatchId(matches[0].id);
    }
  }, [matches, selectedMatchId]);

  // Calculate Standings Table Dynamically
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
    setMatches(prevMatches =>
      prevMatches.map(m => {
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
      })
    );

    // 2. Update Player stats (Goals, Assists, Cards, Fouls, Saves)
    setPlayers(prevPlayers =>
      prevPlayers.map(p => {
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
      })
    );
  };

  // 🗑️ Delete Event & Automatic Score Rollback (Score & Player Rollback)
  const handleDeleteEvent = (matchId: string, eventId: string) => {
    const targetMatch = matches.find(m => m.id === matchId);
    const targetEvent = targetMatch?.events.find(e => e.id === eventId);
    if (!targetMatch || !targetEvent) return;

    // 1. Rollback Match Score and remove event
    setMatches(prevMatches =>
      prevMatches.map(m => {
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
      })
    );

    // 2. Rollback Player stats (Goals, Assists, Cards, Fouls, Saves)
    setPlayers(prevPlayers =>
      prevPlayers.map(p => {
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
      })
    );
  };

  // Match Status & Clock updater
  const handleUpdateMatchStatus = (
    matchId: string, 
    status: MatchStatus, 
    minute: number, 
    isClockRunning: boolean
  ) => {
    setMatches(prevMatches =>
      prevMatches.map(m => {
        if (m.id === matchId) {
          return { ...m, status, currentMinute: minute, isClockRunning };
        }
        return m;
      })
    );
  };

  // Match Story updater
  const handleUpdateMatchStory = (matchId: string, story: string) => {
    setMatches(prevMatches =>
      prevMatches.map(m => m.id === matchId ? { ...m, matchStoryNotes: story } : m)
    );
  };

  // Reset Match Score
  const handleResetMatchScore = (matchId: string) => {
    setMatches(prevMatches =>
      prevMatches.map(m => m.id === matchId ? { ...m, homeScore: 0, awayScore: 0, events: [] } : m)
    );
  };

  // ✏️ Edit Match Details
  const handleEditMatch = (updatedMatch: Match) => {
    setMatches(prev => prev.map(m => m.id === updatedMatch.id ? updatedMatch : m));
  };

  // 🗑️ Delete Match
  const handleDeleteMatch = (matchId: string) => {
    setMatches(prev => prev.filter(m => m.id !== matchId));
  };

  // Team & Player CRUD
  const handleSaveTeam = (teamToSave: Team) => {
    setTeams(prev => {
      const exists = prev.some(t => t.id === teamToSave.id);
      return exists ? prev.map(t => t.id === teamToSave.id ? teamToSave : t) : [...prev, teamToSave];
    });
  };

  const handleDeleteTeam = (teamId: string) => {
    setTeams(prev => prev.filter(t => t.id !== teamId));
    setPlayers(prev => prev.filter(p => p.teamId !== teamId));
    setMatches(prev => prev.filter(m => m.homeTeamId !== teamId && m.awayTeamId !== teamId));
  };

  const handleSavePlayer = (playerToSave: Player) => {
    setPlayers(prev => {
      const exists = prev.some(p => p.id === playerToSave.id);
      return exists ? prev.map(p => p.id === playerToSave.id ? playerToSave : p) : [...prev, playerToSave];
    });
  };

  const handleDeletePlayer = (playerId: string) => {
    setPlayers(prev => prev.filter(p => p.id !== playerId));
  };

  // Create match
  const handleCreateMatch = (newMatch: Match) => {
    setMatches(prev => [newMatch, ...prev]);
    setSelectedMatchId(newMatch.id);
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
    setMatches(prev => [newMatch, ...prev]);
    setSelectedMatchId(newMatch.id);
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
  };

  // Load Demo Data for testing
  const handleLoadDemoData = () => {
    setTeams(DEMO_TEAMS);
    setPlayers(DEMO_PLAYERS);
    setMatches(DEMO_MATCHES);
    setSelectedMatchId(DEMO_MATCHES[0].id);
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
            onUpdateInfo={setTournamentInfo}
            isAdmin={isAdmin}
          />
        )}

        {activeTab === 'ADMIN' && (
          <AdminHubView
            isAdmin={isAdmin}
            adminPin={adminPin}
            onUpdatePin={setAdminPin}
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
    </div>
  );
};
