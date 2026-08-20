import { Team, Player, Match, MatchEvent, TournamentInfo, GalleryMediaItem } from './types';

export const INITIAL_TOURNAMENT_INFO: TournamentInfo = {
  name: 'NPL Night Football Premier League 2026–2027',
  edition: '৮ম বর্ষ',
  category: 'এলাকাভিত্তিক নাইট ফুটবল প্রিমিয়ার লীগ',
  tagline: 'নয়াগাঁও নাইট ফুটবলের সবচেয়ে বড় ও মর্যাদাপূর্ণ ফুটবল উৎসব',
  poweredBy: 'Sky Star Boys Club (Noyagaon)',
  coSponsors: [
    'Brand RMT',
    'শাকিল এন্ড ব্রাদার্স',
    'শরীফ এন্ড ব্রাদার্স'
  ],
  bannerPhotoUrl: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=1200&auto=format&fit=crop&q=80',
  clubLogoUrl: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=300&auto=format&fit=crop&q=80',
  facebookPageUrl: 'https://facebook.com/npl.football.league',
  facebookGroupName: 'NPL Night Football Premier League Fans Community',
  venueName: 'নয়াগাঁও নাইট স্পোর্টস এরিনা গ্রাউন্ড',
  venueLocation: 'নয়াগাঁও মেইন রোড, ফ্লাডলাইট স্টেডিয়াম, ঢাকা',
  contactNumber: '+880 1711-234567, +880 1912-345678',
  organizerName: 'স্কাই স্টার বয়েজ ক্লাব পরিচালনা পর্ষদ ও এনপিএল কমিটি',
  startDate: 'ফেব্রুয়ারি ২০২৬',
  endDate: 'মার্চ ২০২৭',
  prizeMoney: '🏆 চ্যাম্পিয়ন: ৫০,০০০/- ও গ্র্যান্ড ট্রফি | 🥈 রানার্স-আপ: ২৫,০০০/- ও ট্রফি | 🥇 গোল্ডেন বুট ও বল ট্রফি',
  rulesSummary: '১. ম্যাচ হবে ৫০ মিনিট (২৫+২৫) এবং অতিরিক্ত ৫ মিনিট ইনজুরি টাইম।\n২. প্রতিটি দলের সর্বোচ্চ ১১ জন স্কোয়াড ও ৬ জন মূল খেলোয়াড় মাঠে থাকবেন।\n৩. রেফারির সিদ্ধান্ত চূড়ান্ত বলে গণ্য হবে এবং ফ্লাডলাইটে নাইট ম্যাচ অনুষ্ঠিত হবে।\n৪. প্রতিটি ম্যাচে ম্যান অব দ্য ম্যাচ (Player of the Match) পুরস্কার প্রদান করা হবে।',
  notices: [
    {
      id: 'notice-1',
      title: '🚨 জরুরি নোটিশ: আজকের নাইট ম্যাচের সময়সূচি',
      content: 'আজকের ফ্লাডলাইট ম্যাচ রাত ৮:০০ টায় যথাসময়ে অনুষ্ঠিত হবে। সকল টিম ম্যানেজমেন্টকে ম্যাচ শুরুর ৩০ মিনিট পূর্বে মাঠে উপস্থিত হওয়ার নির্দেশ দেওয়া হচ্ছে।',
      date: 'আজ, সন্ধ্যা ৬:০০',
      category: 'ADMIN_EMERGENCY',
      isImportant: true,
      author: 'এনপিএল ম্যানেজমেন্ট কমিটি'
    },
    {
      id: 'notice-2',
      title: '🏆 NPL ২০২৬-২৭ ৮ম বর্ষের জমকালো উদ্বোধন',
      content: 'স্কাই স্টার বয়েজ ক্লাবের আয়োজনে এবং Brand RMT, শাকিল এন্ড ব্রাদার্স ও শরীফ এন্ড ব্রাদার্সের পৃষ্ঠপোষকতায় শুরু হয়েছে ঐতিহ্যবাহী এলাকাভিত্তিক নাইট ফুটবল লীগ।',
      date: 'গতকাল',
      category: 'LEAGUE',
      isImportant: true,
      author: 'Sky Star Boys Club'
    },
    {
      id: 'notice-3',
      title: '📄 এক ক্লিকে ম্যাচের PDF Summary ডাউনলোড চালু',
      content: 'এখন থেকে প্রতিটি ম্যাচ শেষ হওয়ার সাথে সাথে অফিসিয়াল স্কোরশিট, গোল, কার্ড, অ্যাসিস্ট ও সম্পূর্ণ স্ট্যাটস সম্বলিত Match Summary PDF ডাউনলোড করা যাবে।',
      date: '২ দিন আগে',
      category: 'NEWS',
      isImportant: false,
      author: 'আইটি ও মিডিয়া উইং'
    }
  ],
  galleryPhotos: [
    'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&auto=format&fit=crop&q=80'
  ],
  mediaGallery: [
    {
      id: 'media-1',
      title: 'উদ্বোধনী নাইট ম্যাচের রোমাঞ্চকর মুহূর্ত',
      url: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&auto=format&fit=crop&q=80',
      category: 'MATCH',
      description: 'স্কাই স্টার বয়েজ ক্লাব বনাম আরএমটি স্ট্রাইকার্স ম্যাচের টানটান উত্তেজনাপূর্ণ আক্রমণ।',
      date: 'ম্যাচডে ১'
    },
    {
      id: 'media-2',
      title: 'স্কাই স্টার বয়েজ ক্লাব অফিশিয়াল টিম ফটো',
      url: 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=800&auto=format&fit=crop&q=80',
      category: 'TEAM',
      description: 'আয়োজক দল স্কাই স্টার বয়েজ ক্লাব (নয়াগাঁও) স্কোয়াড ২০২৬।',
      date: 'টিম লঞ্চ'
    },
    {
      id: 'media-3',
      title: '৭ম বর্ষের ডিফেন্ডিং চ্যাম্পিয়ন ট্রফি সেলিব্রেশন',
      url: 'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=800&auto=format&fit=crop&q=80',
      category: 'CHAMPION',
      description: 'গত আসরের গ্র্যান্ড ফিনালেতে ট্রফি জয়ের অনাবিল আনন্দ।',
      date: 'চ্যাম্পিয়ন হিস্ট্রি'
    },
    {
      id: 'media-4',
      title: 'শাকিল এন্ড ব্রাদার্স বনাম শরীফ এন্ড ব্রাদার্স ম্যাচ ফটো',
      url: 'https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=800&auto=format&fit=crop&q=80',
      category: 'MATCH',
      description: 'ডিফেন্স ও গোলকিপারের চমৎকার সেভের মুহূর্ত।',
      date: 'ম্যাচডে ২'
    }
  ]
};

