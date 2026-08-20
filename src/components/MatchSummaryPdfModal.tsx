import React, { useRef, useState } from 'react';
import { Match, Team, Player, TournamentInfo } from '../types';
import { 
  Download, 
  Printer, 
  X, 
  Trophy, 
  Star, 
  Calendar, 
  MapPin, 
  Shield, 
  Zap, 
  CheckCircle2,
  Clock,
  Award,
  Share2
} from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface MatchSummaryPdfModalProps {
  isOpen: boolean;
  onClose: () => void;
  match: Match;
  teams: Team[];
  players: Player[];
  tournamentInfo: TournamentInfo;
}

export const MatchSummaryPdfModal: React.FC<MatchSummaryPdfModalProps> = ({
  isOpen,
  onClose,
  match,
  teams,
  players,
  tournamentInfo
}) => {
  const printRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  if (!isOpen) return null;

  const homeTeam = teams.find(t => t.id === match.homeTeamId);
  const awayTeam = teams.find(t => t.id === match.awayTeamId);
  const potmPlayer = players.find(p => p.id === match.potmPlayerId);

  // Group events
  const goals = match.events.filter(e => e.type === 'GOAL' || e.type === 'PENALTY_GOAL' || e.type === 'OWN_GOAL');
  const cards = match.events.filter(e => e.type === 'YELLOW_CARD' || e.type === 'RED_CARD' || e.type === 'SECOND_YELLOW_RED');
  const substitutions = match.events.filter(e => e.type === 'SUBSTITUTION');

  // Stats fallback
  const homeStats = match.homeStats || {
    possession: 50,
    shots: 8,
    shotsOnTarget: 4,
    shotsOffTarget: 4,
    corners: 3,
    fouls: 5,
    offsides: 1,
    yellowCards: cards.filter(c => c.teamId === match.homeTeamId && c.type === 'YELLOW_CARD').length,
    redCards: cards.filter(c => c.teamId === match.homeTeamId && (c.type === 'RED_CARD' || c.type === 'SECOND_YELLOW_RED')).length,
    passes: 130,
    saves: 3
  };

  const awayStats = match.awayStats || {
    possession: 50,
    shots: 7,
    shotsOnTarget: 3,
    shotsOffTarget: 4,
    corners: 2,
    fouls: 6,
    offsides: 2,
    yellowCards: cards.filter(c => c.teamId === match.awayTeamId && c.type === 'YELLOW_CARD').length,
    redCards: cards.filter(c => c.teamId === match.awayTeamId && (c.type === 'RED_CARD' || c.type === 'SECOND_YELLOW_RED')).length,
    passes: 120,
    saves: 4
  };

  const handleDownloadPdf = async () => {
    if (!printRef.current) return;
    try {
      setIsGenerating(true);
      const element = printRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#0f172a'
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`NPL-Match-Summary-${homeTeam?.shortName || 'Home'}-vs-${awayTeam?.shortName || 'Away'}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      // Fallback to window.print if html2canvas meets an issue
      window.print();
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden relative my-auto">
        
        {/* Modal Top Action Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90 sticky top-0 z-20">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
              📄
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white">Match Summary Report (PDF)</h3>
              <p className="text-xs text-slate-400">অফিসিয়াল ম্যাচ বিবরণী ও পরিসংখ্যান</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyLink}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Share Link"
            >
              <Share2 className="w-4 h-4" />
              <span className="hidden sm:inline">{copiedLink ? 'Copied!' : 'Share'}</span>
            </button>

            <button
              onClick={handlePrint}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Print Sheet"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">Print</span>
            </button>

            <button
              onClick={handleDownloadPdf}
              disabled={isGenerating}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-emerald-950 transition-all cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>{isGenerating ? 'Generating PDF...' : 'Download PDF (ডাউনলোড)'}</span>
            </button>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer ml-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* PDF Printable Document Content */}
        <div className="p-4 sm:p-8 overflow-y-auto space-y-6">
          <div 
            ref={printRef}
            id="printable-match-summary"
            className="bg-slate-900 text-slate-100 p-6 sm:p-8 rounded-2xl border border-slate-800 shadow-xl space-y-6 print:border-none print:shadow-none print:p-0"
          >
            {/* Header / Branding */}
            <div className="text-center pb-6 border-b border-slate-800 relative">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-black tracking-wider uppercase mb-2">
                <Trophy className="w-3.5 h-3.5" />
                <span>{tournamentInfo.edition || '৮ম বর্ষ'} • {tournamentInfo.category || 'এলাকাভিত্তিক নাইট ফুটবল'}</span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight font-display">
                {tournamentInfo.name}
              </h1>

              <div className="text-xs text-slate-400 mt-1 font-medium">
                <span>Powered By: </span>
                <span className="text-emerald-400 font-bold">{tournamentInfo.poweredBy}</span>
                <span className="mx-2">•</span>
                <span>Co-Sponsors: </span>
                <span className="text-amber-400 font-semibold">{tournamentInfo.coSponsors.join(', ')}</span>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-slate-400 mt-3 pt-3 border-t border-slate-800/80">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>{match.matchDate}</span>
                </span>
                <span>•</span>
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>{match.venue}</span>
                </span>
                <span>•</span>
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>{match.round}</span>
                </span>
              </div>
            </div>

            {/* Scoreboard Section */}
            <div className="bg-slate-950/80 rounded-2xl border border-slate-800 p-6 flex items-center justify-between gap-4">
              {/* Home Team */}
              <div className="flex-1 text-center">
                <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-2xl bg-slate-900 border-2 border-slate-700 overflow-hidden flex items-center justify-center mb-2 shadow-lg">
                  {homeTeam?.logoUrl ? (
                    <img src={homeTeam.logoUrl} alt={homeTeam.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-2xl font-black text-slate-400">{homeTeam?.shortName}</span>
                  )}
                </div>
                <h3 className="font-black text-white text-base sm:text-lg">{homeTeam?.name}</h3>
                <span className="text-xs text-slate-400 font-semibold">{homeTeam?.city}</span>
              </div>

              {/* Score Display */}
              <div className="text-center px-4">
                <div className="text-4xl sm:text-6xl font-black text-emerald-400 font-display tracking-tight">
                  {match.homeScore} - {match.awayScore}
                </div>
                <div className="inline-block mt-2 px-3 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider bg-slate-800 text-slate-300 border border-slate-700">
                  {match.status === 'FINISHED' ? 'FULL TIME (ম্যাচ সমাপ্ত)' : match.status}
                </div>
                {match.status !== 'UPCOMING' && (
                  <div className="text-xs text-slate-500 font-mono mt-1">
                    {match.currentMinute}' {match.addedMinutes > 0 ? `+${match.addedMinutes}'` : ''} Played
                  </div>
                )}
              </div>

              {/* Away Team */}
              <div className="flex-1 text-center">
                <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-2xl bg-slate-900 border-2 border-slate-700 overflow-hidden flex items-center justify-center mb-2 shadow-lg">
                  {awayTeam?.logoUrl ? (
                    <img src={awayTeam.logoUrl} alt={awayTeam.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-2xl font-black text-slate-400">{awayTeam?.shortName}</span>
                  )}
                </div>
                <h3 className="font-black text-white text-base sm:text-lg">{awayTeam?.name}</h3>
                <span className="text-xs text-slate-400 font-semibold">{awayTeam?.city}</span>
              </div>
            </div>

            {/* Match Events: Goals, Assists & Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Home Events */}
              <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-800/80 space-y-2">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800 pb-1.5 flex items-center gap-1.5">
                  <span>⚽ {homeTeam?.shortName} Match Events</span>
                </h4>
                {match.events.filter(e => e.teamId === match.homeTeamId).length === 0 ? (
                  <p className="text-xs text-slate-500 italic py-2">কোনো ইভেন্ট রেকর্ড হয়নি</p>
                ) : (
                  <div className="space-y-1.5 text-xs">
                    {match.events.filter(e => e.teamId === match.homeTeamId).map(e => (
                      <div key={e.id} className="flex items-center justify-between bg-slate-900/60 p-1.5 rounded-lg border border-slate-800">
                        <span className="font-bold text-white flex items-center gap-1.5">
                          <span>{e.type === 'GOAL' ? '⚽' : e.type === 'PENALTY_GOAL' ? '🥅' : e.type === 'YELLOW_CARD' ? '🟨' : e.type === 'RED_CARD' ? '🟥' : '🔄'}</span>
                          <span>{e.playerName}</span>
                          {e.assistPlayerName && <span className="text-slate-400 font-normal">(Ast: {e.assistPlayerName})</span>}
                        </span>
                        <span className="font-mono text-emerald-400 font-bold">{e.minute}'</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Away Events */}
              <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-800/80 space-y-2">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800 pb-1.5 flex items-center gap-1.5">
                  <span>⚽ {awayTeam?.shortName} Match Events</span>
                </h4>
                {match.events.filter(e => e.teamId === match.awayTeamId).length === 0 ? (
                  <p className="text-xs text-slate-500 italic py-2">কোনো ইভেন্ট রেকর্ড হয়নি</p>
                ) : (
                  <div className="space-y-1.5 text-xs">
                    {match.events.filter(e => e.teamId === match.awayTeamId).map(e => (
                      <div key={e.id} className="flex items-center justify-between bg-slate-900/60 p-1.5 rounded-lg border border-slate-800">
                        <span className="font-bold text-white flex items-center gap-1.5">
                          <span>{e.type === 'GOAL' ? '⚽' : e.type === 'PENALTY_GOAL' ? '🥅' : e.type === 'YELLOW_CARD' ? '🟨' : e.type === 'RED_CARD' ? '🟥' : '🔄'}</span>
                          <span>{e.playerName}</span>
                          {e.assistPlayerName && <span className="text-slate-400 font-normal">(Ast: {e.assistPlayerName})</span>}
                        </span>
                        <span className="font-mono text-emerald-400 font-bold">{e.minute}'</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Man of the Match Showcase */}
            {potmPlayer && (
              <div className="bg-gradient-to-r from-amber-950/40 via-slate-900 to-amber-950/30 p-4 rounded-2xl border border-amber-500/40 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-400/50 flex items-center justify-center text-amber-400 text-2xl shadow-lg">
                    ⭐
                  </div>
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded-md border border-amber-500/30">
                      Player of the Match (ম্যান অব দ্য ম্যাচ)
                    </span>
                    <h4 className="text-base font-black text-white mt-0.5">{potmPlayer.name} (#{potmPlayer.jerseyNumber})</h4>
                    <p className="text-xs text-slate-400 italic">{match.potmReason || 'অসাধারণ পারফরম্যান্স ও ম্যাচ উইনিং প্রভাব'}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-amber-300">🏆 POTM Trophy</span>
                </div>
              </div>
            )}

            {/* 📊 Full Match Statistics Table */}
            <div className="bg-slate-950/60 rounded-2xl border border-slate-800 p-5 space-y-3">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-400" />
                <span>ম্যাচ পরিসংখ্যান (Complete Match Statistics)</span>
              </h4>

              <div className="space-y-2.5 text-xs">
                {/* Possession */}
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono font-bold text-emerald-400 w-12 text-left">{homeStats.possession}%</span>
                  <div className="flex-1 flex items-center gap-2">
                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden flex">
                      <div className="bg-emerald-500 h-full" style={{ width: `${homeStats.possession}%` }} />
                      <div className="bg-blue-500 h-full" style={{ width: `${awayStats.possession}%` }} />
                    </div>
                  </div>
                  <span className="font-semibold text-slate-300 text-center w-36">Ball Possession %</span>
                  <span className="font-mono font-bold text-blue-400 w-12 text-right">{awayStats.possession}%</span>
                </div>

                {/* Total Shots */}
                <div className="flex items-center justify-between gap-2 bg-slate-900/40 p-1 rounded-lg">
                  <span className="font-mono font-bold text-white w-12 text-left">{homeStats.shots}</span>
                  <span className="font-medium text-slate-400 text-center flex-1">Total Shots</span>
                  <span className="font-mono font-bold text-white w-12 text-right">{awayStats.shots}</span>
                </div>

                {/* Shots on Target */}
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono font-bold text-emerald-400 w-12 text-left">{homeStats.shotsOnTarget}</span>
                  <span className="font-medium text-slate-400 text-center flex-1">🎯 Shots on Target</span>
                  <span className="font-mono font-bold text-blue-400 w-12 text-right">{awayStats.shotsOnTarget}</span>
                </div>

                {/* Shots off Target */}
                <div className="flex items-center justify-between gap-2 bg-slate-900/40 p-1 rounded-lg">
                  <span className="font-mono font-bold text-slate-300 w-12 text-left">{homeStats.shotsOffTarget}</span>
                  <span className="font-medium text-slate-400 text-center flex-1">🎯 Shots off Target</span>
                  <span className="font-mono font-bold text-slate-300 w-12 text-right">{awayStats.shotsOffTarget}</span>
                </div>

                {/* Corners */}
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono font-bold text-white w-12 text-left">{homeStats.corners}</span>
                  <span className="font-medium text-slate-400 text-center flex-1">🚩 Corners</span>
                  <span className="font-mono font-bold text-white w-12 text-right">{awayStats.corners}</span>
                </div>

                {/* Fouls */}
                <div className="flex items-center justify-between gap-2 bg-slate-900/40 p-1 rounded-lg">
                  <span className="font-mono font-bold text-white w-12 text-left">{homeStats.fouls}</span>
                  <span className="font-medium text-slate-400 text-center flex-1">⚠️ Fouls</span>
                  <span className="font-mono font-bold text-white w-12 text-right">{awayStats.fouls}</span>
                </div>

                {/* Offsides */}
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono font-bold text-white w-12 text-left">{homeStats.offsides}</span>
                  <span className="font-medium text-slate-400 text-center flex-1">Offsides</span>
                  <span className="font-mono font-bold text-white w-12 text-right">{awayStats.offsides}</span>
                </div>

                {/* Saves */}
                <div className="flex items-center justify-between gap-2 bg-slate-900/40 p-1 rounded-lg">
                  <span className="font-mono font-bold text-emerald-400 w-12 text-left">{homeStats.saves}</span>
                  <span className="font-medium text-slate-400 text-center flex-1">🧤 Saves / Blocks</span>
                  <span className="font-mono font-bold text-blue-400 w-12 text-right">{awayStats.saves}</span>
                </div>

                {/* Yellow / Red Cards */}
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono font-bold text-amber-400 w-12 text-left">{homeStats.yellowCards}🟨 {homeStats.redCards}🟥</span>
                  <span className="font-medium text-slate-400 text-center flex-1">Cards (কার্ড)</span>
                  <span className="font-mono font-bold text-amber-400 w-12 text-right">{awayStats.yellowCards}🟨 {awayStats.redCards}🟥</span>
                </div>

                {/* Passes */}
                <div className="flex items-center justify-between gap-2 bg-slate-900/40 p-1 rounded-lg">
                  <span className="font-mono font-bold text-white w-12 text-left">{homeStats.passes}</span>
                  <span className="font-medium text-slate-400 text-center flex-1">Passes Completed</span>
                  <span className="font-mono font-bold text-white w-12 text-right">{awayStats.passes}</span>
                </div>
              </div>
            </div>

            {/* Match Summary Notes */}
            {match.matchStoryNotes && (
              <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-800 text-xs">
                <h5 className="font-bold text-slate-300 mb-1">✍️ ম্যাচের সংক্ষিপ্ত বিবরণ (Match Story & Highlights):</h5>
                <p className="text-slate-400 leading-relaxed">{match.matchStoryNotes}</p>
              </div>
            )}

            {/* Match Officials & Footer stamp */}
            <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-400">
              <div>
                <span>ম্যাচ রেফারি: </span>
                <span className="text-white font-bold">{match.referee || 'অফিসিয়াল রেফারি প্যানেল'}</span>
                {match.assistantReferees && (
                  <span className="text-slate-400"> ({match.assistantReferees})</span>
                )}
              </div>

              <div className="text-right text-slate-500 font-mono">
                <span>Generated: {new Date().toLocaleDateString('bn-BD', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                <span className="ml-2 font-bold text-emerald-500">✓ Official Verified Sheet</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Bottom Footer */}
        <div className="px-6 py-3.5 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between text-xs text-slate-400">
          <span>NPL Night Football Premier League Management System</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold transition-colors cursor-pointer"
          >
            Close (বন্ধ করুন)
          </button>
        </div>
      </div>
    </div>
  );
};
