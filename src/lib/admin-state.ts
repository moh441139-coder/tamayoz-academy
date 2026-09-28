import "server-only";
import { isRedisConfigured } from "./kv";
import { isBlobConfigured } from "./images";
import { buildPublicState, getSnapshot, getWinners } from "./store";

export async function getAdminState() {
  const snap = await getSnapshot(true);
  const [winners] = await Promise.all([getWinners()]);
  return {
    ...buildPublicState(snap),
    winnersDraft: winners,
    system: {
      redis: isRedisConfigured(),
      blob: isBlobConfigured(),
      sessionSecret: !!process.env.SESSION_SECRET,
    },
  };
}

export type AdminState = Awaited<ReturnType<typeof getAdminState>>;
