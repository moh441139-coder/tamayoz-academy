import "server-only";
import { KEYS, defaultFormation, defaultMatch, defaultPlayers, defaultSettings } from "./constants";
import { isValidShape, FORMATION_SHAPES } from "./formations";
import { kv } from "./kv";
import { maskPhone } from "./phone";
import { effectiveStatus, matchTimes } from "./time";
import type {
  FormationData,
  MatchData,
  Player,
  Prediction,
  PredictionStats,
  PublicState,
  Settings,
  VoteRecord,
  VoteSummary,
  WinnerEntry,
  WinnersData,
} from "./types";

/* ------------------------------------------------------------------ */
/* القراءة والكتابة الأساسية                                           */
/* ------------------------------------------------------------------ */

function mergeMatch(raw: Partial<MatchData> | null): MatchData {
  const d = defaultMatch();
  if (!raw) return d;
  return {
    ...d,
    ...raw,
    home: { ...d.home, ...(raw.home ?? {}) },
    away: { ...d.away, ...(raw.away ?? {}) },
  };
}

function mergeSettings(raw: Partial<Settings> | null): Settings {
  return { ...defaultSettings(), ...(raw ?? {}) };
}

function sanitizeFormation(raw: FormationData | null, players: Player[]): FormationData {
  const f = raw ?? defaultFormation();
  const ids = new Set(players.map((p) => p.id));
  const size = f.size;
  const shape = isValidShape(size, f.shape) ? f.shape : FORMATION_SHAPES[size][0];
  const slots: (string | null)[] = Array.from({ length: size }, (_, i) => {
    const id = f.slots[i] ?? null;
    return id && ids.has(id) ? id : null;
  });
  const used = new Set(slots.filter(Boolean) as string[]);
  const subs = f.subs.filter((id) => ids.has(id) && !used.has(id));
  return { size, shape, slots, subs };
}

export async function getMatch(): Promise<MatchData> {
  return mergeMatch(await kv().get<MatchData>(KEYS.match));
}

export async function saveMatch(match: MatchData): Promise<void> {
  await kv().set(KEYS.match, { ...match, updatedAt: Date.now() });
  invalidateSnapshot();
}

export async function getPlayers(): Promise<Player[]> {
  const list = await kv().get<Player[]>(KEYS.players);
  return sortPlayers(list ?? defaultPlayers());
}

export function sortPlayers(list: Player[]): Player[] {
  return [...list].sort((a, b) => a.number - b.number);
}

export async function savePlayers(players: Player[]): Promise<void> {
  await kv().set(KEYS.players, sortPlayers(players));
  invalidateSnapshot();
}

export async function getSettings(): Promise<Settings> {
  return mergeSettings(await kv().get<Settings>(KEYS.settings));
}

export async function saveSettings(settings: Settings): Promise<void> {
  await kv().set(KEYS.settings, settings);
  invalidateSnapshot();
}

export async function getFormation(players?: Player[]): Promise<FormationData> {
  const list = players ?? (await getPlayers());
  return sanitizeFormation(await kv().get<FormationData>(KEYS.formation), list);
}

export async function saveFormation(f: FormationData, players: Player[]): Promise<FormationData> {
  const clean = sanitizeFormation(f, players);
  await kv().set(KEYS.formation, clean);
  invalidateSnapshot();
  return clean;
}

export async function getWinners(): Promise<WinnersData | null> {
  return kv().get<WinnersData>(KEYS.winners);
}

/* ------------------------------------------------------------------ */
/* الحالة العامة (مع كاش قصير داخل المثيل لتقليل أوامر Redis)          */
/* ------------------------------------------------------------------ */

interface Snapshot {
  match: MatchData;
  players: Player[];
  settings: Settings;
  formation: FormationData;
  winners: WinnersData | null;
  voteResults: Record<string, number>;
  predictionScores: Record<string, number>;
}

const SNAPSHOT_TTL_MS = 2000;
const snapCache = globalThis as unknown as { __tamayozSnap?: { at: number; data: Snapshot } };

function invalidateSnapshot() {
  snapCache.__tamayozSnap = undefined;
}

export async function getSnapshot(fresh = false): Promise<Snapshot> {
  const cached = snapCache.__tamayozSnap;
  if (!fresh && cached && Date.now() - cached.at < SNAPSHOT_TTL_MS) return cached.data;

  const store = kv();
  const [values, voteResults, predictionScores] = await Promise.all([
    store.mget<unknown>([KEYS.match, KEYS.players, KEYS.settings, KEYS.formation, KEYS.winners]),
    store.hgetall(KEYS.voteResults),
    store.hgetall(KEYS.predictionsScores),
  ]);
  const [m, p, s, f, w] = values;
  const players = sortPlayers((p as Player[] | null) ?? defaultPlayers());
  const data: Snapshot = {
    match: mergeMatch(m as MatchData | null),
    players,
    settings: mergeSettings(s as Settings | null),
    formation: sanitizeFormation(f as FormationData | null, players),
    winners: (w as WinnersData | null) ?? null,
    voteResults,
    predictionScores,
  };
  snapCache.__tamayozSnap = { at: Date.now(), data };
  return data;
}

