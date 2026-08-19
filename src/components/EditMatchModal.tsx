import React, { useState, useEffect } from 'react';
import { Match, Team, Player, MatchStatus } from '../types';
import { X, Save, Trash2, Calendar, MapPin, Trophy, Clock, AlertTriangle, Star, Award } from 'lucide-react';

interface EditMatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  match: Match | null;
  teams: Team[];
  players?: Player[];
  onSave: (updatedMatch: Match) => void;
  onDelete?: (matchId: string) => void;
}

export const EditMatchModal: React.FC<EditMatchModalProps> = ({
  isOpen,
  onClose,
  match,
  teams,
  players = [],
  onSave,
  onDelete
}) => {
  const [homeTeamId, setHomeTeamId] = useState(match?.homeTeamId || '');
  const [awayTeamId, setAwayTeamId] = useState(match?.awayTeamId || '');
  const [homeScore, setHomeScore] = useState<number>(match?.homeScore || 0);
  const [awayScore, setAwayScore] = useState<number>(match?.awayScore || 0);
  const [status, setStatus] = useState<MatchStatus>(match?.status || 'UPCOMING');
  const [currentMinute, setCurrentMinute] = useState<number>(match?.currentMinute || 0);
  const [addedMinutes, setAddedMinutes] = useState<number>(match?.addedMinutes || 0);
  const [isClockRunning, setIsClockRunning] = useState<boolean>(match?.isClockRunning || false);
  const [venue, setVenue] = useState(match?.venue || '');
  const [matchDate, setMatchDate] = useState(match?.matchDate || '');
  const [round, setRound] = useState(match?.round || '');
  const [matchStoryNotes, setMatchStoryNotes] = useState(match?.matchStoryNotes || '');
  const [potmPlayerId, setPotmPlayerId] = useState(match?.potmPlayerId || '');
  const [potmPlayerName, setPotmPlayerName] = useState(match?.potmPlayerName || '');
  const [potmReason, setPotmReason] = useState(match?.potmReason || '');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (match) {
      setHomeTeamId(match.homeTeamId);
      setAwayTeamId(match.awayTeamId);
      setHomeScore(match.homeScore);
      setAwayScore(match.awayScore);
      setStatus(match.status);
      setCurrentMinute(match.currentMinute);
      setAddedMinutes(match.addedMinutes || 0);
      setIsClockRunning(match.isClockRunning);
      setVenue(match.venue || '');
      setMatchDate(match.matchDate || '');
      setRound(match.round || '');
      setMatchStoryNotes(match.matchStoryNotes || '');
      setPotmPlayerId(match.potmPlayerId || '');
      setPotmPlayerName(match.potmPlayerName || '');
      setPotmReason(match.potmReason || '');
      setShowDeleteConfirm(false);
    }
  }, [match]);

  if (!isOpen || !match) return null;

  const matchPlayers = players.filter(
    p => p.teamId === homeTeamId || p.teamId === awayTeamId
  );

  const handleSelectPotmPlayer = (playerId: string) => {
    setPotmPlayerId(playerId);
    if (playerId) {
      const selected = players.find(p => p.id === playerId);
      if (selected) {
        setPotmPlayerName(selected.name);
      }
    } else {
      setPotmPlayerName('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (homeTeamId === awayTeamId) {
      alert('Home এবং Away দল একই হতে পারবে না!');
      return;
    }

    onSave({
      ...match,
      homeTeamId,
      awayTeamId,
      homeScore: Math.max(0, Number(homeScore) || 0),
      awayScore: Math.max(0, Number(awayScore) || 0),
      status,
      currentMinute: Math.max(0, Math.min(130, Number(currentMinute) || 0)),
      addedMinutes: Math.max(0, Number(addedMinutes) || 0),
      isClockRunning,
      venue,
      matchDate,
      round,
      matchStoryNotes,
      potmPlayerId,
      potmPlayerName,
      potmReason
    });
    onClose();
  };

  const handleDelete = () => {
    if (onDelete && match) {
      onDelete(match.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700/90 rounded-3xl max-w-xl w-full p-6 sm:p-7 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-6">
          <h3 className="text-xl font-black text-white font-display flex items-center gap-2">
            <span>✏️</span>
            <span>ম্যাচ এডিট করুন (Edit Match)</span>
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            দলের নাম, স্কোর, ম্যাচের সময় এবং লাইভ স্ট্যাটাস পরিবর্তন করুন
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Teams Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                🏠 হোম টিম (Home Team)
              </label>
              <select
                value={homeTeamId}
                onChange={(e) => setHomeTeamId(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 font-semibold"
                required
              >
                {teams.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.shortName})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                ✈️ অ্যাওয়ে টিম (Away Team)
              </label>
              <select
                value={awayTeamId}
                onChange={(e) => setAwayTeamId(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 font-semibold"
                required
              >
                {teams.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.shortName})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Scores & Minutes */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                হোম গোল
              </label>
              <input
                type="number"
                min="0"
                max="99"
                value={homeScore}
                onChange={(e) => setHomeScore(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white font-bold focus:outline-none focus:border-emerald-500 text-center"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                অ্যাওয়ে গোল
              </label>
              <input
                type="number"
                min="0"
                max="99"
                value={awayScore}
                onChange={(e) => setAwayScore(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white font-bold focus:outline-none focus:border-emerald-500 text-center"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                মিনিট (Time)
              </label>
              <input
                type="number"
                min="0"
                max="130"
                value={currentMinute}
                onChange={(e) => setCurrentMinute(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white font-bold focus:outline-none focus:border-emerald-500 text-center"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                অতিরিক্ত সময় (+)
              </label>
              <input
                type="number"
                min="0"
                max="20"
                value={addedMinutes}
                onChange={(e) => setAddedMinutes(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white font-bold focus:outline-none focus:border-emerald-500 text-center"
              />
            </div>
          </div>

          {/* Status & Clock Running */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                ম্যাচ স্ট্যাটাস (Status)
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as MatchStatus)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 font-semibold"
              >
                <option value="UPCOMING">📅 শুরু হয়নি (Upcoming)</option>
                <option value="LIVE_1ST_HALF">🟢 লাইভ ১ম হাফ (Live 1st Half)</option>
                <option value="HALF_TIME">⏸️ হাফ টাইম (Half Time)</option>
                <option value="LIVE_2ND_HALF">🟢 লাইভ ২য় হাফ (Live 2nd Half)</option>
                <option value="EXTRA_TIME">⚡ অতিরিক্ত সময় (Extra Time)</option>
                <option value="FINISHED">🏁 ম্যাচ সমাপ্ত (Full Time / Finished)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                ম্যাচ ঘড়ি (Clock)
              </label>
              <button
                type="button"
                onClick={() => setIsClockRunning(!isClockRunning)}
                className={`w-full py-2 px-3 rounded-xl border text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  isClockRunning
                    ? 'bg-emerald-600/20 border-emerald-500/40 text-emerald-400'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <Clock className="w-4 h-4" />
                <span>{isClockRunning ? 'ঘড়ি চালু (Clock Running)' : 'ঘড়ি বন্ধ (Clock Paused)'}</span>
              </button>
            </div>
          </div>

          {/* Details: Venue, Date, Round */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                ভেন্যু (Venue)
              </label>
              <input
                type="text"
                value={venue}
                onChange={(e) => setVenue(e.target.value)}
                placeholder="যেমন: মিরপুর স্টেডিয়াম"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                তারিখ ও সময় (Date/Time)
              </label>
              <input
                type="text"
                value={matchDate}
                onChange={(e) => setMatchDate(e.target.value)}
                placeholder="যেমন: আজ, রাত ৮:০০"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                ম্যাচ রাউন্ড (Round)
              </label>
              <input
                type="text"
                value={round}
                onChange={(e) => setRound(e.target.value)}
                placeholder="যেমন: ফাইনাল বা ১ম ম্যাচ"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Match Story */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">
              ম্যাচ স্টোরি বা ধারাভাষ্য (Match Story / Commentary)
            </label>
            <textarea
              rows={2}
              value={matchStoryNotes}
              onChange={(e) => setMatchStoryNotes(e.target.value)}
              placeholder="ম্যাচের কোনো বিশেষ নোট বা বিবরণ এখানে লিখুন..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 resize-none"
            />
          </div>

          {/* 🌟 PLAYER OF THE MATCH (ম্যান অব দ্য ম্যাচ) 🏆 */}
          <div className="bg-gradient-to-r from-amber-950/40 via-slate-950 to-amber-950/20 p-4 rounded-2xl border border-amber-500/30 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center">
                  <Star className="w-3.5 h-3.5 fill-current" />
                </div>
                <label className="text-xs font-extrabold text-amber-300">
                  Player Of The Match (ম্যাচের সেরা খেলোয়াড়)
                </label>
              </div>
              {potmPlayerName && (
                <button
                  type="button"
                  onClick={() => {
                    setPotmPlayerId('');
                    setPotmPlayerName('');
                    setPotmReason('');
                  }}
                  className="text-[11px] text-rose-400 hover:text-rose-300 font-bold cursor-pointer"
                >
                  ✕ রিমুভ করুন
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-400 mb-1">
                  প্লেয়ার নির্বাচন করুন
                </label>
                <select
                  value={potmPlayerId}
                  onChange={(e) => handleSelectPotmPlayer(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400 font-semibold"
                >
                  <option value="">-- প্লেয়ার সিলেক্ট করুন (বা নিজে নাম লিখুন) --</option>
                  {matchPlayers.map((p) => {
                    const t = teams.find(team => team.id === p.teamId);
                    return (
                      <option key={p.id} value={p.id}>
                        {p.name} (#{p.jerseyNumber}) - {t?.shortName || ''}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 mb-1">
                  ম্যান অব দ্য ম্যাচের নাম
                </label>
                <input
                  type="text"
                  placeholder="যেমন: জামাল ভূঁইয়া"
                  value={potmPlayerName}
                  onChange={(e) => setPotmPlayerName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-amber-200 font-bold focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-400 mb-1">
                পুরস্কারের কারণ / বিশেষ কৃতিত্ব (Performance Highlight)
              </label>
              <input
                type="text"
                placeholder="যেমন: হ্যাটট্রিক গোল ও ৮.৯ রেটিং / দুর্দান্ত গোলকিপিং"
                value={potmReason}
                onChange={(e) => setPotmReason(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-800 gap-3">
            {onDelete && (
              <div>
                {showDeleteConfirm ? (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleDelete}
                      className="px-3 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs"
                    >
                      ডিলিট কনফার্ম
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowDeleteConfirm(false)}
                      className="px-3 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs"
                    >
                      বাতিল
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirm(true)}
                    className="px-3 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>ম্যাচ মুছুন</span>
                  </button>
                )}
              </div>
            )}

            <div className="flex items-center gap-2 ml-auto">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-colors"
              >
                বাতিল
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-950 transition-colors cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>পরিবর্তন সেভ করুন</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
