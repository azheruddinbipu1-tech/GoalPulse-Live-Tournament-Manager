import React, { useState } from 'react';
import { Match, Team, Player } from '../types';
import { 
  ShieldCheck, 
  Lock, 
  Unlock, 
  Key, 
  Calendar, 
  RotateCcw, 
  Plus, 
  Users, 
  Trophy, 
  DollarSign, 
  Activity,
  Trash2,
  DownloadCloud,
  Edit3,
  MapPin,
  Clock,
  Play,
  CheckCircle2,
  Award,
  Filter
} from 'lucide-react';
import { CreateMatchModal } from './CreateMatchModal';
import { EditMatchModal } from './EditMatchModal';

interface AdminHubViewProps {
  isAdmin: boolean;
  adminPin: string;
  onUpdatePin: (newPin: string) => void;
  onToggleAdmin: () => void;
  matches: Match[];
  teams: Team[];
  players: Player[];
  onCreateMatch: (match: Match) => void;
  onEditMatch?: (match: Match) => void;
  onDeleteMatch?: (matchId: string) => void;
  onResetData: () => void;
  onLoadDemoData: () => void;
  onNavigateToMatch: (matchId: string) => void;
}

export const AdminHubView: React.FC<AdminHubViewProps> = ({
  isAdmin,
  adminPin,
  onUpdatePin,
  onToggleAdmin,
  matches,
  teams,
  players,
  onCreateMatch,
  onEditMatch,
  onDeleteMatch,
  onResetData,
  onLoadDemoData,
  onNavigateToMatch
}) => {
  // PIN change state
  const [showPinModal, setShowPinModal] = useState(false);
  const [newPin, setNewPin] = useState('');
  const [pinError, setPinError] = useState('');

  // Create match modal state
  const [showMatchModal, setShowMatchModal] = useState(false);
  
  // Edit match modal state
  const [editingMatch, setEditingMatch] = useState<Match | null>(null);

  // Match list filter
  const [matchFilter, setMatchFilter] = useState<'ALL' | 'UPCOMING' | 'LIVE' | 'FINISHED'>('ALL');

  const totalTransferValue = players.reduce((sum, p) => sum + p.purchasePrice, 0);

  const handleSavePin = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPin.length < 4) {
      setPinError('PIN অন্তত ৪ ডিজিট হতে হবে');
      return;
    }
    onUpdatePin(newPin);
    setShowPinModal(false);
    setNewPin('');
    setPinError('');
  };

  const filteredMatches = matches.filter(m => {
    if (matchFilter === 'UPCOMING') return m.status === 'UPCOMING';
    if (matchFilter === 'LIVE') {
      return m.status === 'LIVE_1ST_HALF' || m.status === 'LIVE_2ND_HALF' || m.status === 'HALF_TIME' || m.status === 'EXTRA_TIME';
    }
    if (matchFilter === 'FINISHED') return m.status === 'FINISHED';
    return true;
  });

  const upcomingCount = matches.filter(m => m.status === 'UPCOMING').length;
  const liveCount = matches.filter(m => m.status === 'LIVE_1ST_HALF' || m.status === 'LIVE_2ND_HALF' || m.status === 'HALF_TIME' || m.status === 'EXTRA_TIME').length;
  const finishedCount = matches.filter(m => m.status === 'FINISHED').length;

  const handleDeleteMatchWithConfirm = (matchId: string) => {
    if (confirm('আপনি কি নিশ্চিতভাবে এই ম্যাচটি মুছে ফেলতে চান?')) {
      onDeleteMatch?.(matchId);
    }
  };

  return (
    <div className="space-y-8 pb-16">
      {/* 1. Admin Status Banner */}
      <div className={`rounded-3xl p-6 sm:p-8 border transition-all ${
        isAdmin 
          ? 'bg-gradient-to-r from-emerald-950/60 via-slate-900 to-slate-900 border-emerald-500/40 shadow-xl'
          : 'bg-slate-900 border-slate-800'
      }`}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className={`h-14 w-14 rounded-2xl flex items-center justify-center shadow-lg ${
              isAdmin 
                ? 'bg-emerald-500 text-slate-950 shadow-emerald-900/50 font-bold' 
                : 'bg-slate-800 text-slate-400 border border-slate-700'
            }`}>
              {isAdmin ? <Unlock className="w-7 h-7" /> : <Lock className="w-7 h-7" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-extrabold text-white font-display">
                  {isAdmin ? 'অ্যাডমিন মোড সক্রিয় (Admin Unlocked)' : 'পাবলিক স্পেকটেটর ভিউ (Spectator Mode)'}
                </h3>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  isAdmin 
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                    : 'bg-slate-800 text-slate-400 border border-slate-700'
                }`}>
                  {isAdmin ? 'Full Access' : 'Read Only'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1 max-w-xl">
                {isAdmin 
                  ? 'আপনি দল তৈরি, ম্যাচ শিডিউল, লাইভ স্কোর আপডেট, গোল/কার্ড যোগ এবং পয়েন্টস টেবিল সম্পূর্ণ নিয়ন্ত্রণ করতে পারছেন।'
                  : 'ম্যাচ পরিচালনা ও ডেটা নিয়ন্ত্রণের জন্য আপনার অ্যাডমিন পিন (Admin PIN) দিয়ে আনলক করুন।'}
              </p>
            </div>
          </div>

          <button
            onClick={onToggleAdmin}
            className={`px-5 py-2.5 rounded-2xl font-bold text-xs flex items-center gap-2 transition-all shadow-md cursor-pointer ${
              isAdmin
                ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-950'
            }`}
          >
            {isAdmin ? (
              <>
                <Lock className="w-3.5 h-3.5" />
                <span>লক করুন (Lock)</span>
              </>
            ) : (
              <>
                <Unlock className="w-3.5 h-3.5" />
                <span>আনলক অ্যাডমিন (Unlock)</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 2. Tournament Overview Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>মোট দল (Clubs)</span>
          </div>
          <div className="text-2xl font-black text-white font-display">
            {teams.length}
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-2">
            <Users className="w-4 h-4 text-emerald-400" />
            <span>মোট খেলোয়াড়</span>
          </div>
          <div className="text-2xl font-black text-white font-display">
            {players.length}
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-2">
            <Activity className="w-4 h-4 text-emerald-400" />
            <span>মোট ম্যাচ (Matches)</span>
          </div>
          <div className="text-2xl font-black text-white font-display">
            {matches.length}
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-2">
            <DollarSign className="w-4 h-4 text-emerald-400" />
            <span>লিগ মার্কেট ভ্যালু</span>
          </div>
          <div className="text-2xl font-black text-emerald-400 font-display">
            ৳{totalTransferValue.toFixed(1)}M
          </div>
        </div>
      </div>

      {/* 3. MATCH SCHEDULE & FIXTURES MANAGER 📅⚽ */}
      <div className="bg-slate-900/90 rounded-3xl border border-slate-800 p-6 sm:p-8 shadow-2xl space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white font-display">
                ম্যাচ শিডিউল ও ফিক্সচার ম্যানেজার (Match Schedule)
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                সকল ম্যাচের সময়সূচি, ভেন্যু, ফলাফল এবং রাউন্ড নিয়ন্ত্রণ করুন
              </p>
            </div>
          </div>

          {isAdmin && (
            <button
              onClick={() => setShowMatchModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-lg shadow-emerald-950 transition-all cursor-pointer flex-shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>+ নতুন ম্যাচ শিডিউল করুন</span>
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setMatchFilter('ALL')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              matchFilter === 'ALL'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950'
                : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <span>সব ম্যাচ</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-black/30 font-mono">
              {matches.length}
            </span>
          </button>

          <button
            onClick={() => setMatchFilter('UPCOMING')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              matchFilter === 'UPCOMING'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-950'
                : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <span>আসন্ন / শুরু হয়নি</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-black/30 font-mono">
              {upcomingCount}
            </span>
          </button>

          <button
            onClick={() => setMatchFilter('LIVE')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              matchFilter === 'LIVE'
                ? 'bg-rose-600 text-white shadow-md shadow-rose-950'
                : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse" />
            <span>লাইভ ম্যাচ</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-black/30 font-mono">
              {liveCount}
            </span>
          </button>

          <button
            onClick={() => setMatchFilter('FINISHED')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              matchFilter === 'FINISHED'
                ? 'bg-slate-700 text-white shadow-md'
                : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <span>সমাপ্ত ম্যাচ</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-black/30 font-mono">
              {finishedCount}
            </span>
          </button>
        </div>

        {/* Matches List Grid */}
        {filteredMatches.length === 0 ? (
          <div className="bg-slate-950/40 rounded-2xl border border-dashed border-slate-800 p-10 text-center space-y-3">
            <Calendar className="w-10 h-10 text-slate-600 mx-auto opacity-50" />
            <p className="text-xs text-slate-400">
              এই ফিল্টারে কোনো ম্যাচ খুঁজে পাওয়া যায়নি।
            </p>
            {isAdmin && (
              <button
                onClick={() => setShowMatchModal(true)}
                className="px-4 py-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/40 text-xs font-bold transition-all cursor-pointer"
              >
                + নতুন ম্যাচ শিডিউল তৈরি করুন
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredMatches.map(match => {
              const home = teams.find(t => t.id === match.homeTeamId);
              const away = teams.find(t => t.id === match.awayTeamId);
              const isLive = match.status === 'LIVE_1ST_HALF' || match.status === 'LIVE_2ND_HALF' || match.status === 'EXTRA_TIME' || match.status === 'HALF_TIME';
              const isFinished = match.status === 'FINISHED';

              return (
                <div
                  key={match.id}
                  className="bg-slate-950/70 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 sm:p-5 flex flex-col justify-between space-y-4 transition-all shadow-md"
                >
                  {/* Top Bar: Round & Date & Venue */}
                  <div className="flex items-center justify-between gap-2 text-xs border-b border-slate-800/80 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-amber-400 px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/20 text-[11px]">
                        {match.round || 'ম্যাচ'}
                      </span>
                      <span className="text-slate-400 flex items-center gap-1 text-[11px]">
                        <Calendar className="w-3 h-3 text-slate-500" />
                        {match.matchDate}
                      </span>
                    </div>

                    {/* Status Badge */}
                    {isLive ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-rose-500/20 text-rose-400 border border-rose-500/40 animate-pulse">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                        লাইভ ({match.currentMinute}')
                      </span>
                    ) : isFinished ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                        🏁 ম্যাচ সমাপ্ত
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-400 border border-blue-500/40">
                        📅 শিডিউল করা
                      </span>
                    )}
                  </div>

                  {/* Teams and Score Display */}
                  <div className="flex items-center justify-between gap-3 py-2">
                    {/* Home Team */}
                    <div className="flex items-center gap-3 flex-1">
                      <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center overflow-hidden flex-shrink-0">
                        {home?.logoUrl ? (
                          <img src={home.logoUrl} alt={home.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-xs font-bold text-slate-400">{home?.shortName || 'T1'}</span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="font-extrabold text-sm text-white truncate font-display">
                          {home?.name || 'দল ১'}
                        </div>
                        <div className="text-[11px] text-slate-400">{home?.shortName}</div>
                      </div>
                    </div>

                    {/* Score or VS Badge */}
                    <div className="flex flex-col items-center justify-center px-3">
                      {isLive || isFinished ? (
                        <div className="flex items-center gap-2 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800 shadow-inner">
                          <span className="text-lg font-black text-white font-mono">{match.homeScore}</span>
                          <span className="text-xs text-slate-500 font-bold">-</span>
                          <span className="text-lg font-black text-white font-mono">{match.awayScore}</span>
                        </div>
                      ) : (
                        <span className="px-2.5 py-1 rounded-lg bg-slate-900 text-[10px] font-black text-slate-400 border border-slate-800">
                          VS
                        </span>
                      )}
                    </div>

                    {/* Away Team */}
                    <div className="flex items-center justify-end gap-3 flex-1 text-right">
                      <div className="min-w-0">
                        <div className="font-extrabold text-sm text-white truncate font-display">
                          {away?.name || 'দল ২'}
                        </div>
                        <div className="text-[11px] text-slate-400">{away?.shortName}</div>
                      </div>
                      <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center overflow-hidden flex-shrink-0">
                        {away?.logoUrl ? (
                          <img src={away.logoUrl} alt={away.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-xs font-bold text-slate-400">{away?.shortName || 'T2'}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Venue & POTM Details */}
                  <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/60">
                    <span className="flex items-center gap-1 truncate">
                      <MapPin className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                      <span>{match.venue || 'মাঠ/ভেন্যু নির্ধারিত নেই'}</span>
                    </span>

                    {match.potmPlayerName && (
                      <span className="flex items-center gap-1 text-amber-300 font-medium">
                        <Award className="w-3 h-3 text-amber-400 flex-shrink-0" />
                        <span>POTM: {match.potmPlayerName}</span>
                      </span>
                    )}
                  </div>

                  {/* Action Buttons for Match Control */}
                  <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-800/80">
                    <button
                      onClick={() => onNavigateToMatch(match.id)}
                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 text-xs font-bold transition-all cursor-pointer"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>লাইভ স্কোর ও নিয়ন্ত্রণ</span>
                    </button>

                    {isAdmin && (
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => setEditingMatch(match)}
                          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs transition-all cursor-pointer"
                          title="শিডিউল ও স্কোর এডিট করুন"
                        >
                          <Edit3 className="w-3.5 h-3.5 text-emerald-400" />
                        </button>
                        <button
                          onClick={() => handleDeleteMatchWithConfirm(match.id)}
                          className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-xs transition-all cursor-pointer"
                          title="ম্যাচ মুছে ফেলুন"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 4. Admin Tools & Actions (Protected) */}
      {isAdmin ? (
        <div className="bg-slate-900/90 rounded-3xl border border-slate-800 p-6 sm:p-8 shadow-2xl space-y-6">
          <h4 className="text-base font-bold text-white font-display">অ্যাডমিন সিস্টেম ও ডেটা কন্ট্রোল</h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Tool 1: Change Security PIN */}
            <div className="bg-slate-950/60 border border-slate-800 p-5 rounded-2xl flex flex-col justify-between space-y-4">
              <div>
                <div className="h-10 w-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center mb-3">
                  <Key className="w-5 h-5" />
                </div>
                <h5 className="font-bold text-white text-sm">অ্যাডমিন PIN পরিবর্তন</h5>
                <p className="text-xs text-slate-400 mt-1">
                  বর্তমান পিন: <span className="font-mono font-bold text-emerald-400">{adminPin}</span>। প্রয়োজন হলে নতুন পিন সেট করুন।
                </p>
              </div>

              <button
                onClick={() => {
                  setNewPin('');
                  setPinError('');
                  setShowPinModal(true);
                }}
                className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition-all border border-slate-700 cursor-pointer"
              >
                পিন আপডেট করুন
              </button>
            </div>

            {/* Tool 2: Clear All Data / Start Fresh */}
            <div className="bg-slate-950/60 border border-slate-800 p-5 rounded-2xl flex flex-col justify-between space-y-4">
              <div>
                <div className="h-10 w-10 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center mb-3">
                  <Trash2 className="w-5 h-5" />
                </div>
                <h5 className="font-bold text-white text-sm">সব ডেটা মুছে শূন্য করুন</h5>
                <p className="text-xs text-slate-400 mt-1">
                  সব দল, প্লেয়ার, ম্যাচ ও পয়েন্ট মুছে একদম নতুনভাবে নিজের ইচ্ছামতো শুরু করার জন্য।
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={onResetData}
                  className="flex-1 py-2 px-3 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 font-bold text-xs transition-all cursor-pointer"
                >
                  সব মুছুন (Clear All)
                </button>
                <button
                  onClick={onLoadDemoData}
                  className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 font-bold text-xs transition-all cursor-pointer"
                  title="ডেমো ডেটা লোড করুন"
                >
                  <DownloadCloud className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-slate-900/80 rounded-3xl border border-slate-800 p-6 sm:p-8 shadow-xl text-center space-y-4 max-w-xl mx-auto">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto">
            <Lock className="w-7 h-7" />
          </div>
          <div>
            <h4 className="text-lg font-bold text-white font-display">
              🔒 পাবলিক রিড-অনলি মোড সক্রিয়
            </h4>
            <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
              পাবলিক মোডে সাধারণ দর্শকরা কেবল লাইভ স্কোর, পয়েন্ট টেবিল, নোটিশ ও ছবি দেখতে পারবেন। কোনো তথ্য বা স্কোর এডিট বা ডিলিট করা সম্পূর্ণ নিষিদ্ধ ও সুরক্ষিত রাখা হয়েছে।
            </p>
          </div>
          <div className="pt-2">
            <button
              onClick={onToggleAdmin}
              className="px-6 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-950 transition-all cursor-pointer inline-flex items-center gap-2"
            >
              <Unlock className="w-4 h-4" />
              <span>অ্যাডমিন PIN দিয়ে আনলক করুন</span>
            </button>
          </div>
        </div>
      )}

      {/* MODAL: Schedule Match */}
      {isAdmin && (
        <CreateMatchModal
          isOpen={showMatchModal}
          onClose={() => setShowMatchModal(false)}
          teams={teams}
          onCreateMatch={(matchData) => {
            const newMatch: Match = {
              id: `match-${Date.now()}`,
              homeTeamId: matchData.homeTeamId,
              awayTeamId: matchData.awayTeamId,
              homeScore: matchData.homeScore || 0,
              awayScore: matchData.awayScore || 0,
              status: matchData.status,
              currentMinute: 0,
              addedMinutes: 0,
              isClockRunning: false,
              venue: matchData.venue,
              matchDate: matchData.matchDate,
              round: matchData.round,
              matchStoryNotes: '',
              events: []
            };
            onCreateMatch(newMatch);
            setShowMatchModal(false);
            onNavigateToMatch(newMatch.id);
          }}
        />
      )}

      {/* MODAL: Edit Match */}
      {editingMatch && (
        <EditMatchModal
          isOpen={!!editingMatch}
          onClose={() => setEditingMatch(null)}
          match={editingMatch}
          teams={teams}
          players={players}
          onSave={(updated) => {
            onEditMatch?.(updated);
            setEditingMatch(null);
          }}
          onDelete={(id) => {
            onDeleteMatch?.(id);
            setEditingMatch(null);
          }}
        />
      )}

      {/* MODAL: Change PIN */}
      {showPinModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-sm w-full p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white font-display mb-3">নতুন অ্যাডমিন PIN সেট করুন</h3>
            <p className="text-xs text-slate-400 mb-4">
              কমপক্ষে ৪ ডিজিটের সংখ্যা লিখুন।
            </p>

            <form onSubmit={handleSavePin} className="space-y-4">
              <div>
                <input
                  type="password"
                  maxLength={6}
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))}
                  placeholder="যেমন: 5678"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-center text-xl font-mono text-white tracking-widest"
                  required
                />
                {pinError && <p className="text-xs text-rose-400 mt-1 text-center">{pinError}</p>}
              </div>

              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowPinModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-950 cursor-pointer"
                >
                  পিন সেভ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
