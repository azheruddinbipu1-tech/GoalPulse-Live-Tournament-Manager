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
}

export interface NoticeItem {
  id: string;
  title: string;
  content: string;
  date: string;
  isImportant?: boolean;
  author?: string;
}

export interface TournamentInfo {
  name: string;
  tagline: string;
  bannerPhotoUrl: string;
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