// 👥 6 Official Area-Based Teams for NPL 2026-2027
export const INITIAL_TEAMS: Team[] = [
  {
    id: 'team-sky-star',
    name: 'Sky Star Boys Club (Noyagaon)',
    shortName: 'SSBC',
    logoUrl: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=200&auto=format&fit=crop&q=80',
    primaryColorHex: '#10B981', // Emerald Green
    totalBudget: 150.0,
    city: 'Noyagaon, Dhaka',
    coach: 'কবির হোসেন (Kabir Hossain)'
  },
  {
    id: 'team-rmt',
    name: 'Brand RMT Strikers',
    shortName: 'RMT',
    logoUrl: 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=200&auto=format&fit=crop&q=80',
    primaryColorHex: '#EF4444', // Red
    totalBudget: 140.0,
    city: 'Noyagaon Sector 2',
    coach: 'তারিকুল ইসলাম (Tariqul Islam)'
  },
  {
    id: 'team-shakil',
    name: 'Shakil & Brothers FC',
    shortName: 'SBFC',
    logoUrl: 'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=200&auto=format&fit=crop&q=80',
    primaryColorHex: '#3B82F6', // Blue
    totalBudget: 135.0,
    city: 'Noyagaon Bazar',
    coach: 'শাখাওয়াত শাকিল (Shakhawat Shakil)'
  },
  {
    id: 'team-sharif',
    name: 'Sharif & Brothers United',
    shortName: 'SBU',
    logoUrl: 'https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=200&auto=format&fit=crop&q=80',
    primaryColorHex: '#F59E0B', // Amber
    totalBudget: 130.0,
    city: 'Noyagaon East',
    coach: 'শরীফ চৌধুরী (Sharif Chowdhury)'
  },
  {
    id: 'team-super-kings',
    name: 'Noyagaon Super Kings',
    shortName: 'NSK',
    logoUrl: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=200&auto=format&fit=crop&q=80',
    primaryColorHex: '#8B5CF6', // Purple
    totalBudget: 125.0,
    city: 'Noyagaon South',
    coach: 'মাসুদ রানা (Masud Rana)'
  },
  {
    id: 'team-young-star',
    name: 'Young Star Football Club',
    shortName: 'YSFC',
    logoUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&auto=format&fit=crop&q=80',
    primaryColorHex: '#06B6D4', // Cyan
    totalBudget: 120.0,
    city: 'Noyagaon North',
    coach: 'আরিফুল হক (Ariful Haque)'
  }
];

