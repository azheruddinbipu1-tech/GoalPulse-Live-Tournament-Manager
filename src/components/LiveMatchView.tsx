import React, { useState } from 'react';
import { 
  Match, 
  Team, 
  Player, 
  MatchEvent, 
  EventType, 
  MatchStatus 
} from '../types';
import { 
  Play, 
  Pause, 
  Plus, 
  Trash2, 
  Edit3, 
  Save, 
  RotateCcw, 
  Clock, 
  AlertCircle, 
  Calendar, 
  MapPin, 
  Award,
  ChevronRight,
  Shield,
  Zap,
  CheckCircle2,
  Users,
  Trophy,
  Star
} from 'lucide-react';
import { EditMatchModal } from './EditMatchModal';
import { CreateMatchModal } from './CreateMatchModal';

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
  onNavigateToClubs
}) => {
  const currentMatch = matches.find(m => m.id === selectedMatchId) || matches[0];
  const homeTeam = teams.find(t => t.id === currentMatch?.homeTeamId);
  const awayTeam = teams.find(t => t.id === currentMatch?.awayTeamId);

  // Modals state
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEventModal, setShowEventModal] = useState(false);
  const [selectedEventType, setSelectedEventType] = useState<EventType>('GOAL');
  const [selectedTeamId, setSelectedTeamId] = useState<string>('');
  const [selectedPlayerId, setSelectedPlayerId] = useState<string>('');
  const [selectedAssistPlayerId, setSelectedAssistPlayerId] = useState<string>('');
  const [eventMinute, setEventMinute] = useState<number>(currentMatch?.currentMinute || 1);
  const [eventNote, setEventNote] = useState<string>('');

  // Story edit state
  const [isEditingStory, setIsEditingStory] = useState(false);
  const [storyText, setStoryText] = useState(currentMatch?.matchStoryNotes || '');

  // Delete event modal
  const [eventToDelete, setEventToDelete] = useState<MatchEvent | null>(null);

  // Empty state if no matches or no teams exist
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
              isAdmin ? (
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-sm flex items-center gap-2 shadow-lg shadow-emerald-950 transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>⚽ নতুন ম্যাচ তৈরি করুন (Create Match)</span>
                </button>
              ) : (
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 text-slate-400 text-xs font-semibold">
                  <span>🔒 পাবলিক ভিউ মোড • ম্যাচ তৈরি করতে অ্যাডমিন পিন প্রয়োজন</span>
                </div>
              )
            )}
          </div>
        </div>

        {/* Create Match Modal */}
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
    setEventMinute(currentMatch.currentMinute || 1);
    setEventNote('');
    setShowEventModal(true);
  };

  const handleSaveEvent = (e: React.FormEvent) => {
    e.preventDefault();
    const player = players.find(p => p.id === selectedPlayerId);
    const assistPlayer = players.find(p => p.id === selectedAssistPlayerId);

    if (!player) return;

    onAddEvent({
      matchId: currentMatch.id,
      type: selectedEventType,
      minute: Number(eventMinute) || currentMatch.currentMinute || 1,
      teamId: selectedTeamId,
      playerId: player.id,
      playerName: player.name,
      assistPlayerId: assistPlayer?.id,
      assistPlayerName: assistPlayer?.name,
      note: eventNote
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
      {/* Match Selector Tabs & New Match Button */}
      <div className="flex items-center justify-between gap-3 overflow-x-auto pb-2 scrollbar-none">
        <div className="flex items-center gap-2">
          {matches.map(m => {
            const h = teams.find(t => t.id === m.homeTeamId);
            const a = teams.find(t => t.id === m.awayTeamId);
            const isSelected = m.id === currentMatch.id;
            const isLive = m.status === 'LIVE_1ST_HALF' || m.status === 'LIVE_2ND_HALF' || m.status === 'EXTRA_TIME';

            return (
              <button
                key={m.id}
                onClick={() => onSelectMatch(m.id)}
                className={`flex items-center gap-2.5 px-4 py-2.5 rounded-2xl border text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-slate-900 border-emerald-500/80 text-white shadow-lg shadow-emerald-950/30'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                {isLive && (
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                )}
                <span>
                  {h?.shortName || 'Team 1'} <span className="text-emerald-400">{m.homeScore} - {m.awayScore}</span> {a?.shortName || 'Team 2'}
                </span>
                <span className="text-[10px] text-slate-500">
                  ({m.status === 'FINISHED' ? 'FT' : `${m.currentMinute}'`})
                </span>
              </button>
            );
          })}
        </div>

        {isAdmin && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/40 text-xs font-extrabold whitespace-nowrap cursor-pointer transition-all ml-auto"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>নতুন ম্যাচ তৈরি</span>
          </button>
        )}
      </div>

      {/* Main Scoreboard Card */}
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

          <div className="flex items-center gap-4 text-slate-400">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {currentMatch.matchDate}
            </span>
            <span className="flex items-center gap-1 hidden sm:flex">
              <MapPin className="w-3.5 h-3.5" />
              {currentMatch.venue}
            </span>

            {/* Admin Edit Match Button */}
            {isAdmin && (
              <button
                onClick={() => setShowEditModal(true)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700 text-xs font-bold transition-colors cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>ম্যাচ এডিট</span>
              </button>
            )}
          </div>
        </div>

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

        {/* Admin Controls Toolbar */}
        {isAdmin && (
          <div className="mt-6 pt-6 border-t border-slate-800/80">
            <div className="text-xs font-bold text-slate-400 mb-3 flex items-center justify-between">
              <span>🛠️ অ্যাডমিন লাইভ ম্যাচ অ্যাকশন ও ইভেন্ট কন্ট্রোল</span>
              <button
                onClick={() => onResetMatchScore(currentMatch.id)}
                className="text-[11px] text-rose-400 hover:text-rose-300 font-semibold flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                <span>স্কোর শূন্য করুন (Reset 0-0)</span>
              </button>
            </div>

            {/* Quick Event Buttons */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 mb-4">
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
                onClick={() => handleOpenEventModal('FOUL')}
                className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95"
              >
                <span>🛑</span>
                <span>+ ফাউল</span>
              </button>

              <button
                onClick={() => handleOpenEventModal('SAVE')}
                className="py-2.5 px-3 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95 col-span-2 sm:col-span-1"
              >
                <span>🧤</span>
                <span>+ সেভ (Save)</span>
              </button>
            </div>

            {/* Match Status & Time Controls */}
            <div className="flex flex-wrap items-center gap-2 bg-slate-950 p-3 rounded-2xl border border-slate-800/80">
              <button
                onClick={() => onUpdateMatchStatus(
                  currentMatch.id,
                  currentMatch.status,
                  currentMatch.currentMinute + 1,
                  currentMatch.isClockRunning
                )}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+১ মিনিট</span>
              </button>

              <select
                value={currentMatch.status}
                onChange={(e) => onUpdateMatchStatus(
                  currentMatch.id,
                  e.target.value as MatchStatus,
                  currentMatch.currentMinute,
                  currentMatch.isClockRunning
                )}
                className="bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-xl px-3 py-1.5 font-bold focus:outline-none focus:border-emerald-500"
              >
                <option value="UPCOMING">📅 শুরু হয়নি (Upcoming)</option>
                <option value="LIVE_1ST_HALF">🟢 ১st Half Live</option>
                <option value="HALF_TIME">⏸️ Half Time</option>
                <option value="LIVE_2ND_HALF">🟢 2nd Half Live</option>
                <option value="EXTRA_TIME">⚡ Extra Time</option>
                <option value="FINISHED">🏁 Full Time (FT)</option>
              </select>

              <button
                onClick={() => setShowEditModal(true)}
                className="px-3.5 py-1.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/40 text-xs font-bold flex items-center gap-1.5 ml-auto cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>সম্পূর্ণ ম্যাচ এডিট করুন</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Player Of The Match (ম্যান অব দ্য ম্যাচ) Showcase Card 🌟🏆 */}
      {(currentMatch.potmPlayerName || (isAdmin && currentMatch.status !== 'UPCOMING')) && (
        <div className="bg-gradient-to-r from-amber-950/50 via-slate-900 to-amber-950/30 rounded-3xl border border-amber-500/40 p-5 sm:p-6 shadow-2xl relative overflow-hidden">
          <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
            <div className="flex items-center gap-4">
              {/* Player Avatar or Badge */}
              <div className="relative flex-shrink-0">
                {(() => {
                  const potmPlayer = players.find(p => p.id === currentMatch.potmPlayerId);
                  const potmTeam = teams.find(t => t.id === potmPlayer?.teamId);
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
                  <span>Player Of The Match</span>
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

      {/* Match Events & Commentary Section */}
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
                  className="mt-3 text-xs text-emerald-400 hover:text-emerald-300 font-bold"
                >
                  + প্রথম গোল যুক্ত করুন
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {currentMatch.events.map(ev => {
                const team = teams.find(t => t.id === ev.teamId);
                const isHome = ev.teamId === currentMatch.homeTeamId;

                return (
                  <div
                    key={ev.id}
                    className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all ${
                      ev.type === 'GOAL'
                        ? 'bg-emerald-950/20 border-emerald-500/30'
                        : ev.type === 'YELLOW_CARD'
                        ? 'bg-amber-950/20 border-amber-500/30'
                        : ev.type === 'RED_CARD'
                        ? 'bg-rose-950/20 border-rose-500/30'
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
                            {ev.type === 'GOAL' ? '⚽' : ev.type === 'YELLOW_CARD' ? '🟨' : ev.type === 'RED_CARD' ? '🟥' : ev.type === 'SAVE' ? '🧤' : '🛑'}
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
                        className="text-slate-500 hover:text-rose-400 p-2 rounded-xl hover:bg-slate-800 transition-colors"
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
                <span>ম্যাচ স্টোরি ও বিবরণ</span>
              </h4>
              {isAdmin && !isEditingStory && (
                <button
                  onClick={() => {
                    setStoryText(currentMatch.matchStoryNotes || '');
                    setIsEditingStory(true);
                  }}
                  className="text-xs text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1"
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
                    className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1 shadow-md shadow-emerald-950"
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

      {/* Add Event Modal */}
      {showEventModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-700/90 rounded-3xl max-w-md w-full p-6 shadow-2xl relative">
            <h3 className="text-lg font-black text-white font-display mb-4 flex items-center gap-2">
              <span>{selectedEventType === 'GOAL' ? '⚽' : selectedEventType === 'YELLOW_CARD' ? '🟨' : selectedEventType === 'RED_CARD' ? '🟥' : '🛑'}</span>
              <span>ইভেন্ট যুক্ত করুন</span>
            </h3>

            <form onSubmit={handleSaveEvent} className="space-y-4">
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
                  খেলোয়াড়
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
                    placeholder="যেমন: পেনাল্টি বা হেড"
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
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold shadow-md shadow-emerald-950"
                >
                  যোগ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
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
    </div>
  );
};
