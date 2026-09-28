/**
 * يولّد صورة Open Graph والأيقونات بمتصفح Chromium (لدعم تشكيل الحروف العربية).
 * الاستخدام: node scripts/generate-assets.mjs  (يتطلب playwright-core)
 */
import { chromium } from "playwright-core";
import { mkdirSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(process.cwd());
const font = (w) => `file://${root}/node_modules/@fontsource/tajawal/files/tajawal-arabic-${w}-normal.woff2`;
const fontLatin = (w) => `file://${root}/node_modules/@fontsource/tajawal/files/tajawal-latin-${w}-normal.woff2`;
const fontFaces = [500, 700, 900]
  .map(
    (w) => `@font-face{font-family:T;font-weight:${w};src:url(${font(w)}) format("woff2");unicode-range:U+0600-06FF,U+0750-077F,U+FB50-FDFF,U+FE70-FEFF;}
@font-face{font-family:T;font-weight:${w};src:url(${fontLatin(w)}) format("woff2");unicode-range:U+0000-00FF;}`,
  )
  .join("\n");

const base = `
${fontFaces}
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:T,sans-serif;background:#0A1414;color:#fff;overflow:hidden}
.bg{position:absolute;inset:0;background:
 radial-gradient(ellipse 70% 60% at 50% -10%,rgba(79,227,200,.35),transparent 60%),
 radial-gradient(ellipse 50% 60% at 0% 100%,rgba(11,94,94,.7),transparent 60%),
 radial-gradient(ellipse 50% 60% at 100% 100%,rgba(98,104,176,.55),transparent 60%),#0A1414}
.grid{position:absolute;inset:0;background-image:linear-gradient(rgba(79,227,200,.09) 1px,transparent 1px),linear-gradient(90deg,rgba(79,227,200,.09) 1px,transparent 1px);background-size:48px 48px;mask-image:linear-gradient(to top,#000,transparent 80%)}
`;

const og = `<!doctype html><html dir="rtl" lang="ar"><head><meta charset="utf-8"><style>${base}
.wrap{position:relative;width:1200px;height:630px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:26px}
.org{font-size:30px;font-weight:700;color:#4FE3C8;letter-spacing:.5px}
.row{display:flex;align-items:center;gap:70px}
.team{display:flex;flex-direction:column;align-items:center;gap:18px}
.logo{width:230px;height:230px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:62px;font-weight:900;text-shadow:0 4px 14px rgba(0,0,0,.5)}
.home{background:radial-gradient(circle at 30% 25%,#4FE3C8,#0B5E5E 70%);box-shadow:0 0 0 5px rgba(79,227,200,.7),0 0 80px rgba(79,227,200,.55)}
.away{background:radial-gradient(circle at 30% 25%,#04AE9F,#6268B0 70%);box-shadow:0 0 0 5px rgba(98,104,176,.8),0 0 80px rgba(98,104,176,.55)}
.name{font-size:44px;font-weight:900}
.vs{font-size:130px;font-weight:900;font-style:italic;background:linear-gradient(90deg,#6268B0,#04AE9F,#4FE3C8);-webkit-background-clip:text;color:transparent;filter:drop-shadow(0 0 30px rgba(79,227,200,.6))}
.tag{font-size:28px;font-weight:700;color:rgba(255,255,255,.75);background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.15);padding:10px 30px;border-radius:999px}
</style></head><body><div class="bg"></div><div class="grid"></div><div class="wrap">
<div class="org">جمعية التنمية الأهلية بقرطبة والرحاب</div>
<div class="row">
 <div class="team"><div class="logo home">التميز</div><div class="name">أكاديمية التميز</div></div>
 <div class="vs">VS</div>
 <div class="team"><div class="logo away">رحب</div><div class="name">رحب</div></div>
</div>
<div class="tag">🎯 توقع النتيجة &nbsp;•&nbsp; ⭐ رجل المباراة &nbsp;•&nbsp; 🧩 التشكيلة</div>
</div></body></html>`;

const icon = (size, pad) => `<!doctype html><html dir="rtl"><head><meta charset="utf-8"><style>${base}
.wrap{position:relative;width:${size}px;height:${size}px;display:flex;align-items:center;justify-content:center}
.c{width:${size - pad * 2}px;height:${size - pad * 2}px;border-radius:50%;display:flex;flex-direction:column;align-items:center;justify-content:center;
background:radial-gradient(circle at 30% 25%,#4FE3C8,#0B5E5E 72%);box-shadow:0 0 0 ${size * 0.02}px #4FE3C8, 0 0 ${size * 0.12}px rgba(79,227,200,.6)}
.t{font-weight:900;font-size:${size * 0.2}px;line-height:1;text-shadow:0 ${size * 0.01}px ${size * 0.03}px rgba(0,0,0,.5)}
.v{font-weight:900;font-style:italic;font-size:${size * 0.12}px;color:#0A1414;margin-top:${size * 0.02}px;letter-spacing:1px}
</style></head><body style="background:#0A1414"><div class="wrap"><div class="c"><div class="t">التميز</div><div class="v">VS</div></div></div></body></html>`;

const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || "/opt/pw-browsers/chromium-1194/chrome-linux/chrome" });
async function shot(html, w, h, out) {
  const page = await browser.newPage({ viewport: { width: w, height: h } });
  await page.setContent(html, { waitUntil: "load" });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(200);
  await page.screenshot({ path: out, type: "png" });
  await page.close();
  console.log("wrote", out);
}

mkdirSync(`${root}/public/icons`, { recursive: true });
await shot(og, 1200, 630, `${root}/src/app/opengraph-image.png`);
await shot(og, 1200, 630, `${root}/src/app/twitter-image.png`);
await shot(icon(512, 24), 512, 512, `${root}/public/icons/icon-512.png`);
await shot(icon(192, 9), 192, 192, `${root}/public/icons/icon-192.png`);
await shot(icon(512, 72), 512, 512, `${root}/public/icons/maskable-512.png`);
await shot(icon(180, 8), 180, 180, `${root}/src/app/apple-icon.png`);
await shot(icon(64, 2), 64, 64, `${root}/src/app/icon.png`);
await browser.close();
