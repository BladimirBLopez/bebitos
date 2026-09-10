export type ProductColor = {
  name: string;
  hex: string;
};

export type Product = {
  id: string;
  slug: string;
  name: string;
  description: string;
  features: string[];
  price: number;
  originalPrice?: number;
  isNew?: boolean;
  inStock?: boolean;
  category: string;
  colors: ProductColor[];
  images: string[]; // Cloudinary public_ids
};

export const GASTO_CATEGORIES = [
  "Insumos",
  "Transporte",
  "Sueldos",
  "Marketing",
  "Alquiler",
  "Servicios",
  "Otros",
];
