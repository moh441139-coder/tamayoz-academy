export const SITE_NAME = "التميز ضد رحب";
export const SITE_DESCRIPTION =
  "الموقع الرسمي لمباراة أكاديمية التميز ضد رحب — جمعية التنمية الأهلية بقرطبة والرحاب. التشكيلة، اللاعبون، توقع النتيجة، رجل المباراة والفائزون.";

export function siteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return explicit.replace(/\/$/, "");
  const prod = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (prod) return `https://${prod}`;
  const vercel = process.env.VERCEL_URL;
  if (vercel) return `https://${vercel}`;
  return "http://localhost:3000";
}
