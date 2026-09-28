import "server-only";
import sharp from "sharp";
import { del, put } from "@vercel/blob";
import { ApiError } from "./api";

export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;
const OUTPUT_SIZE = 800;

export function isBlobConfigured(): boolean {
  return !!process.env.BLOB_READ_WRITE_TOKEN;
}

type Detected = "jpeg" | "png" | "heic" | "webp" | null;

/** التعرف على نوع الصورة من البايتات الأولى (لا نثق بامتداد الملف) */
function detectType(buf: Buffer): Detected {
  if (buf.length < 12) return null;
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return "jpeg";
  if (buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return "png";
  if (buf.toString("ascii", 0, 4) === "RIFF" && buf.toString("ascii", 8, 12) === "WEBP") return "webp";
  if (buf.toString("ascii", 4, 8) === "ftyp") {
    const brand = buf.toString("ascii", 8, 12).toLowerCase();
    if (["heic", "heix", "hevc", "hevx", "heim", "heis", "mif1", "msf1"].includes(brand)) return "heic";
  }
  return null;
}

async function decodeHeic(input: Buffer): Promise<Buffer> {
  // نحاول أولاً عبر sharp (إن كان libheif يدعم HEVC)، وإلا نستخدم heic-convert
  try {
    return await sharp(input).rotate().jpeg({ quality: 92 }).toBuffer();
  } catch {
    const { default: convert } = await import("heic-convert");
    const out = await convert({ buffer: input, format: "JPEG", quality: 0.92 });
    return Buffer.from(out as ArrayBuffer);
  }
}

/** قص مربع + تصغير لحد أقصى 800px + تحويل WebP مضغوط */
export async function processImage(file: File): Promise<Buffer> {
  if (file.size === 0) throw new ApiError(400, "الملف فارغ", "EMPTY_FILE");
  if (file.size > MAX_UPLOAD_BYTES) throw new ApiError(413, "حجم الصورة يتجاوز 5 ميجابايت", "FILE_TOO_LARGE");
  let buf: Buffer = Buffer.from(await file.arrayBuffer());
  const type = detectType(buf);
  if (!type) throw new ApiError(415, "صيغة غير مدعومة. المسموح: JPG, PNG, HEIC", "UNSUPPORTED_TYPE");
  if (type === "heic") buf = await decodeHeic(buf);

  try {
    const img = sharp(buf, { failOn: "error", limitInputPixels: 64_000_000 }).rotate();
    const meta = await img.metadata();
    const side = Math.min(meta.width ?? OUTPUT_SIZE, meta.height ?? OUTPUT_SIZE, OUTPUT_SIZE);
    return await img
      .resize(side, side, { fit: "cover", position: sharp.strategy.attention })
      .webp({ quality: 80, effort: 4 })
      .toBuffer();
  } catch (e) {
    console.error("[images] processing failed", e);
    throw new ApiError(422, "تعذرت معالجة الصورة، جرّب صورة أخرى", "IMAGE_PROCESSING_FAILED");
  }
}

export async function uploadImage(buffer: Buffer, folder: "logos" | "players", name: string): Promise<string> {
  if (!isBlobConfigured()) {
    throw new ApiError(503, "تخزين الصور غير مهيأ. أضف BLOB_READ_WRITE_TOKEN", "BLOB_NOT_CONFIGURED");
  }
  const blob = await put(`${folder}/${name}.webp`, buffer, {
    access: "public",
    contentType: "image/webp",
    addRandomSuffix: true,
    cacheControlMaxAge: 60 * 60 * 24 * 365,
  });
  return blob.url;
}

export async function deleteImages(urls: (string | null | undefined)[]): Promise<void> {
  const list = urls.filter((u): u is string => !!u && u.includes(".blob.vercel-storage.com"));
  if (list.length === 0 || !isBlobConfigured()) return;
  try {
    await del(list);
  } catch (e) {
    console.error("[images] failed to delete old images", e);
  }
}
