import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { requireAdminOnly } from "@/lib/permissions";

export default async function ConfiguracionLayout({
  children,
}: {
  children: ReactNode;
}) {
  const user = await requireAdminOnly();

  if (!user) {
    redirect("/admin");
  }

  return children;
}
