"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Plus, Minus, Trash2, ImageOff, ShoppingCart, UserCheck } from "lucide-react";
import PageHeader from "./PageHeader";
import { useToast } from "@/lib/toast-context";

const CLOUD_NAME = "dkq95jus0";

type ProductOption = {
  id: string;
  name: string;
  price: number;
  promoPrice: number | null;
  isPromo: boolean;
  stock: number;
  images: string[];
};

type CartLine = {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  maxStock: number;
};

type ClienteMatch = {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  orderCount: number;
  lastOrderAt: string | null;
};

export default function VentaForm({ products }: { products: ProductOption[] }) {
  const router = useRouter();
  const { showToast } = useToast();

  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<CartLine[]>([]);
  const [customer, setCustomer] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [clienteMatch, setClienteMatch] = useState<ClienteMatch | null>(null);
  const [checkingPhone, setCheckingPhone] = useState(false);

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const total = useMemo(
    () => cart.reduce((sum, line) => sum + line.price * line.quantity, 0),
    [cart]
  );

  async function handlePhoneBlur() {
    const cleaned = phone.trim();
    if (!/^\d{6,15}$/.test(cleaned)) {
      setClienteMatch(null);
      return;
    }
    setCheckingPhone(true);
    try {
      const res = await fetch(`/api/admin/clientes/lookup?phone=${cleaned}`, {
        cache: "no-store",
      });
      const data = await res.json();
      if (data.found) {
        setClienteMatch({
          id: data.cliente.id,
          name: data.cliente.name,
          phone: data.cliente.phone,
          email: data.cliente.email,
          orderCount: data.orderCount,
          lastOrderAt: data.lastOrderAt,
        });
        setCustomer(data.cliente.name);
        setEmail(data.cliente.email || "");
      } else {
        setClienteMatch(null);
      }
    } catch {
      setClienteMatch(null);
    } finally {
      setCheckingPhone(false);
    }
  }

  function addToCart(product: ProductOption) {
    const price = product.isPromo && product.promoPrice ? product.promoPrice : product.price;
    setCart((prev) => {
      const existing = prev.find((l) => l.productId === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) return prev;
        return prev.map((l) =>
          l.productId === product.id ? { ...l, quantity: l.quantity + 1 } : l
        );
      }
      return [
        ...prev,
        { productId: product.id, name: product.name, price, quantity: 1, maxStock: product.stock },
      ];
    });
  }

  function changeQty(productId: string, delta: number) {
    setCart((prev) =>
      prev
        .map((l) => {
          if (l.productId !== productId) return l;
          const next = l.quantity + delta;
          if (next <= 0) return null;
          if (next > l.maxStock) return l;
          return { ...l, quantity: next };
        })
        .filter((l): l is CartLine => l !== null)
    );
  }

  function removeLine(productId: string) {
    setCart((prev) => prev.filter((l) => l.productId !== productId));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (cart.length === 0) {
      setError("Agrega al menos un producto al carrito");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer,
          phone,
          email: email || undefined,
          items: cart.map((l) => ({ productId: l.productId, quantity: l.quantity })),
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "No se pudo registrar la venta");
        setSubmitting(false);
        return;
      }

      showToast("Venta registrada correctamente", "success");
      router.push("/admin/pedidos");
      router.refresh();
    } catch (err) {
      setError("Error de conexión");
      setSubmitting(false);
    }
  }

  return (
    <div>
      <PageHeader title="Nueva venta" meta="Registra un pedido y descuenta el stock automáticamente" />

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Selector de productos */}
        <div className="bg-panel-surface border border-panel-border rounded-xl p-4">
          <div className="relative mb-4">
            <Search className="w-4 h-4 text-panel-ink-soft absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar producto..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-panel-border bg-panel-bg text-sm text-panel-ink focus:outline-none focus:ring-2 focus:ring-brown-dark/30"
            />
          </div>

          <div className="space-y-2 max-h-[420px] overflow-y-auto">
            {filtered.length === 0 && (
              <p className="text-sm text-panel-ink-soft text-center py-6">
                No hay productos con stock disponible.
              </p>
            )}
            {filtered.map((p) => {
              const price = p.isPromo && p.promoPrice ? p.promoPrice : p.price;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => addToCart(p)}
                  className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-panel-bg transition-colors text-left"
                >
                  <div className="w-11 h-11 rounded-lg bg-panel-bg flex items-center justify-center overflow-hidden shrink-0">
                    {p.images[0] ? (
                      <img
                        src={`https://res.cloudinary.com/${CLOUD_NAME}/image/upload/w_80,h_80,c_fill/${p.images[0]}`}
                        alt={p.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <ImageOff className="w-4 h-4 text-panel-ink-soft" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-panel-ink truncate">{p.name}</p>
                    <p className="text-xs text-panel-ink-soft">
                      Bs. {price.toFixed(2)} · Stock: {p.stock}
                    </p>
                  </div>
                  <Plus className="w-4 h-4 text-brown-dark shrink-0" />
                </button>
              );
            })}
          </div>
        </div>

        {/* Carrito + datos del cliente */}
        <div className="space-y-4">
          <div className="bg-panel-surface border border-panel-border rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <ShoppingCart className="w-4 h-4 text-brown-dark" />
              <h3 className="font-semibold text-panel-ink text-sm">
                Carrito ({cart.length})
              </h3>
            </div>

            {cart.length === 0 ? (
              <p className="text-sm text-panel-ink-soft text-center py-6">
                Toca un producto de la izquierda para agregarlo.
              </p>
            ) : (
              <div className="space-y-2">
                {cart.map((line) => (
                  <div
                    key={line.productId}
                    className="flex items-center gap-2 border-b border-panel-border pb-2 last:border-0"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-panel-ink truncate">{line.name}</p>
                      <p className="text-xs text-panel-ink-soft">Bs. {line.price.toFixed(2)} c/u</p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => changeQty(line.productId, -1)}
                        className="w-6 h-6 flex items-center justify-center rounded-full bg-panel-bg hover:bg-panel-border text-panel-ink"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-sm font-medium text-panel-ink w-5 text-center">
                        {line.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => changeQty(line.productId, 1)}
                        disabled={line.quantity >= line.maxStock}
                        className="w-6 h-6 flex items-center justify-center rounded-full bg-panel-bg hover:bg-panel-border text-panel-ink disabled:opacity-30"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                    <p className="text-sm font-semibold text-panel-ink w-16 text-right">
                      Bs. {(line.price * line.quantity).toFixed(2)}
                    </p>
                    <button
                      type="button"
                      onClick={() => removeLine(line.productId)}
                      className="text-red-400 hover:text-red-500"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}

                <div className="flex items-center justify-between pt-2">
                  <span className="text-sm font-semibold text-panel-ink">Total</span>
                  <span className="text-lg font-bold text-brown-dark">Bs. {total.toFixed(2)}</span>
                </div>
              </div>
            )}
          </div>

          <form
            onSubmit={handleSubmit}
            className="bg-panel-surface border border-panel-border rounded-xl p-4 space-y-3"
          >
            <h3 className="font-semibold text-panel-ink text-sm mb-1">Datos del cliente</h3>

            <div>
              <label className="text-xs text-panel-ink-soft block mb-1">WhatsApp *</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  if (clienteMatch) setClienteMatch(null);
                }}
                onBlur={handlePhoneBlur}
                required
                placeholder="70123456"
                className="w-full px-3 py-2.5 rounded-lg border border-panel-border bg-panel-bg text-sm text-panel-ink focus:outline-none focus:ring-2 focus:ring-brown-dark/30"
              />
              {checkingPhone && (
                <p className="text-xs text-panel-ink-soft mt-1">Buscando cliente...</p>
              )}
            </div>

            {clienteMatch && (
              <div className="flex items-start gap-2 bg-green/10 border border-green/30 rounded-lg px-3 py-2">
                <UserCheck className="w-4 h-4 text-green-dark shrink-0 mt-0.5" />
                <div className="text-xs text-panel-ink">
                  <p className="font-semibold">Cliente existente: {clienteMatch.name}</p>
                  <p className="text-panel-ink-soft">
                    {clienteMatch.orderCount} compra{clienteMatch.orderCount === 1 ? "" : "s"} anterior
                    {clienteMatch.orderCount === 1 ? "" : "es"}
                    {clienteMatch.lastOrderAt &&
                      ` · última: ${new Date(clienteMatch.lastOrderAt).toLocaleDateString("es-BO")}`}
                  </p>
                </div>
              </div>
            )}

            <div>
              <label className="text-xs text-panel-ink-soft block mb-1">Nombre *</label>
              <input
                type="text"
                value={customer}
                onChange={(e) => setCustomer(e.target.value)}
                required
                className="w-full px-3 py-2.5 rounded-lg border border-panel-border bg-panel-bg text-sm text-panel-ink focus:outline-none focus:ring-2 focus:ring-brown-dark/30"
              />
            </div>
            <div>
              <label className="text-xs text-panel-ink-soft block mb-1">Email (opcional)</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-panel-border bg-panel-bg text-sm text-panel-ink focus:outline-none focus:ring-2 focus:ring-brown-dark/30"
              />
            </div>

            <button
              type="submit"
              disabled={submitting || cart.length === 0}
              className="w-full bg-green hover:bg-green-dark disabled:opacity-50 text-white font-semibold text-sm py-3 rounded-lg transition-colors"
            >
              {submitting ? "Registrando..." : "Registrar venta"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
