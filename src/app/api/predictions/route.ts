import type { NextRequest } from "next/server";
import { ApiError, assertSameOrigin, handler, ok, rateLimit, readJson } from "@/lib/api";
import { predictionSchema } from "@/lib/schemas";
import { computePredictionStats, getSnapshot, submitPrediction } from "@/lib/store";

export const dynamic = "force-dynamic";

export const GET = handler(async (req: NextRequest) => {
  await rateLimit(req, "predictions-get", 120, 60, false);
  const snap = await getSnapshot();
  return ok(computePredictionStats(snap.predictionScores), {
    cache: "public, max-age=0, s-maxage=3, stale-while-revalidate=5",
  });
});

export const POST = handler(async (req: NextRequest) => {
  assertSameOrigin(req);
  await rateLimit(req, "predictions-post", 8, 60);
  const body = predictionSchema.parse(await readJson(req));
  if (body.website) throw new ApiError(400, "طلب غير صالح", "BOT_DETECTED");
  const result = await submitPrediction({ name: body.name, phone: body.phone, home: body.home, away: body.away });
  if (result === "closed") throw new ApiError(409, "التوقعات مغلقة حالياً", "PREDICTIONS_CLOSED");
  if (result === "duplicate") throw new ApiError(409, "تم تسجيل توقع بهذا الرقم مسبقاً", "DUPLICATE_PHONE");
  return ok({ message: "تم تسجيل توقعك بنجاح! بالتوفيق 🍀", home: body.home, away: body.away }, { status: 201 });
});
