import type { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { ApiError, assertSameOrigin, handler, ok, rateLimit, readJson } from "@/lib/api";
import { DEVICE_COOKIE, validDeviceId } from "@/lib/device";
import { voteSchema } from "@/lib/schemas";
import { castVote, computeVoteSummary, getDeviceVote, getSnapshot } from "@/lib/store";

export const dynamic = "force-dynamic";

function readDeviceId(): string | null {
  return validDeviceId(cookies().get(DEVICE_COOKIE)?.value);
}

export const GET = handler(async (req: NextRequest) => {
  await rateLimit(req, "vote-get", 120, 60, false);
  const deviceId = readDeviceId();
  const [snap, myVote] = await Promise.all([getSnapshot(), deviceId ? getDeviceVote(deviceId) : null]);
  return ok({
    votingOpen: snap.settings.votingOpen,
    manOfMatchId: snap.match.manOfMatchId,
    summary: computeVoteSummary(snap.voteResults, snap.players),
    myVote: myVote ? myVote.playerId : null,
  });
});

export const POST = handler(async (req: NextRequest) => {
  assertSameOrigin(req);
  await rateLimit(req, "vote-post", 6, 60);
  const body = voteSchema.parse(await readJson(req));
  if (body.website) throw new ApiError(400, "طلب غير صالح", "BOT_DETECTED");

  let deviceId = readDeviceId();
  let newDevice = false;
  if (!deviceId) {
    deviceId = crypto.randomUUID();
    newDevice = true;
  }

  const result = await castVote(deviceId, body.phone, body.playerId);
  switch (result) {
    case "closed":
      throw new ApiError(409, "التصويت مغلق حالياً", "VOTING_CLOSED");
    case "invalid_player":
      throw new ApiError(400, "اللاعب غير موجود", "INVALID_PLAYER");
    case "device_voted":
      throw new ApiError(409, "تم التصويت من هذا الجهاز مسبقاً", "DEVICE_ALREADY_VOTED");
    case "phone_voted":
      throw new ApiError(409, "تم التصويت بهذا الرقم مسبقاً", "PHONE_ALREADY_VOTED");
  }

  const res = ok({ message: "شكراً! تم تسجيل صوتك ✅", playerId: body.playerId }, { status: 201 });
  if (newDevice) {
    res.cookies.set(DEVICE_COOKIE, deviceId, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
    });
  }
  return res;
});
