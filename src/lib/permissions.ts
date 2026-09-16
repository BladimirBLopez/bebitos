import { getCurrentUser } from "@/lib/auth";

export type Role = "ADMIN" | "EDITOR" | "VIEWER";

// Solo ADMIN puede entrar. Úsalo en Contabilidad, Usuarios y Configuración
// (zonas sensibles: dinero, cuentas de usuario y ajustes generales).
export async function requireAdminOnly() {
  const user = await getCurrentUser();
  if (!user || !user.active) return null;
  if (user.role !== "ADMIN") return null;
  return user;
}

// ADMIN o EDITOR pueden crear/editar. Úsalo en POST/PUT de módulos
// operativos (productos, pedidos, ventas, clientes, leads, inventario).
export async function requireWriteAccess() {
  const user = await getCurrentUser();
  if (!user || !user.active) return null;
  if (user.role !== "ADMIN" && user.role !== "EDITOR") return null;
  return user;
}

// Solo ADMIN puede borrar. Úsalo en DELETE de módulos operativos.
export async function requireDeleteAccess() {
  const user = await getCurrentUser();
  if (!user || !user.active) return null;
  if (user.role !== "ADMIN") return null;
  return user;
}
