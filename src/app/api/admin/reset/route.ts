import type { NextRequest } from "next/server";
import { assertSameOrigin, handler, ok, rateLimit, readJson, requireAdmin } from "@/lib/api";
import { deleteImages } from "@/lib/images";
import { resetSchema } from "@/lib/schemas";
import { resetData } from "@/lib/store";

export const dynamic = "force-dynamic";

const LABELS = {
  predictions: "التوقعات",
  votes: "التصويت",
  winners: "الفائزين",
  all: "جميع البيانات",
} as const;

export const POST = handler(async (req: NextRequest) => {
  assertSameOrigin(req);
  await requireAdmin();
  await rateLimit(req, "admin-reset", 10, 60);
  const { scope } = resetSchema.parse(await readJson(req));
  const images = await resetData(scope);
  await deleteImages(images);
  return ok({ message: `تم تصفير ${LABELS[scope]}` });
});
