import { z } from "zod";

export const clienteSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "El nombre es obligatorio")
    .min(2, "El nombre es muy corto"),
  phone: z
    .string()
    .trim()
    .min(1, "El WhatsApp es obligatorio")
    .regex(/^\d{6,15}$/, "Solo números, sin espacios ni +591 (ej. 70123456)"),
  email: z
    .string()
    .trim()
    .email("Email inválido")
    .optional()
    .or(z.literal("")),
  address: z.string().trim().optional().or(z.literal("")),
  notes: z.string().trim().optional().or(z.literal("")),
});

export type ClienteFormValues = z.infer<typeof clienteSchema>;
