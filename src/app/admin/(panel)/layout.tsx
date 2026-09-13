import type { ReactNode } from "react";
import type { Metadata, Viewport } from "next";
import { redirect } from "next/navigation";
import AdminSidebar from "@/components/AdminSidebar";
import PwaRegister from "@/components/PwaRegister";
import { ToastProvider } from "@/lib/toast-context";
import { requireAuth } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Bebitos Admin",
  manifest: "/admin-manifest.json",
  appleWebApp: {
    capable: true,
    title: "Bebitos Admin",
    statusBarStyle: "default",
  },
  icons: {
    apple:
      "https://res.cloudinary.com/dkq95jus0/image/upload/w_180,h_180,c_pad,b_white/v1787086146/Dise%C3%B1o_sin_t%C3%ADtulo_8_ccrkbc.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#6B4226",
};

export default async function AdminPanelLayout({
  children,
}: {
  children: ReactNode;
}) {
  // Verificar sesión
  const user = await requireAuth();

  if (!user) {
    redirect("/admin/login");
  }

  return (
    <ToastProvider>
      <PwaRegister />
      <div className="admin-panel min-h-screen bg-panel-bg flex flex-col sm:flex-row">
        <AdminSidebar />
        <main className="flex-1 px-4 sm:px-8 py-6 sm:py-8 max-w-5xl pb-32">
          {children}
        </main>
      </div>
    </ToastProvider>
  );
}
