import { Product } from "./types";

export const products: Product[] = [
  {
    id: "1",
    slug: "chupon-frutero-silicona",
    name: "Chupón Frutero de Silicona",
    description: "Ideal para que tu bebé explore nuevos sabores de frutas y verduras de forma segura, sin riesgo de atragantamiento.",
    features: ["Silicona 100% segura", "Facil de limpiar", "Apto para Baby Led Weaning"],
    price: 35,
    category: "Alimentacion",
    colors: [
      { name: "Verde", hex: "#85BF35" },
      { name: "Rosado", hex: "#F5A3C7" },
    ],
    images: [],
  },
  {
    id: "2",
    slug: "set-3-cucharitas-silicona",
    name: "Set de 3 Cucharitas de Silicona",
    description: "Ideales para Baby Led Weaning, con mango ergonomico y punta suave para las encias de tu bebe.",
    features: ["Set de 3 unidades", "Colores variados", "Silicona libre de BPA"],
    price: 45,
    category: "Alimentacion",
    colors: [
      { name: "Verde", hex: "#85BF35" },
      { name: "Rosado", hex: "#F5A3C7" },
      { name: "Beige", hex: "#E8D4B8" },
    ],
    images: [],
  },
];
