const ARABIC_DIGITS: Record<string, string> = {
  "٠": "0", "١": "1", "٢": "2", "٣": "3", "٤": "4",
  "٥": "5", "٦": "6", "٧": "7", "٨": "8", "٩": "9",
  "۰": "0", "۱": "1", "۲": "2", "۳": "3", "۴": "4",
  "۵": "5", "۶": "6", "۷": "7", "۸": "8", "۹": "9",
};

export function toLatinDigits(input: string): string {
  return input.replace(/[٠-٩۰-۹]/g, (d) => ARABIC_DIGITS[d] ?? d);
}

/** يحوّل أي صيغة لرقم جوال سعودي إلى 05XXXXXXXX أو يعيد null */
export function normalizeSaudiPhone(input: string): string | null {
  let digits = toLatinDigits(input).replace(/[^\d]/g, "");
  if (digits.startsWith("00966")) digits = digits.slice(5);
  else if (digits.startsWith("966")) digits = digits.slice(3);
  if (digits.length === 9 && digits.startsWith("5")) digits = `0${digits}`;
  return /^05\d{8}$/.test(digits) ? digits : null;
}

/** 0501234567 → 050123**** */
export function maskPhone(phone: string): string {
  if (phone.length <= 4) return "****";
  return `${phone.slice(0, -4)}****`;
}