export function predictionsAccepting(match: MatchData, settings: Settings, now = Date.now()): boolean {
  if (!settings.predictionsOpen) return false;
  if (effectiveStatus(match, now) !== "UPCOMING") return false;
  const { kickoffAt } = matchTimes(match);
  return kickoffAt > 0 && now < kickoffAt;
}

export function computePredictionStats(scores: Record<string, number>): PredictionStats {
  let total = 0;
  let home = 0;
  let draw = 0;
  let away = 0;
  const entries: { home: number; away: number; count: number }[] = [];
  for (const [key, count] of Object.entries(scores)) {
    const [h, a] = key.split("-").map(Number);
    if (!Number.isFinite(h) || !Number.isFinite(a) || count <= 0) continue;
    total += count;
    if (h > a) home += count;
    else if (h === a) draw += count;
    else away += count;
    entries.push({ home: h, away: a, count });
  }
  const pct = (n: number) => (total ? Math.round((n / total) * 1000) / 10 : 0);
  entries.sort((x, y) => y.count - x.count || x.home + x.away - (y.home + y.away));
  return {
    total,
    homeWinPct: pct(home),
    drawPct: pct(draw),
    awayWinPct: pct(away),
    topScores: entries.slice(0, 5).map((e) => ({ ...e, pct: pct(e.count) })),
  };
}

export function computeVoteSummary(results: Record<string, number>, players: Player[]): VoteSummary {
  const ids = new Set(players.map((p) => p.id));
  const byNumber = new Map(players.map((p) => [p.id, p.number]));
  const list = Object.entries(results)
    .filter(([id, c]) => ids.has(id) && c > 0)
    .map(([playerId, count]) => ({ playerId, count }));
  const total = list.reduce((s, r) => s + r.count, 0);
  return {
    total,
    results: list
      .map((r) => ({ ...r, pct: total ? Math.round((r.count / total) * 1000) / 10 : 0 }))
      .sort((a, b) => b.count - a.count || (byNumber.get(a.playerId) ?? 0) - (byNumber.get(b.playerId) ?? 0)),
  };
}

export function buildPublicState(snap: Snapshot, now = Date.now()): PublicState {
  const { kickoffAt, endAt } = matchTimes(snap.match);
  return {
    now,
    match: { ...snap.match, effectiveStatus: effectiveStatus(snap.match, now), kickoffAt, endAt },
    players: snap.players,
    settings: { ...snap.settings, predictionsAccepting: predictionsAccepting(snap.match, snap.settings, now) },
    formation: snap.formation,
    predictionStats: computePredictionStats(snap.predictionScores),
    votes: computeVoteSummary(snap.voteResults, snap.players),
    winners: snap.winners?.announced ? snap.winners : null,
  };
}

export async function getPublicState(fresh = false): Promise<PublicState> {
  return buildPublicState(await getSnapshot(fresh));
}

/* ------------------------------------------------------------------ */
/* التوقعات                                                            */
/* ------------------------------------------------------------------ */

export type SubmitResult = "ok" | "duplicate" | "closed";

export async function submitPrediction(input: Omit<Prediction, "createdAt">): Promise<SubmitResult> {
  const [match, settings] = await Promise.all([getMatch(), getSettings()]);
  if (!predictionsAccepting(match, settings)) return "closed";
  const record: Prediction = { ...input, createdAt: Date.now() };
  const created = await kv().set(KEYS.prediction(input.phone), record, { nx: true });
  if (!created) return "duplicate";
  await Promise.all([
    kv().sadd(KEYS.predictionsIndex, input.phone),
    kv().hincrby(KEYS.predictionsScores, `${input.home}-${input.away}`, 1),
  ]);
  invalidateSnapshot();
  return "ok";
}

export async function getPredictionByPhone(phone: string): Promise<Prediction | null> {
  return kv().get<Prediction>(KEYS.prediction(phone));
}

export async function listPredictions(): Promise<Prediction[]> {
  const phones = await kv().smembers(KEYS.predictionsIndex);
  const rows = await kv().mget<Prediction>(phones.map((p) => KEYS.prediction(p)));
  return rows.filter((r): r is Prediction => !!r).sort((a, b) => a.createdAt - b.createdAt);
}

/* ------------------------------------------------------------------ */
/* التصويت                                                             */
/* ------------------------------------------------------------------ */

export type VoteResultCode = "ok" | "closed" | "device_voted" | "phone_voted" | "invalid_player";

