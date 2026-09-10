import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import AdminSidebar from "@/components/AdminSidebar";
import { ToastProvider } from "@/lib/toast-context";
import { requireAuth } from "@/lib/auth";

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
      <div className="admin-panel min-h-screen bg-panel-bg flex flex-col sm:flex-row">
        <AdminSidebar />
        <main className="flex-1 px-4 sm:px-8 py-6 sm:py-8 max-w-5xl pb-32">
          {children}
        </main>
      </div>
    </ToastProvider>
  );
}
