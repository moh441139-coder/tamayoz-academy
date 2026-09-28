import type { FormationData, MatchData, Player, Position, Settings } from "./types";

export const TIMEZONE = "Asia/Riyadh";
export const TZ_OFFSET = "+03:00";

export const KEYS = {
  match: "match:data",
  players: "players:list",
  settings: "settings",
  prediction: (phone: string) => `predictions:${phone}`,
  predictionsIndex: "predictions:index",
  predictionsScores: "predictions:scores",
  vote: (deviceId: string) => `votes:${deviceId}`,
  votePhone: (phone: string) => `votes:phone:${phone}`,
  votesIndex: "votes:index",
  voteResults: "vote:results",
  winners: "winners",
  formation: "formation:data",
  rateLimit: (bucket: string, id: string, window: number) => `ratelimit:${bucket}:${id}:${window}`,
} as const;

export const POSITION_LABELS: Record<Position, { short: string; ar: string }> = {
  GK: { short: "GK", ar: "حارس مرمى" },
  DF: { short: "DF", ar: "مدافع" },
  MF: { short: "MF", ar: "وسط" },
  FW: { short: "FW", ar: "مهاجم" },
  PL: { short: "PL", ar: "لاعب" },
};

const SEED_PLAYERS: [number, string, Position][] = [
  [1, "وافي الخضير", "GK"],
  [2, "المثنى الحربي", "GK"],
  [3, "احمد المشوح", "PL"],
  [4, "عبدالله الخضيري", "PL"],
  [5, "تميم الناصر", "PL"],
  [6, "هيثم الدخيل", "PL"],
  [7, "سامر الحربي", "PL"],
  [8, "عبدالعزيز الهريش", "PL"],
  [9, "خيال الجاسر", "PL"],
  [10, "اسامة المبيريك", "PL"],
  [11, "حكيم الجمعه", "PL"],
  [12, "عبدالله العياف", "PL"],
  [13, "صالح العبيدان", "PL"],
  [14, "عبدالله الحسين", "PL"],
  [15, "عبدالله الحماد", "PL"],
  [16, "غسان الغانم", "PL"],
];

export function defaultPlayers(): Player[] {
  return SEED_PLAYERS.map(([number, name, position]) => ({
    id: `p${number}`,
    number,
    name,
    position,
    photo: null,
  }));
}

export function defaultMatch(): MatchData {
  return {
    title: "أكاديمية التميز ضد رحب",
    organizer: "جمعية التنمية الأهلية بقرطبة والرحاب",
    home: { name: "أكاديمية التميز", shortName: "التميز", logo: null },
    away: { name: "رحب", shortName: "رحب", logo: null },
    date: "2026-10-01",
    startTime: "18:45",
    endTime: "19:45",
    venue: "ملعب جمعية التنمية الأهلية بقرطبة والرحاب",
    status: "UPCOMING",
    statusMode: "auto",
    homeScore: 0,
    awayScore: 0,
    manOfMatchId: null,
    updatedAt: 0,
  };
}

export function defaultSettings(): Settings {
  return { predictionsOpen: true, votingOpen: false, votingClosedAt: null };
}

export function defaultFormation(): FormationData {
  return {
    size: 11,
    shape: "4-3-3",
    slots: ["p1", "p3", "p4", "p5", "p6", "p7", "p8", "p9", "p10", "p11", "p12"],
    subs: ["p2", "p13", "p14", "p15", "p16"],
  };
}
