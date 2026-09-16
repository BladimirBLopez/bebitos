import { z } from "zod";

export const categoriaSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "El nombre es obligatorio")
    .min(2, "El nombre es muy corto")
    .max(40, "El nombre es muy largo"),
});

export type CategoriaFormValues = z.infer<typeof categoriaSchema>;
