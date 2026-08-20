export type Position = 'GOALKEEPER' | 'DEFENDER' | 'MIDFIELDER' | 'FORWARD';

export interface Player {
  id: string;
  teamId: string;
  name: string;
  jerseyNumber: number;
  position: Position;
  photoUrl: string;
  purchasePrice: number; // in Millions (৳M or $M)
  nationality: string;
  goals: number;
  assists: number;
  yellowCards: number;
  redCards: number;
  fouls: number;
  saves: number;
  matchesPlayed: number;
  isCaptain?: boolean;
  isIconPlayer?: boolean;
  potmAwards?: number;
}

export interface Team {
  id: string;
  name: string;
  shortName: string;
  logoUrl: string;
  primaryColorHex: string;
  totalBudget: number; // in Millions (৳M)
  city: string;
  coach: string;
  captainPlayerId?: string;
  iconPlayerId?: string;
}

export type MatchStatus = 
  | 'UPCOMING'
  | 'LIVE_1ST_HALF'
  | 'HALF_TIME'
  | 'LIVE_2ND_HALF'
  | 'EXTRA_TIME'
  | 'FINISHED';

export type EventType =
  | 'GOAL'
  | 'PENALTY_GOAL'
  | 'OWN_GOAL'
  | 'ASSIST'
  | 'YELLOW_CARD'
  | 'RED_CARD'
  | 'SECOND_YELLOW_RED'
  | 'FOUL'
  | 'SAVE'
  | 'SUBSTITUTION'
  | 'PENALTY_MISSED';

export interface MatchEvent {
  id: string;
  matchId: string;
  type: EventType;
  minute: number;
  teamId: string;
  playerId: string;
  playerName: string;
  assistPlayerId?: string;
  assistPlayerName?: string;
  subOutPlayerId?: string;
  subOutPlayerName?: string;
  note?: string;
  timestamp: number;
}

export interface MatchStats {
  possession: number; // Percentage (e.g. 55)
  shots: number;
  shotsOnTarget: number;
  shotsOffTarget: number;
  corners: number;
  fouls: number;
  offsides: number;
  yellowCards: number;
  redCards: number;
  passes: number;
  saves: number;
}

export interface Match {
  id: string;
  homeTeamId: string;
  awayTeamId: string;
  homeScore: number;
  awayScore: number;
  status: MatchStatus;
  currentMinute: number;
  addedMinutes: number;
  isClockRunning: boolean;
  venue: string;
  matchDate: string;
  round: string;
  matchStoryNotes: string;
  events: MatchEvent[];
  potmPlayerId?: string;
  potmPlayerName?: string;
  potmReason?: string;
  referee?: string;
  assistantReferees?: string;
  homeStats?: MatchStats;
  awayStats?: MatchStats;
}

export type NoticeCategory = 'LEAGUE' | 'MATCH_CHANGE' | 'ADMIN_EMERGENCY' | 'NEWS' | 'GENERAL';

export interface NoticeItem {
  id: string;
  title: string;
  content: string;
  date: string;
  category?: NoticeCategory;
  isImportant?: boolean;
  author?: string;
}

export interface GalleryMediaItem {
  id: string;
  title: string;
  url: string;
  category: 'MATCH' | 'TEAM' | 'CHAMPION' | 'VIDEO';
  description?: string;
  date?: string;
}

export interface TournamentSponsor {
  name: string;
  type: 'POWERED_BY' | 'CO_SPONSOR' | 'MEDIA_PARTNER';
  logoUrl?: string;
}

export interface TournamentInfo {
  name: string;
  edition: string;
  category: string;
  tagline: string;
  poweredBy: string;
  coSponsors: string[];
  bannerPhotoUrl: string;
  clubLogoUrl: string;
  facebookPageUrl: string;
  facebookGroupName?: string;
  venueName: string;
  venueLocation: string;
  contactNumber: string;
  organizerName: string;
  startDate: string;
  endDate: string;
  prizeMoney: string;
  rulesSummary: string;
  notices: NoticeItem[];
  galleryPhotos: string[];
  mediaGallery?: GalleryMediaItem[];
}

export interface StandingRow {
  teamId: string;
  teamName: string;
  shortName: string;
  logoUrl: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
  form: ('W' | 'D' | 'L')[];
}

