import React from 'react';
import { StandingRow } from '../types';
import { Trophy, Award, TrendingUp, Shield } from 'lucide-react';

interface StandingsViewProps {
  standings: StandingRow[];
  onNavigateToClubs?: () => void;
  isAdmin?: boolean;
}

export const StandingsView: React.FC<StandingsViewProps> = ({ standings, onNavigateToClubs, isAdmin = false }) => {
  return (
    <div className="space-y-6 pb-12">
      {/* Banner */}
      <div className="bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-900 border border-emerald-800/30 rounded-3xl p-6 flex items-center justify-between shadow-xl">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shadow-lg">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white font-display">পয়েন্টস টেবিল (Tournament Standings)</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              লাইভ পয়েন্ট • জয় = ৩ পয়েন্ট (W), ড্র = ১ পয়েন্ট (D), হার = ০ পয়েন্ট (L)
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5 bg-slate-950/80 px-3 py-1.5 rounded-xl border border-slate-800">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span className="text-slate-300 font-semibold">শীর্ষ ২ দল কোয়ালিফাই করবে</span>
          </div>
        </div>
      </div>

      {/* Standings Table Card */}
      <div className="bg-slate-900/90 rounded-3xl border border-slate-800 overflow-hidden shadow-2xl">
        {standings.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <Trophy className="w-12 h-12 mx-auto mb-3 text-slate-600 opacity-60" />
            <h4 className="text-base font-bold text-white mb-1">কোনো দলের পয়েন্ট নেই</h4>
            <p className="text-xs text-slate-400 mb-4 max-w-sm mx-auto">
              নতুন দল এবং ম্যাচ তৈরি করে লাইভ স্কোর পরিচালনা করলেই পয়েন্টস টেবিল স্বয়ংক্রিয়ভাবে আপডেট হবে।
            </p>
            {isAdmin && onNavigateToClubs && (
              <button
                onClick={onNavigateToClubs}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all cursor-pointer"
              >
                ➕ দল যোগ করুন (Add Clubs)
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-slate-950/70 border-b border-slate-800/80 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-3.5 px-4 sm:px-6 w-12 text-center">#</th>
                  <th className="py-3.5 px-4">Club</th>
                  <th className="py-3.5 px-3 text-center">MP</th>
                  <th className="py-3.5 px-3 text-center text-emerald-400">W</th>
                  <th className="py-3.5 px-3 text-center">D</th>
                  <th className="py-3.5 px-3 text-center text-rose-400">L</th>
                  <th className="py-3.5 px-3 text-center">GF</th>
                  <th className="py-3.5 px-3 text-center">GA</th>
                  <th className="py-3.5 px-3 text-center font-bold">GD</th>
                  <th className="py-3.5 px-4 text-center font-black text-emerald-400">PTS</th>
                  <th className="py-3.5 px-4 text-center hidden md:table-cell">Recent Form</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50 font-medium text-slate-300">
                {standings.map((row, index) => {
                  const rank = index + 1;
                  const isPromotionZone = rank <= 2;

                  return (
                    <tr 
                      key={row.teamId}
                      className={`hover:bg-slate-800/40 transition-colors ${
                        isPromotionZone ? 'bg-emerald-950/10' : ''
                      }`}
                    >
                      {/* Rank Number */}
                      <td className="py-4 px-4 sm:px-6 text-center">
                        <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                          rank === 1 ? 'bg-amber-400 text-slate-950 font-black shadow-sm' :
                          rank === 2 ? 'bg-slate-300 text-slate-950 font-black' :
                          'text-slate-400 bg-slate-800'
                        }`}>
                          {rank}
                        </span>
                      </td>

                      {/* Club Name & Logo */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 overflow-hidden flex items-center justify-center flex-shrink-0">
                            {row.logoUrl ? (
                              <img src={row.logoUrl} alt={row.teamName} className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-xs font-black text-white">{row.shortName}</span>
                            )}
                          </div>
                          <div>
                            <div className="font-bold text-white text-sm flex items-center gap-1.5">
                              <span>{row.teamName}</span>
                              {isPromotionZone && (
                                <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                  Top 2
                                </span>
                              )}
                            </div>
                            <span className="text-xs text-slate-500 font-semibold">{row.shortName}</span>
                          </div>
                        </div>
                      </td>

                      {/* MP */}
                      <td className="py-4 px-3 text-center text-slate-300 font-semibold">{row.played}</td>

                      {/* W */}
                      <td className="py-4 px-3 text-center font-bold text-emerald-400">{row.won}</td>

                      {/* D */}
                      <td className="py-4 px-3 text-center text-slate-400">{row.drawn}</td>

                      {/* L */}
                      <td className="py-4 px-3 text-center text-rose-400">{row.lost}</td>

                      {/* GF */}
                      <td className="py-4 px-3 text-center text-slate-400">{row.goalsFor}</td>

                      {/* GA */}
                      <td className="py-4 px-3 text-center text-slate-400">{row.goalsAgainst}</td>

                      {/* GD */}
                      <td className={`py-4 px-3 text-center font-bold ${
                        row.goalDifference > 0 ? 'text-emerald-400' :
                        row.goalDifference < 0 ? 'text-rose-400' : 'text-slate-400'
                      }`}>
                        {row.goalDifference > 0 ? `+${row.goalDifference}` : row.goalDifference}
                      </td>

                      {/* PTS */}
                      <td className="py-4 px-4 text-center font-black text-base text-emerald-400 font-display">
                        {row.points}
                      </td>

                      {/* Form Guide */}
                      <td className="py-4 px-4 text-center hidden md:table-cell">
                        <div className="flex items-center justify-center gap-1.5">
                          {row.form.length > 0 ? (
                            row.form.map((res, i) => (
                              <span
                                key={i}
                                className={`w-5 h-5 rounded-full text-[10px] font-black flex items-center justify-center ${
                                  res === 'W' ? 'bg-emerald-600 text-white' :
                                  res === 'D' ? 'bg-amber-500 text-slate-950' :
                                  'bg-rose-600 text-white'
                                }`}
                              >
                                {res}
                              </span>
                            ))
                          ) : (
                            <span className="text-xs text-slate-500">-</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
