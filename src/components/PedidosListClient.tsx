"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, ChevronDown, ChevronUp, Trash2, MessageCircle } from "lucide-react";
import PageHeader from "./PageHeader";
import ConfirmModal from "./ConfirmModal";
import AnularModal from "./AnularModal";
import { useToast } from "@/lib/toast-context";
import { useCurrentUser } from "@/lib/user-context";
import { canDelete, canWrite } from "@/lib/roles";

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
  origin: string;
  anulado: boolean;
  anuladoEn: string | Date | null;
  motivoAnulacion: string | null;
  items: OrderItem[];
  createdAt: string | Date;
};

const STATUS_OPTIONS = ["pendiente", "confirmado", "enviado", "entregado", "cancelado"];

const STATUS_STYLES: Record<string, string> = {
  pendiente: "bg-amber-soft text-amber",
  confirmado: "bg-brown-soft text-brown-dark",
  enviado: "bg-ink-soft-bg text-ink",
  entregado: "bg-green-soft text-green-dark",
  cancelado: "bg-red-soft text-red",
};

const ORIGIN_LABELS: Record<string, string> = {
  manual: "🏪 Venta directa",
  online: "🌐 Pedido online",
};

const ORIGIN_STYLES: Record<string, string> = {
  manual: "bg-panel-bg text-panel-ink-soft",
  online: "bg-panel-bg text-panel-ink-soft",
};

type Action = { label: string; status: string; variant: "primary" | "secondary" | "danger" };

const NEXT_ACTIONS: Record<string, Action[]> = {
  pendiente: [
    { label: "Confirmar pedido", status: "confirmado", variant: "primary" },
    { label: "Cancelar", status: "cancelado", variant: "danger" },
  ],
  confirmado: [
    { label: "Marcar enviado", status: "enviado", variant: "primary" },
    { label: "Marcar entregado", status: "entregado", variant: "secondary" },
    { label: "Cancelar", status: "cancelado", variant: "danger" },
  ],
  enviado: [
    { label: "Marcar entregado", status: "entregado", variant: "primary" },
    { label: "Cancelar", status: "cancelado", variant: "danger" },
  ],
  entregado: [],
  cancelado: [{ label: "Reactivar pedido", status: "pendiente", variant: "primary" }],
};

const VARIANT_STYLES: Record<string, string> = {
  primary: "bg-green hover:bg-green-dark text-white",
  secondary: "bg-brown-soft hover:opacity-80 text-brown-dark",
  danger: "text-red hover:opacity-70 bg-transparent px-2",
};

