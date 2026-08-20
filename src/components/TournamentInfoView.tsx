import React, { useState } from 'react';
import { TournamentInfo, NoticeItem, NoticeCategory } from '../types';
import { 
  Trophy, 
  Share2, 
  MapPin, 
  Phone, 
  Calendar, 
  Shield, 
  Bell, 
  Plus, 
  Trash2, 
  Edit3, 
  ExternalLink, 
  Image as ImageIcon, 
  Award, 
  BookOpen, 
  Info,
  CheckCircle2,
  Filter,
  Search,
  Video,
  Radio
} from 'lucide-react';
import { ImageUploadBox } from './ImageUploadBox';

interface TournamentInfoViewProps {
  info: TournamentInfo;
  isAdmin: boolean;
  onUpdateInfo: (updatedInfo: TournamentInfo) => void;
}

export const TournamentInfoView: React.FC<TournamentInfoViewProps> = ({
  info,
  isAdmin,
  onUpdateInfo
}) => {
  // Modal states
  const [showEditInfoModal, setShowEditInfoModal] = useState(false);
  const [showAddNoticeModal, setShowAddNoticeModal] = useState(false);
  const [showAddPhotoModal, setShowAddPhotoModal] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  // Notice filtering & search
  const [noticeFilter, setNoticeFilter] = useState<'ALL' | 'IMPORTANT' | 'LEAGUE' | 'MATCH_CHANGE' | 'NEWS'>('ALL');
  const [noticeSearch, setNoticeSearch] = useState('');

  // Gallery filter
  const [galleryCategory, setGalleryCategory] = useState<'ALL' | 'MATCH' | 'TEAM' | 'CHAMPION'>('ALL');

  // Edit Info Form State
  const [name, setName] = useState(info.name);
  const [tagline, setTagline] = useState(info.tagline);
  const [bannerPhotoUrl, setBannerPhotoUrl] = useState(info.bannerPhotoUrl);
  const [facebookPageUrl, setFacebookPageUrl] = useState(info.facebookPageUrl);
  const [facebookGroupName, setFacebookGroupName] = useState(info.facebookGroupName || '');
  const [venueName, setVenueName] = useState(info.venueName);
  const [venueLocation, setVenueLocation] = useState(info.venueLocation);
  const [contactNumber, setContactNumber] = useState(info.contactNumber);
  const [organizerName, setOrganizerName] = useState(info.organizerName);
  const [startDate, setStartDate] = useState(info.startDate);
  const [endDate, setEndDate] = useState(info.endDate);
  const [prizeMoney, setPrizeMoney] = useState(info.prizeMoney);
  const [rulesSummary, setRulesSummary] = useState(info.rulesSummary);

  // New Notice Form State
  const [noticeTitle, setNoticeTitle] = useState('');
  const [noticeContent, setNoticeContent] = useState('');
  const [noticeCategory, setNoticeCategory] = useState<NoticeCategory>('LEAGUE');
  const [noticeIsImportant, setNoticeIsImportant] = useState(false);

  // New Gallery Photo Form State
  const [newGalleryPhoto, setNewGalleryPhoto] = useState('');

  const handleOpenEditInfo = () => {
    setName(info.name);
    setTagline(info.tagline);
    setBannerPhotoUrl(info.bannerPhotoUrl);
    setFacebookPageUrl(info.facebookPageUrl);
    setFacebookGroupName(info.facebookGroupName || '');
    setVenueName(info.venueName);
    setVenueLocation(info.venueLocation);
    setContactNumber(info.contactNumber);
    setOrganizerName(info.organizerName);
    setStartDate(info.startDate);
    setEndDate(info.endDate);
    setPrizeMoney(info.prizeMoney);
    setRulesSummary(info.rulesSummary);
    setShowEditInfoModal(true);
  };

  const handleSaveInfoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateInfo({
      ...info,
      name,
      tagline,
      bannerPhotoUrl,
      facebookPageUrl,
      facebookGroupName,
      venueName,
      venueLocation,
      contactNumber,
      organizerName,
      startDate,
      endDate,
      prizeMoney,
      rulesSummary
    });
    setShowEditInfoModal(false);
  };

  const handleAddNoticeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noticeTitle.trim()) return;

    const newNotice: NoticeItem = {
      id: `notice-${Date.now()}`,
      title: noticeTitle,
      content: noticeContent,
      date: new Date().toLocaleDateString('bn-BD', { day: 'numeric', month: 'short', year: 'numeric' }),
      category: noticeCategory,
      isImportant: noticeIsImportant,
      author: info.organizerName || 'টুর্নামেন্ট কমিটি'
    };

    onUpdateInfo({
      ...info,
      notices: [newNotice, ...info.notices]
    });

    setNoticeTitle('');
    setNoticeContent('');
    setNoticeCategory('LEAGUE');
    setNoticeIsImportant(false);
    setShowAddNoticeModal(false);
  };

  const handleDeleteNotice = (noticeId: string) => {
    if (confirm('আপনি কি এই নোটিশটি মুছে ফেলতে চান?')) {
      onUpdateInfo({
        ...info,
        notices: info.notices.filter(n => n.id !== noticeId)
      });
    }
  };

  const handleAddPhotoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGalleryPhoto) return;

    onUpdateInfo({
      ...info,
      galleryPhotos: [newGalleryPhoto, ...(info.galleryPhotos || [])]
    });

    setNewGalleryPhoto('');
    setShowAddPhotoModal(false);
  };

  const handleDeletePhoto = (photoUrl: string) => {
    if (confirm('এই ছবিটি গ্যালারি থেকে মুছে ফেলতে চান?')) {
      onUpdateInfo({
        ...info,
        galleryPhotos: (info.galleryPhotos || []).filter(p => p !== photoUrl)
      });
    }
  };

  // Filter notices
  const filteredNotices = (info.notices || []).filter(n => {
    if (noticeFilter === 'IMPORTANT' && !n.isImportant) return false;
    if (noticeFilter === 'LEAGUE' && n.category !== 'LEAGUE') return false;
    if (noticeFilter === 'MATCH_CHANGE' && n.category !== 'MATCH_CHANGE') return false;
    if (noticeFilter === 'NEWS' && n.category !== 'NEWS') return false;

    if (noticeSearch.trim()) {
      const q = noticeSearch.toLowerCase();
      return n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q);
    }
    return true;
  });

  const getCategoryBadge = (category?: NoticeCategory) => {
    switch (category) {
      case 'ADMIN_EMERGENCY':
        return (
          <span className="px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-400 border border-rose-500/30 text-[10px] font-black uppercase">
            🚨 জরুরি নোটিশ
          </span>
        );
      case 'MATCH_CHANGE':
        return (
          <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[10px] font-black uppercase">
            🔄 সময়সূচি পরিবর্তন
          </span>
        );
      case 'NEWS':
        return (
          <span className="px-2 py-0.5 rounded-md bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-[10px] font-black uppercase">
            📰 সংবাদ ও আপডেট
          </span>
        );
      case 'LEAGUE':
      default:
        return (
          <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-black uppercase">
            📢 লীগ ঘোষণা
          </span>
        );
    }
  };

  return (
    <div className="space-y-8 pb-16">
      {/* 1. HERO BANNER & TOURNAMENT TITLE CARD */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900/95 to-slate-950 border border-slate-800 shadow-2xl">
        {info.bannerPhotoUrl ? (
          <div className="h-52 sm:h-72 w-full relative">
            <img 
              src={info.bannerPhotoUrl} 
              alt={info.name} 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />
          </div>
        ) : (
          <div className="h-32 sm:h-44 w-full bg-gradient-to-r from-emerald-950/60 via-slate-900 to-indigo-950/60 relative flex items-center justify-center">
            <div className="text-center">
              <span className="text-4xl sm:text-6xl opacity-30">⚽🏆</span>
            </div>
          </div>
        )}

        <div className="p-6 sm:p-8 -mt-12 sm:-mt-16 relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-2 max-w-3xl">
              <div className="flex flex-wrap items-center gap-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-bold shadow-inner">
                  <Trophy className="w-3.5 h-3.5" />
                  <span>{info.edition || '৮ম বর্ষ'} • {info.category || 'এলাকাভিত্তিক নাইট ফুটবল টুর্নামেন্ট'}</span>
                </div>
                <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-bold">
                  <span>⚡ Powered by {info.poweredBy || 'Sky Star Boys Club (Noyagaon)'}</span>
                </div>
              </div>
              <h1 className="text-2xl sm:text-4xl font-black text-white font-display tracking-tight">
                {info.name}
              </h1>
              <p className="text-sm sm:text-base text-slate-300 font-medium">
                {info.tagline}
              </p>

              {/* Co-sponsors highlight */}
              {info.coSponsors && info.coSponsors.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <span className="text-xs text-slate-400 font-semibold">কো-স্পন্সর:</span>
                  {info.coSponsors.map((s, idx) => (
                    <span key={idx} className="text-xs font-bold text-amber-300 bg-amber-950/40 border border-amber-500/30 px-2.5 py-0.5 rounded-lg">
                      ⭐ {s}
                    </span>
                  ))}
                </div>
              )}
              <div className="flex flex-wrap items-center gap-3 pt-2 text-xs text-slate-400">
                <span className="flex items-center gap-1.5 bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700/80">
                  <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                  {info.venueName}, {info.venueLocation}
                </span>
                <span className="flex items-center gap-1.5 bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700/80">
                  <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                  {info.startDate} - {info.endDate}
                </span>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 flex-shrink-0">
              {info.facebookPageUrl && (
                <a
                  href={info.facebookPageUrl.startsWith('http') ? info.facebookPageUrl : `https://${info.facebookPageUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#1877F2] hover:bg-[#166fe5] text-white font-bold text-xs shadow-lg shadow-blue-950 transition-all cursor-pointer"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  <span>ফেসবুক পেজ ফলো করুন</span>
                  <ExternalLink className="w-3.5 h-3.5 opacity-80" />
                </a>
              )}

              {isAdmin && (
                <button
                  onClick={handleOpenEditInfo}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-emerald-400 font-bold text-xs border border-slate-700 shadow-md transition-all cursor-pointer"
                >
                  <Edit3 className="w-4 h-4" />
                  <span>তথ্য ও ছবি এডিট করুন</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 2. FACEBOOK PAGE & SOCIAL INTEGRATION CARD 🌐 */}
      <div className="bg-gradient-to-r from-blue-950/30 via-slate-900 to-indigo-950/30 rounded-3xl border border-blue-900/40 p-6 sm:p-8 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#1877F2] text-white flex items-center justify-center shadow-xl shadow-blue-950 flex-shrink-0">
            <svg className="w-8 h-8 fill-current" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-black text-white font-display flex items-center gap-2">
              <span>অফিসিয়াল ফেসবুক পেজ ও ফ্যান কমিউনিটি</span>
            </h3>
            <p className="text-xs text-slate-300 mt-1 max-w-xl">
              টুর্নামেন্টের সরাসরি লাইভ ভিডিও সম্প্রচার, ম্যাচ ফটোশুট, ম্যান অব দ্য ম্যাচ ইন্টারভিউ ও আকর্ষণীয় আপডেট পেতে আমাদের ফেসবুক পেজের সাথে যুক্ত থাকুন।
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          {info.facebookPageUrl ? (
            <a
              href={info.facebookPageUrl.startsWith('http') ? info.facebookPageUrl : `https://${info.facebookPageUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full md:w-auto text-center px-6 py-3 rounded-2xl bg-[#1877F2] hover:bg-[#166fe5] text-white font-extrabold text-sm shadow-xl shadow-blue-950 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <span>Visit Official Facebook Page</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          ) : (
            <button
              onClick={handleOpenEditInfo}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold border border-slate-700"
            >
              ➕ ফেসবুক পেজ লিঙ্ক যুক্ত করুন
            </button>
          )}
        </div>
      </div>

      {/* 3. GRID: PRIZE MONEY & RULES + NOTICE BOARD 📢 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: NOTICE BOARD WITH CATEGORIES & SEARCH */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center justify-center">
                <Bell className="w-4 h-4" />
              </div>
              <h2 className="text-lg font-black text-white font-display">
                টুর্নামেন্ট নোটিশ ও ঘোষণা (Notice Board)
              </h2>
            </div>

            {isAdmin && (
              <button
                onClick={() => setShowAddNoticeModal(true)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-950 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>নতুন নোটিশ দিন</span>
              </button>
            )}
          </div>

          {/* Filter Pills & Search */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 bg-slate-900/80 p-2 rounded-2xl border border-slate-800">
            <div className="flex items-center gap-1 overflow-x-auto scrollbar-none">
              <button
                onClick={() => setNoticeFilter('ALL')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  noticeFilter === 'ALL' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                সব ({info.notices?.length || 0})
              </button>
              <button
                onClick={() => setNoticeFilter('IMPORTANT')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  noticeFilter === 'IMPORTANT' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                জরুরি নোটিশ
              </button>
              <button
                onClick={() => setNoticeFilter('LEAGUE')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  noticeFilter === 'LEAGUE' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                লীগ ঘোষণা
              </button>
              <button
                onClick={() => setNoticeFilter('MATCH_CHANGE')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  noticeFilter === 'MATCH_CHANGE' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                সময়সূচি পরিবর্তন
              </button>
            </div>

            <div className="relative sm:w-48">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="নোটিশ খুঁজুন..."
                value={noticeSearch}
                onChange={(e) => setNoticeSearch(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {filteredNotices.length > 0 ? (
            <div className="space-y-3">
              {filteredNotices.map((notice) => (
                <div
                  key={notice.id}
                  className={`rounded-2xl border p-5 transition-all ${
                    notice.isImportant
                      ? 'bg-gradient-to-r from-amber-950/30 via-slate-900 to-slate-900 border-amber-500/40 shadow-lg'
                      : 'bg-slate-900/80 border-slate-800'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-2 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        {getCategoryBadge(notice.category)}
                        {notice.isImportant && (
                          <span className="px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-400 border border-rose-500/30 text-[10px] font-black uppercase">
                            ⭐ গুরুত্বপূর্ণ
                          </span>
                        )}
                        <h3 className="text-sm font-bold text-white font-display">
                          {notice.title}
                        </h3>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">
                        {notice.content}
                      </p>
                      <div className="flex items-center gap-3 text-[11px] text-slate-400 pt-2 border-t border-slate-800/80">
                        <span>📅 {notice.date}</span>
                        <span>•</span>
                        <span>✍️ {notice.author || 'টুর্নামেন্ট কমিটি'}</span>
                      </div>
                    </div>

                    {isAdmin && (
                      <button
                        onClick={() => handleDeleteNotice(notice.id)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-950/30 transition-colors cursor-pointer"
                        title="নোটিশ মুছুন"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-8 text-center text-slate-400 text-xs">
              কোনো নোটিশ পাওয়া যায়নি।
            </div>
          )}
        </div>

        {/* Right 1 Col: PRIZE MONEY & KEY DETAILS 🏆 */}
        <div className="space-y-6">
          {/* Prize Money Card */}
          <div className="bg-gradient-to-br from-amber-950/40 via-slate-900 to-slate-950 border border-amber-500/30 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/40">
                <Trophy className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-white font-display">
                  পুরস্কার ও প্রাইজমানি (Prizes)
                </h3>
                <span className="text-xs text-amber-400/90 font-medium">আকর্ষণীয় ট্রফি ও সম্মাননা</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/80 border border-amber-500/20 text-xs text-amber-200/90 leading-relaxed whitespace-pre-line font-medium">
              {info.prizeMoney || 'চ্যাম্পিয়ন ট্রফি, মেডেল ও প্রাইজমানি'}
            </div>
          </div>

          {/* Organizer & Helpline Card */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/40">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-white font-display">
                  আয়োজক ও যোগাযোগ
                </h3>
                <span className="text-xs text-slate-400 font-medium">Organizing Committee</span>
              </div>
            </div>

            <div className="space-y-2.5 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <span className="text-slate-400">কমিটি:</span>
                <strong className="text-white">{info.organizerName}</strong>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-slate-400">হেল্পলাইন:</span>
                <strong className="text-emerald-400 font-mono">{info.contactNumber}</strong>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                <span className="text-slate-400">ভেন্যু:</span>
                <strong className="text-slate-200">{info.venueName}</strong>
              </div>
            </div>
          </div>

          {/* Tournament Rules Card */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-3">
            <div className="flex items-center gap-2.5">
              <BookOpen className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-extrabold text-white font-display">
                টুর্নামেন্ট নিয়মাবলী (Rules)
              </h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line bg-slate-950/60 p-3.5 rounded-xl border border-slate-800 font-mono">
              {info.rulesSummary || 'সকল আন্তর্জাতিক ও স্থানীয় ফুটবল রুলস কার্যকর থাকবে।'}
            </p>
          </div>
        </div>
      </div>

      {/* 4. PHOTO GALLERY SECTION 📸 */}
      <div className="space-y-4 pt-4 border-t border-slate-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/30 flex items-center justify-center">
              <ImageIcon className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white font-display">
                টুর্নামেন্ট মিডিয়া ও ছবির গ্যালারি (Media Gallery)
              </h2>
              <p className="text-xs text-slate-400">মাঠের উত্তেজনা, ট্রফি ও প্লেয়ারদের বিশেষ মুহূর্তসমূহ</p>
            </div>
          </div>

          {isAdmin && (
            <button
              onClick={() => setShowAddPhotoModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-950 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>ছবি যোগ করুন</span>
            </button>
          )}
        </div>

        {info.galleryPhotos && info.galleryPhotos.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {info.galleryPhotos.map((photo, index) => (
              <div 
                key={index}
                className="group relative aspect-video sm:aspect-square rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 shadow-md cursor-pointer hover:border-emerald-500/50 transition-all"
                onClick={() => setSelectedPhoto(photo)}
              >
                <img 
                  src={photo} 
                  alt={`Tournament photo ${index + 1}`} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <span className="text-white text-xs font-bold bg-black/60 px-2.5 py-1 rounded-lg">
                    🔍 বড় করে দেখুন
                  </span>
                  {isAdmin && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeletePhoto(photo);
                      }}
                      className="p-1.5 rounded-lg bg-rose-600 text-white hover:bg-rose-500 transition-colors"
                      title="মুছুন"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-8 text-center">
            <ImageIcon className="w-10 h-10 text-slate-600 mx-auto mb-2 opacity-50" />
            <p className="text-xs text-slate-400">এখনো কোনো ছবি যুক্ত করা হয়নি।</p>
          </div>
        )}
      </div>

      {/* Lightbox for Selected Photo */}
      {selectedPhoto && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"
          onClick={() => setSelectedPhoto(null)}
        >
          <div className="max-w-4xl max-h-[85vh] relative" onClick={(e) => e.stopPropagation()}>
            <img 
              src={selectedPhoto} 
              alt="Full view" 
              className="max-w-full max-h-[80vh] rounded-2xl object-contain border border-slate-700 shadow-2xl" 
            />
            <button
              onClick={() => setSelectedPhoto(null)}
              className="absolute -top-10 right-0 text-white bg-slate-800 hover:bg-slate-700 px-3 py-1 rounded-xl text-xs font-bold cursor-pointer"
            >
              বন্ধ করুন (Close ✕)
            </button>
          </div>
        </div>
      )}

      {/* MODAL 1: EDIT TOURNAMENT INFO ✏️ */}
      {showEditInfoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-xl w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-black text-white font-display mb-4 flex items-center gap-2">
              <span>🏆</span>
              <span>টুর্নামেন্ট তথ্য, ব্যানার ও ফেসবুক পেজ এডিট</span>
            </h3>

            <form onSubmit={handleSaveInfoSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">টুর্নামেন্টের নাম *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">ট্যাগলাইন / স্লোগান</label>
                <input
                  type="text"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white"
                />
              </div>

              {/* Tournament Banner Upload */}
              <div>
                <ImageUploadBox
                  label="🖼️ টুর্নামেন্ট ব্যানার / পোস্টার ছবি"
                  sublabel="ডিভাইস থেকে টুর্নামেন্টের ব্যানার বা কভার ছবি সিলেক্ট করুন"
                  value={bannerPhotoUrl}
                  onChange={setBannerPhotoUrl}
                  aspectRatio="square"
                  fallbackText="ব্যানার"
                />
              </div>

              {/* Facebook Page URL */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">🌐 অফিসিয়াল ফেসবুক পেজ লিঙ্ক (URL)</label>
                <input
                  type="url"
                  placeholder="https://facebook.com/yourpage"
                  value={facebookPageUrl}
                  onChange={(e) => setFacebookPageUrl(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">ভেন্যুর নাম</label>
                  <input
                    type="text"
                    value={venueName}
                    onChange={(e) => setVenueName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">ভেন্যুর ঠিকানা/শহর</label>
                  <input
                    type="text"
                    value={venueLocation}
                    onChange={(e) => setVenueLocation(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">আয়োজক কমিটি</label>
                  <input
                    type="text"
                    value={organizerName}
                    onChange={(e) => setOrganizerName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">হেল্পলাইন নম্বর</label>
                  <input
                    type="text"
                    value={contactNumber}
                    onChange={(e) => setContactNumber(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">প্রাইজমানি বিবরণী</label>
                <textarea
                  rows={2}
                  value={prizeMoney}
                  onChange={(e) => setPrizeMoney(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">নিয়মাবলী সংক্ষেপ</label>
                <textarea
                  rows={3}
                  value={rulesSummary}
                  onChange={(e) => setRulesSummary(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEditInfoModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-950"
                >
                  সংরক্ষণ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: ADD NEW NOTICE 📢 */}
      {showAddNoticeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-lg w-full p-6 shadow-2xl">
            <h3 className="text-lg font-black text-white font-display mb-4 flex items-center gap-2">
              <Bell className="w-5 h-5 text-amber-400" />
              <span>নতুন নোটিশ প্রকাশ করুন</span>
            </h3>

            <form onSubmit={handleAddNoticeSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">নোটিশ ক্যাটাগরি</label>
                <select
                  value={noticeCategory}
                  onChange={(e) => setNoticeCategory(e.target.value as NoticeCategory)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white"
                >
                  <option value="LEAGUE">📢 লীগ ঘোষণা (League Announcement)</option>
                  <option value="ADMIN_EMERGENCY">🚨 জরুরি নোটিশ (Emergency Notice)</option>
                  <option value="MATCH_CHANGE">🔄 সময়সূচি পরিবর্তন (Schedule Change)</option>
                  <option value="NEWS">📰 টুর্নামেন্ট সংবাদ ও মিডিয়া (News)</option>
                  <option value="GENERAL">📌 সাধারণ তথ্য (General)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">নোটিশের শিরোনাম *</label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: আজকের ফ্লাডলাইট ম্যাচের সময়সূচি..."
                  value={noticeTitle}
                  onChange={(e) => setNoticeTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">বিস্তারিত বিবরণ *</label>
                <textarea
                  required
                  rows={4}
                  placeholder="নোটিশের সম্পূর্ণ বিবরণ এখানে লিখুন..."
                  value={noticeContent}
                  onChange={(e) => setNoticeContent(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="importantNotice"
                  checked={noticeIsImportant}
                  onChange={(e) => setNoticeIsImportant(e.target.checked)}
                  className="rounded border-slate-800 text-rose-600 focus:ring-rose-500"
                />
                <label htmlFor="importantNotice" className="text-xs text-slate-300 font-semibold cursor-pointer">
                  🚨 জরুরি ঘোষণা হিসেবে হাইলাইট করুন
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddNoticeModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-950"
                >
                  প্রকাশ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: ADD GALLERY PHOTO 📸 */}
      {showAddPhotoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-lg font-black text-white font-display mb-4 flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-emerald-400" />
              <span>গ্যালারিতে নতুন ছবি যোগ করুন</span>
            </h3>

            <form onSubmit={handleAddPhotoSubmit} className="space-y-4">
              <ImageUploadBox
                label="📷 ছবি আপলোড করুন"
                sublabel="ডিভাইস থেকে টুর্নামেন্টের ছবি বা মোমেন্ট সিলেক্ট করুন"
                value={newGalleryPhoto}
                onChange={setNewGalleryPhoto}
                aspectRatio="video"
                fallbackText="ফটো"
              />

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddPhotoModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={!newGalleryPhoto}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold shadow-lg shadow-emerald-950"
                >
                  গ্যালারিতে যুক্ত করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
