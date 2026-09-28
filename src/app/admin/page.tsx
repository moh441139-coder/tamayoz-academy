import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { getAdminState } from "@/lib/admin-state";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/session";
import { AdminDashboard } from "@/components/admin/AdminDashboard";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "لوحة المشرف",
  robots: { index: false, follow: false },
};

export default async function AdminPage() {
  // تحقق إضافي بجانب Middleware
  if (!(await verifySessionToken(cookies().get(SESSION_COOKIE)?.value))) redirect("/admin/login");
  const state = await getAdminState();
  return <AdminDashboard initial={state} />;
}
