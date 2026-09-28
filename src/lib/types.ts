export type MatchStatus = "UPCOMING" | "LIVE" | "FINISHED";
export type StatusMode = "auto" | "manual";
export type Position = "GK" | "DF" | "MF" | "FW" | "PL";
export type TeamSide = "home" | "away";

export interface Team {
  name: string;
  shortName: string;
  logo: string | null;
}

export interface MatchData {
  title: string;
  organizer: string;
  home: Team;
  away: Team;
  /** YYYY-MM-DD (توقيت الرياض) */
  date: string;
  /** HH:mm 24h */
  startTime: string;
  /** HH:mm 24h */
  endTime: string;
  venue: string;
  status: MatchStatus;
  statusMode: StatusMode;
  homeScore: number;
  awayScore: number;
  manOfMatchId: string | null;
  updatedAt: number;
}

export interface Player {
  id: string;
  number: number;
  name: string;
  position: Position;
  photo: string | null;
}

export interface Settings {
  predictionsOpen: boolean;
  votingOpen: boolean;
  /** هل تم إغلاق التصويت نهائياً وإعلان رجل المباراة */
  votingClosedAt: number | null;
}

export type FormationSize = 5 | 7 | 8 | 11;

export interface FormationData {
  size: FormationSize;
  shape: string;
  /** index 0 = حارس المرمى. طول المصفوفة = size */
  slots: (string | null)[];
  subs: string[];
}

export interface Prediction {
  name: string;
  phone: string;
  home: number;
  away: number;
  createdAt: number;
}

export interface VoteRecord {
  playerId: string;
  phone: string;
  createdAt: number;
}

export interface WinnerEntry {
  name: string;
  maskedPhone: string;
  home: number;
  away: number;
}

export interface WinnersData {
  announced: boolean;
  homeScore: number;
  awayScore: number;
  exact: WinnerEntry[];
  outcome: WinnerEntry[];
  announcedAt: number | null;
}

export interface PredictionStats {
  total: number;
  homeWinPct: number;
  drawPct: number;
  awayWinPct: number;
  topScores: { home: number; away: number; count: number; pct: number }[];
}

export interface VoteResult {
  playerId: string;
  count: number;
  pct: number;
}

export interface VoteSummary {
  total: number;
  results: VoteResult[];
}

export interface PublicState {
  now: number;
  match: MatchData & { effectiveStatus: MatchStatus; kickoffAt: number; endAt: number };
  players: Player[];
  settings: Settings & { predictionsAccepting: boolean };
  formation: FormationData;
  predictionStats: PredictionStats;
  votes: VoteSummary;
  winners: WinnersData | null;
}
