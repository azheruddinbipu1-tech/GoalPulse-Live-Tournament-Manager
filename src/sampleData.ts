import { Team, Player, Match, MatchEvent, TournamentInfo } from './types';

// Default clean state: 0 teams, 0 players, 0 matches
export const INITIAL_TEAMS: Team[] = [];
export const INITIAL_PLAYERS: Player[] = [];
export const INITIAL_EVENTS: MatchEvent[] = [];
export const INITIAL_MATCHES: Match[] = [];

export const INITIAL_TOURNAMENT_INFO: TournamentInfo = {
  name: 'GoalPulse ফুটবল সুপার লিগ ২০২৬',
  tagline: 'সেরা ফুটবলারদের জমজমাট লড়াই ও টুর্নামেন্ট',
  bannerPhotoUrl: '',
  facebookPageUrl: 'https://facebook.com',
  facebookGroupName: 'GoalPulse Football Fans Community',
  venueName: 'প্রধান স্টেডিয়াম ও স্পোর্টস কমপ্লেক্স',
  venueLocation: 'স্টেডিয়াম রোড, ঢাকা',
  contactNumber: '+880 1700-000000',
  organizerName: 'টুর্নামেন্ট পরিচালনা ও ইভেন্ট কমিটি',
  startDate: '২০২৬',
  endDate: 'চলমান',
  prizeMoney: '🏆 চ্যাম্পিয়ন: ট্রফি ও আকর্ষণীয় প্রাইজমানি | 🥈 রানার্স-আপ: ট্রফি ও মেডেল',
  rulesSummary: '১. ফিফা এবং স্থানীয় টুর্নামেন্ট কমিটির সকল নিয়ম প্রযোজ্য হবে।\n২. প্রতিটি ম্যাচে Player Of The Match ট্রফি প্রদান করা হবে।\n৩. কার্ড ও শাস্তিমূলক ব্যবস্থা রেফারির সিদ্ধান্ত অনুযায়ী চূড়ান্ত বলে গণ্য হবে।',
  notices: [
    {
      id: 'notice-1',
      title: 'টুর্নামেন্ট রেজিস্ট্রেশন ও লাইভ স্কোর আপডেট',
      content: 'সকল দল ও সমর্থকদের দৃষ্টি আকর্ষণ করা যাচ্ছে: টুর্নামেন্টের সকল লাইভ স্কোর, গোল্ডেন বুট ও পয়েন্ট টেবিল এই অ্যাপে নিয়মিত আপডেট করা হবে।',
      date: 'আজ',
      isImportant: true,
      author: 'টুর্নামেন্ট কমিটি'
    }
  ],
  galleryPhotos: []
};

// Optional Demo Data if user wants to restore sample teams
export const DEMO_TEAMS: Team[] = [
  {
    id: 'team-1',
    name: 'Dhaka Kings',
    shortName: 'DHK',
    logoUrl: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=150&auto=format&fit=crop&q=80',
    primaryColorHex: '#E11D48',
    totalBudget: 180.0,
    city: 'Dhaka',
    coach: 'Julian Alva'
  },
  {
    id: 'team-2',
    name: 'Chittagong Mariners',
    shortName: 'CTG',
    logoUrl: 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=150&auto=format&fit=crop&q=80',
    primaryColorHex: '#2563EB',
    totalBudget: 160.0,
    city: 'Chittagong',
    coach: 'Marco Silva'
  }
];

export const DEMO_PLAYERS: Player[] = [
  {
    id: 'p-101',
    teamId: 'team-1',
    name: 'Rakib Hossain',
    jerseyNumber: 10,
    position: 'FORWARD',
    photoUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
    purchasePrice: 42.0,
    nationality: 'Bangladesh',
    goals: 1,
    assists: 0,
    yellowCards: 0,
    redCards: 0,
    fouls: 0,
    saves: 0,
    matchesPlayed: 1
  },
  {
    id: 'p-201',
    teamId: 'team-2',
    name: 'Dorielton Gomez',
    jerseyNumber: 9,
    position: 'FORWARD',
    photoUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80',
    purchasePrice: 45.0,
    nationality: 'Brazil',
    goals: 1,
    assists: 0,
    yellowCards: 0,
    redCards: 0,
    fouls: 0,
    saves: 0,
    matchesPlayed: 1
  }
];

export const DEMO_MATCHES: Match[] = [
  {
    id: 'match-1',
    homeTeamId: 'team-1',
    awayTeamId: 'team-2',
    homeScore: 0,
    awayScore: 0,
    status: 'UPCOMING',
    currentMinute: 0,
    addedMinutes: 0,
    isClockRunning: false,
    venue: 'Bangabandhu National Stadium',
    matchDate: 'Today, 19:30',
    round: 'Matchday 1',
    matchStoryNotes: '',
    events: []
  }
];
