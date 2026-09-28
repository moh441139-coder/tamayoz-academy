# أكاديمية التميز 🆚 رحب

موقع مباراة احترافي — جمعية التنمية الأهلية بقرطبة والرحاب.

**التقنيات:** Next.js 14 (App Router) · TypeScript · Tailwind CSS · Framer Motion · Zod · Upstash Redis · Vercel Blob · Sharp · PWA

## الصفحات

| المسار | الوصف |
|---|---|
| `/` | بطاقة المباراة: الشعارات، VS، التاريخ والوقت والمكان، العد التنازلي، النتيجة، الحالة |
| `/players` | بطاقات FIFA للاعبين (GK للحراس) |
| `/formation` | ملعب بمنظور علوي (5 / 7 / 8 / 11 لاعباً) + الاحتياط |
| `/prediction` | توقع النتيجة + الإحصائيات |
| `/vote` | رجل المباراة (تحديث كل 5 ثوانٍ) |
| `/winners` | الفائزون (أرقام الجوال مخفية `050123****`) |
| `/qr` | رمز QR جاهز للطباعة (A4) |
| `/screen` | الشاشة الكبيرة / البروجكتور |
| `/admin` | لوحة المشرف (محمية) — الدخول من `/admin/login` |

## حالات المباراة

- **تلقائي (افتراضي):** قادمة قبل وقت البداية ← مباشر ← انتهت بعد وقت النهاية (7:45 مساءً افتراضياً، بتوقيت الرياض).
- **يدوي:** يختار المشرف الحالة بنفسه من تبويب «النتيجة».
- التوقعات تُغلق تلقائياً عند البداية، ويمكن للمشرف إغلاقها قبل ذلك.
- عند إغلاق التصويت يُعلن صاحب أعلى الأصوات رجلاً للمباراة (قابل للتعديل يدوياً).

## متغيرات البيئة

انسخ `.env.example` إلى `.env.local`:

| المتغير | إلزامي | الوصف |
|---|---|---|
| `ADMIN_PASSWORD` | ✅ | كلمة مرور لوحة المشرف |
| `SESSION_SECRET` | موصى به | سر توقيع الجلسات (32 حرفاً عشوائياً) |
| `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` | ✅ للإنتاج | أو `KV_REST_API_URL` / `KV_REST_API_TOKEN` |
| `BLOB_READ_WRITE_TOKEN` | ✅ لرفع الصور | من Vercel Blob Store |
| `NEXT_PUBLIC_SITE_URL` | اختياري | الرابط النهائي (لـ QR وOpen Graph) |

بدون Redis يعمل الموقع بذاكرة مؤقتة غير دائمة (للتطوير فقط) وتظهر تحذيرات في لوحة المشرف.

## التشغيل المحلي

```bash
npm install
cp .env.example .env.local   # ثم عدّل القيم
npm run dev
```

## النشر على Vercel (CLI بدون GitHub)

### الطريقة السريعة

```bash
npm run deploy
```

السكربت يسجّل الدخول ويربط المشروع ويضيف `ADMIN_PASSWORD` و`SESSION_SECRET`، ويتحقق من ربط Redis وBlob، ثم يبني وينشر ويفحص `/api/health`.

### الطريقة اليدوية

```bash
npm i -g vercel
vercel login
vercel link                      # إنشاء/ربط المشروع

# 1) Redis: من لوحة Vercel → Storage → Upstash (Redis) → Connect to project
# 2) Blob:  من لوحة Vercel → Storage → Blob → Create → Connect to project
#    (المتغيرات تضاف للمشروع تلقائياً)

# 3) كلمة المرور وسر الجلسات:
vercel env add ADMIN_PASSWORD production
openssl rand -base64 32 | vercel env add SESSION_SECRET production

# 4) النشر:
vercel deploy --prod
```

> `vercel.json` يعطّل النشر التلقائي من Git (`git.deploymentEnabled: false`).

## Redis Keys

| Key | المحتوى |
|---|---|
| `match:data` | بيانات المباراة والنتيجة والحالة |
| `players:list` | قائمة اللاعبين |
| `settings` | فتح/إغلاق التوقعات والتصويت |
| `formation:data` | الخطة والأساسيون والاحتياط |
| `predictions:{phone}` | توقع كل رقم (SET NX لمنع التكرار) |
| `predictions:index` / `predictions:scores` | فهرس الأرقام وعدّاد النتائج للإحصائيات |
| `votes:{deviceId}` | صوت كل جهاز (SET NX) |
| `votes:phone:{phone}` / `votes:index` | منع تكرار التصويت بنفس الرقم + الفهرس |
| `vote:results` | Hash لعدد الأصوات لكل لاعب |
| `winners` | الفائزون المعلنون (بأرقام مخفية) |
| `ratelimit:*` | عدادات Rate Limiting |

## الأمان

- جلسة المشرف: Cookie `HttpOnly` + `Secure` + `SameSite=Strict` موقّعة بـ HMAC-SHA256، صلاحيتها 12 ساعة.
- حماية مزدوجة: Middleware + تحقق داخل كل مسار API للمشرف.
- كل API: تحقق Zod، Rate limiting، حماية CSRF بفحص Origin، ورسائل JSON موحدة `{ ok, data | error }`.
- الصور: فحص نوع الملف من البايتات (JPG/PNG/HEIC)، حد 5MB، قص مربع 800px وتحويل WebP بـ Sharp، وحذف الصورة القديمة عند الاستبدال.
- CSV محمي من حقن الصيغ.

## توليد صورة Open Graph والأيقونات

```bash
npm i -D playwright-core
CHROME_PATH=/path/to/chrome node scripts/generate-assets.mjs
```
