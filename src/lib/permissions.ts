import { getCurrentUser } from "@/lib/auth";
import { canWrite, canDelete, type Role } from "@/lib/roles";

export type { Role };

export async function requireAdminOnly() {
  const user = await getCurrentUser();
  if (!user || !user.active) return null;
  if ((user.role as Role) !== "ADMIN") return null;
  return user;
}

export async function requireWriteAccess() {
  const user = await getCurrentUser();
  if (!user || !user.active) return null;
  if (!canWrite(user.role as Role)) return null;
  return user;
}

export async function requireDeleteAccess() {
  const user = await getCurrentUser();
  if (!user || !user.active) return null;
  if (!canDelete(user.role as Role)) return null;
  return user;
}
