import React, { useState, useEffect } from 'react';
import { Team, Player, Position } from '../types';
import { 
  Users, 
  DollarSign, 
  Plus, 
  Edit3, 
  Trash2, 
  Shield, 
  UserPlus, 
  Briefcase, 
  MapPin, 
  User,
  Search,
  ArrowRightLeft,
  Star,
  Award,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';
import { ImageUploadBox } from './ImageUploadBox';

interface ClubsBudgetViewProps {
  teams: Team[];
  players: Player[];
  isAdmin: boolean;
  onSaveTeam: (team: Team) => void;
  onDeleteTeam: (teamId: string) => void;
  onSavePlayer: (player: Player) => void;
  onDeletePlayer: (playerId: string) => void;
}

export const ClubsBudgetView: React.FC<ClubsBudgetViewProps> = ({
  teams,
  players,
  isAdmin,
  onSaveTeam,
  onDeleteTeam,
  onSavePlayer,
  onDeletePlayer
}) => {
  const [selectedTeamId, setSelectedTeamId] = useState<string>(teams[0]?.id || '');
  const [playerSearchQuery, setPlayerSearchQuery] = useState('');
  const [viewAllPlayers, setViewAllPlayers] = useState(false);

  // Keep selectedTeamId synced if teams change or if current selection was deleted
  useEffect(() => {
    if (teams.length > 0 && !teams.some(t => t.id === selectedTeamId)) {
      setSelectedTeamId(teams[0].id);
    }
  }, [teams, selectedTeamId]);

  const currentTeam = teams.find(t => t.id === selectedTeamId) || teams[0];
  const teamPlayers = currentTeam ? players.filter(p => p.teamId === currentTeam.id) : [];

  // Identify any orphaned/unassigned players whose teamId does not match any current team
  const unassignedPlayers = players.filter(p => !teams.some(t => t.id === p.teamId));

  // Modals state
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [showAddTeamModal, setShowAddTeamModal] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [showAddPlayerModal, setShowAddPlayerModal] = useState(false);
  const [quickTransferPlayer, setQuickTransferPlayer] = useState<Player | null>(null);
  const [transferTargetTeamId, setTransferTargetTeamId] = useState('');

  // Team Form State
  const [teamName, setTeamName] = useState('');
  const [teamShortName, setTeamShortName] = useState('');
  const [teamLogoUrl, setTeamLogoUrl] = useState('');
  const [teamBudget, setTeamBudget] = useState<number>(150);
  const [teamCity, setTeamCity] = useState('');
  const [teamCoach, setTeamCoach] = useState('');

  // Player Form State
  const [playerName, setPlayerName] = useState('');
  const [playerJersey, setPlayerJersey] = useState<number>(10);
  const [playerPosition, setPlayerPosition] = useState<Position>('FORWARD');
  const [playerPhotoUrl, setPlayerPhotoUrl] = useState('');
  const [playerPrice, setPlayerPrice] = useState<number>(20);
  const [playerTeamId, setPlayerTeamId] = useState('');
  const [playerIsCaptain, setPlayerIsCaptain] = useState(false);
  const [playerIsIcon, setPlayerIsIcon] = useState(false);

  const handleOpenAddTeam = () => {
    setEditingTeam(null);
    setTeamName('');
    setTeamShortName('');
    setTeamLogoUrl('');
    setTeamBudget(150);
    setTeamCity('');
    setTeamCoach('');
    setShowAddTeamModal(true);
  };

  const handleOpenEditTeam = (team: Team) => {
    setEditingTeam(team);
    setTeamName(team.name);
    setTeamShortName(team.shortName);
    setTeamLogoUrl(team.logoUrl);
    setTeamBudget(team.totalBudget);
    setTeamCity(team.city);
    setTeamCoach(team.coach);
  };

  const handleSaveTeamSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamName.trim()) return;

    const teamToSave: Team = {
      id: editingTeam ? editingTeam.id : `team-${Date.now()}`,
      name: teamName.trim(),
      shortName: teamShortName.trim().toUpperCase() || teamName.slice(0, 3).toUpperCase(),
      logoUrl: teamLogoUrl,
      primaryColorHex: editingTeam?.primaryColorHex || '#10B981',
      totalBudget: Number(teamBudget) || 100,
      city: teamCity.trim() || 'Dhaka',
      coach: teamCoach.trim() || 'Head Coach'
    };

    onSaveTeam(teamToSave);
    setSelectedTeamId(teamToSave.id);
    setEditingTeam(null);
    setShowAddTeamModal(false);
  };

  const handleOpenEditPlayer = (player: Player) => {
    setEditingPlayer(player);
    setPlayerName(player.name);
    setPlayerJersey(player.jerseyNumber);
    setPlayerPosition(player.position);
    setPlayerPhotoUrl(player.photoUrl || '');
    setPlayerPrice(player.purchasePrice);
    setPlayerTeamId(player.teamId);
    setPlayerIsCaptain(!!player.isCaptain);
    setPlayerIsIcon(!!player.isIconPlayer);
  };

  const handleOpenAddPlayer = (targetTeamId?: string) => {
    const assignedTeamId = targetTeamId || currentTeam?.id || teams[0]?.id || '';
    setEditingPlayer(null);
    setPlayerName('');
    const existingCount = players.filter(p => p.teamId === assignedTeamId).length;
    setPlayerJersey(existingCount + 1);
    setPlayerPosition('FORWARD');
    setPlayerPhotoUrl('');
    setPlayerPrice(15);
    setPlayerTeamId(assignedTeamId);
    setPlayerIsCaptain(false);
    setPlayerIsIcon(false);
    setShowAddPlayerModal(true);
  };

  const handleSavePlayerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!playerName.trim()) return;

    const resolvedTeamId = playerTeamId || currentTeam?.id || teams[0]?.id || '';

    const playerToSave: Player = {
      id: editingPlayer ? editingPlayer.id : `p-${Date.now()}`,
      teamId: resolvedTeamId,
      name: playerName.trim(),
      jerseyNumber: Number(playerJersey) || 9,
      position: playerPosition,
      photoUrl: playerPhotoUrl,
      purchasePrice: Number(playerPrice) || 5,
      nationality: editingPlayer?.nationality || 'Bangladesh',
      goals: editingPlayer?.goals || 0,
      assists: editingPlayer?.assists || 0,
      yellowCards: editingPlayer?.yellowCards || 0,
      redCards: editingPlayer?.redCards || 0,
      fouls: editingPlayer?.fouls || 0,
      saves: editingPlayer?.saves || 0,
      matchesPlayed: editingPlayer?.matchesPlayed || 0,
      potmAwards: editingPlayer?.potmAwards || 0,
      isCaptain: playerIsCaptain,
      isIconPlayer: playerIsIcon
    };

    onSavePlayer(playerToSave);
    setEditingPlayer(null);
    setShowAddPlayerModal(false);
  };

  // Quick transfer player to a different team
  const handleExecuteQuickTransfer = () => {
    if (!quickTransferPlayer || !transferTargetTeamId) return;

    const updated: Player = {
      ...quickTransferPlayer,
      teamId: transferTargetTeamId,
      // If moved, clear captain from old team if transferring
      isCaptain: false
    };

    onSavePlayer(updated);
    setQuickTransferPlayer(null);
    setTransferTargetTeamId('');
  };

  if (!currentTeam) {
    return (
      <div className="space-y-6 pb-12">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 sm:p-12 text-center max-w-xl mx-auto shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-white font-display mb-2">
            কোনো দল (Club) তৈরি করা নেই
          </h2>
          <p className="text-sm text-slate-400 mb-6 max-w-md mx-auto">
            আপনার নিজস্ব দলের নাম, লোগো, বাজেট এবং কোচ নির্ধারণ করে প্রথম ক্লাবটি তৈরি করুন।
          </p>

          {isAdmin ? (
            <button
              onClick={handleOpenAddTeam}
              className="px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-sm flex items-center gap-2 shadow-lg shadow-emerald-950 mx-auto transition-all cursor-pointer"
            >
              <Plus className="w-5 h-5" />
              <span>➕ প্রথম দল যোগ করুন (Add New Club)</span>
            </button>
          ) : (
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 text-slate-400 text-xs font-semibold">
              <span>🔒 পাবলিক ভিউ মোড • দল তৈরি করতে অ্যাডমিন পিন প্রয়োজন</span>
            </div>
          )}
        </div>

        {/* Modal: Add/Edit Team Form */}
        {showAddTeamModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
            <div className="bg-slate-900 border border-slate-700/90 rounded-3xl max-w-md w-full p-6 shadow-2xl relative">
              <h3 className="text-lg font-black text-white font-display mb-4 flex items-center gap-2">
                <span>🛡️</span>
                <span>নতুন ক্লাব তৈরি করুন</span>
              </h3>

              <form onSubmit={handleSaveTeamSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    ক্লাবের পূর্ণ নাম *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="যেমন: ঢাকা কিংস"
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">
                      শর্ট কোড
                    </label>
                    <input
                      type="text"
                      maxLength={4}
                      placeholder="যেমন: DHK"
                      value={teamShortName}
                      onChange={(e) => setTeamShortName(e.target.value.toUpperCase())}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">
                      বাজেট (৳M)
                    </label>
                    <input
                      type="number"
                      min="10"
                      value={teamBudget}
                      onChange={(e) => setTeamBudget(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-bold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">
                      শহর (City)
                    </label>
                    <input
                      type="text"
                      placeholder="যেমন: ঢাকা"
                      value={teamCity}
                      onChange={(e) => setTeamCity(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">
                      কোচ (Coach)
                    </label>
                    <input
                      type="text"
                      placeholder="যেমন: হেড কোচ"
                      value={teamCoach}
                      onChange={(e) => setTeamCoach(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <ImageUploadBox
                    label="🛡️ ক্লাবের লোগো আপলোড করুন (Club Logo)"
                    sublabel="ডিভাইসের গ্যালারি বা ফোল্ডার থেকে লোগো সিলেক্ট করুন"
                    value={teamLogoUrl}
                    onChange={setTeamLogoUrl}
                    aspectRatio="square"
                    fallbackText="লোগো"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setShowAddTeamModal(false)}
                    className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold"
                  >
                    বাতিল
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-950"
                  >
                    ক্লাব সংরক্ষণ করুন
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Budget calculations
  const totalSpent = teamPlayers.reduce((sum, p) => sum + (p.purchasePrice || 0), 0);
  const remainingBudget = currentTeam ? currentTeam.totalBudget - totalSpent : 0;
  const budgetUtilization = (currentTeam && currentTeam.totalBudget > 0) ? (totalSpent / currentTeam.totalBudget) * 100 : 0;

  // Filtered players list for display
  const displayedPlayers = (viewAllPlayers ? players : teamPlayers).filter(p => {
    if (!playerSearchQuery.trim()) return true;
    const q = playerSearchQuery.toLowerCase();
    const nameMatch = p.name.toLowerCase().includes(q);
    const jerseyMatch = String(p.jerseyNumber).includes(q);
    const posMatch = p.position.toLowerCase().includes(q);
    return nameMatch || jerseyMatch || posMatch;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* ⚠️ Unassigned / Orphaned Players Alert Banner (If any) */}
      {unassignedPlayers.length > 0 && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0" />
            <div>
              <h5 className="font-bold text-amber-300 text-xs">
                {unassignedPlayers.length} জন প্লেয়ার কোনো ক্লাবে যুক্ত নেই (Unassigned Players)
              </h5>
              <p className="text-[11px] text-amber-200/70">
                এই প্লেয়ারগুলো কোনো ক্লাবের তালিকায় প্রদর্শিত হচ্ছে না। তাদের যেকোনো ক্লাবে অ্যাসাইন করুন।
              </p>
            </div>
          </div>
          {isAdmin && (
            <button
              onClick={() => {
                setViewAllPlayers(true);
                setPlayerSearchQuery('');
              }}
              className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs shadow-md transition-all cursor-pointer flex-shrink-0"
            >
              প্লেয়ারগুলো দেখুন ও টিম দিন
            </button>
          )}
        </div>
      )}

      {/* 1. Clubs Selector Horizontal Bar */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none flex-1">
          {teams.map(t => {
            const isSelected = !viewAllPlayers && t.id === currentTeam.id;
            const clubPlayerCount = players.filter(p => p.teamId === t.id).length;
            return (
              <button
                key={t.id}
                onClick={() => {
                  setSelectedTeamId(t.id);
                  setViewAllPlayers(false);
                }}
                className={`flex items-center gap-2.5 px-4 py-2.5 rounded-2xl border transition-all flex-shrink-0 cursor-pointer ${
                  isSelected
                    ? 'bg-slate-800 border-emerald-500 shadow-md shadow-emerald-950 text-white ring-1 ring-emerald-500/50'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 text-slate-400'
                }`}
              >
                <div className="w-7 h-7 rounded-xl bg-slate-800 border border-slate-700 overflow-hidden flex items-center justify-center">
                  {t.logoUrl ? (
                    <img src={t.logoUrl} alt={t.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-[10px] font-bold">{t.shortName}</span>
                  )}
                </div>
                <div className="text-left">
                  <div className="font-bold text-xs">{t.shortName}</div>
                  <div className="text-[10px] text-slate-400 font-normal">{clubPlayerCount} জন প্লেয়ার</div>
                </div>
              </button>
            );
          })}

          {/* View All Roster Button */}
          <button
            onClick={() => setViewAllPlayers(true)}
            className={`flex items-center gap-2 px-3.5 py-2.5 rounded-2xl border transition-all flex-shrink-0 cursor-pointer ${
              viewAllPlayers
                ? 'bg-indigo-600 border-indigo-500 text-white shadow-md shadow-indigo-950 font-bold'
                : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 text-slate-400'
            }`}
          >
            <Users className="w-4 h-4" />
            <span className="text-xs font-bold">সকল প্লেয়ার ({players.length})</span>
          </button>
        </div>

        {isAdmin && (
          <button
            onClick={handleOpenAddTeam}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-950 flex-shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>নতুন ক্লাব</span>
          </button>
        )}
      </div>

      {/* 2. Selected Club Profile & Budget Overview Card 🏟️💰 */}
      {!viewAllPlayers && currentTeam && (
        <div className="bg-slate-900/90 rounded-3xl border border-slate-800 p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-800">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-slate-800 border-2 border-emerald-500/50 p-1 flex items-center justify-center overflow-hidden shadow-xl">
                {currentTeam.logoUrl ? (
                  <img src={currentTeam.logoUrl} alt={currentTeam.name} className="w-full h-full object-cover rounded-xl" />
                ) : (
                  <span className="text-xl font-black text-white">{currentTeam.shortName}</span>
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-extrabold text-white font-display">{currentTeam.name}</h3>
                  <span className="text-xs px-2 py-0.5 rounded-md bg-slate-800 border border-slate-700 text-slate-300 font-mono">
                    {currentTeam.shortName}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                  <span className="flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-emerald-400" />
                    Coach: <strong className="text-slate-200">{currentTeam.coach}</strong>
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                    {currentTeam.city}
                  </span>
                </div>
              </div>
            </div>

            {isAdmin && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleOpenAddPlayer(currentTeam.id)}
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-950 cursor-pointer"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>প্লেয়ার যোগ করুন</span>
                </button>
                <button
                  onClick={() => handleOpenEditTeam(currentTeam)}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 border border-slate-700 cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Edit Club</span>
                </button>
              </div>
            )}
          </div>

          {/* Budget Metrics 💰 */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
              <div className="text-xs text-slate-400 font-semibold mb-1">Total Club Budget (মোট বাজেট)</div>
              <div className="text-2xl font-black text-white font-display">৳{currentTeam.totalBudget}M</div>
              <div className="text-[11px] text-slate-500 mt-1">বরাদ্দকৃত সর্বমোট বাজেট</div>
            </div>

            <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
              <div className="text-xs text-slate-400 font-semibold mb-1">Squad Expenditure (প্লেয়ার খরচ)</div>
              <div className="text-2xl font-black text-rose-400 font-display">৳{totalSpent.toFixed(1)}M</div>
              <div className="text-[11px] text-slate-500 mt-1">{teamPlayers.length} জন সাইন করা প্লেয়ার</div>
            </div>

            <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
              <div className="text-xs text-slate-400 font-semibold mb-1">Remaining Balance (অবশিষ্ট বাজেট)</div>
              <div className={`text-2xl font-black font-display ${remainingBudget >= 0 ? 'text-emerald-400' : 'text-rose-500'}`}>
                ৳{remainingBudget.toFixed(1)}M
              </div>
              <div className="text-[11px] text-slate-500 mt-1">নতুন প্লেয়ার সাইনিংয়ের জন্য বাকি</div>
            </div>
          </div>

          {/* Budget Utilization Progress Bar */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-slate-400">Budget Utilization</span>
              <span className={budgetUtilization > 90 ? 'text-rose-400' : 'text-emerald-400'}>
                {budgetUtilization.toFixed(1)}%
              </span>
            </div>
            <div className="h-2.5 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  budgetUtilization > 90 ? 'bg-rose-500' : 'bg-gradient-to-r from-emerald-500 to-teal-400'
                }`}
                style={{ width: `${Math.min(budgetUtilization, 100)}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* 3. Squad Roster & Players Table 👤 */}
      <div className="bg-slate-900/90 rounded-3xl border border-slate-800 p-6 shadow-2xl space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-2 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-400" />
            <h4 className="font-bold text-white text-base font-display">
              {viewAllPlayers 
                ? `সকল ক্লাবের খেলোয়াড় তালিকা (${players.length} জন)` 
                : `${currentTeam?.name} Squad (${teamPlayers.length} জন)`}
            </h4>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {/* Search Input */}
            <div className="relative flex-1 sm:w-48">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="প্লেয়ার খুঁজুন..."
                value={playerSearchQuery}
                onChange={(e) => setPlayerSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            {isAdmin && (
              <button
                onClick={() => handleOpenAddPlayer(viewAllPlayers ? undefined : currentTeam?.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-950 cursor-pointer flex-shrink-0"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>প্লেয়ার সাইন করুন</span>
              </button>
            )}
          </div>
        </div>

        {displayedPlayers.length === 0 ? (
          <div className="py-12 text-center text-slate-500 space-y-2">
            <Users className="w-8 h-8 text-slate-600 mx-auto" />
            <p className="text-xs">
              {playerSearchQuery ? 'এই নামে কোনো প্লেয়ার পাওয়া যায়নি।' : 'এই ক্লাবে কোনো প্লেয়ার যুক্ত করা নেই।'}
            </p>
            {isAdmin && (
              <button
                onClick={() => handleOpenAddPlayer(currentTeam?.id)}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer mt-2"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>প্লেয়ার যুক্ত করুন</span>
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {displayedPlayers.map(player => {
              const playerClub = teams.find(t => t.id === player.teamId);
              const isOrphaned = !playerClub;

              return (
                <div
                  key={player.id}
                  className={`bg-slate-950/70 border rounded-2xl p-3.5 flex items-center justify-between gap-3 hover:border-slate-700 transition-all ${
                    isOrphaned ? 'border-amber-500/50 bg-amber-950/10' : 'border-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {/* Player Photo Avatar 👤 */}
                    <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 overflow-hidden flex items-center justify-center flex-shrink-0 relative">
                      {player.photoUrl ? (
                        <img src={player.photoUrl} alt={player.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-xs font-bold text-slate-400">{player.name.slice(0, 2)}</span>
                      )}
                      {player.isCaptain && (
                        <div className="absolute top-0 left-0 bg-amber-500 text-slate-950 text-[9px] font-black px-1 rounded-br">
                          C
                        </div>
                      )}
                    </div>

                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-emerald-400 font-mono font-black text-sm">#{player.jerseyNumber}</span>
                        <span className="font-bold text-white text-sm">{player.name}</span>
                        {player.isCaptain && (
                          <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-bold">
                            Captain
                          </span>
                        )}
                        {player.isIconPlayer && (
                          <span className="px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 border border-purple-500/40 text-[10px] font-bold">
                            Icon ⭐
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5 flex-wrap">
                        <span className="px-1.5 py-0.2 rounded bg-slate-800 text-[10px] font-bold text-slate-300">
                          {player.position}
                        </span>
                        <span>•</span>
                        {/* Club Badge Pill */}
                        {playerClub ? (
                          <span className="text-slate-300 text-[11px] font-semibold flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: playerClub.primaryColorHex || '#10B981' }} />
                            {playerClub.shortName}
                          </span>
                        ) : (
                          <span className="text-amber-400 text-[10px] font-bold bg-amber-500/20 px-1.5 rounded">
                            অ্যাসাইন করা নেই ⚠️
                          </span>
                        )}
                        <span>•</span>
                        <span className="text-emerald-400 font-bold">💰 ৳{player.purchasePrice}M</span>
                      </div>

                      {/* Stats pill */}
                      <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-1">
                        {player.goals > 0 && <span>⚽ {player.goals}</span>}
                        {player.assists > 0 && <span>👟 {player.assists}</span>}
                        {player.yellowCards > 0 && <span>🟨 {player.yellowCards}</span>}
                        {player.redCards > 0 && <span>🟥 {player.redCards}</span>}
                        {player.saves > 0 && <span>🧤 {player.saves}</span>}
                        {player.potmAwards ? <span>🏆 POTM x{player.potmAwards}</span> : null}
                      </div>
                    </div>
                  </div>

                  {/* Admin Player Actions */}
                  {isAdmin && (
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {/* Transfer / Change Team Quick Button */}
                      <button
                        onClick={() => {
                          setQuickTransferPlayer(player);
                          setTransferTargetTeamId(player.teamId || teams[0]?.id || '');
                        }}
                        className="p-2 rounded-lg text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 transition-all cursor-pointer"
                        title="টিম পরিবর্তন / Transfer Club"
                      >
                        <ArrowRightLeft className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleOpenEditPlayer(player)}
                        className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
                        title="Edit Player"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`আপনি কি নিশ্চিতভাবে ${player.name} খেলোয়াড়কে ডিলিট করতে চান?`)) {
                            onDeletePlayer(player.id);
                          }
                        }}
                        className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all cursor-pointer"
                        title="Delete Player"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 4. MODAL: Add/Edit Team Form ✏️ */}
      {(showAddTeamModal || editingTeam) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white font-display mb-4">
              {editingTeam ? 'Edit Club & Budget' : 'নতুন ক্লাব তৈরি করুন (Register Club)'}
            </h3>

            <form onSubmit={handleSaveTeamSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Club Full Name *</label>
                <input
                  type="text"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  placeholder="যেমন: ঢাকা কিংস"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Short Code</label>
                  <input
                    type="text"
                    maxLength={4}
                    value={teamShortName}
                    onChange={(e) => setTeamShortName(e.target.value.toUpperCase())}
                    placeholder="যেমন: DHK"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white uppercase"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Budget (৳ Millions)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={teamBudget}
                    onChange={(e) => setTeamBudget(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white font-mono"
                    required
                  />
                </div>
              </div>

              <div>
                <ImageUploadBox
                  label="🛡️ ক্লাবের লোগো (Club Logo)"
                  sublabel="ডিভাইস থেকে ক্লাবের লোগো সিলেক্ট করুন"
                  value={teamLogoUrl}
                  onChange={setTeamLogoUrl}
                  aspectRatio="square"
                  fallbackText="লোগো"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">City / Region</label>
                  <input
                    type="text"
                    value={teamCity}
                    onChange={(e) => setTeamCity(e.target.value)}
                    placeholder="যেমন: ঢাকা"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Head Coach</label>
                  <input
                    type="text"
                    value={teamCoach}
                    onChange={(e) => setTeamCoach(e.target.value)}
                    placeholder="যেমন: হেড কোচ"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddTeamModal(false);
                    setEditingTeam(null);
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-950 cursor-pointer"
                >
                  Save Club
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. MODAL: Add/Edit Player Form 👤💰 */}
      {(showAddPlayerModal || editingPlayer) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-white font-display mb-4 flex items-center gap-2">
              <span>{editingPlayer ? '✏️' : '👤'}</span>
              <span>{editingPlayer ? 'প্লেয়ার তথ্য পরিবর্তন (Edit Player)' : 'নতুন প্লেয়ার সাইন করুন (Sign Player)'}</span>
            </h3>

            <form onSubmit={handleSavePlayerSubmit} className="space-y-3.5">
              {/* Club Assignment Dropdown */}
              <div>
                <label className="block text-xs font-bold text-emerald-400 mb-1">
                  🛡️ কোন ক্লাবের প্লেয়ার? (Club Assignment) *
                </label>
                <select
                  value={playerTeamId}
                  onChange={(e) => setPlayerTeamId(e.target.value)}
                  className="w-full bg-slate-950 border border-emerald-500/50 rounded-xl p-2.5 text-xs text-white font-bold focus:outline-none focus:border-emerald-500"
                  required
                >
                  {teams.map(t => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.shortName})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Player Full Name *</label>
                <input
                  type="text"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  placeholder="যেমন: তানভীর আহমেদ"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Jersey #</label>
                  <input
                    type="number"
                    min="1"
                    max="99"
                    value={playerJersey}
                    onChange={(e) => setPlayerJersey(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white font-mono font-bold"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">💰 ক্রয় মূল্য (৳ Millions)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={playerPrice}
                    onChange={(e) => setPlayerPrice(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white font-mono font-bold"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Position</label>
                  <select
                    value={playerPosition}
                    onChange={(e) => setPlayerPosition(e.target.value as Position)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white font-bold"
                  >
                    <option value="FORWARD">Forward (FWD)</option>
                    <option value="MIDFIELDER">Midfielder (MID)</option>
                    <option value="DEFENDER">Defender (DEF)</option>
                    <option value="GOALKEEPER">Goalkeeper (GK)</option>
                  </select>
                </div>

                <div className="flex items-center gap-3 pt-5">
                  <label className="flex items-center gap-2 text-xs text-slate-300 font-semibold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={playerIsCaptain}
                      onChange={(e) => setPlayerIsCaptain(e.target.checked)}
                      className="rounded bg-slate-950 border-slate-700 text-emerald-500 focus:ring-0"
                    />
                    <span>দল অধিনায়ক (Captain)</span>
                  </label>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <label className="flex items-center gap-2 text-xs text-slate-300 font-semibold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={playerIsIcon}
                    onChange={(e) => setPlayerIsIcon(e.target.checked)}
                    className="rounded bg-slate-950 border-slate-700 text-purple-500 focus:ring-0"
                  />
                  <span>আইকন প্লেয়ার (Icon Star Player ⭐)</span>
                </label>
              </div>

              <div>
                <ImageUploadBox
                  label="👤 প্লেয়ারের ছবি (Player Photo)"
                  sublabel="ডিভাইস থেকে প্লেয়ারের প্রোফাইল ছবি সিলেক্ট করুন"
                  value={playerPhotoUrl}
                  onChange={setPlayerPhotoUrl}
                  aspectRatio="circle"
                  fallbackText="প্লেয়ার ছবি"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddPlayerModal(false);
                    setEditingPlayer(null);
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-950 cursor-pointer"
                >
                  প্লেয়ার সংরক্ষণ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. MODAL: Quick Transfer Player 🔄 */}
      {quickTransferPlayer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
                <ArrowRightLeft className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-white text-sm">প্লেয়ার দল বদল (Transfer)</h4>
                <p className="text-xs text-slate-400">{quickTransferPlayer.name}</p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                নতুন ক্লাব নির্বাচন করুন (Target Club):
              </label>
              <select
                value={transferTargetTeamId}
                onChange={(e) => setTransferTargetTeamId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white font-bold focus:outline-none focus:border-indigo-500"
              >
                {teams.map(t => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.shortName})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setQuickTransferPlayer(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
              >
                বাতিল
              </button>
              <button
                type="button"
                onClick={handleExecuteQuickTransfer}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-950 cursor-pointer"
              >
                ট্রান্সফার কনফার্ম করুন
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