// 👤 Squad Players for NPL 2026-2027
export const INITIAL_PLAYERS: Player[] = [
  // Sky Star Boys Club
  {
    id: 'p-ssbc-1',
    teamId: 'team-sky-star',
    name: 'তানভীর আহমেদ (Tanvir Ahmed)',
    jerseyNumber: 10,
    position: 'FORWARD',
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    purchasePrice: 48.0,
    nationality: 'Bangladesh (Local Star)',
    goals: 4,
    assists: 2,
    yellowCards: 0,
    redCards: 0,
    fouls: 2,
    saves: 0,
    matchesPlayed: 2,
    isCaptain: true,
    isIconPlayer: true,
    potmAwards: 1
  },
  {
    id: 'p-ssbc-2',
    teamId: 'team-sky-star',
    name: 'সোহাগ রানা (Sohag Rana)',
    jerseyNumber: 7,
    position: 'MIDFIELDER',
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
    purchasePrice: 35.0,
    nationality: 'Bangladesh',
    goals: 1,
    assists: 3,
    yellowCards: 1,
    redCards: 0,
    fouls: 4,
    saves: 0,
    matchesPlayed: 2,
    potmAwards: 0
  },
  {
    id: 'p-ssbc-3',
    teamId: 'team-sky-star',
    name: 'আশরাফুল ইসলাম (Ashraful)',
    jerseyNumber: 1,
    position: 'GOALKEEPER',
    photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
    purchasePrice: 28.0,
    nationality: 'Bangladesh',
    goals: 0,
    assists: 0,
    yellowCards: 0,
    redCards: 0,
    fouls: 1,
    saves: 8,
    matchesPlayed: 2,
    potmAwards: 0
  },

  // Brand RMT Strikers
  {
    id: 'p-rmt-1',
    teamId: 'team-rmt',
    name: 'মেহেদী হাসান (Mehedi Hasan)',
    jerseyNumber: 9,
    position: 'FORWARD',
    photoUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&auto=format&fit=crop&q=80',
    purchasePrice: 45.0,
    nationality: 'Bangladesh',
    goals: 3,
    assists: 1,
    yellowCards: 1,
    redCards: 0,
    fouls: 3,
    saves: 0,
    matchesPlayed: 2,
    isCaptain: true,
    isIconPlayer: true,
    potmAwards: 1
  },
  {
    id: 'p-rmt-2',
    teamId: 'team-rmt',
    name: 'রাশেদুল আলম (Rashedul Alam)',
    jerseyNumber: 8,
    position: 'MIDFIELDER',
    photoUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=200&auto=format&fit=crop&q=80',
    purchasePrice: 32.0,
    nationality: 'Bangladesh',
    goals: 1,
    assists: 2,
    yellowCards: 0,
    redCards: 0,
    fouls: 2,
    saves: 0,
    matchesPlayed: 2
  },

  // Shakil & Brothers FC
  {
    id: 'p-shakil-1',
    teamId: 'team-shakil',
    name: 'শাকিল আহমেদ (Shakil Ahmed)',
    jerseyNumber: 11,
    position: 'FORWARD',
    photoUrl: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=200&auto=format&fit=crop&q=80',
    purchasePrice: 42.0,
    nationality: 'Bangladesh',
    goals: 2,
    assists: 1,
    yellowCards: 0,
    redCards: 0,
    fouls: 2,
    saves: 0,
    matchesPlayed: 2,
    isCaptain: true,
    isIconPlayer: true
  },
  {
    id: 'p-shakil-2',
    teamId: 'team-shakil',
    name: 'নাজমুল হুদা (Nazmul Huda)',
    jerseyNumber: 4,
    position: 'DEFENDER',
    photoUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&auto=format&fit=crop&q=80',
    purchasePrice: 30.0,
    nationality: 'Bangladesh',
    goals: 0,
    assists: 1,
    yellowCards: 1,
    redCards: 0,
    fouls: 5,
    saves: 0,
    matchesPlayed: 2
  },

  // Sharif & Brothers United
  {
    id: 'p-sharif-1',
    teamId: 'team-sharif',
    name: 'শরীফুল ইসলাম (Shariful Islam)',
    jerseyNumber: 10,
    position: 'MIDFIELDER',
    photoUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&auto=format&fit=crop&q=80',
    purchasePrice: 38.0,
    nationality: 'Bangladesh',
    goals: 2,
    assists: 2,
    yellowCards: 0,
    redCards: 0,
    fouls: 3,
    saves: 0,
    matchesPlayed: 2,
    isCaptain: true,
    isIconPlayer: true
  },

  // Noyagaon Super Kings
  {
    id: 'p-nsk-1',
    teamId: 'team-super-kings',
    name: 'ফয়সাল মাহমুদ (Faisal Mahmud)',
    jerseyNumber: 7,
    position: 'FORWARD',
    photoUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&auto=format&fit=crop&q=80',
    purchasePrice: 36.0,
    nationality: 'Bangladesh',
    goals: 1,
    assists: 1,
    yellowCards: 2,
    redCards: 0,
    fouls: 4,
    saves: 0,
    matchesPlayed: 2,
    isCaptain: true
  },

  // Young Star FC
  {
    id: 'p-ysfc-1',
    teamId: 'team-young-star',
    name: 'ইমরান খান (Imran Khan)',
    jerseyNumber: 9,
    position: 'FORWARD',
    photoUrl: 'https://images.unsplash.com/photo-1463453091185-61582044d556?w=200&auto=format&fit=crop&q=80',
    purchasePrice: 34.0,
    nationality: 'Bangladesh',
    goals: 2,
    assists: 0,
    yellowCards: 0,
    redCards: 0,
    fouls: 1,
    saves: 0,
    matchesPlayed: 2,
    isCaptain: true
  }
];

