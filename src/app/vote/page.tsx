import type { Metadata } from "next";
import { cookies } from "next/headers";
import { PageShell } from "@/components/PageShell";
import { DEVICE_COOKIE, validDeviceId } from "@/lib/device";
import { computeVoteSummary, getDeviceVote, getSnapshot } from "@/lib/store";
import { VoteClient } from "./VoteClient";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "رجل المباراة",
  description: "صوّت لرجل المباراة من لاعبي أكاديمية التميز",
  alternates: { canonical: "/vote" },
};

export default async function VotePage() {
  const deviceId = validDeviceId(cookies().get(DEVICE_COOKIE)?.value);
  const [snap, myVote] = await Promise.all([getSnapshot(), deviceId ? getDeviceVote(deviceId) : null]);
  return (
    <PageShell title="رجل المباراة" subtitle="اختر أفضل لاعب في المباراة">
      <VoteClient
        players={snap.players}
        initial={{
          votingOpen: snap.settings.votingOpen,
          manOfMatchId: snap.match.manOfMatchId,
          summary: computeVoteSummary(snap.voteResults, snap.players),
          myVote: myVote?.playerId ?? null,
        }}
      />
    </PageShell>
  );
}
