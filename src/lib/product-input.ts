export type ProductColorInput = {
  name: string;
  hex: string;
};

export type ParsedProductInput = {
  slug: string;
  name: string;
  description: string;
  features: string[];
  price: number;
  cost: number | null;
  category: string;
  colors: ProductColorInput[];
  images: string[];
  inStock: boolean;
  isPromo: boolean;
  promoPrice: number | null;
  isNew: boolean;
  barcode: string | null;
};

type ParseResult<T> =
  | { ok: true; value: T }
  | { ok: false; error: string };

export function parseProductInput(
  data: unknown
): ParseResult<ParsedProductInput> {
  if (!data || typeof data !== "object") {
    return { ok: false, error: "Datos inválidos" };
  }

  const d = data as Record<string, unknown>;

  const name =
    typeof d.name === "string" ? d.name.trim() : "";

  if (!name) {
    return { ok: false, error: "El nombre es requerido" };
  }

  if (name.length > 200) {
    return { ok: false, error: "El nombre es demasiado largo" };
  }

  const slug =
    typeof d.slug === "string" ? d.slug.trim() : "";

  if (!slug) {
    return { ok: false, error: "El slug es requerido" };
  }

  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    return {
      ok: false,
      error: "El identificador del producto no es válido",
    };
  }

  const description =
    typeof d.description === "string"
      ? d.description.trim()
      : "";

  if (!description) {
    return {
      ok: false,
      error: "La descripción es requerida",
    };
  }

  const category =
    typeof d.category === "string"
      ? d.category.trim()
      : "";

  if (!category) {
    return {
      ok: false,
      error: "La categoría es requerida",
    };
  }

  const price = Number(d.price);

  if (
    !Number.isFinite(price) ||
    price <= 0 ||
    price > 1_000_000
  ) {
    return {
      ok: false,
      error: "El precio debe ser un número mayor a 0",
    };
  }

  let cost: number | null = null;

  if (
    d.cost !== undefined &&
    d.cost !== null &&
    d.cost !== ""
  ) {
    const parsedCost = Number(d.cost);

    if (
      !Number.isFinite(parsedCost) ||
      parsedCost < 0 ||
      parsedCost > 1_000_000
    ) {
      return {
        ok: false,
        error: "El costo no es válido",
      };
    }

    cost = parsedCost;
  }

  if (!Array.isArray(d.features)) {
    return {
      ok: false,
      error: "Formato de características inválido",
    };
  }

  const features = d.features
    .filter(
      (item): item is string =>
        typeof item === "string"
    )
    .map((item) => item.trim())
    .filter(Boolean);

  if (features.length > 30) {
    return {
      ok: false,
      error: "Demasiadas características",
    };
  }

  if (!Array.isArray(d.colors)) {
    return {
      ok: false,
      error: "Formato de colores inválido",
    };
  }

  const colors: ProductColorInput[] = [];

  for (const raw of d.colors) {
    if (!raw || typeof raw !== "object") {
      return {
        ok: false,
        error: "Hay un color con formato inválido",
      };
    }

    const color = raw as Record<string, unknown>;

    const colorName =
      typeof color.name === "string"
        ? color.name.trim()
        : "";

    const colorHex =
      typeof color.hex === "string"
        ? color.hex.trim()
        : "";

    if (!colorName) {
      return {
        ok: false,
        error: "Hay un color sin nombre",
      };
    }

    if (!/^#[0-9a-fA-F]{6}$/.test(colorHex)) {
      return {
        ok: false,
        error: `El color "${colorName}" no tiene un código válido`,
      };
    }

    colors.push({
      name: colorName,
      hex: colorHex,
    });
  }

  if (colors.length > 30) {
    return {
      ok: false,
      error: "Demasiados colores",
    };
  }

  if (!Array.isArray(d.images)) {
    return {
      ok: false,
      error: "Formato de imágenes inválido",
    };
  }

  const images = d.images
    .filter(
      (item): item is string =>
        typeof item === "string"
    )
    .map((item) => item.trim())
    .filter(Boolean);

  if (images.length > 20) {
    return {
      ok: false,
      error: "Puedes guardar como máximo 20 imágenes",
    };
  }

  const isPromo = d.isPromo === true;
  const isNew = d.isNew === true;
  const inStock = d.inStock === true;

  let promoPrice: number | null = null;

  if (isPromo) {
    const parsedPromoPrice = Number(d.promoPrice);

    if (
      !Number.isFinite(parsedPromoPrice) ||
      parsedPromoPrice <= 0
    ) {
      return {
        ok: false,
        error:
          "El precio de oferta debe ser mayor a 0",
      };
    }

    if (parsedPromoPrice >= price) {
      return {
        ok: false,
        error:
          "El precio de oferta debe ser menor al precio normal",
      };
    }

    promoPrice = parsedPromoPrice;
  }

  let barcode: string | null = null;

  if (
    d.barcode !== undefined &&
    d.barcode !== null &&
    d.barcode !== ""
  ) {
    if (typeof d.barcode !== "string") {
      return {
        ok: false,
        error: "El código de barras no es válido",
      };
    }

    const cleanBarcode = d.barcode.trim();

    if (
      cleanBarcode.length < 3 ||
      cleanBarcode.length > 50
    ) {
      return {
        ok: false,
        error:
          "El código de barras debe tener entre 3 y 50 caracteres",
      };
    }

    barcode = cleanBarcode;
  }

  return {
    ok: true,
    value: {
      slug,
      name,
      description,
      features,
      price,
      cost,
      category,
      colors,
      images,
      inStock,
      isPromo,
      promoPrice,
      isNew,
      barcode,
    },
  };
}

export function parseInventoryInput(
  data: unknown
): ParseResult<{
  stock: number;
  lowStockThreshold: number;
}> {
  if (!data || typeof data !== "object") {
    return { ok: false, error: "Datos inválidos" };
  }

  const d = data as Record<string, unknown>;

  const stock = Number(d.stock ?? 0);
  const lowStockThreshold = Number(
    d.lowStockThreshold ?? 5
  );

  if (
    !Number.isInteger(stock) ||
    stock < 0 ||
    stock > 1_000_000
  ) {
    return {
      ok: false,
      error:
        "El stock debe ser un número entero mayor o igual a 0",
    };
  }

  if (
    !Number.isInteger(lowStockThreshold) ||
    lowStockThreshold < 0 ||
    lowStockThreshold > 1_000_000
  ) {
    return {
      ok: false,
      error:
        "El stock mínimo debe ser un número entero mayor o igual a 0",
    };
  }

  return {
    ok: true,
    value: {
      stock,
      lowStockThreshold,
    },
  };
}
