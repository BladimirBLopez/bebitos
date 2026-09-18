"use client";

import { useEffect, useMemo, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import {
  AlertTriangle,
  Boxes,
  CheckCircle2,
  Minus,
  PackageX,
  Plus,
  Save,
  Search,
  X,
} from "lucide-react";

import PageHeader from "@/components/PageHeader";
import { useToast } from "@/lib/toast-context";

type InventoryProduct = {
  id: string;
  name: string;
  category: string;
  stock: number;
  lowStockThreshold: number;
  inStock: boolean;
};

export default function AdminInventarioPage() {
  const { showToast } = useToast();

  const [products, setProducts] = useState<InventoryProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [selectedProduct, setSelectedProduct] =
    useState<InventoryProduct | null>(null);

  const [stockValue, setStockValue] = useState(0);
  const [threshold, setThreshold] = useState(5);

  async function fetchProducts() {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/admin/products", {
        cache: "no-store",
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Error al leer los productos");
        return;
      }

      setProducts(Array.isArray(data) ? data : []);
    } catch {
      setError("No se pudo conectar con el servidor");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchProducts();
  }, []);

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return products;

    return products.filter(
      (product) =>
        product.name.toLowerCase().includes(query) ||
        product.category.toLowerCase().includes(query)
    );
  }, [products, search]);

  const summary = useMemo(() => {
    const total = products.length;

    const outOfStock = products.filter(
      (product) => product.stock <= 0
    ).length;

    const lowStock = products.filter(
      (product) =>
        product.stock > 0 &&
        product.stock <= (product.lowStockThreshold ?? 5)
    ).length;

    const available = products.filter(
      (product) =>
        product.stock > 0 && product.inStock
    ).length;

    return {
      total,
      available,
      lowStock,
      outOfStock,
    };
  }, [products]);

  function openStockModal(product: InventoryProduct) {
    setSelectedProduct(product);
    setStockValue(product.stock);
    setThreshold(product.lowStockThreshold ?? 5);
    setError("");
    setShowModal(true);
  }

  async function handleUpdateStock(e: React.FormEvent) {
    e.preventDefault();

    if (!selectedProduct || saving) return;

    if (!Number.isInteger(stockValue) || stockValue < 0) {
      setError("El stock debe ser un número entero mayor o igual a 0");
      return;
    }

    if (!Number.isInteger(threshold) || threshold < 0) {
      setError("El stock mínimo debe ser un número entero mayor o igual a 0");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const res = await fetch(
        `/api/admin/products/${selectedProduct.id}/stock`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            stock: stockValue,
            lowStockThreshold: threshold,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Error al actualizar el stock");
        return;
      }

      setProducts((current) =>
        current.map((product) =>
          product.id === selectedProduct.id
            ? {
                ...product,
                stock: data.stock,
                lowStockThreshold: data.lowStockThreshold,
                inStock: data.inStock,
              }
            : product
        )
      );

      setShowModal(false);
      setSelectedProduct(null);

      showToast("Inventario actualizado", "success");
    } catch {
      setError("No se pudo conectar con el servidor");
    } finally {
      setSaving(false);
    }
  }

  function getStatus(product: InventoryProduct) {
    if (product.stock <= 0) {
      return {
        label: "Agotado",
        className: "bg-red-50 text-red-600",
      };
    }

    if (!product.inStock) {
      return {
        label: "Pausado",
        className: "bg-panel-bg text-panel-ink-soft",
      };
    }

    if (
      product.stock <= (product.lowStockThreshold ?? 5)
    ) {
      return {
        label: "Stock bajo",
        className: "bg-amber-soft text-amber",
      };
    }

    return {
      label: "Disponible",
      className: "bg-green-soft text-green-dark",
    };
  }

  return (
    <div>
      <PageHeader
        title="Inventario"
        meta="Controla existencias y alertas de stock"
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        <div className="bg-panel-surface border border-panel-border rounded-xl p-4">
          <div className="flex items-center gap-2 text-panel-ink-soft">
            <Boxes className="w-4 h-4" />
            <span className="text-xs">Productos</span>
          </div>
          <p className="text-2xl font-bold text-panel-ink mt-2">
            {summary.total}
          </p>
        </div>

        <div className="bg-panel-surface border border-panel-border rounded-xl p-4">
          <div className="flex items-center gap-2 text-green-dark">
            <CheckCircle2 className="w-4 h-4" />
            <span className="text-xs">Disponibles</span>
          </div>
          <p className="text-2xl font-bold text-panel-ink mt-2">
            {summary.available}
          </p>
        </div>

        <div className="bg-panel-surface border border-panel-border rounded-xl p-4">
          <div className="flex items-center gap-2 text-amber">
            <AlertTriangle className="w-4 h-4" />
            <span className="text-xs">Stock bajo</span>
          </div>
          <p className="text-2xl font-bold text-panel-ink mt-2">
            {summary.lowStock}
          </p>
        </div>

        <div className="bg-panel-surface border border-panel-border rounded-xl p-4">
          <div className="flex items-center gap-2 text-red-500">
            <PackageX className="w-4 h-4" />
            <span className="text-xs">Agotados</span>
          </div>
          <p className="text-2xl font-bold text-panel-ink mt-2">
            {summary.outOfStock}
          </p>
        </div>
      </div>

      <div className="relative mb-4">
        <Search className="w-4 h-4 text-panel-ink-soft absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por producto o categoría..."
          className="w-full bg-panel-surface border border-panel-border rounded-xl pl-9 pr-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brown-dark/20 focus:border-brown-dark/40"
        />
      </div>

      {error && !showModal && (
        <p className="text-red-600 bg-red-50 border border-red-100 p-3 rounded-xl mb-4 text-sm">
          {error}
        </p>
      )}

      {loading ? (
        <p className="text-panel-ink-soft text-sm">
          Cargando inventario...
        </p>
      ) : filteredProducts.length === 0 ? (
        <div className="bg-panel-surface border border-panel-border rounded-xl p-8 text-center">
          <Boxes className="w-8 h-8 mx-auto text-panel-ink-soft/40 mb-2" />
          <p className="text-sm text-panel-ink-soft">
            No se encontraron productos.
          </p>
        </div>
      ) : (
        <div className="bg-panel-surface border border-panel-border rounded-xl overflow-hidden">
          <div className="hidden md:grid grid-cols-[minmax(0,1fr)_140px_130px_120px] gap-4 px-4 py-3 bg-panel-bg border-b border-panel-border text-[11px] uppercase tracking-wide font-semibold text-panel-ink-soft">
            <span>Producto</span>
            <span>Estado</span>
            <span>Inventario</span>
            <span className="text-right">Acción</span>
          </div>

          {filteredProducts.map((product) => {
            const status = getStatus(product);

            return (
              <div
                key={product.id}
                className="grid md:grid-cols-[minmax(0,1fr)_140px_130px_120px] gap-3 md:gap-4 items-center px-4 py-4 border-b border-panel-border last:border-b-0 hover:bg-panel-bg/40 transition-colors"
              >
                <div className="min-w-0">
                  <p className="font-semibold text-panel-ink truncate">
                    {product.name}
                  </p>
                  <p className="text-xs text-panel-ink-soft mt-0.5">
                    {product.category}
                  </p>
                </div>

                <div>
                  <span
                    className={`inline-flex px-2.5 py-1 rounded-full text-[11px] font-semibold ${status.className}`}
                  >
                    {status.label}
                  </span>
                </div>

                <div>
                  <p className="text-sm font-bold text-panel-ink">
                    {product.stock} unidades
                  </p>
                  <p className="text-[11px] text-panel-ink-soft">
                    Alerta: {product.lowStockThreshold ?? 5}
                  </p>
                </div>

                <div className="md:text-right">
                  <button
                    type="button"
                    onClick={() => openStockModal(product)}
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-brown-dark border border-panel-border bg-panel-surface hover:bg-panel-bg px-3 py-2 rounded-lg transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Ajustar
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Dialog.Root
        open={showModal}
        onOpenChange={(open) => {
          if (saving) return;

          setShowModal(open);

          if (!open) {
            setSelectedProduct(null);
            setError("");
          }
        }}
      >
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />

          <Dialog.Content className="fixed z-[51] left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100%-2rem)] max-w-md bg-panel-surface rounded-2xl border border-panel-border p-6 focus:outline-none shadow-xl">
            <form onSubmit={handleUpdateStock}>
              <div className="flex items-start justify-between gap-4 mb-5">
                <div>
                  <Dialog.Title className="text-lg font-bold text-panel-ink">
                    Ajustar inventario
                  </Dialog.Title>

                  <Dialog.Description className="text-sm text-panel-ink-soft mt-1">
                    {selectedProduct?.name}
                  </Dialog.Description>
                </div>

                <Dialog.Close asChild>
                  <button
                    type="button"
                    disabled={saving}
                    className="text-panel-ink-soft hover:text-panel-ink disabled:opacity-50"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </Dialog.Close>
              </div>

              {error && (
                <p className="text-red-600 bg-red-50 border border-red-100 p-3 rounded-xl mb-4 text-sm">
                  {error}
                </p>
              )}

              <div className="space-y-5">
                <div>
                  <label className="text-xs font-semibold text-panel-ink block mb-1.5">
                    Stock actual
                  </label>

                  <input
                    type="number"
                    min={0}
                    step={1}
                    value={stockValue}
                    onChange={(e) =>
                      setStockValue(
                        Math.max(0, Number.parseInt(e.target.value || "0", 10))
                      )
                    }
                    className="w-full border border-panel-border rounded-xl px-3 py-2.5 bg-panel-bg text-panel-ink focus:outline-none focus:ring-2 focus:ring-brown-dark/20 focus:border-brown-dark/40"
                  />

                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <button
                      type="button"
                      onClick={() =>
                        setStockValue((current) =>
                          Math.max(0, current - 1)
                        )
                      }
                      className="flex items-center justify-center gap-1.5 text-sm font-medium text-panel-ink bg-panel-bg border border-panel-border p-2.5 rounded-xl"
                    >
                      <Minus className="w-4 h-4" />
                      Restar 1
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setStockValue((current) => current + 1)
                      }
                      className="flex items-center justify-center gap-1.5 text-sm font-medium text-panel-ink bg-panel-bg border border-panel-border p-2.5 rounded-xl"
                    >
                      <Plus className="w-4 h-4" />
                      Sumar 1
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-panel-ink block mb-1.5">
                    Alerta de stock bajo
                  </label>

                  <input
                    type="number"
                    min={0}
                    step={1}
                    value={threshold}
                    onChange={(e) =>
                      setThreshold(
                        Math.max(0, Number.parseInt(e.target.value || "0", 10))
                      )
                    }
                    className="w-full border border-panel-border rounded-xl px-3 py-2.5 bg-panel-bg text-panel-ink focus:outline-none focus:ring-2 focus:ring-brown-dark/20 focus:border-brown-dark/40"
                  />

                  <p className="text-[11px] text-panel-ink-soft mt-1.5">
                    Se marcará como stock bajo cuando llegue a esta cantidad o menos.
                  </p>
                </div>
              </div>

              <button
                type="submit"
                disabled={saving || !selectedProduct}
                className="w-full mt-5 flex items-center justify-center gap-2 bg-green hover:bg-green-dark text-white font-semibold py-3 rounded-xl disabled:opacity-60 transition-colors"
              >
                <Save className="w-4 h-4" />
                {saving ? "Guardando..." : "Guardar inventario"}
              </button>
            </form>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
