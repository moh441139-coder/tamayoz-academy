import { TIMEZONE, TZ_OFFSET } from "./constants";
import type { MatchData, MatchStatus } from "./types";

export function toTimestamp(date: string, time: string): number {
  const ts = Date.parse(`${date}T${time}:00${TZ_OFFSET}`);
  return Number.isFinite(ts) ? ts : 0;
}

export function matchTimes(match: Pick<MatchData, "date" | "startTime" | "endTime">) {
  const kickoffAt = toTimestamp(match.date, match.startTime);
  let endAt = toTimestamp(match.date, match.endTime);
  if (endAt <= kickoffAt) endAt = kickoffAt + 90 * 60 * 1000;
  return { kickoffAt, endAt };
}

export function effectiveStatus(match: MatchData, now = Date.now()): MatchStatus {
  if (match.statusMode === "manual") return match.status;
  const { kickoffAt, endAt } = matchTimes(match);
  if (now >= endAt) return "FINISHED";
  if (now >= kickoffAt) return "LIVE";
  return "UPCOMING";
}

const LOCALE = "ar-SA-u-ca-gregory-nu-latn";

export function formatArabicDate(date: string): string {
  const ts = toTimestamp(date, "12:00");
  if (!ts) return date;
  return new Intl.DateTimeFormat(LOCALE, {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: TIMEZONE,
  }).format(new Date(ts));
}

export function formatArabicTime(time: string): string {
  const [hRaw, m] = time.split(":");
  const h = Number(hRaw);
  if (!Number.isFinite(h)) return time;
  const period = h >= 12 ? "مساءً" : "صباحاً";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${m} ${period}`;
}

export const STATUS_LABELS: Record<MatchStatus, string> = {
  UPCOMING: "لم تبدأ بعد",
  LIVE: "مباشر",
  FINISHED: "انتهت المباراة",
};