export const INITIAL_EVENTS: MatchEvent[] = [
  {
    id: 'ev-1',
    matchId: 'match-live-1',
    type: 'GOAL',
    minute: 14,
    teamId: 'team-sky-star',
    playerId: 'p-ssbc-1',
    playerName: 'তানভীর আহমেদ',
    assistPlayerId: 'p-ssbc-2',
    assistPlayerName: 'সোহাগ রানা',
    note: 'চমৎকার হেডার থেকে প্রথম গোল!',
    timestamp: Date.now() - 1500000
  },
  {
    id: 'ev-2',
    matchId: 'match-live-1',
    type: 'GOAL',
    minute: 28,
    teamId: 'team-rmt',
    playerId: 'p-rmt-1',
    playerName: 'মেহেদী হাসান',
    assistPlayerId: 'p-rmt-2',
    assistPlayerName: 'রাশেদুল আলম',
    note: 'বক্সের বাইরে থেকে বুলেট শট!',
    timestamp: Date.now() - 900000
  },
  {
    id: 'ev-3',
    matchId: 'match-live-1',
    type: 'YELLOW_CARD',
    minute: 34,
    teamId: 'team-sky-star',
    playerId: 'p-ssbc-2',
    playerName: 'সোহাগ রানা',
    note: 'ট্যাকলের কারণে হলুদ কার্ড',
    timestamp: Date.now() - 400000
  }
];

