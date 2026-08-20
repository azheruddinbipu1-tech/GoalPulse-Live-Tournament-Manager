import React, { useState } from 'react';
import { Player, Team } from '../types';
import { 
  Award, 
  Flame, 
  Zap, 
  Shield, 
  DollarSign, 
  Target, 
  Trophy, 
  Star, 
  X, 
  Info,
  Search,
  CheckCircle2,
  Users
} from 'lucide-react';

interface LeaderboardViewProps {
  players: Player[];
  teams: Team[];
}

export type LeaderboardCategory = 'GOALS' | 'ASSISTS' | 'MVP' | 'POTM' | 'SAVES' | 'CARDS' | 'VALUE';

export const LeaderboardView: React.FC<LeaderboardViewProps> = ({ players, teams }) => {
  const [activeCategory, setActiveCategory] = useState<LeaderboardCategory>('GOALS');
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Top Scorer (Golden Boot Leader)
  const topScorers = [...players]
    .filter(p => p.goals > 0)
    .sort((a, b) => b.goals - a.goals || b.assists - a.assists || a.matchesPlayed - b.matchesPlayed);
  const goldenBootLeader = topScorers[0] || null;
  const goldenBootTeam = teams.find(t => t.id === goldenBootLeader?.teamId);

  // Top Playmaker (Assist Leader)
  const topPlaymakers = [...players]
    .filter(p => p.assists > 0)
    .sort((a, b) => b.assists - a.assists || b.goals - a.goals);
  const assistLeader = topPlaymakers[0] || null;
  const assistLeaderTeam = teams.find(t => t.id === assistLeader?.teamId);

  // MVP Score calculation: Goals*3 + Assists*2 + POTM*2.5 + Saves*0.5 - YellowCards*0.5 - RedCards*2
  const calculateMvpScore = (p: Player) => {
    return (
      (p.goals || 0) * 3 +
      (p.assists || 0) * 2 +
      (p.potmAwards || 0) * 2.5 +
      (p.saves || 0) * 0.5 -
      (p.yellowCards || 0) * 0.5 -
      (p.redCards || 0) * 2
    );
  };

  const mvpList = [...players].sort((a, b) => calculateMvpScore(b) - calculateMvpScore(a));
  const mvpLeader = mvpList[0] || null;
  const mvpTeam = teams.find(t => t.id === mvpLeader?.teamId);

  // Golden Glove (Top Goalkeeper)
  const topKeepers = [...players]
    .filter(p => p.saves > 0 || p.position === 'GOALKEEPER')
    .sort((a, b) => b.saves - a.saves);
  const goldenGloveLeader = topKeepers[0] || null;
  const goldenGloveTeam = teams.find(t => t.id === goldenGloveLeader?.teamId);

  // Filtered & Sorted List
  const getSortedPlayers = () => {
    let list = [...players];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(p => {
        const t = teams.find(team => team.id === p.teamId);
        return (
          p.name.toLowerCase().includes(q) ||
          p.jerseyNumber.toString().includes(q) ||
          p.position.toLowerCase().includes(q) ||
          t?.name.toLowerCase().includes(q) ||
          t?.shortName.toLowerCase().includes(q)
        );
      });
    }

    switch (activeCategory) {
      case 'GOALS':
        return list.filter(p => p.goals > 0).sort((a, b) => b.goals - a.goals || b.assists - a.assists);
      case 'ASSISTS':
        return list.filter(p => p.assists > 0).sort((a, b) => b.assists - a.assists || b.goals - a.goals);
      case 'MVP':
        return list.sort((a, b) => calculateMvpScore(b) - calculateMvpScore(a));
      case 'POTM':
        return list.filter(p => (p.potmAwards || 0) > 0).sort((a, b) => (b.potmAwards || 0) - (a.potmAwards || 0) || b.goals - a.goals);
      case 'SAVES':
        return list.filter(p => p.saves > 0 || p.position === 'GOALKEEPER').sort((a, b) => b.saves - a.saves);
      case 'CARDS':
        return list.sort((a, b) => (b.redCards * 3 + b.yellowCards + b.fouls * 0.1) - (a.redCards * 3 + a.yellowCards + a.fouls * 0.1));
      case 'VALUE':
        return list.sort((a, b) => b.purchasePrice - a.purchasePrice);
      default:
        return list;
    }
  };

  const sortedList = getSortedPlayers();
  const selectedPlayerTeam = teams.find(t => t.id === selectedPlayer?.teamId);

  return (
    <div className="space-y-8 pb-12">
      {/* 🌟 4 PILLAR HERO SPOTLIGHTS: Golden Boot, Playmaker, MVP, Golden Glove 🏆 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* 1. Golden Boot (Top Scorer) */}
        {goldenBootLeader && (
          <div
            onClick={() => setSelectedPlayer(goldenBootLeader)}
            className="bg-gradient-to-br from-amber-950/50 via-slate-900 to-slate-950 border border-amber-500/40 rounded-3xl p-5 shadow-xl relative overflow-hidden cursor-pointer hover:border-amber-400 transition-all group"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-black uppercase tracking-wider border border-amber-500/30">
                <Trophy className="w-3 h-3 text-amber-400" />
                <span>টপ স্কোরার (Golden Boot)</span>
              </span>
              <span className="text-xl font-black text-amber-400 font-display">#{goldenBootLeader.jerseyNumber}</span>
            </div>

            <div className="flex items-center gap-3.5">
              <div className="w-14 h-14 rounded-2xl bg-amber-950/60 border border-amber-500/40 overflow-hidden flex items-center justify-center flex-shrink-0">
                {goldenBootLeader.photoUrl ? (
                  <img src={goldenBootLeader.photoUrl} alt={goldenBootLeader.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <span className="text-xl">⚽</span>
                )}
              </div>
              <div className="min-w-0">
                <h4 className="font-extrabold text-white text-sm truncate group-hover:text-amber-300 transition-colors">
                  {goldenBootLeader.name}
                </h4>
                <p className="text-xs text-slate-400 truncate">{goldenBootTeam?.name}</p>
                <div className="mt-1 flex items-center gap-2">
                  <span className="text-base font-black text-amber-400 font-display">{goldenBootLeader.goals} গোল</span>
                  <span className="text-xs text-slate-500 font-medium">({goldenBootLeader.assists} অ্যাসিস্ট)</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 2. Top Playmaker */}
        {assistLeader && (
          <div
            onClick={() => setSelectedPlayer(assistLeader)}
            className="bg-gradient-to-br from-indigo-950/50 via-slate-900 to-slate-950 border border-indigo-500/40 rounded-3xl p-5 shadow-xl relative overflow-hidden cursor-pointer hover:border-indigo-400 transition-all group"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-black uppercase tracking-wider border border-indigo-500/30">
                <span>👟</span>
                <span>প্লে-মেকার (Top Assists)</span>
              </span>
              <span className="text-xl font-black text-indigo-400 font-display">#{assistLeader.jerseyNumber}</span>
            </div>

            <div className="flex items-center gap-3.5">
              <div className="w-14 h-14 rounded-2xl bg-indigo-950/60 border border-indigo-500/40 overflow-hidden flex items-center justify-center flex-shrink-0">
                {assistLeader.photoUrl ? (
                  <img src={assistLeader.photoUrl} alt={assistLeader.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <span className="text-xl">👟</span>
                )}
              </div>
              <div className="min-w-0">
                <h4 className="font-extrabold text-white text-sm truncate group-hover:text-indigo-300 transition-colors">
                  {assistLeader.name}
                </h4>
                <p className="text-xs text-slate-400 truncate">{assistLeaderTeam?.name}</p>
                <div className="mt-1 flex items-center gap-2">
                  <span className="text-base font-black text-indigo-400 font-display">{assistLeader.assists} অ্যাসিস্ট</span>
                  <span className="text-xs text-slate-500 font-medium">({assistLeader.goals} গোল)</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 3. MVP (Most Valuable Player) */}
        {mvpLeader && (
          <div
            onClick={() => setSelectedPlayer(mvpLeader)}
            className="bg-gradient-to-br from-emerald-950/50 via-slate-900 to-slate-950 border border-emerald-500/40 rounded-3xl p-5 shadow-xl relative overflow-hidden cursor-pointer hover:border-emerald-400 transition-all group"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-black uppercase tracking-wider border border-emerald-500/30">
                <Star className="w-3 h-3 text-emerald-400 fill-emerald-400" />
                <span>সেরা খেলোয়াড় (MVP)</span>
              </span>
              <span className="text-xl font-black text-emerald-400 font-display">#{mvpLeader.jerseyNumber}</span>
            </div>

            <div className="flex items-center gap-3.5">
              <div className="w-14 h-14 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 overflow-hidden flex items-center justify-center flex-shrink-0">
                {mvpLeader.photoUrl ? (
                  <img src={mvpLeader.photoUrl} alt={mvpLeader.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <span className="text-xl">⭐</span>
                )}
              </div>
              <div className="min-w-0">
                <h4 className="font-extrabold text-white text-sm truncate group-hover:text-emerald-300 transition-colors">
                  {mvpLeader.name}
                </h4>
                <p className="text-xs text-slate-400 truncate">{mvpTeam?.name}</p>
                <div className="mt-1 flex items-center gap-2">
                  <span className="text-base font-black text-emerald-400 font-display">{calculateMvpScore(mvpLeader).toFixed(1)} PTS</span>
                  <span className="text-xs text-slate-500 font-medium">({mvpLeader.goals + mvpLeader.assists} G+A)</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 4. Golden Glove (Best Goalkeeper) */}
        {goldenGloveLeader && (
          <div
            onClick={() => setSelectedPlayer(goldenGloveLeader)}
            className="bg-gradient-to-br from-cyan-950/50 via-slate-900 to-slate-950 border border-cyan-500/40 rounded-3xl p-5 shadow-xl relative overflow-hidden cursor-pointer hover:border-cyan-400 transition-all group"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-black uppercase tracking-wider border border-cyan-500/30">
                <Shield className="w-3 h-3 text-cyan-400" />
                <span>গোল্ডেন গ্লাভস (Saves)</span>
              </span>
              <span className="text-xl font-black text-cyan-400 font-display">#{goldenGloveLeader.jerseyNumber}</span>
            </div>

            <div className="flex items-center gap-3.5">
              <div className="w-14 h-14 rounded-2xl bg-cyan-950/60 border border-cyan-500/40 overflow-hidden flex items-center justify-center flex-shrink-0">
                {goldenGloveLeader.photoUrl ? (
                  <img src={goldenGloveLeader.photoUrl} alt={goldenGloveLeader.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <span className="text-xl">🧤</span>
                )}
              </div>
              <div className="min-w-0">
                <h4 className="font-extrabold text-white text-sm truncate group-hover:text-cyan-300 transition-colors">
                  {goldenGloveLeader.name}
                </h4>
                <p className="text-xs text-slate-400 truncate">{goldenGloveTeam?.name}</p>
                <div className="mt-1 flex items-center gap-2">
                  <span className="text-base font-black text-cyan-400 font-display">{goldenGloveLeader.saves} সেভ</span>
                  <span className="text-xs text-slate-500 font-medium">({goldenGloveLeader.matchesPlayed} ম্যাচ)</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 🧭 Category Navigation & Live Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveCategory('GOALS')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              activeCategory === 'GOALS'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>⚽</span>
            <span>গোল্ডেন বুট (Goals)</span>
          </button>

          <button
            onClick={() => setActiveCategory('ASSISTS')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              activeCategory === 'ASSISTS'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-950'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>👟</span>
            <span>অ্যাসিস্ট (Assists)</span>
          </button>

          <button
            onClick={() => setActiveCategory('MVP')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              activeCategory === 'MVP'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Star className="w-3.5 h-3.5 fill-current" />
            <span>সেরা খেলোয়াড় (MVP)</span>
          </button>

          <button
            onClick={() => setActiveCategory('POTM')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              activeCategory === 'POTM'
                ? 'bg-amber-600 text-white shadow-md shadow-amber-950'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Trophy className="w-3.5 h-3.5" />
            <span>ম্যান অব দ্য ম্যাচ (POTM)</span>
          </button>

          <button
            onClick={() => setActiveCategory('SAVES')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              activeCategory === 'SAVES'
                ? 'bg-cyan-600 text-white shadow-md shadow-cyan-950'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>🧤</span>
            <span>গোলকিপার সেভ (Saves)</span>
          </button>

          <button
            onClick={() => setActiveCategory('CARDS')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              activeCategory === 'CARDS'
                ? 'bg-rose-600 text-white shadow-md shadow-rose-950'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>🟨🟥</span>
            <span>শৃঙ্খলা ও কার্ড</span>
          </button>

          <button
            onClick={() => setActiveCategory('VALUE')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              activeCategory === 'VALUE'
                ? 'bg-emerald-700 text-white shadow-md shadow-emerald-950'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>💰</span>
            <span>প্লেয়ার ভ্যালু (Value)</span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative md:w-60">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="প্লেয়ার বা দল খুঁজুন..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-8 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      {/* 📊 Leaderboard List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sortedList.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-500 bg-slate-900/40 rounded-3xl border border-slate-800">
            এই ক্যাটাগরিতে এখনো কোনো প্লেয়ারের পরিসংখ্যান পাওয়া যায়নি।
          </div>
        ) : (
          sortedList.map((player, index) => {
            const rank = index + 1;
            const playerTeam = teams.find(t => t.id === player.teamId);

            return (
              <div
                key={player.id}
                onClick={() => setSelectedPlayer(player)}
                className={`bg-slate-900/90 rounded-2xl border p-4 flex items-center justify-between gap-4 transition-all hover:border-emerald-500/70 hover:shadow-lg hover:shadow-emerald-950/30 cursor-pointer group ${
                  rank === 1 ? 'border-amber-500/40 bg-gradient-to-r from-amber-950/20 to-slate-900 shadow-lg' :
                  rank === 2 ? 'border-slate-500/30' :
                  rank === 3 ? 'border-amber-800/30' : 'border-slate-800/80'
                }`}
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  {/* Medal / Rank */}
                  <div className="w-8 text-center flex-shrink-0">
                    {rank === 1 ? <span className="text-2xl">🥇</span> :
                     rank === 2 ? <span className="text-2xl">🥈</span> :
                     rank === 3 ? <span className="text-2xl">🥉</span> :
                     <span className="font-mono text-sm font-bold text-slate-500">#{rank}</span>}
                  </div>

                  {/* Player Avatar */}
                  <div className="relative group-hover:scale-105 transition-transform flex-shrink-0">
                    <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 overflow-hidden flex items-center justify-center">
                      {player.photoUrl ? (
                        <img 
                          src={player.photoUrl} 
                          alt={player.name} 
                          className="w-full h-full object-cover" 
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <span className="text-sm font-black text-slate-400">
                          {player.name.slice(0, 2).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <span className="absolute -bottom-1 -right-1 px-1 rounded bg-slate-950 border border-slate-700 text-[9px] font-bold text-slate-300">
                      {player.position.slice(0, 3)}
                    </span>
                  </div>

                  {/* Player Info */}
                  <div className="min-w-0">
                    <h4 className="font-bold text-white text-sm flex items-center gap-1.5 group-hover:text-emerald-300 transition-colors truncate">
                      <span className="text-slate-400 font-mono">#{player.jerseyNumber}</span>
                      <span className="truncate">{player.name}</span>
                      {player.isCaptain && (
                        <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[9px] font-black">
                          (C)
                        </span>
                      )}
                      {player.isIconPlayer && (
                        <span className="text-amber-400 text-xs" title="আইকন প্লেয়ার">⭐</span>
                      )}
                    </h4>
                    <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5 truncate">
                      <span className="truncate">{playerTeam?.name || 'Club'}</span>
                      <span>•</span>
                      <span className="text-emerald-400 font-medium">💰 ৳{player.purchasePrice}M</span>
                    </div>
                  </div>
                </div>

                {/* Stat Display */}
                <div className="text-right flex-shrink-0">
                  {activeCategory === 'GOALS' && (
                    <div>
                      <div className="text-2xl font-black text-emerald-400 font-display">
                        {player.goals}
                      </div>
                      <div className="text-[10px] text-slate-500 font-semibold uppercase">Goals</div>
                    </div>
                  )}

                  {activeCategory === 'ASSISTS' && (
                    <div>
                      <div className="text-2xl font-black text-indigo-400 font-display">
                        {player.assists}
                      </div>
                      <div className="text-[10px] text-slate-500 font-semibold uppercase">Assists</div>
                    </div>
                  )}

                  {activeCategory === 'MVP' && (
                    <div>
                      <div className="text-2xl font-black text-emerald-400 font-display">
                        {calculateMvpScore(player).toFixed(1)}
                      </div>
                      <div className="text-[10px] text-slate-500 font-semibold uppercase">MVP Score</div>
                    </div>
                  )}

                  {activeCategory === 'POTM' && (
                    <div>
                      <div className="text-2xl font-black text-amber-400 font-display">
                        {player.potmAwards || 0}
                      </div>
                      <div className="text-[10px] text-slate-500 font-semibold uppercase">POTM Awards</div>
                    </div>
                  )}

                  {activeCategory === 'SAVES' && (
                    <div>
                      <div className="text-2xl font-black text-cyan-400 font-display">
                        {player.saves}
                      </div>
                      <div className="text-[10px] text-slate-500 font-semibold uppercase">Saves</div>
                    </div>
                  )}

                  {activeCategory === 'CARDS' && (
                    <div className="space-y-0.5">
                      <div className="flex items-center justify-end gap-1.5 text-xs font-bold">
                        <span className="text-amber-400">🟨 {player.yellowCards}</span>
                        <span className="text-rose-400">🟥 {player.redCards}</span>
                      </div>
                      <div className="text-[10px] text-slate-500">{player.fouls} Fouls</div>
                    </div>
                  )}

                  {activeCategory === 'VALUE' && (
                    <div>
                      <div className="text-xl font-black text-emerald-400 font-display">
                        ৳{player.purchasePrice}M
                      </div>
                      <div className="text-[10px] text-slate-500 font-semibold uppercase">Market Price</div>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 🌟 Detailed Player Profile Popup Modal 🌟 */}
      {selectedPlayer && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn"
          onClick={() => setSelectedPlayer(null)}
        >
          <div 
            className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative overflow-hidden space-y-6"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Background Glow */}
            <div className="absolute -top-12 -right-12 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
            
            {/* Close Button */}
            <button
              onClick={() => setSelectedPlayer(null)}
              className="absolute top-5 right-5 w-9 h-9 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer border border-slate-700"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header Info */}
            <div className="flex items-center gap-4">
              <div className="relative flex-shrink-0">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-900/60 to-slate-900 border-2 border-emerald-500/40 overflow-hidden flex items-center justify-center shadow-lg">
                  {selectedPlayer.photoUrl ? (
                    <img 
                      src={selectedPlayer.photoUrl} 
                      alt={selectedPlayer.name} 
                      className="w-full h-full object-cover" 
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <span className="text-2xl font-black text-emerald-300">
                      {selectedPlayer.name.slice(0, 2).toUpperCase()}
                    </span>
                  )}
                </div>
                <span className="absolute -bottom-2 -right-2 bg-emerald-600 text-white font-mono text-xs font-black px-2 py-0.5 rounded-lg shadow">
                  #{selectedPlayer.jerseyNumber}
                </span>
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-bold">
                    <span>📍 {selectedPlayer.position}</span>
                  </span>
                  {selectedPlayer.isCaptain && (
                    <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-black">
                      👑 অধিনায়ক (Captain)
                    </span>
                  )}
                  {selectedPlayer.isIconPlayer && (
                    <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] font-black">
                      ⭐ আইকন প্লেয়ার
                    </span>
                  )}
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-white mt-1">
                  {selectedPlayer.name}
                </h3>
                <div className="text-xs text-slate-400 font-medium mt-0.5 flex items-center gap-2">
                  <span>🛡️ {selectedPlayerTeam?.name || 'Club'}</span>
                  <span>•</span>
                  <span className="text-emerald-400 font-semibold">💰 ৳{selectedPlayer.purchasePrice}M</span>
                </div>
              </div>
            </div>

            {/* Key Stats Grid */}
            <div className="grid grid-cols-4 gap-2.5 text-center">
              <div className="bg-slate-950/60 p-3 rounded-2xl border border-slate-800">
                <div className="text-2xl font-black text-emerald-400 font-display">
                  {selectedPlayer.goals}
                </div>
                <div className="text-[10px] text-slate-400 font-semibold uppercase mt-0.5">Goals</div>
              </div>

              <div className="bg-slate-950/60 p-3 rounded-2xl border border-slate-800">
                <div className="text-2xl font-black text-indigo-400 font-display">
                  {selectedPlayer.assists}
                </div>
                <div className="text-[10px] text-slate-400 font-semibold uppercase mt-0.5">Assists</div>
              </div>

              <div className="bg-slate-950/60 p-3 rounded-2xl border border-slate-800">
                <div className="text-2xl font-black text-amber-400 font-display">
                  {selectedPlayer.potmAwards || 0}
                </div>
                <div className="text-[10px] text-slate-400 font-semibold uppercase mt-0.5">POTMs</div>
              </div>

              <div className="bg-slate-950/60 p-3 rounded-2xl border border-slate-800">
                <div className="text-2xl font-black text-slate-200 font-display">
                  {selectedPlayer.matchesPlayed || 1}
                </div>
                <div className="text-[10px] text-slate-400 font-semibold uppercase mt-0.5">Matches</div>
              </div>
            </div>

            {/* Detailed Performance & Discipline */}
            <div className="space-y-2.5 bg-slate-950/40 p-4 rounded-2xl border border-slate-800/80">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-indigo-400" />
                <span>শৃঙ্খলা ও ডিফেন্সিভ স্ট্যাটস</span>
              </h4>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-xs">
                <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800 flex flex-col items-center">
                  <span className="text-amber-400 font-bold text-base">🟨 {selectedPlayer.yellowCards}</span>
                  <span className="text-[10px] text-slate-500 font-medium mt-0.5">Yellow Cards</span>
                </div>
                <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800 flex flex-col items-center">
                  <span className="text-rose-400 font-bold text-base">🟥 {selectedPlayer.redCards}</span>
                  <span className="text-[10px] text-slate-500 font-medium mt-0.5">Red Cards</span>
                </div>
                <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800 flex flex-col items-center">
                  <span className="text-slate-300 font-bold text-base">{selectedPlayer.fouls}</span>
                  <span className="text-[10px] text-slate-500 font-medium mt-0.5">Total Fouls</span>
                </div>
                <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800 flex flex-col items-center">
                  <span className="text-cyan-400 font-bold text-base">{selectedPlayer.saves}</span>
                  <span className="text-[10px] text-slate-500 font-medium mt-0.5">Goalkeeper Saves</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800/60 px-1">
                <span>Total Goal Contributions (G+A):</span>
                <span className="font-bold text-emerald-400">{selectedPlayer.goals + selectedPlayer.assists} Goals & Assists</span>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end pt-1">
              <button
                onClick={() => setSelectedPlayer(null)}
                className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-colors cursor-pointer"
              >
                বন্ধ করুন (Close)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
