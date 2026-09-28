import type { Metadata } from "next";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = {
  title: "دخول المشرف",
  robots: { index: false, follow: false },
};

export default function AdminLoginPage() {
  return (
    <main className="flex min-h-dvh items-center justify-center px-4 py-10">
      <LoginForm />
    </main>
  );
}
