"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, ChevronDown, ChevronUp, Trash2, MessageCircle } from "lucide-react";
import PageHeader from "./PageHeader";
import ConfirmModal from "./ConfirmModal";
import { useToast } from "@/lib/toast-context";

type OrderItem = {
  id: string;
  productName: string;
  quantity: number;
  price: number;
};

type Order = {
  id: string;
  customer: string;
  email: string | null;
  phone: string;
  total: number;
  status: string;
  items: OrderItem[];
  createdAt: string | Date;
};

const STATUS_OPTIONS = ["pendiente", "confirmado", "enviado", "entregado", "cancelado"];

const STATUS_STYLES: Record<string, string> = {
  pendiente: "bg-amber-100 text-amber-700",
  confirmado: "bg-blue-100 text-blue-700",
  enviado: "bg-purple-100 text-purple-700",
  entregado: "bg-green/15 text-green-dark",
  cancelado: "bg-red-100 text-red-600",
};

export default function PedidosListClient({ orders: initialOrders }: { orders: Order[] }) {
  const router = useRouter();
  const { showToast } = useToast();
  const [orders, setOrders] = useState(initialOrders);
  const [statusFilter, setStatusFilter] = useState("Todos");
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [toDelete, setToDelete] = useState<Order | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);

  const filtered =
    statusFilter === "Todos" ? orders : orders.filter((o) => o.status === statusFilter);

  function toggleExpand(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function changeStatus(order: Order, status: string) {
    setUpdating(order.id);
    const res = await fetch(`/api/admin/orders/${order.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    const data = await res.json();
    setUpdating(null);

    if (res.ok) {
      setOrders((prev) => prev.map((o) => (o.id === order.id ? { ...o, status } : o)));
      showToast("Estado actualizado", "success");
      router.refresh();
    } else {
      showToast(data.error || "No se pudo actualizar el estado", "error");
    }
  }

  async function handleDelete() {
    if (!toDelete) return;
    const res = await fetch(`/api/admin/orders/${toDelete.id}`, { method: "DELETE" });
    const deletedId = toDelete.id;
    setToDelete(null);

    if (res.ok) {
      setOrders((prev) => prev.filter((o) => o.id !== deletedId));
      showToast("Pedido eliminado y stock devuelto", "success");
      router.refresh();
    } else {
      const data = await res.json().catch(() => ({}));
      showToast(data.error || "No se pudo eliminar el pedido", "error");
    }
  }

  return (
    <div>
      <PageHeader
        title="Pedidos"
        meta={`${orders.length} pedido${orders.length === 1 ? "" : "s"} registrado${orders.length === 1 ? "" : "s"}`}
        action={
          <Link
            href="/admin/ventas"
            className="flex items-center gap-1.5 bg-green hover:bg-green-dark text-white font-semibold text-sm px-4 py-2.5 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            Nueva venta
          </Link>
        }
      />

      <div className="flex gap-2 flex-wrap mb-4">
        {["Todos", ...STATUS_OPTIONS].map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`text-xs font-medium px-3 py-1.5 rounded-full capitalize transition-colors ${
              statusFilter === s
                ? "bg-brown-dark text-cream"
                : "bg-panel-surface text-panel-ink-soft border border-panel-border hover:bg-panel-bg"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="text-sm text-panel-ink-soft text-center py-10">
          No hay pedidos {statusFilter !== "Todos" ? `en estado "${statusFilter}"` : "todavía"}.
        </p>
      ) : (
        <div className="space-y-3">
          {filtered.map((order) => {
            const isOpen = expanded.has(order.id);
            return (
              <div
                key={order.id}
                className="bg-panel-surface border border-panel-border rounded-xl overflow-hidden"
              >
                <button
                  onClick={() => toggleExpand(order.id)}
                  className="w-full flex items-center justify-between gap-3 p-4 text-left"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-panel-ink truncate">
                      {order.customer}
                    </p>
                    <p className="text-xs text-panel-ink-soft">
                      {new Date(order.createdAt).toLocaleDateString("es", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}{" "}
                      · {order.items.length} producto{order.items.length === 1 ? "" : "s"}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span
                      className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${STATUS_STYLES[order.status] || "bg-panel-bg text-panel-ink-soft"}`}
                    >
                      {order.status}
                    </span>
                    <span className="text-sm font-bold text-brown-dark">
                      Bs. {order.total.toFixed(2)}
                    </span>
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 text-panel-ink-soft" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-panel-ink-soft" />
                    )}
                  </div>
                </button>

                {isOpen && (
                  <div className="border-t border-panel-border p-4 space-y-3">
                    <div className="space-y-1.5">
                      {order.items.map((item) => (
                        <div key={item.id} className="flex justify-between text-sm">
                          <span className="text-panel-ink">
                            {item.quantity}x {item.productName}
                          </span>
                          <span className="text-panel-ink-soft">
                            Bs. {(item.price * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-panel-border">
                      <div className="flex items-center gap-2">
                        <a
                          href={`https://wa.me/${order.phone.replace(/\D/g, "")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 text-xs text-panel-ink-soft hover:text-panel-ink"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          {order.phone}
                        </a>
                      </div>

                      <div className="flex items-center gap-2">
                        <select
                          value={order.status}
                          disabled={updating === order.id}
                          onChange={(e) => changeStatus(order, e.target.value)}
                          className="text-xs font-medium border border-panel-border rounded-lg px-2.5 py-1.5 bg-panel-bg text-panel-ink capitalize focus:outline-none focus:ring-2 focus:ring-brown-dark/30"
                        >
                          {STATUS_OPTIONS.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                        <button
                          onClick={() => setToDelete(order)}
                          className="text-red-400 hover:text-red-500"
                          aria-label="Eliminar pedido"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <ConfirmModal
        open={!!toDelete}
        title="Eliminar pedido"
        message={`Se eliminará el pedido de "${toDelete?.customer}" y se devolverá el stock de sus productos.`}
        confirmLabel="Eliminar"
        onConfirm={handleDelete}
        onCancel={() => setToDelete(null)}
      />
    </div>
  );
}
