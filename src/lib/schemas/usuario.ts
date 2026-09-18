import { z } from "zod";

export const USER_ROLES = [
  "ADMIN",
  "EDITOR",
  "VIEWER",
] as const;

export type UserRole =
  (typeof USER_ROLES)[number];

export const ROLE_LABELS: Record<
  UserRole,
  string
> = {
  ADMIN: "Administrador",
  EDITOR: "Editor",
  VIEWER: "Solo lectura",
};

export const ROLE_DESCRIPTIONS: Record<
  UserRole,
  string
> = {
  ADMIN:
    "Acceso completo al sistema, usuarios, configuración y contabilidad.",
  EDITOR:
    "Puede crear y editar contenido operativo, pero no administrar áreas sensibles.",
  VIEWER:
    "Puede consultar información sin realizar modificaciones.",
};

export function usuarioSchema(
  isEditing: boolean
) {
  return z.object({
    name: z
      .string()
      .trim()
      .min(
        2,
        "El nombre debe tener al menos 2 caracteres"
      )
      .max(
        120,
        "El nombre es demasiado largo"
      ),

    email: z
      .string()
      .trim()
      .toLowerCase()
      .min(
        1,
        "El email es obligatorio"
      )
      .email("Email inválido")
      .max(
        254,
        "El email es demasiado largo"
      ),

    password: isEditing
      ? z
          .string()
          .max(
            128,
            "La contraseña es demasiado larga"
          )
          .optional()
          .or(z.literal(""))
          .refine(
            (value) =>
              !value ||
              value.length >= 8,
            "La contraseña debe tener al menos 8 caracteres"
          )
      : z
          .string()
          .min(
            8,
            "La contraseña debe tener al menos 8 caracteres"
          )
          .max(
            128,
            "La contraseña es demasiado larga"
          ),

    role: z.enum(USER_ROLES, {
      error:
        "Selecciona un rol válido",
    }),

    active: z.boolean(),
  });
}

export type UsuarioFormValues =
  z.infer<
    ReturnType<
      typeof usuarioSchema
    >
  >;
