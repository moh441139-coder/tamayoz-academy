import type { Metadata, Viewport } from "next";
import "@fontsource/tajawal/400.css";
import "@fontsource/tajawal/500.css";
import "@fontsource/tajawal/700.css";
import "@fontsource/tajawal/800.css";
import "@fontsource/tajawal/900.css";
import "./globals.css";
import { StadiumBackground } from "@/components/StadiumBackground";
import { ServiceWorker } from "@/components/ServiceWorker";
import { SITE_DESCRIPTION, SITE_NAME, siteUrl } from "@/lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: {
    default: `${SITE_NAME} | أكاديمية التميز 🆚 رحب`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: ["أكاديمية التميز", "رحب", "مباراة", "كرة قدم", "قرطبة", "الرحاب", "توقع النتيجة", "رجل المباراة"],
  authors: [{ name: "أكاديمية التميز" }],
  manifest: "/manifest.webmanifest",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "ar_SA",
    siteName: SITE_NAME,
    title: "أكاديمية التميز 🆚 رحب",
    description: SITE_DESCRIPTION,
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: "أكاديمية التميز 🆚 رحب",
    description: SITE_DESCRIPTION,
  },
  appleWebApp: {
    capable: true,
    title: SITE_NAME,
    statusBarStyle: "black-translucent",
  },
  formatDetection: { telephone: false },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#0A1414",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  colorScheme: "dark",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <body className="font-sans antialiased">
        <StadiumBackground />
        {children}
        <ServiceWorker />
      </body>
    </html>
  );
}
