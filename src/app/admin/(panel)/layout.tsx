import AdminSidebar from "@/components/AdminSidebar";
import { ToastProvider } from "@/lib/toast-context";

export default function AdminPanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ToastProvider>
      <div className="min-h-screen bg-cream flex flex-col sm:flex-row">
        <AdminSidebar />
        <main className="flex-1 px-4 sm:px-8 py-6 sm:py-8 max-w-5xl">
          {children}
        </main>
      </div>
    </ToastProvider>
  );
}
