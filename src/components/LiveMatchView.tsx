import React, { useState, useEffect } from 'react';
import { 
  Match, 
  Team, 
  Player, 
  MatchEvent, 
  EventType, 
  MatchStatus,
  TournamentInfo,
  MatchStats
} from '../types';
import { 
  Play, 
  Pause, 
  Plus, 
  Minus,
  Trash2, 
  Edit3, 
  Save, 
  RotateCcw, 
  Clock, 
  Calendar, 
  MapPin, 
  Award,
  Shield, 
  Zap, 
  CheckCircle2, 
  Users, 
  Trophy, 
  Star,
  FileText,
  Search,
  Filter,
  Flame,
  ArrowRightLeft,
  Volume2,
  Share2,
  Bell,
  BellRing,
  Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundEffects } from '../utils/audio';
import { EditMatchModal } from './EditMatchModal';
import { CreateMatchModal } from './CreateMatchModal';
import { MatchSummaryPdfModal } from './MatchSummaryPdfModal';

interface LiveMatchViewProps {
  matches: Match[];
  teams: Team[];
  players: Player[];
  selectedMatchId: string;
  onSelectMatch: (id: string) => void;
  isAdmin: boolean;
  onAddEvent: (event: Omit<MatchEvent, 'id' | 'timestamp'>) => void;
  onDeleteEvent: (matchId: string, eventId: string) => void;
  onUpdateMatchStatus: (matchId: string, status: MatchStatus, minute: number, isClockRunning: boolean) => void;
  onUpdateMatchStory: (matchId: string, story: string) => void;
  onResetMatchScore: (matchId: string) => void;
  onEditMatch: (updatedMatch: Match) => void;
  onCreateMatch: (matchData: any) => void;
  onDeleteMatch: (matchId: string) => void;
  onNavigateToClubs?: () => void;
  tournamentInfo?: TournamentInfo;
}

