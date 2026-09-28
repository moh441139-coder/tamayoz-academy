import { z } from "zod";
import { normalizeSaudiPhone } from "./phone";

export const phoneSchema = z
  .string({ error: "رقم الجوال مطلوب" })
  .trim()
  .transform((v, ctx) => {
    const n = normalizeSaudiPhone(v);
    if (!n) {
      ctx.addIssue({ code: "custom", message: "رقم الجوال غير صحيح، مثال: 05XXXXXXXX" });
      return z.NEVER;
    }
    return n;
  });

export const nameSchema = z
  .string({ error: "الاسم مطلوب" })
  .trim()
  .min(2, "الاسم قصير جداً")
  .max(40, "الاسم طويل جداً")
  .refine((v) => !/[<>{}]/.test(v), "الاسم يحتوي على رموز غير مسموحة");

const goals = z.coerce
  .number({ error: "أدخل عدد الأهداف" })
  .int("عدد الأهداف يجب أن يكون رقماً صحيحاً")
  .min(0, "عدد الأهداف لا يمكن أن يكون سالباً")
  .max(30, "عدد الأهداف كبير جداً");

export const predictionSchema = z.object({
  name: nameSchema,
  phone: phoneSchema,
  home: goals,
  away: goals,
  website: z.string().max(0).optional(), // honeypot
});

export const voteSchema = z.object({
  playerId: z.string().trim().min(1, "اختر لاعباً").max(40),
  phone: phoneSchema,
  website: z.string().max(0).optional(),
});

export const loginSchema = z.object({
  password: z.string().min(1, "أدخل كلمة المرور").max(200),
});

const timeSchema = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "صيغة الوقت غير صحيحة");
const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "صيغة التاريخ غير صحيحة");
const shortText = (max: number) => z.string().trim().min(1, "الحقل مطلوب").max(max);

export const matchUpdateSchema = z
  .object({
    date: dateSchema,
    startTime: timeSchema,
    endTime: timeSchema,
    venue: shortText(120),
    title: shortText(120),
    organizer: shortText(120),
    homeName: shortText(60),
    homeShortName: shortText(30),
    awayName: shortText(60),
    awayShortName: shortText(30),
    status: z.enum(["UPCOMING", "LIVE", "FINISHED"]),
    statusMode: z.enum(["auto", "manual"]),
    homeScore: goals,
    awayScore: goals,
    manOfMatchId: z.string().max(40).nullable(),
  })
  .partial();

export const settingsUpdateSchema = z
  .object({
    predictionsOpen: z.boolean(),
    votingOpen: z.boolean(),
  })
  .partial();

export const playerPositionSchema = z.enum(["GK", "DF", "MF", "FW", "PL"]);

export const playerCreateSchema = z.object({
  name: shortText(40),
  number: z.coerce.number().int().min(1, "الرقم من 1 إلى 99").max(99, "الرقم من 1 إلى 99"),
  position: playerPositionSchema,
});

export const playerUpdateSchema = playerCreateSchema.partial().extend({
  id: z.string().min(1).max(40),
});

export const playerDeleteSchema = z.object({ id: z.string().min(1).max(40) });

export const formationSchema = z.object({
  size: z.union([z.literal(5), z.literal(7), z.literal(8), z.literal(11)]),
  shape: z.string().regex(/^\d(-\d){1,4}$/, "خطة غير صحيحة"),
  slots: z.array(z.string().max(40).nullable()).max(11),
  subs: z.array(z.string().max(40)).max(30),
});

export const uploadTargetSchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("logo"), side: z.enum(["home", "away"]) }),
  z.object({ kind: z.literal("player"), playerId: z.string().min(1).max(40) }),
]);

export const resetSchema = z.object({
  scope: z.enum(["predictions", "votes", "winners", "all"]),
  confirm: z.literal("تصفير", { error: "اكتب كلمة (تصفير) للتأكيد" }),
});

export const exportSchema = z.object({
  type: z.enum(["predictions", "votes", "winners"]),
});
