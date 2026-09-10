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

const BABY_AGE_OPTIONS = ["Estoy en embarazo", "0-3 meses", "4-6 meses", "7-12 meses", "+1 año"];

export function validateLead(data: unknown): { valid: boolean; error?: string } {
  if (!data || typeof data !== "object") {
    return { valid: false, error: "Datos inválidos" };
  }
  const d = data as Record<string, unknown>;

  if (!d.name || typeof d.name !== "string" || !d.name.trim()) {
    return { valid: false, error: "El nombre es requerido" };
  }
  if (d.name.length > 120) {
    return { valid: false, error: "El nombre es demasiado largo" };
  }
  if (!d.whatsapp || typeof d.whatsapp !== "string" || !/^\d{6,15}$/.test(d.whatsapp.trim())) {
    return { valid: false, error: "El número de WhatsApp debe tener solo dígitos (6-15)" };
  }
  if (!d.babyAge || typeof d.babyAge !== "string" || !BABY_AGE_OPTIONS.includes(d.babyAge)) {
    return { valid: false, error: "Selecciona la edad de tu bebé" };
  }

  return { valid: true };
}

export function validateGiftResource(data: unknown): { valid: boolean; error?: string } {
  if (!data || typeof data !== "object") {
    return { valid: false, error: "Datos inválidos" };
  }
  const d = data as Record<string, unknown>;

  if (!d.label || typeof d.label !== "string" || !d.label.trim()) {
    return { valid: false, error: "El nombre del recurso es requerido" };
  }
  if (d.label.length > 100) {
    return { valid: false, error: "El nombre es demasiado largo" };
  }
  if (!d.image || typeof d.image !== "string" || !d.image.trim()) {
    return { valid: false, error: "Falta la imagen del recurso" };
  }

  return { valid: true };
}

export function validateOrder(data: unknown): { valid: boolean; error?: string } {
  if (!data || typeof data !== "object") {
    return { valid: false, error: "Datos inválidos" };
  }
  const d = data as Record<string, unknown>;

  if (!d.customer || typeof d.customer !== "string" || !d.customer.trim()) {
    return { valid: false, error: "El nombre del cliente es requerido" };
  }
  if (d.customer.length > 150) {
    return { valid: false, error: "El nombre del cliente es demasiado largo" };
  }
  if (!d.phone || typeof d.phone !== "string" || !/^\d{6,15}$/.test(d.phone.trim())) {
    return { valid: false, error: "El WhatsApp debe tener solo dígitos (6-15)" };
  }
  if (d.email && typeof d.email === "string" && d.email.trim() !== "") {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email.trim())) {
      return { valid: false, error: "El email no es válido" };
    }
  }
  if (!Array.isArray(d.items) || d.items.length === 0) {
    return { valid: false, error: "Agrega al menos un producto" };
  }
  for (const item of d.items) {
    if (!item || typeof item !== "object") {
      return { valid: false, error: "Formato de producto inválido" };
    }
    const it = item as Record<string, unknown>;
    if (!it.productId || typeof it.productId !== "string") {
      return { valid: false, error: "Falta el producto" };
    }
    const qty = Number(it.quantity);
    if (isNaN(qty) || qty <= 0 || !Number.isInteger(qty)) {
      return { valid: false, error: "La cantidad debe ser un entero mayor a 0" };
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

export function validateCliente(data: unknown): { valid: boolean; error?: string } {
  if (!data || typeof data !== "object") {
    return { valid: false, error: "Datos inválidos" };
  }
  const d = data as Record<string, unknown>;

  if (!d.name || typeof d.name !== "string" || !d.name.trim()) {
    return { valid: false, error: "El nombre es requerido" };
  }
  if (d.name.length > 150) {
    return { valid: false, error: "El nombre es demasiado largo" };
  }
  if (!d.phone || typeof d.phone !== "string" || !/^\d{6,15}$/.test(d.phone.trim())) {
    return { valid: false, error: "El WhatsApp debe tener solo dígitos (6-15)" };
  }
  if (d.email && typeof d.email === "string" && d.email.trim() !== "") {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email.trim())) {
      return { valid: false, error: "El email no es válido" };
    }
  }
  if (d.address && typeof d.address !== "string") {
    return { valid: false, error: "Formato de dirección inválido" };
  }
  if (d.notes && typeof d.notes !== "string") {
    return { valid: false, error: "Formato de notas inválido" };
  }

  return { valid: true };
}