export const LiveMatchView: React.FC<LiveMatchViewProps> = ({
  matches,
  teams,
  players,
  selectedMatchId,
  onSelectMatch,
  isAdmin,
  onAddEvent,
  onDeleteEvent,
  onUpdateMatchStatus,
  onUpdateMatchStory,
  onResetMatchScore,
  onEditMatch,
  onCreateMatch,
  onDeleteMatch,
  onNavigateToClubs,
  tournamentInfo
}) => {
  const currentMatch = matches.find(m => m.id === selectedMatchId) || matches[0];
  const homeTeam = teams.find(t => t.id === currentMatch?.homeTeamId);
  const awayTeam = teams.find(t => t.id === currentMatch?.awayTeamId);

  // Modals state
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEventModal, setShowEventModal] = useState(false);
  const [showPdfModal, setShowPdfModal] = useState(false);
  
  // Fixture list filters & search
  const [fixtureFilter, setFixtureFilter] = useState<'ALL' | 'LIVE' | 'TODAY' | 'UPCOMING' | 'FINISHED'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Event creation form state
  const [selectedEventType, setSelectedEventType] = useState<EventType>('GOAL');
  const [selectedTeamId, setSelectedTeamId] = useState<string>('');
  const [selectedPlayerId, setSelectedPlayerId] = useState<string>('');
  const [selectedAssistPlayerId, setSelectedAssistPlayerId] = useState<string>('');
  const [selectedSubOutPlayerId, setSelectedSubOutPlayerId] = useState<string>('');
  const [eventMinute, setEventMinute] = useState<number>(currentMatch?.currentMinute || 1);
  const [eventNote, setEventNote] = useState<string>('');

  // Story edit state
  const [isEditingStory, setIsEditingStory] = useState(false);
  const [storyText, setStoryText] = useState(currentMatch?.matchStoryNotes || '');

  // Stats active subtab
  const [statsViewTab, setStatsViewTab] = useState<'OVERVIEW' | 'STATS' | 'LINEUP' | 'POTM'>('OVERVIEW');

  // Match Reminders state
  const [reminders, setReminders] = useState<{ [matchId: string]: boolean }>(() => {
    try {
      const saved = localStorage.getItem('npl_match_reminders');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });
  const [reminderToast, setReminderToast] = useState<string | null>(null);

  // Clock ticker for countdowns
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const toggleMatchReminder = (matchId: string, matchTitle: string) => {
    const updated = { ...reminders, [matchId]: !reminders[matchId] };
    setReminders(updated);
    try {
      localStorage.setItem('npl_match_reminders', JSON.stringify(updated));
    } catch {}

    if (updated[matchId]) {
      soundEffects.playReminderChime();
      setReminderToast(`🔔 "${matchTitle}" ম্যাচের রিমাইন্ডার অন করা হয়েছে!`);
      if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
      }
    } else {
      setReminderToast(`🔕 রিমাইন্ডার বন্ধ করা হয়েছে`);
    }

    setTimeout(() => setReminderToast(null), 3500);
  };

  // Trigger celebration on goal
  const triggerGoalCelebration = () => {
    soundEffects.playGoalFanfare();
    confetti({
      particleCount: 90,
      spread: 75,
      origin: { y: 0.6 }
    });
  };

  // Safe fallback stats
  const homeStats: MatchStats = currentMatch?.homeStats || {
    possession: 50,
    shots: 8,
    shotsOnTarget: 4,
    shotsOffTarget: 4,
    corners: 3,
    fouls: 5,
    offsides: 1,
    yellowCards: currentMatch?.events?.filter(e => e.teamId === currentMatch.homeTeamId && e.type === 'YELLOW_CARD').length || 0,
    redCards: currentMatch?.events?.filter(e => e.teamId === currentMatch.homeTeamId && (e.type === 'RED_CARD' || e.type === 'SECOND_YELLOW_RED')).length || 0,
    passes: 140,
    saves: 3
  };

  const awayStats: MatchStats = currentMatch?.awayStats || {
    possession: 50,
    shots: 7,
    shotsOnTarget: 3,
    shotsOffTarget: 4,
    corners: 2,
    fouls: 6,
    offsides: 2,
    yellowCards: currentMatch?.events?.filter(e => e.teamId === currentMatch.awayTeamId && e.type === 'YELLOW_CARD').length || 0,
    redCards: currentMatch?.events?.filter(e => e.teamId === currentMatch.awayTeamId && (e.type === 'RED_CARD' || e.type === 'SECOND_YELLOW_RED')).length || 0,
    passes: 130,
    saves: 4
  };

  const updateStats = (team: 'home' | 'away', field: keyof MatchStats, delta: number) => {
    if (!currentMatch) return;
    const currentH = { ...homeStats };
    const currentA = { ...awayStats };

    if (team === 'home') {
      if (field === 'possession') {
        const newH = Math.max(10, Math.min(90, currentH.possession + delta));
        currentH.possession = newH;
        currentA.possession = 100 - newH;
      } else {
        currentH[field] = Math.max(0, (currentH[field] as number) + delta);
      }
    } else {
      if (field === 'possession') {
        const newA = Math.max(10, Math.min(90, currentA.possession + delta));
        currentA.possession = newA;
        currentH.possession = 100 - newA;
      } else {
        currentA[field] = Math.max(0, (currentA[field] as number) + delta);
      }
    }

    onEditMatch({
      ...currentMatch,
      homeStats: currentH,
      awayStats: currentA
    });
  };

  // Filtered fixtures
  const filteredMatches = matches.filter(m => {
    const h = teams.find(t => t.id === m.homeTeamId);
    const a = teams.find(t => t.id === m.awayTeamId);
    const matchesSearch = !searchQuery || 
      h?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.round?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.venue?.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (fixtureFilter === 'LIVE') {
      return m.status === 'LIVE_1ST_HALF' || m.status === 'LIVE_2ND_HALF' || m.status === 'EXTRA_TIME' || m.status === 'HALF_TIME';
    }
    if (fixtureFilter === 'FINISHED') {
      return m.status === 'FINISHED';
    }
    if (fixtureFilter === 'UPCOMING') {
      return m.status === 'UPCOMING';
    }
    if (fixtureFilter === 'TODAY') {
      return m.matchDate?.includes('আজ') || m.matchDate?.includes('Today') || m.matchDate?.includes('2026');
    }
    return true;
  });

  if (!currentMatch || !homeTeam || !awayTeam || matches.length === 0 || teams.length < 2) {
    return (
      <div className="space-y-6 pb-12">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 sm:p-12 text-center max-w-2xl mx-auto shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">⚽</span>
          </div>
          <h2 className="text-2xl font-black text-white font-display mb-2">
            {teams.length < 2 ? 'কোনো দল তৈরি করা হয়নি' : 'কোনো ম্যাচ শিডিউল নেই'}
          </h2>
          <p className="text-sm text-slate-400 mb-6 max-w-md mx-auto">
            {teams.length < 2
              ? 'ম্যাচ শুরু করতে প্রথমে অন্তত ২টি দলের নাম যোগ করুন। এরপর খুব সহজেই লাইভ স্কোর ও ইভেন্ট পরিচালনা করতে পারবেন।'
              : 'নতুন একটি লাইভ ম্যাচ তৈরি করুন এবং গোল, অ্যাসিস্ট, কার্ড ইত্যাদি যুক্ত করে স্কোর পরিচালনা করুন।'}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3">
            {teams.length < 2 ? (
              isAdmin ? (
                <button
                  onClick={onNavigateToClubs}
                  className="px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-sm flex items-center gap-2 shadow-lg shadow-emerald-950 transition-all cursor-pointer"
                >
                  <Users className="w-4 h-4" />
                  <span>➕ দল যোগ করুন (Add Teams)</span>
                </button>
              ) : (
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 text-slate-400 text-xs font-semibold">
                  <span>🔒 পাবলিক ভিউ মোড • দল তৈরি করতে অ্যাডমিন পিন প্রয়োজন</span>
                </div>
              )
            ) : (
              isAdmin && (
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-sm flex items-center gap-2 shadow-lg shadow-emerald-950 transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>⚽ নতুন ম্যাচ তৈরি করুন (Create Match)</span>
                </button>
              )
            )}
          </div>
        </div>

        {isAdmin && (
          <CreateMatchModal
            isOpen={showCreateModal}
            onClose={() => setShowCreateModal(false)}
            teams={teams}
            onCreateMatch={onCreateMatch}
          />
        )}
      </div>
    );
  }

  const teamPlayers = players.filter(p => p.teamId === selectedTeamId);

  const handleOpenEventModal = (type: EventType) => {
    setSelectedEventType(type);
    setSelectedTeamId(homeTeam.id);
    const initialPlayers = players.filter(p => p.teamId === homeTeam.id);
    setSelectedPlayerId(initialPlayers[0]?.id || '');
    setSelectedAssistPlayerId('');
    setSelectedSubOutPlayerId(initialPlayers[1]?.id || '');
    setEventMinute(currentMatch.currentMinute || 1);
    setEventNote('');
    setShowEventModal(true);
  };

  const handleSaveEvent = (e: React.FormEvent) => {
    e.preventDefault();
    const player = players.find(p => p.id === selectedPlayerId);
    const assistPlayer = players.find(p => p.id === selectedAssistPlayerId);

    if (!player) return;

    if (selectedEventType === 'GOAL' || selectedEventType === 'PENALTY_GOAL') {
      triggerGoalCelebration();
    }

    onAddEvent({
      matchId: currentMatch.id,
      type: selectedEventType,
      minute: Number(eventMinute) || currentMatch.currentMinute || 1,
      teamId: selectedTeamId,
      playerId: player.id,
      playerName: player.name,
      assistPlayerId: assistPlayer?.id,
      assistPlayerName: assistPlayer?.name,
      note: selectedEventType === 'SUBSTITUTION' 
        ? `🔄 In: ${player.name}, Out: ${players.find(p => p.id === selectedSubOutPlayerId)?.name || 'Player'}`
        : eventNote
    });

    setShowEventModal(false);
  };

  const handleSaveStory = () => {
    onUpdateMatchStory(currentMatch.id, storyText);
    setIsEditingStory(false);
  };

  const getStatusBadge = (status: MatchStatus) => {
    switch (status) {
      case 'LIVE_1ST_HALF':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-rose-500/20 text-rose-400 border border-rose-500/40 animate-pulse">
            <span className="w-2 h-2 rounded-full bg-rose-500"></span>
            ১ম হাফ লাইভ (1st Half)
          </span>
        );
      case 'HALF_TIME':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-400 border border-amber-500/40">
            ⏸️ হাফ টাইম (Half Time)
          </span>
        );
      case 'LIVE_2ND_HALF':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-rose-500/20 text-rose-400 border border-rose-500/40 animate-pulse">
            <span className="w-2 h-2 rounded-full bg-rose-500"></span>
            ২য় হাফ লাইভ (2nd Half)
          </span>
        );
      case 'EXTRA_TIME':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-purple-500/20 text-purple-400 border border-purple-500/40 animate-pulse">
            ⚡ অতিরিক্ত সময় (ET)
          </span>
        );
      case 'FINISHED':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-slate-800 text-slate-300 border border-slate-700">
            🏁 ম্যাচ সমাপ্ত (Full Time)
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-blue-500/20 text-blue-400 border border-blue-500/40">
            📅 শুরু হয়নি (Upcoming)
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* 📅 Fixtures Filter & Quick Match Selector Bar */}
      <div className="space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 bg-slate-900/90 p-1 rounded-2xl border border-slate-800 overflow-x-auto scrollbar-none">
            <button
              onClick={() => setFixtureFilter('ALL')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                fixtureFilter === 'ALL' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              সব ম্যাচ ({matches.length})
            </button>
            <button
              onClick={() => setFixtureFilter('LIVE')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                fixtureFilter === 'LIVE' ? 'bg-rose-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse" />
              <span>লাইভ ({matches.filter(m => m.status.includes('LIVE') || m.status === 'HALF_TIME').length})</span>
            </button>
            <button
              onClick={() => setFixtureFilter('TODAY')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                fixtureFilter === 'TODAY' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              আজকের ম্যাচ
            </button>
            <button
              onClick={() => setFixtureFilter('UPCOMING')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                fixtureFilter === 'UPCOMING' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              আগামী ম্যাচ
            </button>
            <button
              onClick={() => setFixtureFilter('FINISHED')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                fixtureFilter === 'FINISHED' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              ফলাফল ও হিস্ট্রি
            </button>
          </div>

          {/* Search Bar */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1 md:w-56">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="ম্যাচ খুঁজুন..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            {isAdmin && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-950 transition-all cursor-pointer flex-shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">নতুন ম্যাচ</span>
              </button>
            )}
          </div>
        </div>

        {/* Matches Horizontal Scroll List */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {filteredMatches.map(m => {
            const h = teams.find(t => t.id === m.homeTeamId);
            const a = teams.find(t => t.id === m.awayTeamId);
            const isSelected = m.id === currentMatch.id;
            const isLive = m.status === 'LIVE_1ST_HALF' || m.status === 'LIVE_2ND_HALF' || m.status === 'EXTRA_TIME';

            return (
              <button
                key={m.id}
                onClick={() => onSelectMatch(m.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl border text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-slate-900 border-emerald-500/80 text-white shadow-lg shadow-emerald-950/30 ring-1 ring-emerald-500/50'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                {isLive && (
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                )}
                <span>
                  {h?.shortName || 'T1'} <span className="text-emerald-400 font-mono font-black">{m.homeScore} - {m.awayScore}</span> {a?.shortName || 'T2'}
                </span>
                <span className="text-[10px] text-slate-500 font-normal">
                  ({m.status === 'FINISHED' ? 'FT' : m.status === 'UPCOMING' ? 'Upcoming' : `${m.currentMinute}'`})
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 🏆 Main Scoreboard Card */}
      <div className="bg-slate-900 border border-slate-800/90 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        {/* Glow Accent */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Top Info Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-6 border-b border-slate-800/80 text-xs">
          <div className="flex items-center gap-3">
            {getStatusBadge(currentMatch.status)}
            <span className="text-slate-400 font-medium flex items-center gap-1">
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              {currentMatch.round || 'Super League'}
            </span>
          </div>

          <div className="flex items-center gap-3 text-slate-400">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              {currentMatch.matchDate}
            </span>
            <span className="flex items-center gap-1 hidden sm:flex">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              {currentMatch.venue}
            </span>

            {/* 🔊 Goal Celebration Sound Button */}
            <button
              onClick={triggerGoalCelebration}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold transition-all cursor-pointer"
              title="গোল সেলিব্রেশন ও চিয়ার সাউন্ড বাজান"
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">গোল সাউন্ড ⚽</span>
            </button>

            {/* 🔔 Reminder Bell Toggle for Upcoming Matches */}
            {currentMatch.status === 'UPCOMING' && (
              <button
                onClick={() => toggleMatchReminder(currentMatch.id, `${homeTeam?.name} vs ${awayTeam?.name}`)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                  reminders[currentMatch.id]
                    ? 'bg-amber-500 text-slate-950 border-amber-400 font-extrabold shadow-lg shadow-amber-950'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                }`}
                title="ম্যাচের আগে রিমাইন্ডার নোটিফিকেশন পান"
              >
                {reminders[currentMatch.id] ? <BellRing className="w-3.5 h-3.5" /> : <Bell className="w-3.5 h-3.5" />}
                <span>{reminders[currentMatch.id] ? 'রিমাইন্ডার অন 🔔' : 'রিমাইন্ডার দিন'}</span>
              </button>
            )}

            {/* 📄 PDF Match Summary Export Button */}
            <button
              onClick={() => setShowPdfModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold transition-all cursor-pointer"
              title="ম্যাচ বিবরণী ও সামারি PDF ডাউনলোড করুন"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Match Summary PDF</span>
            </button>

            {/* Admin Edit Match Button */}
            {isAdmin && (
              <button
                onClick={() => setShowEditModal(true)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition-colors cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>এডিট</span>
              </button>
            )}
          </div>
        </div>

        {/* ⏳ Upcoming Match Countdown Banner */}
        {currentMatch.status === 'UPCOMING' && (
          <div className="my-4 p-4 rounded-2xl bg-gradient-to-r from-indigo-950/60 via-slate-950 to-emerald-950/60 border border-indigo-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
                <Clock className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <span className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
                  <span>ম্যাচ শুরু হতে বাকি (Match Countdown)</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                </span>
                <p className="text-sm font-extrabold text-white">
                  📅 {currentMatch.matchDate} • 📍 {currentMatch.venue}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="text-center px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 min-w-[52px]">
                <span className="text-base font-black font-mono text-emerald-400">
                  {String(Math.floor((Math.max(0, 86400 - (now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds()))) / 3600)).padStart(2, '0')}
                </span>
                <span className="block text-[9px] text-slate-400 font-semibold">ঘণ্টা</span>
              </div>
              <span className="text-slate-600 font-bold">:</span>
              <div className="text-center px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 min-w-[52px]">
                <span className="text-base font-black font-mono text-emerald-400">
                  {String(59 - now.getMinutes()).padStart(2, '0')}
                </span>
                <span className="block text-[9px] text-slate-400 font-semibold">মিনিট</span>
              </div>
              <span className="text-slate-600 font-bold">:</span>
              <div className="text-center px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 min-w-[52px]">
                <span className="text-base font-black font-mono text-amber-400">
                  {String(59 - now.getSeconds()).padStart(2, '0')}
                </span>
                <span className="block text-[9px] text-slate-400 font-semibold">সেকেন্ড</span>
              </div>
            </div>
          </div>
        )}

        {/* Score Display */}
        <div className="py-8 grid grid-cols-3 items-center text-center">
          {/* Home Team */}
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-slate-950 border border-slate-800 p-2.5 mb-3 shadow-lg flex items-center justify-center">
              {homeTeam.logoUrl ? (
                <img
                  src={homeTeam.logoUrl}
                  alt={homeTeam.name}
                  className="w-full h-full object-contain"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <span className="text-2xl font-black text-emerald-400">{homeTeam.shortName}</span>
              )}
            </div>
            <h3 className="font-extrabold text-base sm:text-xl text-white font-display">
              {homeTeam.name}
            </h3>
            <span className="text-xs text-slate-400 font-semibold mt-0.5">
              {homeTeam.city || 'Home'}
            </span>
          </div>

          {/* Scores & Match Minute */}
          <div className="flex flex-col items-center justify-center">
            <div className="flex items-center gap-3 sm:gap-6 font-black font-display text-4xl sm:text-6xl text-white tracking-tight">
              <span className="text-white drop-shadow-md">{currentMatch.homeScore}</span>
              <span className="text-slate-600 font-light">:</span>
              <span className="text-white drop-shadow-md">{currentMatch.awayScore}</span>
            </div>

            <div className="mt-3 flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-slate-950 text-emerald-400 border border-slate-800 font-mono">
                <Clock className="w-3.5 h-3.5" />
                {currentMatch.currentMinute}'
                {currentMatch.addedMinutes > 0 && ` +${currentMatch.addedMinutes}`}
              </span>
            </div>
          </div>

          {/* Away Team */}
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-slate-950 border border-slate-800 p-2.5 mb-3 shadow-lg flex items-center justify-center">
              {awayTeam.logoUrl ? (
                <img
                  src={awayTeam.logoUrl}
                  alt={awayTeam.name}
                  className="w-full h-full object-contain"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <span className="text-2xl font-black text-blue-400">{awayTeam.shortName}</span>
              )}
            </div>
            <h3 className="font-extrabold text-base sm:text-xl text-white font-display">
              {awayTeam.name}
            </h3>
            <span className="text-xs text-slate-400 font-semibold mt-0.5">
              {awayTeam.city || 'Away'}
            </span>
          </div>
        </div>

        {/* 🛠️ Admin Controls Toolbar */}
        {isAdmin && (
          <div className="mt-6 pt-6 border-t border-slate-800/80">
            <div className="text-xs font-bold text-slate-400 mb-3 flex items-center justify-between">
              <span>🛠️ অ্যাডমিন লাইভ ম্যাচ অ্যাকশন ও ইভেন্ট কন্ট্রোল</span>
              <button
                onClick={() => onResetMatchScore(currentMatch.id)}
                className="text-[11px] text-rose-400 hover:text-rose-300 font-semibold flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>স্কোর শূন্য করুন (Reset 0-0)</span>
              </button>
            </div>

            {/* Quick Event Buttons */}
            <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 mb-4">
              <button
                onClick={() => handleOpenEventModal('GOAL')}
                className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-950 transition-all cursor-pointer active:scale-95"
              >
                <span>⚽</span>
                <span>+ গোল (Goal)</span>
              </button>

              <button
                onClick={() => handleOpenEventModal('YELLOW_CARD')}
                className="py-2.5 px-3 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95"
              >
                <span>🟨</span>
                <span>হলুদ কার্ড</span>
              </button>

              <button
                onClick={() => handleOpenEventModal('RED_CARD')}
                className="py-2.5 px-3 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95"
              >
                <span>🟥</span>
                <span>লাল কার্ড</span>
              </button>

              <button
                onClick={() => handleOpenEventModal('SUBSTITUTION')}
                className="py-2.5 px-3 rounded-xl bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-500/40 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95"
              >
                <span>🔄</span>
                <span>বদল (Sub)</span>
              </button>

              <button
                onClick={() => handleOpenEventModal('FOUL')}
                className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95"
              >
                <span>🛑</span>
                <span>+ ফাউল</span>
              </button>

              <button
                onClick={() => handleOpenEventModal('SAVE')}
                className="py-2.5 px-3 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95"
              >
                <span>🧤</span>
                <span>+ সেভ</span>
              </button>
            </div>

            {/* Match Status & Time Steppers */}
            <div className="flex flex-wrap items-center gap-2 bg-slate-950 p-3 rounded-2xl border border-slate-800/80">
              <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
                <button
                  onClick={() => onUpdateMatchStatus(
                    currentMatch.id,
                    currentMatch.status,
                    Math.max(0, currentMatch.currentMinute - 1),
                    currentMatch.isClockRunning
                  )}
                  className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg text-xs"
                  title="-1 Minute"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="px-2 text-xs font-mono font-bold text-emerald-400">{currentMatch.currentMinute}'</span>
                <button
                  onClick={() => onUpdateMatchStatus(
                    currentMatch.id,
                    currentMatch.status,
                    currentMatch.currentMinute + 1,
                    currentMatch.isClockRunning
                  )}
                  className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg text-xs"
                  title="+1 Minute"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              <select
                value={currentMatch.status}
                onChange={(e) => onUpdateMatchStatus(
                  currentMatch.id,
                  e.target.value as MatchStatus,
                  currentMatch.currentMinute,
                  currentMatch.isClockRunning
                )}
                className="bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-xl px-3 py-2 font-bold focus:outline-none focus:border-emerald-500"
              >
                <option value="UPCOMING">📅 শুরু হয়নি (Upcoming)</option>
                <option value="LIVE_1ST_HALF">🟢 ১st Half Live</option>
                <option value="HALF_TIME">⏸️ Half Time</option>
                <option value="LIVE_2ND_HALF">🟢 2nd Half Live</option>
                <option value="EXTRA_TIME">⚡ Extra Time</option>
                <option value="FINISHED">🏁 Full Time (FT)</option>
              </select>

              <button
                onClick={() => onEditMatch({
                  ...currentMatch,
                  addedMinutes: (currentMatch.addedMinutes || 0) + 1
                })}
                className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-bold flex items-center gap-1 cursor-pointer"
              >
                <span>+১ এক্সট্রা টাইম ({currentMatch.addedMinutes || 0}')</span>
              </button>

              <button
                onClick={() => setShowEditModal(true)}
                className="px-3.5 py-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/40 text-xs font-bold flex items-center gap-1.5 ml-auto cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>ম্যাচ এডিট ও রেফারি</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 🌟 PLAYER OF THE MATCH (ম্যান অব দ্য ম্যাচ) 🏆 */}
      {(currentMatch.potmPlayerName || (isAdmin && currentMatch.status !== 'UPCOMING')) && (
        <div className="bg-gradient-to-r from-amber-950/50 via-slate-900 to-amber-950/30 rounded-3xl border border-amber-500/40 p-5 sm:p-6 shadow-2xl relative overflow-hidden">
          <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
            <div className="flex items-center gap-4">
              <div className="relative flex-shrink-0">
                {(() => {
                  const potmPlayer = players.find(p => p.id === currentMatch.potmPlayerId);
                  return (
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-950 border-2 border-amber-400 p-1 shadow-xl shadow-amber-950/50 overflow-hidden flex items-center justify-center">
                      {potmPlayer?.photoUrl ? (
                        <img
                          src={potmPlayer.photoUrl}
                          alt={currentMatch.potmPlayerName || 'POTM'}
                          className="w-full h-full object-cover rounded-xl"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="text-center">
                          <span className="text-2xl">👑</span>
                          {potmPlayer?.jerseyNumber && (
                            <span className="block text-[10px] font-black text-amber-300 font-mono">
                              #{potmPlayer.jerseyNumber}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })()}

                <div className="absolute -bottom-1.5 -right-1.5 bg-amber-400 text-slate-950 p-1 rounded-lg shadow-md">
                  <Star className="w-3.5 h-3.5 fill-current" />
                </div>
              </div>

              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-400 text-[10px] font-black uppercase tracking-wider mb-1">
                  <Trophy className="w-3 h-3" />
                  <span>Player Of The Match (ম্যান অব দ্য ম্যাচ)</span>
                </div>

                <h3 className="text-lg sm:text-xl font-black text-white font-display flex items-center gap-2">
                  <span>{currentMatch.potmPlayerName || 'ম্যান অব দ্য ম্যাচ নির্বাচিত হয়নি'}</span>
                </h3>

                {currentMatch.potmReason ? (
                  <p className="text-xs text-amber-200/90 font-medium mt-0.5">
                    ✨ {currentMatch.potmReason}
                  </p>
                ) : (
                  <p className="text-xs text-slate-400 mt-0.5">
                    ম্যাচে অসাধারণ নৈপুণ্য ও পারফরম্যান্সের স্বীকৃতি
                  </p>
                )}
              </div>
            </div>

            {isAdmin && (
              <button
                onClick={() => setShowEditModal(true)}
                className="px-4 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer flex-shrink-0"
              >
                <Award className="w-3.5 h-3.5" />
                <span>{currentMatch.potmPlayerName ? 'POTM পরিবর্তন' : '👑 POTM নির্বাচন করুন'}</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* 📊 MATCH STATISTICS COMPARISON PANEL */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-base font-extrabold text-white font-display">লাইভ ম্যাচ পরিসংখ্যান (Match Statistics)</h4>
              <p className="text-xs text-slate-400">{homeTeam.shortName} বনাম {awayTeam.shortName} হেড-টু-হেড বিশ্লেষণ</p>
            </div>
          </div>

          <button
            onClick={() => setShowPdfModal(true)}
            className="text-xs text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1 cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>PDF রিপোর্ট দেখুন</span>
          </button>
        </div>

        {/* Stats Table & Quick Admin Buttons */}
        <div className="space-y-3 pt-2">
          {/* Possession Bar */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-bold">
              <div className="flex items-center gap-1.5">
                {isAdmin && (
                  <button onClick={() => updateStats('home', 'possession', -5)} className="text-slate-500 hover:text-white px-1 font-mono">-</button>
                )}
                <span className="font-mono text-emerald-400 text-sm">{homeStats.possession}%</span>
                {isAdmin && (
                  <button onClick={() => updateStats('home', 'possession', 5)} className="text-slate-500 hover:text-white px-1 font-mono">+</button>
                )}
              </div>
              <span className="text-slate-300 font-semibold uppercase tracking-wider text-[11px]">Ball Possession (বল দখল %)</span>
              <div className="flex items-center gap-1.5">
                {isAdmin && (
                  <button onClick={() => updateStats('away', 'possession', -5)} className="text-slate-500 hover:text-white px-1 font-mono">-</button>
                )}
                <span className="font-mono text-blue-400 text-sm">{awayStats.possession}%</span>
                {isAdmin && (
                  <button onClick={() => updateStats('away', 'possession', 5)} className="text-slate-500 hover:text-white px-1 font-mono">+</button>
                )}
              </div>
            </div>
            <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden flex">
              <div className="bg-emerald-500 h-full transition-all duration-500" style={{ width: `${homeStats.possession}%` }} />
              <div className="bg-blue-500 h-full transition-all duration-500" style={{ width: `${awayStats.possession}%` }} />
            </div>
          </div>

          {/* Grid of stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
            {[
              { label: 'Total Shots (মোট শট)', key: 'shots' as keyof MatchStats },
              { label: '🎯 Shots on Target (টার্গেটে শট)', key: 'shotsOnTarget' as keyof MatchStats },
              { label: '🎯 Shots off Target (টার্গেট ছাড়া শট)', key: 'shotsOffTarget' as keyof MatchStats },
              { label: '🚩 Corner Kicks (কর্নার কিক)', key: 'corners' as keyof MatchStats },
              { label: '⚠️ Fouls Committed (ফাউল)', key: 'fouls' as keyof MatchStats },
              { label: '🚩 Offsides (অফসাইড)', key: 'offsides' as keyof MatchStats },
              { label: '🧤 Goalkeeper Saves (সেভ)', key: 'saves' as keyof MatchStats },
              { label: '⚡ Passes Completed (পাস)', key: 'passes' as keyof MatchStats },
            ].map(item => (
              <div key={item.key} className="bg-slate-950/60 p-3 rounded-2xl border border-slate-800 flex items-center justify-between gap-3 text-xs">
                {/* Home side */}
                <div className="flex items-center gap-1.5">
                  {isAdmin && (
                    <button
                      onClick={() => updateStats('home', item.key, -1)}
                      className="w-5 h-5 rounded-md bg-slate-900 hover:bg-slate-800 text-slate-400 flex items-center justify-center text-xs cursor-pointer"
                    >
                      -
                    </button>
                  )}
                  <span className="font-mono font-bold text-white text-sm w-7 text-center">
                    {homeStats[item.key] as number}
                  </span>
                  {isAdmin && (
                    <button
                      onClick={() => updateStats('home', item.key, 1)}
                      className="w-5 h-5 rounded-md bg-slate-900 hover:bg-slate-800 text-slate-400 flex items-center justify-center text-xs cursor-pointer"
                    >
                      +
                    </button>
                  )}
                </div>

                {/* Stat label */}
                <span className="font-medium text-slate-400 text-center flex-1">{item.label}</span>

                {/* Away side */}
                <div className="flex items-center gap-1.5">
                  {isAdmin && (
                    <button
                      onClick={() => updateStats('away', item.key, -1)}
                      className="w-5 h-5 rounded-md bg-slate-900 hover:bg-slate-800 text-slate-400 flex items-center justify-center text-xs cursor-pointer"
                    >
                      -
                    </button>
                  )}
                  <span className="font-mono font-bold text-white text-sm w-7 text-center">
                    {awayStats[item.key] as number}
                  </span>
                  {isAdmin && (
                    <button
                      onClick={() => updateStats('away', item.key, 1)}
                      className="w-5 h-5 rounded-md bg-slate-900 hover:bg-slate-800 text-slate-400 flex items-center justify-center text-xs cursor-pointer"
                    >
                      +
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ⏱️ Events Timeline & Match Story Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Events Timeline */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-5">
            <h4 className="font-extrabold text-base text-white font-display flex items-center gap-2">
              <span>⏱️</span>
              <span>লাইভ ইভেন্ট ও টাইমলাইন (Events Timeline)</span>
            </h4>
            <span className="text-xs text-slate-400 font-semibold">
              {currentMatch.events.length} ইভেন্ট
            </span>
          </div>

          {currentMatch.events.length === 0 ? (
            <div className="py-12 text-center text-slate-500 bg-slate-950/40 rounded-2xl border border-dashed border-slate-800">
              <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-xs">এখনো কোনো গোল বা কার্ডের ইভেন্ট যুক্ত করা হয়নি।</p>
              {isAdmin && (
                <button
                  onClick={() => handleOpenEventModal('GOAL')}
                  className="mt-3 text-xs text-emerald-400 hover:text-emerald-300 font-bold cursor-pointer"
                >
                  + প্রথম গোল যুক্ত করুন
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {currentMatch.events.map(ev => {
                const team = teams.find(t => t.id === ev.teamId);

                return (
                  <div
                    key={ev.id}
                    className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all ${
                      ev.type === 'GOAL' || ev.type === 'PENALTY_GOAL'
                        ? 'bg-emerald-950/20 border-emerald-500/30'
                        : ev.type === 'YELLOW_CARD'
                        ? 'bg-amber-950/20 border-amber-500/30'
                        : ev.type === 'RED_CARD' || ev.type === 'SECOND_YELLOW_RED'
                        ? 'bg-rose-950/20 border-rose-500/30'
                        : ev.type === 'SUBSTITUTION'
                        ? 'bg-blue-950/20 border-blue-500/30'
                        : 'bg-slate-950/60 border-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center font-mono font-bold text-xs text-emerald-400">
                        {ev.minute}'
                      </span>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-base">
                            {ev.type === 'GOAL' ? '⚽' : ev.type === 'PENALTY_GOAL' ? '🥅' : ev.type === 'OWN_GOAL' ? '💥' : ev.type === 'YELLOW_CARD' ? '🟨' : ev.type === 'RED_CARD' ? '🟥' : ev.type === 'SUBSTITUTION' ? '🔄' : ev.type === 'SAVE' ? '🧤' : '🛑'}
                          </span>
                          <span className="font-bold text-sm text-white">{ev.playerName}</span>
                          <span className="text-xs text-slate-400">({team?.shortName})</span>
                        </div>

                        {ev.assistPlayerName && (
                          <p className="text-xs text-slate-400 mt-0.5">
                            👟 অ্যাসিস্ট: <span className="text-slate-300 font-medium">{ev.assistPlayerName}</span>
                          </p>
                        )}

                        {ev.note && (
                          <p className="text-xs text-slate-400 mt-0.5 italic">
                            "{ev.note}"
                          </p>
                        )}
                      </div>
                    </div>

                    {isAdmin && (
                      <button
                        onClick={() => onDeleteEvent(currentMatch.id, ev.id)}
                        className="text-slate-500 hover:text-rose-400 p-2 rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
                        title="ইভেন্ট ডিলিট ও স্কোর রোলব্যাক করুন"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Match Story & Notes */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-extrabold text-base text-white font-display flex items-center gap-2">
                <span>📝</span>
                <span>ম্যাচ স্টোরি ও ধারাভাষ্য</span>
              </h4>
              {isAdmin && !isEditingStory && (
                <button
                  onClick={() => {
                    setStoryText(currentMatch.matchStoryNotes || '');
                    setIsEditingStory(true);
                  }}
                  className="text-xs text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>এডিট</span>
                </button>
              )}
            </div>

            {isEditingStory ? (
              <div className="space-y-3">
                <textarea
                  rows={6}
                  value={storyText}
                  onChange={(e) => setStoryText(e.target.value)}
                  placeholder="ম্যাচের হাইলাইটস ও বিবরণ লিখুন..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3 text-xs text-white focus:outline-none focus:border-emerald-500 resize-none"
                />
                <div className="flex items-center justify-end gap-2">
                  <button
                    onClick={() => setIsEditingStory(false)}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold"
                  >
                    বাতিল
                  </button>
                  <button
                    onClick={handleSaveStory}
                    className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1 shadow-md shadow-emerald-950 cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>সেভ</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80 text-xs text-slate-300 leading-relaxed min-h-[140px]">
                {currentMatch.matchStoryNotes ? (
                  <p>{currentMatch.matchStoryNotes}</p>
                ) : (
                  <p className="text-slate-500 italic">
                    ম্যাচের কোনো স্টোরি বা বিশেষ নোট যুক্ত করা হয়নি। অ্যাডমিন মোডে এডিট করে যেকোনো বিবরণ লিখতে পারেন।
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800/80 text-xs text-slate-400 flex items-center justify-between">
            <span>🏟️ {currentMatch.venue}</span>
            <span>{currentMatch.matchDate}</span>
          </div>
        </div>
      </div>

      {/* ⚽ Add Event Modal */}
      {showEventModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-700/90 rounded-3xl max-w-md w-full p-6 shadow-2xl relative">
            <h3 className="text-lg font-black text-white font-display mb-4 flex items-center gap-2">
              <span>{selectedEventType === 'GOAL' ? '⚽' : selectedEventType === 'YELLOW_CARD' ? '🟨' : selectedEventType === 'RED_CARD' ? '🟥' : selectedEventType === 'SUBSTITUTION' ? '🔄' : '🛑'}</span>
              <span>ইভেন্ট যুক্ত করুন</span>
            </h3>

            <form onSubmit={handleSaveEvent} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  ইভেন্টের ধরণ (Event Type)
                </label>
                <select
                  value={selectedEventType}
                  onChange={(e) => setSelectedEventType(e.target.value as EventType)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-bold"
                >
                  <option value="GOAL">⚽ গোল (Goal)</option>
                  <option value="PENALTY_GOAL">🥅 পেনাল্টি গোল (Penalty Goal)</option>
                  <option value="OWN_GOAL">💥 ওন গোল (Own Goal)</option>
                  <option value="YELLOW_CARD">🟨 হলুদ কার্ড (Yellow Card)</option>
                  <option value="RED_CARD">🟥 লাল কার্ড (Red Card)</option>
                  <option value="SUBSTITUTION">🔄 বদলি খেলোয়াড় (Substitution)</option>
                  <option value="SAVE">🧤 গোলকিপার সেভ (Save)</option>
                  <option value="FOUL">🛑 ফাউল (Foul)</option>
                  <option value="PENALTY_MISSED">❌ পেনাল্টি মিস (Missed Penalty)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  দল নির্বাচন করুন
                </label>
                <select
                  value={selectedTeamId}
                  onChange={(e) => {
                    setSelectedTeamId(e.target.value);
                    const tPlayers = players.filter(p => p.teamId === e.target.value);
                    setSelectedPlayerId(tPlayers[0]?.id || '');
                    setSelectedSubOutPlayerId(tPlayers[1]?.id || '');
                  }}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-bold"
                  required
                >
                  <option value={homeTeam.id}>{homeTeam.name} (Home)</option>
                  <option value={awayTeam.id}>{awayTeam.name} (Away)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  {selectedEventType === 'SUBSTITUTION' ? 'খেলোয়াড় মাঠের ভেতরে প্রবেশ (Player IN)' : 'খেলোয়াড়'}
                </label>
                {teamPlayers.length === 0 ? (
                  <p className="text-xs text-amber-400 py-1.5">
                    এই দলে কোনো প্লেয়ার যুক্ত করা নেই। Clubs ট্যাবে গিয়ে প্লেয়ার সাইন করুন।
                  </p>
                ) : (
                  <select
                    value={selectedPlayerId}
                    onChange={(e) => setSelectedPlayerId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-bold"
                    required
                  >
                    {teamPlayers.map(p => (
                      <option key={p.id} value={p.id}>
                        #{p.jerseyNumber} {p.name} ({p.position})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {selectedEventType === 'SUBSTITUTION' && (
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    খেলোয়াড় মাঠ থেকে বাইরে (Player OUT)
                  </label>
                  <select
                    value={selectedSubOutPlayerId}
                    onChange={(e) => setSelectedSubOutPlayerId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-bold"
                  >
                    {teamPlayers.filter(p => p.id !== selectedPlayerId).map(p => (
                      <option key={p.id} value={p.id}>
                        #{p.jerseyNumber} {p.name} ({p.position})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {selectedEventType === 'GOAL' && (
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    অ্যাসিস্ট (ঐচ্ছিক)
                  </label>
                  <select
                    value={selectedAssistPlayerId}
                    onChange={(e) => setSelectedAssistPlayerId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="">কোনো অ্যাসিস্ট নেই (Solo / Penalty)</option>
                    {teamPlayers.filter(p => p.id !== selectedPlayerId).map(p => (
                      <option key={p.id} value={p.id}>
                        #{p.jerseyNumber} {p.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    মিনিট (Minute)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="130"
                    value={eventMinute}
                    onChange={(e) => setEventMinute(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white text-center font-bold focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    নোট (ঐচ্ছিক)
                  </label>
                  <input
                    type="text"
                    placeholder="যেমন: হেড / ফ্রি কিক"
                    value={eventNote}
                    onChange={(e) => setEventNote(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowEventModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={!selectedPlayerId}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold shadow-md shadow-emerald-950 cursor-pointer"
                >
                  যোগ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 📄 PDF Match Summary Modal */}
      {showPdfModal && (
        <MatchSummaryPdfModal
          isOpen={showPdfModal}
          onClose={() => setShowPdfModal(false)}
          match={currentMatch}
          teams={teams}
          players={players}
          tournamentInfo={tournamentInfo || {
            name: 'NPL Night Football Premier League 2026–2027',
            tagline: '৮ম বর্ষ • এলাকাভিত্তিক নাইট ফুটবল টুর্নামেন্ট',
            edition: '৮ম বর্ষ',
            category: 'এলাকাভিত্তিক নাইট ফুটবল টুর্নামেন্ট',
            poweredBy: 'Sky Star Boys Club (Noyagaon)',
            coSponsors: ['Brand RMT', 'শাকিল এন্ড ব্রাদার্স (Shakil & Brothers)', 'শরীফ এন্ড ব্রাদার্স (Sharif & Brothers)'],
            bannerPhotoUrl: '',
            facebookPageUrl: '',
            venueName: 'নয়াগাঁও সেন্ট্রাল স্টেডিয়াম গ্রাউন্ড',
            venueLocation: 'নয়াগাঁও',
            contactNumber: '+880 1700-000000',
            organizerName: 'Sky Star Boys Club Management',
            startDate: '০১ নভেম্বর ২০২৬',
            endDate: '২৮ ফেব্রুয়ারি ২০২৭',
            prizeMoney: 'চ্যাম্পিয়ন: ট্রফি ও সম্মাননা',
            rulesSummary: 'আন্তর্জাতিক ও স্থানীয় ফুটবল রুলস',
            notices: []
          }}
        />
      )}

      {/* Edit Match Modal */}
      {isAdmin && (
        <EditMatchModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          match={currentMatch}
          teams={teams}
          players={players}
          onSave={onEditMatch}
          onDelete={onDeleteMatch}
        />
      )}

      {/* Create Match Modal */}
      {isAdmin && (
        <CreateMatchModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          teams={teams}
          onCreateMatch={onCreateMatch}
        />
      )}

      {/* Floating Match Reminder Notification Toast */}
      {reminderToast && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce bg-slate-900 border border-emerald-500/60 text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 backdrop-blur-md">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <BellRing className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold">{reminderToast}</span>
        </div>
      )}
    </div>
  );
};
