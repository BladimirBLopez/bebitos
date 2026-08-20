"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { Product } from "./types";

export type CartItem = {
  productId: string;
  slug: string;
  name: string;
  price: number;
  color?: string;
  qty: number;
};

type CartContextType = {
  items: CartItem[];
  addItem: (product: Product, color?: string) => void;
  removeItem: (productId: string, color?: string) => void;
  updateQty: (productId: string, color: string | undefined, qty: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
};

const CartContext = createContext<CartContextType | null>(null);

const STORAGE_KEY = "bebitos_cart";
const EXPIRY_MS = 48 * 60 * 60 * 1000; // 48 horas sin actividad

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // formato nuevo: { items, savedAt }. Si esta vencido, se descarta.
        if (parsed && Array.isArray(parsed.items)) {
          const isExpired = Date.now() - (parsed.savedAt || 0) > EXPIRY_MS;
          setItems(isExpired ? [] : parsed.items);
        } else if (Array.isArray(parsed)) {
          // formato viejo (solo array), lo migramos sin expirar esta vez
          setItems(parsed);
        }
      } catch {
        setItems([]);
      }
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ items, savedAt: Date.now() })
      );
    }
  }, [items, loaded]);

  function addItem(product: Product, color?: string) {
    setItems((prev) => {
      const existing = prev.find(
        (i) => i.productId === product.id && i.color === color
      );
      if (existing) {
        return prev.map((i) =>
          i.productId === product.id && i.color === color
            ? { ...i, qty: i.qty + 1 }
            : i
        );
      }
      return [
        ...prev,
        {
          productId: product.id,
          slug: product.slug,
          name: product.name,
          price: product.price,
          color,
          qty: 1,
        },
      ];
    });
  }

  function removeItem(productId: string, color?: string) {
    setItems((prev) =>
      prev.filter((i) => !(i.productId === productId && i.color === color))
    );
  }

  function updateQty(productId: string, color: string | undefined, qty: number) {
    if (qty <= 0) {
      removeItem(productId, color);
      return;
    }
    setItems((prev) =>
      prev.map((i) =>
        i.productId === productId && i.color === color ? { ...i, qty } : i
      )
    );
  }

  function clearCart() {
    setItems([]);
  }

  const totalItems = items.reduce((sum, i) => sum + i.qty, 0);
  const totalPrice = items.reduce((sum, i) => sum + i.qty * i.price, 0);

  return (
    <CartContext.Provider
      value={{ items, addItem, removeItem, updateQty, clearCart, totalItems, totalPrice }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart debe usarse dentro de CartProvider");
  return ctx;
}
