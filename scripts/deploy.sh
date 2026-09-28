#!/usr/bin/env bash
# نشر موقع أكاديمية التميز ضد رحب على Vercel (بدون GitHub Deploy)
# الاستخدام: bash scripts/deploy.sh
set -euo pipefail

VERCEL="npx --yes vercel@latest"
cd "$(dirname "$0")/.."

echo "▶ 1/6 التحقق من تسجيل الدخول في Vercel"
if ! $VERCEL whoami >/dev/null 2>&1; then
  $VERCEL login
fi
echo "   ✓ مسجّل باسم: $($VERCEL whoami 2>/dev/null | tail -1)"

echo "▶ 2/6 ربط المشروع"
if [ ! -f .vercel/project.json ]; then
  $VERCEL link
fi

echo "▶ 3/6 التحقق من متغيرات البيئة"
ENV_LIST="$($VERCEL env ls production 2>/dev/null || true)"
has() { grep -qE "(^|[[:space:]])$1([[:space:]]|$)" <<<"$ENV_LIST"; }

if ! has ADMIN_PASSWORD; then
  read -r -s -p "   أدخل كلمة مرور المشرف ADMIN_PASSWORD: " PW; echo
  [ ${#PW} -ge 8 ] || { echo "   ✗ كلمة المرور يجب ألا تقل عن 8 أحرف"; exit 1; }
  printf '%s' "$PW" | $VERCEL env add ADMIN_PASSWORD production >/dev/null
  echo "   ✓ تمت إضافة ADMIN_PASSWORD"
fi
if ! has SESSION_SECRET; then
  openssl rand -base64 32 | tr -d '\n' | $VERCEL env add SESSION_SECRET production >/dev/null
  echo "   ✓ تم توليد SESSION_SECRET"
fi

MISSING=0
if ! has UPSTASH_REDIS_REST_URL && ! has KV_REST_API_URL; then
  echo "   ✗ Redis غير مربوط: من لوحة Vercel ← Storage ← Upstash (Redis) ← Connect Project"
  MISSING=1
fi
if ! has BLOB_READ_WRITE_TOKEN; then
  echo "   ✗ Blob غير مربوط: من لوحة Vercel ← Storage ← Blob ← Create ← Connect Project"
  MISSING=1
fi
if [ "$MISSING" = 1 ]; then
  echo "   اربط التخزين ثم أعد تشغيل السكربت."
  exit 1
fi
echo "   ✓ Redis و Blob مربوطان"

echo "▶ 4/6 اختبار البناء محلياً"
npm ci
npm run build

echo "▶ 5/6 النشر للإنتاج"
URL="$($VERCEL deploy --prod --yes | tail -1)"
echo "   ✓ تم النشر: $URL"

echo "▶ 6/6 فحص الصحة"
sleep 3
curl -fsS "$URL/api/health" && echo

cat <<INFO

✅ الروابط:
   الموقع:        $URL
   لوحة المشرف:   $URL/admin
   QR:            $URL/qr
   الشاشة الكبيرة: $URL/screen
INFO
