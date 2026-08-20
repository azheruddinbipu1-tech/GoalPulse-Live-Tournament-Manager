import React from 'react';
import { 
  Trophy, 
  Activity, 
  Users, 
  ShieldCheck, 
  Lock, 
  Unlock, 
  BarChart2, 
  DollarSign,
  Download,
  Smartphone,
  Info,
  Bell
} from 'lucide-react';

export type TabType = 'LIVE' | 'STANDINGS' | 'LEADERBOARD' | 'CLUBS' | 'INFO' | 'ADMIN';

interface NavbarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  isAdmin: boolean;
  onToggleAdmin: () => void;
  onOpenInstallModal: () => void;
  liveMatchCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  isAdmin,
  onToggleAdmin,
  onOpenInstallModal,
  liveMatchCount
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('LIVE')}>
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center shadow-lg shadow-emerald-950/50">
              <span className="text-xl">⚽</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg sm:text-xl tracking-tight text-white font-display">
                  NPL <span className="text-emerald-400">Night Football</span>
                </span>
                {liveMatchCount > 0 && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30 animate-pulse">
                    LIVE
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 font-medium hidden sm:block">
                ৮ম বর্ষ • Powered by Sky Star Boys Club
              </p>
            </div>
          </div>

          {/* Desktop Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-950/60 p-1.5 rounded-xl border border-slate-800/80">
            <button
              onClick={() => setActiveTab('LIVE')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'LIVE'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/40'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Activity className="w-4 h-4" />
              <span>Live Match</span>
            </button>

            <button
              onClick={() => setActiveTab('STANDINGS')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'STANDINGS'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/40'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Trophy className="w-4 h-4" />
              <span>Points Table</span>
            </button>

            <button
              onClick={() => setActiveTab('LEADERBOARD')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'LEADERBOARD'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/40'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <BarChart2 className="w-4 h-4" />
              <span>Leaderboard</span>
            </button>

            <button
              onClick={() => setActiveTab('CLUBS')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'CLUBS'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/40'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Clubs & Budget</span>
            </button>

            <button
              onClick={() => setActiveTab('INFO')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'INFO'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/40'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Bell className="w-4 h-4 text-amber-400" />
              <span>তথ্য ও নোটিশ</span>
            </button>

            <button
              onClick={() => setActiveTab('ADMIN')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'ADMIN'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/40'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Admin Hub</span>
            </button>
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenInstallModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 text-xs font-bold border border-emerald-500/40 transition-all cursor-pointer"
              title="Install mobile app"
            >
              <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">ইনস্টল অ্যাপ</span>
            </button>

            <button
              onClick={onToggleAdmin}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold tracking-wider transition-all border ${
                isAdmin
                  ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/20'
                  : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
              title={isAdmin ? "Admin mode active (Click to lock)" : "Spectator mode (Click to unlock Admin)"}
            >
              {isAdmin ? (
                <>
                  <Unlock className="w-3.5 h-3.5 text-emerald-400" />
                  <span>ADMIN</span>
                </>
              ) : (
                <>
                  <Lock className="w-3.5 h-3.5 text-slate-400" />
                  <span>PUBLIC</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Bottom Subnav */}
        <div className="md:hidden flex items-center justify-around py-2 border-t border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('LIVE')}
            className={`flex flex-col items-center py-1 px-1.5 rounded-lg font-medium ${
              activeTab === 'LIVE' ? 'text-emerald-400 font-bold' : 'text-slate-400'
            }`}
          >
            <Activity className="w-4 h-4 mb-0.5" />
            <span>Match</span>
          </button>
          <button
            onClick={() => setActiveTab('STANDINGS')}
            className={`flex flex-col items-center py-1 px-1.5 rounded-lg font-medium ${
              activeTab === 'STANDINGS' ? 'text-emerald-400 font-bold' : 'text-slate-400'
            }`}
          >
            <Trophy className="w-4 h-4 mb-0.5" />
            <span>Table</span>
          </button>
          <button
            onClick={() => setActiveTab('LEADERBOARD')}
            className={`flex flex-col items-center py-1 px-1.5 rounded-lg font-medium ${
              activeTab === 'LEADERBOARD' ? 'text-emerald-400 font-bold' : 'text-slate-400'
            }`}
          >
            <BarChart2 className="w-4 h-4 mb-0.5" />
            <span>Leaders</span>
          </button>
          <button
            onClick={() => setActiveTab('CLUBS')}
            className={`flex flex-col items-center py-1 px-1.5 rounded-lg font-medium ${
              activeTab === 'CLUBS' ? 'text-emerald-400 font-bold' : 'text-slate-400'
            }`}
          >
            <DollarSign className="w-4 h-4 mb-0.5" />
            <span>Clubs</span>
          </button>
          <button
            onClick={() => setActiveTab('INFO')}
            className={`flex flex-col items-center py-1 px-1.5 rounded-lg font-medium ${
              activeTab === 'INFO' ? 'text-emerald-400 font-bold' : 'text-slate-400'
            }`}
          >
            <Bell className="w-4 h-4 mb-0.5 text-amber-400" />
            <span>নোটিশ</span>
          </button>
          <button
            onClick={onOpenInstallModal}
            className="flex flex-col items-center py-1 px-1.5 rounded-lg font-medium text-emerald-400 font-bold"
          >
            <Smartphone className="w-4 h-4 mb-0.5" />
            <span>ইনস্টল</span>
          </button>
        </div>
      </div>
    </header>
  );
};
