import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteUrl();
  return ["", "/players", "/formation", "/prediction", "/vote", "/winners", "/qr"].map((p) => ({
    url: `${base}${p}`,
    changeFrequency: "hourly",
    priority: p === "" ? 1 : 0.7,
  }));
}
