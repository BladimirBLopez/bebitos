export type Role = "ADMIN" | "EDITOR" | "VIEWER";

// ADMIN y EDITOR pueden crear/editar contenido operativo.
export function canWrite(role: Role): boolean {
  return role === "ADMIN" || role === "EDITOR";
}

// Solo ADMIN puede borrar.
export function canDelete(role: Role): boolean {
  return role === "ADMIN";
}

// Secciones sensibles: solo ADMIN puede verlas.
export const ADMIN_ONLY_SECTIONS = ["contabilidad", "usuarios", "configuracion"] as const;

export function canAccessSection(role: Role, section: string): boolean {
  if (role === "ADMIN") return true;
  return !ADMIN_ONLY_SECTIONS.includes(section as (typeof ADMIN_ONLY_SECTIONS)[number]);
}
