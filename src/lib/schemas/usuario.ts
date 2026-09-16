import { z } from "zod";

export const USER_ROLES = ["ADMIN", "EDITOR", "VIEWER"] as const;

export function usuarioSchema(isEditing: boolean) {
  return z.object({
    name: z
      .string()
      .trim()
      .min(1, "El nombre es obligatorio")
      .min(2, "El nombre es muy corto"),
    email: z
      .string()
      .trim()
      .min(1, "El email es obligatorio")
      .email("Email inválido"),
    password: isEditing
      ? z
          .string()
          .optional()
          .or(z.literal(""))
          .refine((v) => !v || v.length >= 6, "Mínimo 6 caracteres")
      : z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
    role: z.enum(USER_ROLES, { error: "Selecciona un rol" }),
  });
}

export type UsuarioFormValues = z.infer<ReturnType<typeof usuarioSchema>>;
