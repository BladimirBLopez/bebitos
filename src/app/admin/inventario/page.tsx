"use client";

import { useState, useEffect } from "react";
import { Box, Plus, Minus, AlertTriangle, X, Save } from "lucide-react";
import PageHeader from "@/components/PageHeader";

export default function AdminInventarioPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [stockToAdd, setStockToAdd] = useState(0);

  async function fetchProducts() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/products", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (res.ok) {
        setProducts(data);
      } else {
        setError(data.error || "Error al leer los productos");
      }
    } catch (err) {
      setError("Error interno");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchProducts();
  }, []);

  async function handleUpdateStock(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    try {
      const res = await fetch(`/api/admin/products/${selectedProduct.id}/stock`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stock: stockToAdd }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Error al hacer de stock");
        return;
      }
      setShowModal(false);
      fetchProducts();
    } catch (err) {
      setError("Error interno");
    }
  }

  return (
    <div>
      <PageHeader
        title="Inventario"
        meta="Gestiona el stock de tus productos"
        action={
          <div className="flex gap-2">
            <button
              onClick={() => {
                setSelectedProduct(null);
                setShowModal(true);
              }}
              className="flex items-center gap-2 bg-brown-dark hover:bg-ink text-cream text-sm font-medium px-4 py-2 rounded-lg transition-colors"
            >
              <Box className="w-4 h-4" />
              Gestionar Stock
            </button>
          </div>
        }
      />

      {error && <p className="text-red-600 bg-red-50 p-2 rounded mb-4">{error}</p>}

      <div className="grid gap-4">
        {loading ? (
          <p className="text-panel-ink-soft">Loading...</p>
        ) : (
          <>
            {products.map((product) => (
              <div key={product.id} className="bg-panel-surface rounded-xl border border-panel-border p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <p className="font-sans font-bold text-panel-ink">{product.name}</p>
                  <p className="text-sm text-panel-ink-soft">{product.category}</p>
                </div>
                <div className="flex items-center gap-4">
                  <p className={`font-bold ${product.inStock ? "text-green-600" : "text-red-600"}`}>
                    {product.stock} en stock
                  </p>
                  <button
                    onClick={() => {
                      setSelectedProduct(product);
                      setStockToAdd(0);
                      setShowModal(true);
                    }}
                    className="flex items-center gap-1 text-sm text-blue-600 hover:bg-blue-50 p-2 rounded"
                  >
                    <Plus className="w-4 h-4" />
                    Actualizar
                  </button>
                </div>
              </div>
            ))}
          </>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <form onSubmit={handleUpdateStock} className="w-full max-w-md bg-white rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">Gestionar Stock</h2>
              <button type="button" onClick={() => setShowModal(false)} className="text-gray-500">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <p className="text-sm text-gray-600">{selectedProduct?.name}</p>
              <div className="relative">
                <input
                  type="number"
                  value={stockToAdd}
                  onChange={(e) => setStockToAdd(parseInt(e.target.value))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  placeholder="Nuevo stock"
                />
                <div className="flex gap-2 mt-2">
                  <button
                    type="button"
                    onClick={() => setStockToAdd((prev) => prev - 1)}
                    className="flex items-center gap-1 text-sm text-gray-600 bg-gray-100 p-2 rounded"
                  >
                    <Minus className="w-4 h-4" />
                    Reducir
                  </button>
                  <button
                    type="button"
                    onClick={() => setStockToAdd((prev) => prev + 1)}
                    className="flex items-center gap-1 text-sm text-gray-600 bg-gray-100 p-2 rounded"
                  >
                    <Plus className="w-4 h-4" />
                    Aumentar
                  </button>
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full mt-4 bg-brown-dark hover:bg-ink text-cream font-semibold py-2.5 rounded-lg"
            >
              <Save className="w-4 h-4 inline mr-2" />
              Actualizar
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