export const INITIAL_MATCHES: Match[] = [
  {
    id: 'match-live-1',
    homeTeamId: 'team-sky-star',
    awayTeamId: 'team-rmt',
    homeScore: 1,
    awayScore: 1,
    status: 'LIVE_2ND_HALF',
    currentMinute: 38,
    addedMinutes: 2,
    isClockRunning: true,
    venue: 'নয়াগাঁও নাইট স্পোর্টস এরিনা গ্রাউন্ড',
    matchDate: 'আজ, রাত ৮:০০',
    round: 'ম্যাচডে ৩ (ফ্লাডলাইট নাইট ম্যাচ)',
    matchStoryNotes: 'নয়াগাঁও ডার্বির টানটান উত্তেজনা! প্রথমার্ধের ১৪ মিনিটে তানভীরের গোলে এগিয়ে যায় স্কাই স্টার, কিন্তু দ্বিতীয়ার্ধে মেহেদীর দূরপাল্লার শটে সমতা ফেরায় Brand RMT।',
    events: INITIAL_EVENTS,
    referee: 'মোহাম্মদ রফিক (প্রধান রেফারি)',
    assistantReferees: 'আলমগীর হোসেন ও হাবিবুর রহমান',
    homeStats: {
      possession: 54,
      shots: 9,
      shotsOnTarget: 5,
      shotsOffTarget: 4,
      corners: 4,
      fouls: 6,
      offsides: 1,
      yellowCards: 1,
      redCards: 0,
      passes: 142,
      saves: 3
    },
    awayStats: {
      possession: 46,
      shots: 7,
      shotsOnTarget: 4,
      shotsOffTarget: 3,
      corners: 3,
      fouls: 8,
      offsides: 2,
      yellowCards: 1,
      redCards: 0,
      passes: 118,
      saves: 4
    },
    potmPlayerId: 'p-ssbc-1',
    potmPlayerName: 'তানভীর আহমেদ',
    potmReason: '১টি দৃষ্টিনন্দন গোল ও অসাধারণ বল ড্রিবলিং'
  },
  {
    id: 'match-up-1',
    homeTeamId: 'team-shakil',
    awayTeamId: 'team-sharif',
    homeScore: 0,
    awayScore: 0,
    status: 'UPCOMING',
    currentMinute: 0,
    addedMinutes: 0,
    isClockRunning: false,
    venue: 'নয়াগাঁও নাইট স্পোর্টস এরিনা গ্রাউন্ড',
    matchDate: 'আজ, রাত ৯:৩০',
    round: 'ম্যাচডে ৩ (ম্যাচ ২)',
    matchStoryNotes: 'স্পন্সর ডার্বি: শাকিল & ব্রাদার্স বনাম শরীফ & ব্রাদার্স ইউনাইটেড।',
    events: [],
    referee: 'জসিম উদ্দিন',
    homeStats: { possession: 50, shots: 0, shotsOnTarget: 0, shotsOffTarget: 0, corners: 0, fouls: 0, offsides: 0, yellowCards: 0, redCards: 0, passes: 0, saves: 0 },
    awayStats: { possession: 50, shots: 0, shotsOnTarget: 0, shotsOffTarget: 0, corners: 0, fouls: 0, offsides: 0, yellowCards: 0, redCards: 0, passes: 0, saves: 0 }
  },
  {
    id: 'match-fin-1',
    homeTeamId: 'team-super-kings',
    awayTeamId: 'team-young-star',
    homeScore: 3,
    awayScore: 2,
    status: 'FINISHED',
    currentMinute: 50,
    addedMinutes: 3,
    isClockRunning: false,
    venue: 'নয়াগাঁও নাইট স্পোর্টস এরিনা গ্রাউন্ড',
    matchDate: 'গতকাল, রাত ৮:০০',
    round: 'ম্যাচডে ২',
    matchStoryNotes: '৫ গোলের রোমাঞ্চকর থ্রিলারে ৩-২ ব্যবধানে জয় তুলে নিয়েছে নয়াগাঁও সুপার কিংস। ম্যান অব দ্য ম্যাচ হয়েছেন ফয়সাল মাহমুদ।',
    events: [
      {
        id: 'ev-fin-1',
        matchId: 'match-fin-1',
        type: 'GOAL',
        minute: 8,
        teamId: 'team-super-kings',
        playerId: 'p-nsk-1',
        playerName: 'ফয়সাল মাহমুদ',
        note: 'দারুণ ফিনিশিং',
        timestamp: Date.now() - 86400000
      },
      {
        id: 'ev-fin-2',
        matchId: 'match-fin-1',
        type: 'GOAL',
        minute: 22,
        teamId: 'team-young-star',
        playerId: 'p-ysfc-1',
        playerName: 'ইমরান খান',
        note: 'পেনাল্টি গোল',
        timestamp: Date.now() - 85000000
      }
    ],
    referee: 'মোহাম্মদ রফিক',
    homeStats: { possession: 52, shots: 11, shotsOnTarget: 6, shotsOffTarget: 5, corners: 5, fouls: 7, offsides: 1, yellowCards: 2, redCards: 0, passes: 160, saves: 4 },
    awayStats: { possession: 48, shots: 9, shotsOnTarget: 5, shotsOffTarget: 4, corners: 4, fouls: 9, offsides: 3, yellowCards: 1, redCards: 0, passes: 145, saves: 3 },
    potmPlayerId: 'p-nsk-1',
    potmPlayerName: 'ফয়সাল মাহমুদ',
    potmReason: 'ম্যাচ উইনিং গোল ও নিরলস পারফরম্যান্স'
  }
];

export const DEMO_TEAMS = INITIAL_TEAMS;
export const DEMO_PLAYERS = INITIAL_PLAYERS;
export const DEMO_MATCHES = INITIAL_MATCHES;