export async function castVote(deviceId: string, phone: string, playerId: string): Promise<VoteResultCode> {
  const [settings, players] = await Promise.all([getSettings(), getPlayers()]);
  if (!settings.votingOpen) return "closed";
  if (!players.some((p) => p.id === playerId)) return "invalid_player";
  const store = kv();
  const record: VoteRecord = { playerId, phone, createdAt: Date.now() };

  const phoneOk = await store.set(KEYS.votePhone(phone), deviceId, { nx: true });
  if (!phoneOk) return "phone_voted";
  const deviceOk = await store.set(KEYS.vote(deviceId), record, { nx: true });
  if (!deviceOk) {
    await store.del(KEYS.votePhone(phone));
    return "device_voted";
  }
  await Promise.all([store.sadd(KEYS.votesIndex, deviceId), store.hincrby(KEYS.voteResults, playerId, 1)]);
  invalidateSnapshot();
  return "ok";
}

export async function getDeviceVote(deviceId: string): Promise<VoteRecord | null> {
  return kv().get<VoteRecord>(KEYS.vote(deviceId));
}

export async function listVotes(): Promise<(VoteRecord & { deviceId: string })[]> {
  const ids = await kv().smembers(KEYS.votesIndex);
  const rows = await kv().mget<VoteRecord>(ids.map((id) => KEYS.vote(id)));
  return rows
    .map((r, i) => (r ? { ...r, deviceId: ids[i]! } : null))
    .filter((r): r is VoteRecord & { deviceId: string } => !!r)
    .sort((a, b) => a.createdAt - b.createdAt);
}

export async function topVotedPlayerId(players: Player[]): Promise<string | null> {
  const summary = computeVoteSummary(await kv().hgetall(KEYS.voteResults), players);
  return summary.results[0]?.playerId ?? null;
}

/* ------------------------------------------------------------------ */
/* الفائزون                                                            */
/* ------------------------------------------------------------------ */

export async function announceWinners(): Promise<WinnersData> {
  const [match, predictions] = await Promise.all([getMatch(), listPredictions()]);
  const h = match.homeScore;
  const a = match.awayScore;
  const sign = (n: number) => Math.sign(n);
  const toEntry = (p: Prediction): WinnerEntry => ({
    name: p.name,
    maskedPhone: maskPhone(p.phone),
    home: p.home,
    away: p.away,
  });
  const exact = predictions.filter((p) => p.home === h && p.away === a).map(toEntry);
  const outcome = predictions
    .filter((p) => !(p.home === h && p.away === a) && sign(p.home - p.away) === sign(h - a))
    .map(toEntry);
  const data: WinnersData = {
    announced: true,
    homeScore: h,
    awayScore: a,
    exact,
    outcome,
    announcedAt: Date.now(),
  };
  await kv().set(KEYS.winners, data);
  invalidateSnapshot();
  return data;
}

export async function hideWinners(): Promise<void> {
  const current = await getWinners();
  if (current) await kv().set(KEYS.winners, { ...current, announced: false });
  invalidateSnapshot();
}

/* ------------------------------------------------------------------ */
/* التصفير                                                             */
/* ------------------------------------------------------------------ */

export type ResetScope = "predictions" | "votes" | "winners" | "all";

export async function resetData(scope: ResetScope): Promise<string[]> {
  const store = kv();
  const removedImages: string[] = [];
  if (scope === "predictions" || scope === "all") {
    const phones = await store.smembers(KEYS.predictionsIndex);
    await store.del(...phones.map((p) => KEYS.prediction(p)), KEYS.predictionsIndex, KEYS.predictionsScores);
  }
  if (scope === "votes" || scope === "all") {
    const devices = await store.smembers(KEYS.votesIndex);
    const records = await store.mget<VoteRecord>(devices.map((d) => KEYS.vote(d)));
    const phoneKeys = records.filter((r): r is VoteRecord => !!r).map((r) => KEYS.votePhone(r.phone));
    await store.del(...devices.map((d) => KEYS.vote(d)), ...phoneKeys, KEYS.votesIndex, KEYS.voteResults);
    if (scope === "votes") {
      const [settings, match] = await Promise.all([getSettings(), getMatch()]);
      await saveSettings({ ...settings, votingOpen: false, votingClosedAt: null });
      await saveMatch({ ...match, manOfMatchId: null });
    }
  }
  if (scope === "winners" || scope === "all") {
    await store.del(KEYS.winners);
  }
  if (scope === "all") {
    const [match, players] = await Promise.all([getMatch(), getPlayers()]);
    if (match.home.logo) removedImages.push(match.home.logo);
    if (match.away.logo) removedImages.push(match.away.logo);
    for (const p of players) if (p.photo) removedImages.push(p.photo);
    await store.del(KEYS.match, KEYS.players, KEYS.settings, KEYS.formation);
  }
  invalidateSnapshot();
  return removedImages;
}

