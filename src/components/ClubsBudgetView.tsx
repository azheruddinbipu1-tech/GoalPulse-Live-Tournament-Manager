import React, { useState } from 'react';
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
  User 
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
  const currentTeam = teams.find(t => t.id === selectedTeamId) || teams[0];
  const teamPlayers = players.filter(p => p.teamId === currentTeam?.id);

  // Modals state
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [showAddTeamModal, setShowAddTeamModal] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [showAddPlayerModal, setShowAddPlayerModal] = useState(false);

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

  const handleSaveTeamSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamName) return;

    const teamToSave: Team = {
      id: editingTeam ? editingTeam.id : `team-${Date.now()}`,
      name: teamName,
      shortName: teamShortName.trim().toUpperCase() || teamName.slice(0, 3).toUpperCase(),
      logoUrl: teamLogoUrl,
      primaryColorHex: editingTeam?.primaryColorHex || '#10B981',
      totalBudget: Number(teamBudget) || 100,
      city: teamCity || 'Dhaka',
      coach: teamCoach || 'Head Coach'
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
    setPlayerPhotoUrl(player.photoUrl);
    setPlayerPrice(player.purchasePrice);
    setPlayerTeamId(player.teamId);
  };

  const handleOpenAddPlayer = () => {
    setEditingPlayer(null);
    setPlayerName('');
    setPlayerJersey(teamPlayers.length + 1);
    setPlayerPosition('FORWARD');
    setPlayerPhotoUrl('');
    setPlayerPrice(15);
    setPlayerTeamId(currentTeam.id);
    setShowAddPlayerModal(true);
  };

  const handleSavePlayerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!playerName) return;

    const playerToSave: Player = {
      id: editingPlayer ? editingPlayer.id : `p-${Date.now()}`,
      teamId: playerTeamId || currentTeam.id,
      name: playerName,
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
      matchesPlayed: editingPlayer?.matchesPlayed || 0
    };

    onSavePlayer(playerToSave);
    setEditingPlayer(null);
    setShowAddPlayerModal(false);
  };

  // Budget calculations
  const totalSpent = teamPlayers.reduce((sum, p) => sum + (p.purchasePrice || 0), 0);
  const remainingBudget = currentTeam ? currentTeam.totalBudget - totalSpent : 0;
  const budgetUtilization = (currentTeam && currentTeam.totalBudget > 0) ? (totalSpent / currentTeam.totalBudget) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* 1. Clubs Selector Horizontal Bar */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none flex-1">
          {teams.map(t => {
            const isSelected = t.id === currentTeam.id;
            return (
              <button
                key={t.id}
                onClick={() => setSelectedTeamId(t.id)}
                className={`flex items-center gap-2.5 px-4 py-2.5 rounded-2xl border transition-all flex-shrink-0 cursor-pointer ${
                  isSelected
                    ? 'bg-slate-800 border-emerald-500 shadow-md shadow-emerald-950 text-white'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 text-slate-400'
                }`}
              >
                <div className="w-6 h-6 rounded-lg bg-slate-800 border border-slate-700 overflow-hidden flex items-center justify-center">
                  {t.logoUrl ? (
                    <img src={t.logoUrl} alt={t.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-[10px] font-bold">{t.shortName}</span>
                  )}
                </div>
                <span className="font-bold text-xs">{t.shortName}</span>
                <span className="text-[11px] text-emerald-400 font-mono">৳{t.totalBudget}M</span>
              </button>
            );
          })}
        </div>

        {isAdmin && (
          <button
            onClick={handleOpenAddTeam}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-950 flex-shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Club</span>
          </button>
        )}
      </div>

      {/* 2. Selected Club Profile & Budget Overview Card 🏟️💰 */}
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
            <div className="text-[11px] text-slate-500 mt-1">Allocated season expenditure</div>
          </div>

          <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
            <div className="text-xs text-slate-400 font-semibold mb-1">Squad Expenditure (ক্রয় করা খরচ)</div>
            <div className="text-2xl font-black text-rose-400 font-display">৳{totalSpent.toFixed(1)}M</div>
            <div className="text-[11px] text-slate-500 mt-1">Spent across {teamPlayers.length} signings</div>
          </div>

          <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
            <div className="text-xs text-slate-400 font-semibold mb-1">Remaining Balance (অবশিষ্ট বাজেট)</div>
            <div className={`text-2xl font-black font-display ${remainingBudget >= 0 ? 'text-emerald-400' : 'text-rose-500'}`}>
              ৳{remainingBudget.toFixed(1)}M
            </div>
            <div className="text-[11px] text-slate-500 mt-1">Available for new transfers</div>
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

      {/* 3. Squad Roster & Players Table 👤 */}
      <div className="bg-slate-900/90 rounded-3xl border border-slate-800 p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-400" />
            <h4 className="font-bold text-white text-base font-display">
              {currentTeam.shortName} Registered Squad ({teamPlayers.length} Players)
            </h4>
          </div>

          {isAdmin && (
            <button
              onClick={handleOpenAddPlayer}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-950 cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>Sign Player</span>
            </button>
          )}
        </div>

        {teamPlayers.length === 0 ? (
          <div className="py-12 text-center text-slate-500">
            No players signed in this club yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {teamPlayers.map(player => (
              <div
                key={player.id}
                className="bg-slate-950/70 border border-slate-800 rounded-2xl p-3.5 flex items-center justify-between gap-3 hover:border-slate-700 transition-all"
              >
                <div className="flex items-center gap-3">
                  {/* Player Photo Avatar 👤 */}
                  <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 overflow-hidden flex items-center justify-center flex-shrink-0">
                    {player.photoUrl ? (
                      <img src={player.photoUrl} alt={player.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-xs font-bold text-slate-400">{player.name.slice(0, 2)}</span>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-emerald-400 font-mono font-black text-sm">#{player.jerseyNumber}</span>
                      <span className="font-bold text-white text-sm">{player.name}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                      <span className="px-1.5 py-0.2 rounded bg-slate-800 text-[10px] font-bold text-slate-300">
                        {player.position}
                      </span>
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
                    </div>
                  </div>
                </div>

                {/* Admin Player Actions */}
                {isAdmin && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEditPlayer(player)}
                      className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
                      title="Edit Player"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDeletePlayer(player.id)}
                      className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all cursor-pointer"
                      title="Delete Player"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 4. MODAL: Add/Edit Team Form ✏️ */}
      {(showAddTeamModal || editingTeam) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white font-display mb-4">
              {editingTeam ? 'Edit Club & Budget' : 'Register New Club'}
            </h3>

            <form onSubmit={handleSaveTeamSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Club Full Name</label>
                <input
                  type="text"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  placeholder="e.g. Dhaka Kings"
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
                    onChange={(e) => setTeamShortName(e.target.value)}
                    placeholder="e.g. DHK"
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
                    placeholder="e.g. Dhaka"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Head Coach</label>
                  <input
                    type="text"
                    value={teamCoach}
                    onChange={(e) => setTeamCoach(e.target.value)}
                    placeholder="e.g. Julian Alva"
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
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white font-display mb-4">
              {editingPlayer ? 'Edit Player Profile' : 'Sign New Player'}
            </h3>

            <form onSubmit={handleSavePlayerSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Player Full Name</label>
                <input
                  type="text"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  placeholder="e.g. Jamal Bhuyan"
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
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white font-mono"
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
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white font-mono"
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
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white"
                  >
                    <option value="GOALKEEPER">Goalkeeper (GK)</option>
                    <option value="DEFENDER">Defender (DEF)</option>
                    <option value="MIDFIELDER">Midfielder (MID)</option>
                    <option value="FORWARD">Forward (FWD)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Club Assignment</label>
                  <select
                    value={playerTeamId}
                    onChange={(e) => setPlayerTeamId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white"
                  >
                    {teams.map(t => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>
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

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddPlayerModal(false);
                    setEditingPlayer(null);
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-950 cursor-pointer"
                >
                  Save Player
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
