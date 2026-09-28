"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { apiFetch } from "@/lib/client";
import { useAdmin } from "./context";

const MAX = 5 * 1024 * 1024;
const ACCEPT = "image/jpeg,image/png,image/heic,image/heif,.jpg,.jpeg,.png,.heic,.heif";

type Target = { kind: "logo"; side: "home" | "away" } | { kind: "player"; playerId: string };

interface Props {
  target: Target;
  current: string | null;
  label: string;
  size?: number;
  fallback: React.ReactNode;
}

export function ImageUploader({ target, current, label, size = 96, fallback }: Props) {
  const { run, notify } = useAdmin();
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [previewFailed, setPreviewFailed] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!file) {
      setPreview(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    setPreviewFailed(false);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  function pick(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (!f) return;
    if (f.size > MAX) {
      notify("error", "حجم الصورة يتجاوز 5 ميجابايت");
      return;
    }
    setFile(f);
  }

  async function upload() {
    if (!file) return;
    setBusy(true);
    const fd = new FormData();
    fd.append("file", file);
    fd.append("kind", target.kind);
    if (target.kind === "logo") fd.append("side", target.side);
    else fd.append("playerId", target.playerId);
    const res = await run(() => apiFetch<{ message: string }>("/api/admin/upload", { method: "POST", body: fd }), (r) => r.message);
    if (res) setFile(null);
    setBusy(false);
  }

  async function remove() {
    if (!window.confirm(`حذف ${label}؟`)) return;
    setBusy(true);
    await run(() => apiFetch<{ message: string }>("/api/admin/upload", { method: "DELETE", json: target }), (r) => r.message);
    setBusy(false);
  }

  return (
    <div className="flex items-center gap-3">
      <div
        className="relative shrink-0 overflow-hidden rounded-full border border-white/15 bg-night-900"
        style={{ width: size, height: size }}
      >
        {preview && !previewFailed ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="معاينة" className="h-full w-full object-cover" onError={() => setPreviewFailed(true)} />
        ) : preview && previewFailed ? (
          <div className="flex h-full w-full items-center justify-center p-1 text-center text-[10px] text-white/70">
            HEIC جاهز للرفع
          </div>
        ) : current ? (
          <Image src={current} alt={label} fill sizes={`${size * 2}px`} className="object-cover" />
        ) : (
          fallback
        )}
        {busy && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60">
            <span className="h-6 w-6 animate-spin rounded-full border-2 border-white/30 border-t-white" />
          </div>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        <input ref={inputRef} type="file" accept={ACCEPT} onChange={pick} className="hidden" />
        {file ? (
          <>
            <button type="button" className="btn-primary px-3 py-2 text-sm" onClick={upload} disabled={busy}>
              ⬆️ رفع
            </button>
            <button type="button" className="btn-ghost px-3 py-2 text-sm" onClick={() => setFile(null)} disabled={busy}>
              إلغاء
            </button>
          </>
        ) : (
          <>
            <button type="button" className="btn-ghost px-3 py-2 text-sm" onClick={() => inputRef.current?.click()} disabled={busy}>
              📷 {current ? "استبدال" : "اختيار صورة"}
            </button>
            {current && (
              <button type="button" className="btn px-3 py-2 text-sm text-red-300 hover:bg-red-500/10" onClick={remove} disabled={busy}>
                🗑️ حذف
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
