import { z } from "zod";
import { GASTO_CATEGORIES } from "@/lib/types";

export const gastoSchema = z.object({
  concept: z
    .string()
    .trim()
    .min(1, "El concepto es obligatorio")
    .min(3, "Describe un poco más el concepto"),
  category: z
    .string()
    .min(1, "Selecciona una categoría")
    .refine((v) => (GASTO_CATEGORIES as readonly string[]).includes(v), "Categoría inválida"),
  amount: z
    .string()
    .trim()
    .min(1, "El monto es obligatorio")
    .refine((v) => !isNaN(Number(v)), "El monto debe ser un número")
    .refine((v) => Number(v) > 0, "El monto debe ser mayor a 0"),
  date: z.string().min(1, "La fecha es obligatoria"),
  notes: z.string().trim().optional().or(z.literal("")),
});

export type GastoFormValues = z.infer<typeof gastoSchema>;