export default function PedidosListClient({ orders: initialOrders }: { orders: Order[] }) {
  const router = useRouter();
  const { showToast } = useToast();
  const { role } = useCurrentUser();
  const canRemove = canDelete(role);
  const canEdit = canWrite(role);
  const [orders, setOrders] = useState(initialOrders);
  const [statusFilter, setStatusFilter] = useState("Todos");
  const [originFilter, setOriginFilter] = useState("Todos");
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [toDelete, setToDelete] = useState<Order | null>(null);
  const [toAnular, setToAnular] = useState<Order | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 20;

  const manualCount = orders.filter((o) => o.origin === "manual").length;
  const onlineCount = orders.filter((o) => o.origin === "online").length;

  const filtered = orders.filter((o) => {
    const matchesStatus = statusFilter === "Todos" || o.status === statusFilter;
    const matchesOrigin = originFilter === "Todos" || o.origin === originFilter;
    const q = search.trim().toLowerCase();
    const matchesSearch =
      q === "" || o.customer.toLowerCase().includes(q) || o.phone.includes(q);
    return matchesStatus && matchesOrigin && matchesSearch;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

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

  async function handleAnular(motivo: string) {
    if (!toAnular) return;
    const id = toAnular.id;
    const res = await fetch(`/api/admin/orders/${id}/anular`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ motivo }),
    });
    const data = await res.json();
    setToAnular(null);

    if (res.ok) {
      setOrders((prev) =>
        prev.map((o) =>
          o.id === id
            ? { ...o, anulado: true, anuladoEn: data.anuladoEn, motivoAnulacion: data.motivoAnulacion }
            : o
        )
      );
      showToast("Anulado y stock devuelto", "success");
      router.refresh();
    } else {
      showToast(data.error || "No se pudo anular", "error");
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
        meta={`${orders.length} pedido${orders.length === 1 ? "" : "s"} · ${manualCount} en tienda, ${onlineCount} online`}
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

      <div className="relative mb-3">
        <input
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          placeholder="Buscar por cliente o teléfono..."
          className="w-full bg-panel-surface border border-panel-border rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-brown-dark/40"
        />
      </div>

      <div className="flex gap-2 flex-wrap mb-2">
        {[
          { value: "Todos", label: "Todos" },
          { value: "manual", label: "🏪 En tienda" },
          { value: "online", label: "🌐 Online" },
        ].map((o) => (
          <button
            key={o.value}
            onClick={() => {
              setOriginFilter(o.value);
              setPage(1);
            }}
            className={`text-xs font-medium px-3 py-1.5 rounded-full transition-colors ${
              originFilter === o.value
                ? "bg-panel-ink text-white"
                : "bg-panel-surface text-panel-ink-soft border border-panel-border hover:bg-panel-bg"
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>

      <div className="flex gap-2 flex-wrap mb-4">
        {["Todos", ...STATUS_OPTIONS].map((s) => (
          <button
            key={s}
            onClick={() => {
              setStatusFilter(s);
              setPage(1);
            }}
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
          {paginated.map((order) => {
            const isOpen = expanded.has(order.id);
            const actions = NEXT_ACTIONS[order.status] || [];
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
                    <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
                      <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${ORIGIN_STYLES[order.origin] || "bg-panel-bg text-panel-ink-soft"}`}>
                        {ORIGIN_LABELS[order.origin] || order.origin}
                      </span>
                      <p className="text-xs text-panel-ink-soft">
                        {new Date(order.createdAt).toLocaleDateString("es", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}{" "}
                        · {order.items.length} producto{order.items.length === 1 ? "" : "s"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span
                      className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${STATUS_STYLES[order.status] || "bg-panel-bg text-panel-ink-soft"}`}
                    >
                      {order.status}
                    </span>
                    {order.anulado && (
                      <span className="text-[10px] font-semibold bg-red-100 text-red-600 px-2 py-1 rounded-full">
                        Anulado
                      </span>
                    )}
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

                    {order.anulado && (
                      <div className="bg-red-50 border border-red-100 rounded-lg px-3 py-2 text-xs text-red-600">
                        <p className="font-semibold">
                          Anulado el{" "}
                          {order.anuladoEn &&
                            new Date(order.anuladoEn).toLocaleDateString("es-BO", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })}
                        </p>
                        {order.motivoAnulacion && <p className="mt-0.5">{order.motivoAnulacion}</p>}
                      </div>
                    )}

                    <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-panel-border">
                      <a
                        href={`https://wa.me/${order.phone.replace(/\D/g, "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-xs text-panel-ink-soft hover:text-panel-ink"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        {order.phone}
                      </a>

                      <div className="flex items-center gap-2 flex-wrap justify-end">
                        {actions.length === 0 && order.status !== "entregado" && (
                          <span className="text-xs text-panel-ink-soft italic">
                            Pedido cerrado
                          </span>
                        )}
                        {order.status === "entregado" &&
                          (order.anulado ? (
                            <span className="text-xs text-red-500 italic">Ya anulado</span>
                          ) : canEdit ? (
                            <button
                              onClick={() => setToAnular(order)}
                              className="text-xs font-semibold text-red-500 hover:text-red-600 px-2 py-1.5"
                            >
                              Anular
                            </button>
                          ) : (
                            <span className="text-xs text-panel-ink-soft italic">Entregado</span>
                          ))}
                        {actions.map((action) => (
                          <button
                            key={action.status}
                            disabled={updating === order.id}
                            onClick={() => changeStatus(order, action.status)}
                            className={`text-xs font-semibold py-1.5 rounded-lg transition-colors disabled:opacity-50 ${
                              action.variant === "danger" ? "" : "px-3"
                            } ${VARIANT_STYLES[action.variant]}`}
                          >
                            {action.label}
                          </button>
                        ))}
                        {canRemove && (
                          <button
                            onClick={() => setToDelete(order)}
                            className="text-red-400 hover:text-red-500"
                            aria-label="Eliminar pedido"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 mt-4">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="text-sm font-medium px-3 py-1.5 rounded-lg border border-panel-border text-panel-ink-soft disabled:opacity-40"
          >
            Anterior
          </button>
          <span className="text-sm text-panel-ink-soft">
            Página {currentPage} de {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="text-sm font-medium px-3 py-1.5 rounded-lg border border-panel-border text-panel-ink-soft disabled:opacity-40"
          >
            Siguiente
          </button>
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

      <AnularModal
        open={!!toAnular}
        orderLabel={toAnular?.customer || ""}
        onConfirm={handleAnular}
        onCancel={() => setToAnular(null)}
      />
    </div>
  );
}
