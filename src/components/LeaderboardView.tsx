import React, { useState } from 'react';
import { Player, Team } from '../types';
import { Award, Flame, Zap, Shield, DollarSign, Target, Trophy, Star } from 'lucide-react';

interface LeaderboardViewProps {
  players: Player[];
  teams: Team[];
}

type LeaderboardCategory = 'GOALS' | 'ASSISTS' | 'CARDS' | 'SAVES' | 'VALUE';

export const LeaderboardView: React.FC<LeaderboardViewProps> = ({ players, teams }) => {
  const [activeCategory, setActiveCategory] = useState<LeaderboardCategory>('GOALS');

  // Top Scorer calculation for Golden Boot Showcase
  const topScorers = [...players]
    .filter(p => p.goals > 0)
    .sort((a, b) => b.goals - a.goals || b.assists - a.assists || a.matchesPlayed - b.matchesPlayed);

  const goldenBootLeader = topScorers[0] || null;
  const goldenBootTeam = teams.find(t => t.id === goldenBootLeader?.teamId);

  const getSortedPlayers = () => {
    switch (activeCategory) {
      case 'GOALS':
        return [...players].filter(p => p.goals > 0).sort((a, b) => b.goals - a.goals || b.assists - a.assists);
      case 'ASSISTS':
        return [...players].filter(p => p.assists > 0).sort((a, b) => b.assists - a.assists || b.goals - a.goals);
      case 'CARDS':
        return [...players].sort((a, b) => (b.redCards * 3 + b.yellowCards + b.fouls * 0.1) - (a.redCards * 3 + a.yellowCards + a.fouls * 0.1));
      case 'SAVES':
        return [...players].filter(p => p.saves > 0).sort((a, b) => b.saves - a.saves);
      case 'VALUE':
        return [...players].sort((a, b) => b.purchasePrice - a.purchasePrice);
    }
  };

  const sortedList = getSortedPlayers();

  return (
    <div className="space-y-8 pb-12">
      {/* 🌟 TOURNAMENT TOP SCORER / GOLDEN BOOT HERO CARD 🏆 */}
      {goldenBootLeader ? (
        <div className="bg-gradient-to-r from-amber-950/60 via-slate-900 to-amber-950/40 rounded-3xl border border-amber-500/40 p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
              {/* Grand Player Avatar */}
              <div className="relative flex-shrink-0">
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-br from-amber-400/30 to-amber-950 border-2 border-amber-400 p-1.5 shadow-2xl shadow-amber-950 overflow-hidden flex items-center justify-center">
                  {goldenBootLeader.photoUrl ? (
                    <img 
                      src={goldenBootLeader.photoUrl} 
                      alt={goldenBootLeader.name} 
                      className="w-full h-full object-cover rounded-2xl"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="text-center">
                      <span className="text-3xl">⚽</span>
                      <span className="block text-xs font-black text-amber-300 font-mono mt-1">
                        #{goldenBootLeader.jerseyNumber}
                      </span>
                    </div>
                  )}
                </div>

                <div className="absolute -bottom-2 -right-2 bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 px-2.5 py-1 rounded-xl text-xs font-black shadow-lg flex items-center gap-1">
                  <span>🏆 #1</span>
                </div>
              </div>

              {/* Player Info */}
              <div className="space-y-1.5">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-400 text-xs font-extrabold shadow-inner">
                  <Trophy className="w-3.5 h-3.5" />
                  <span>টুর্নামেন্টের টপ স্কোরার • Golden Boot Leader</span>
                </div>

                <h2 className="text-2xl sm:text-3xl font-black text-white font-display">
                  {goldenBootLeader.name}
                </h2>

                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-xs text-slate-300 font-semibold">
                  <span className="flex items-center gap-1.5 bg-slate-950 px-3 py-1 rounded-xl border border-slate-800">
                    🛡️ {goldenBootTeam?.name || 'Club'} (#{goldenBootLeader.jerseyNumber})
                  </span>
                  <span className="flex items-center gap-1.5 bg-slate-950 px-3 py-1 rounded-xl border border-slate-800 text-amber-300">
                    📍 {goldenBootLeader.position}
                  </span>
                </div>
              </div>
            </div>

            {/* Goal Statistics Badge */}
            <div className="flex items-center gap-4 sm:gap-6 bg-slate-950/80 p-4 sm:p-6 rounded-3xl border border-amber-500/30 shadow-inner text-center flex-shrink-0">
              <div>
                <div className="text-3xl sm:text-5xl font-black text-amber-400 font-display">
                  {goldenBootLeader.goals}
                </div>
                <div className="text-[11px] text-slate-400 font-bold uppercase tracking-wider mt-1">
                  মোট গোল (Goals)
                </div>
              </div>

              <div className="h-10 w-[1px] bg-slate-800" />

              <div>
                <div className="text-2xl sm:text-3xl font-black text-indigo-400 font-display">
                  {goldenBootLeader.assists}
                </div>
                <div className="text-[11px] text-slate-400 font-bold uppercase tracking-wider mt-1">
                  অ্যাসিস্ট (Assists)
                </div>
              </div>

              <div className="h-10 w-[1px] bg-slate-800" />

              <div>
                <div className="text-2xl sm:text-3xl font-black text-emerald-400 font-display">
                  {goldenBootLeader.matchesPlayed || 1}
                </div>
                <div className="text-[11px] text-slate-400 font-bold uppercase tracking-wider mt-1">
                  ম্যাচ (Matches)
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-slate-900/60 rounded-3xl border border-slate-800 p-6 text-center text-slate-400 text-xs">
          🏆 টুর্নামেন্টের গোল হওয়া মাত্রই এখানে সর্বোচ্চ গোলদাতা (টপ স্কোরার) প্রদর্শিত হবে।
        </div>
      )}

      {/* Category Navigation Pills */}
      <div className="flex flex-wrap items-center gap-2 bg-slate-900/80 p-2 rounded-2xl border border-slate-800">
        <button
          onClick={() => setActiveCategory('GOALS')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeCategory === 'GOALS'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <span>⚽</span>
          <span>Top Scorers (গোল্ডেন বুট)</span>
        </button>

        <button
          onClick={() => setActiveCategory('ASSISTS')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeCategory === 'ASSISTS'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-950'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <span>👟</span>
          <span>Top Playmakers (অ্যাসিস্ট)</span>
        </button>

        <button
          onClick={() => setActiveCategory('CARDS')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeCategory === 'CARDS'
              ? 'bg-amber-600 text-white shadow-md shadow-amber-950'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <span>🟨🟥</span>
          <span>Discipline & Cards</span>
        </button>

        <button
          onClick={() => setActiveCategory('SAVES')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeCategory === 'SAVES'
              ? 'bg-cyan-600 text-white shadow-md shadow-cyan-950'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <span>🧤</span>
          <span>Goalkeepers (গোলকিপার সেভ)</span>
        </button>

        <button
          onClick={() => setActiveCategory('VALUE')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeCategory === 'VALUE'
              ? 'bg-emerald-700 text-white shadow-md shadow-emerald-950'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <span>💰</span>
          <span>Player Value (ক্রয় মূল্য)</span>
        </button>
      </div>

      {/* Leaderboard Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sortedList.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-500 bg-slate-900/40 rounded-3xl border border-slate-800">
            এই ক্যাটাগরিতে এখনো কোনো প্লেয়ারের পরিসংখ্যান নেই।
          </div>
        ) : (
          sortedList.map((player, index) => {
            const rank = index + 1;
            const playerTeam = teams.find(t => t.id === player.teamId);

            return (
              <div
                key={player.id}
                className={`bg-slate-900/90 rounded-2xl border p-4 flex items-center justify-between gap-4 transition-all hover:border-slate-700 ${
                  rank === 1 ? 'border-amber-500/40 bg-gradient-to-r from-amber-950/20 to-slate-900 shadow-lg' :
                  rank === 2 ? 'border-slate-500/30' :
                  rank === 3 ? 'border-amber-800/30' : 'border-slate-800/80'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  {/* Medal / Rank */}
                  <div className="w-8 text-center flex-shrink-0">
                    {rank === 1 ? <span className="text-2xl">🥇</span> :
                     rank === 2 ? <span className="text-2xl">🥈</span> :
                     rank === 3 ? <span className="text-2xl">🥉</span> :
                     <span className="font-mono text-sm font-bold text-slate-500">#{rank}</span>}
                  </div>

                  {/* Player Avatar */}
                  <div className="relative">
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
                  <div>
                    <h4 className="font-bold text-white text-sm flex items-center gap-1.5">
                      <span>#{player.jerseyNumber}</span>
                      <span>{player.name}</span>
                    </h4>
                    <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                      <span>{playerTeam?.name || 'Club'}</span>
                      <span>•</span>
                      <span className="text-emerald-400 font-medium">💰 ৳{player.purchasePrice}M</span>
                    </div>
                  </div>
                </div>

                {/* Stat Display */}
                <div className="text-right">
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

                  {activeCategory === 'CARDS' && (
                    <div className="space-y-0.5">
                      <div className="flex items-center justify-end gap-1.5 text-xs font-bold">
                        <span className="text-amber-400">🟨 {player.yellowCards}</span>
                        <span className="text-rose-400">🟥 {player.redCards}</span>
                      </div>
                      <div className="text-[10px] text-slate-500">{player.fouls} Fouls</div>
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
    </div>
  );
};

