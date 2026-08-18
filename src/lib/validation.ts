export function validateProduct(data: unknown): { valid: boolean; error?: string } {
  if (!data || typeof data !== "object") {
    return { valid: false, error: "Datos inválidos" };
  }
  const d = data as Record<string, unknown>;

  if (!d.name || typeof d.name !== "string" || !d.name.trim()) {
    return { valid: false, error: "El nombre es requerido" };
  }
  if (d.name.length > 200) {
    return { valid: false, error: "El nombre es demasiado largo" };
  }
  if (!d.slug || typeof d.slug !== "string" || !d.slug.trim()) {
    return { valid: false, error: "El slug es requerido" };
  }
  if (!d.description || typeof d.description !== "string") {
    return { valid: false, error: "La descripción es requerida" };
  }
  if (!d.category || typeof d.category !== "string") {
    return { valid: false, error: "La categoría es requerida" };
  }
  const price = Number(d.price);
  if (isNaN(price) || price <= 0) {
    return { valid: false, error: "El precio debe ser un número mayor a 0" };
  }
  if (price > 1000000) {
    return { valid: false, error: "El precio parece incorrecto" };
  }
  if (d.isPromo) {
    const promoPrice = Number(d.promoPrice);
    if (isNaN(promoPrice) || promoPrice <= 0) {
      return { valid: false, error: "El precio de oferta debe ser un número mayor a 0" };
    }
    if (promoPrice >= price) {
      return { valid: false, error: "El precio de oferta debe ser menor al precio normal" };
    }
  }
  if (!Array.isArray(d.features)) {
    return { valid: false, error: "Formato de características inválido" };
  }
  if (!Array.isArray(d.colors)) {
    return { valid: false, error: "Formato de colores inválido" };
  }
  if (!Array.isArray(d.images)) {
    return { valid: false, error: "Formato de imágenes inválido" };
  }

  return { valid: true };
}

export function validateSettings(data: unknown): { valid: boolean; error?: string } {
  if (!data || typeof data !== "object") {
    return { valid: false, error: "Datos inválidos" };
  }
  const d = data as Record<string, unknown>;

  if (!d.whatsapp || typeof d.whatsapp !== "string" || !/^\d{6,15}$/.test(d.whatsapp.trim())) {
    return { valid: false, error: "El número de WhatsApp debe tener solo dígitos (6-15)" };
  }
  const urlFields = ["mapsUrl", "instagramUrl", "facebookUrl", "tiktokUrl"];
  for (const field of urlFields) {
    const value = d[field];
    if (value && typeof value === "string" && value.trim() !== "") {
      try {
        new URL(value);
      } catch {
        return { valid: false, error: `El link de ${field} no es una URL válida` };
      }
    }
  }

  return { valid: true };
}

export function validateCategoryName(name: unknown): { valid: boolean; error?: string } {
  if (!name || typeof name !== "string" || !name.trim()) {
    return { valid: false, error: "El nombre es requerido" };
  }
  if (name.trim().length > 50) {
    return { valid: false, error: "El nombre es demasiado largo" };
  }
  return { valid: true };
}
