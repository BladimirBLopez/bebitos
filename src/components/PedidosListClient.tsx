"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChevronDown,
  ChevronUp,
  MessageCircle,
  CreditCard,
  RotateCcw,
  UserPlus,
  Search,
  X,
} from "lucide-react";
import PageHeader from "./PageHeader";
import ConfirmModal from "./ConfirmModal";
import PaymentModal from "./PaymentModal";
import { useToast } from "@/lib/toast-context";
import { useCurrentUser } from "@/lib/user-context";
import { canWrite } from "@/lib/roles";

type OrderItem = {
  id: string;
  productName: string;
  color: string | null;
  quantity: number;
  price: number;
};

type Order = {
  id: string;
  operationNumber: number;
  customer: string;
  email: string | null;
  phone: string;
  clienteId: string | null;
  total: number;
  status: string;
  origin: string;

  paymentMethod: string | null;
  paymentStatus: string;
  paidAt: string | Date | null;

  deliveredAt: string | Date | null;

  anulado: boolean;
  anuladoEn: string | Date | null;
  motivoAnulacion: string | null;

  items: OrderItem[];
  createdAt: string | Date;
};

const STATUS_OPTIONS = [
  "pendiente",
  "confirmado",
  "enviado",
  "entregado",
  "cancelado",
];

const STATUS_STYLES: Record<string, string> = {
  pendiente: "bg-amber-soft text-amber",
  confirmado: "bg-brown-soft text-brown-dark",
  enviado: "bg-ink-soft-bg text-ink",
  entregado: "bg-green-soft text-green-dark",
  cancelado: "bg-red-soft text-red",
};

const PAYMENT_STYLES: Record<string, string> = {
  pendiente: "bg-amber-soft text-amber",
  pagado: "bg-green-soft text-green-dark",
  reembolsado: "bg-red-soft text-red",
};

const PAYMENT_LABELS: Record<string, string> = {
  efectivo: "Efectivo",
  qr: "QR",
  transferencia: "Transferencia",
};

type Action = {
  label: string;
  status: string;
  variant: "primary" | "secondary" | "danger";
};

const NEXT_ACTIONS: Record<string, Action[]> = {
  pendiente: [
    {
      label: "Confirmar pedido",
      status: "confirmado",
      variant: "primary",
    },
    {
      label: "Cancelar",
      status: "cancelado",
      variant: "danger",
    },
  ],
  confirmado: [
    {
      label: "Marcar enviado",
      status: "enviado",
      variant: "primary",
    },
    {
      label: "Marcar entregado",
      status: "entregado",
      variant: "secondary",
    },
    {
      label: "Cancelar",
      status: "cancelado",
      variant: "danger",
    },
  ],
  enviado: [
    {
      label: "Marcar entregado",
      status: "entregado",
      variant: "primary",
    },
    {
      label: "Cancelar",
      status: "cancelado",
      variant: "danger",
    },
  ],
  entregado: [],
  cancelado: [
    {
      label: "Reactivar pedido",
      status: "pendiente",
      variant: "primary",
    },
  ],
};

const VARIANT_STYLES: Record<string, string> = {
  primary: "bg-green hover:bg-green-dark text-white px-3",
  secondary:
    "bg-brown-soft hover:opacity-80 text-brown-dark px-3",
  danger:
    "text-red hover:bg-red-50 bg-transparent px-2",
};

function operationLabel(number: number) {
  return `#${String(number).padStart(6, "0")}`;
}

function paymentMethodLabel(method: string | null) {
  if (!method) return "No registrado";
  return PAYMENT_LABELS[method] || method;
}

export default function PedidosListClient({
  orders: initialOrders,
}: {
  orders: Order[];
}) {
  const router = useRouter();
  const { showToast } = useToast();
  const { role } = useCurrentUser();
  const canEdit = canWrite(role);

  const [orders, setOrders] = useState(initialOrders);
  const [statusFilter, setStatusFilter] = useState("Todos");
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<Set<string>>(
    new Set()
  );

  const [updating, setUpdating] = useState<string | null>(
    null
  );

  const [toPay, setToPay] = useState<Order | null>(null);
  const [paymentSaving, setPaymentSaving] =
    useState(false);

  const [toRefund, setToRefund] =
    useState<Order | null>(null);

  const [toAssignCustomer, setToAssignCustomer] =
    useState<Order | null>(null);

  const [customerName, setCustomerName] =
    useState("");

  const [customerPhone, setCustomerPhone] =
    useState("");

  const [customerEmail, setCustomerEmail] =
    useState("");

  const [customerFound, setCustomerFound] =
    useState(false);

  const [customerChecking, setCustomerChecking] =
    useState(false);

  const [customerSaving, setCustomerSaving] =
    useState(false);

  const [customerError, setCustomerError] =
    useState("");

  const [page, setPage] = useState(1);
  const PAGE_SIZE = 20;

  const filtered = orders.filter((order) => {
    const matchesStatus =
      statusFilter === "Todos" ||
      order.status === statusFilter;

    const q = search.trim().toLowerCase();

    const operation = String(
      order.operationNumber
    ).padStart(6, "0");

    const matchesSearch =
      q === "" ||
      order.customer.toLowerCase().includes(q) ||
      order.phone.includes(q) ||
      operation.includes(q.replace("#", ""));

    return matchesStatus && matchesSearch;
  });

  const totalPages = Math.max(
    1,
    Math.ceil(filtered.length / PAGE_SIZE)
  );

  const currentPage = Math.min(page, totalPages);

  const paginated = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  function toggleExpand(id: string) {
    setExpanded((previous) => {
      const next = new Set(previous);

      if (next.has(id)) next.delete(id);
      else next.add(id);

      return next;
    });
  }

  async function changeStatus(
    order: Order,
    status: string
  ) {
    setUpdating(order.id);

    try {
      const res = await fetch(
        `/api/admin/orders/${order.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        showToast(
          data.error ||
            "No se pudo actualizar el estado",
          "error"
        );
        return;
      }

      setOrders((current) =>
        current.map((item) =>
          item.id === order.id
            ? {
                ...item,
                status: data.status,
                deliveredAt: data.deliveredAt,
                paymentStatus: data.paymentStatus,
                paymentMethod: data.paymentMethod,
                paidAt: data.paidAt,
              }
            : item
        )
      );

      showToast("Estado actualizado", "success");
      router.refresh();
    } catch {
      showToast("Error de conexión", "error");
    } finally {
      setUpdating(null);
    }
  }

  async function registerPayment(method: string) {
    if (!toPay) return;

    setPaymentSaving(true);

    try {
      const res = await fetch(
        `/api/admin/orders/${toPay.id}/payment`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            paymentStatus: "pagado",
            paymentMethod: method,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        showToast(
          data.error ||
            "No se pudo registrar el pago",
          "error"
        );
        return;
      }

      setOrders((current) =>
        current.map((order) =>
          order.id === toPay.id
            ? {
                ...order,
                paymentStatus: data.paymentStatus,
                paymentMethod: data.paymentMethod,
                paidAt: data.paidAt,
              }
            : order
        )
      );

      setToPay(null);
      showToast(
        "Pago registrado correctamente",
        "success"
      );
      router.refresh();
    } catch {
      showToast("Error de conexión", "error");
    } finally {
      setPaymentSaving(false);
    }
  }

  async function refundPayment() {
    if (!toRefund) return;

    const order = toRefund;
    setToRefund(null);

    try {
      const res = await fetch(
        `/api/admin/orders/${order.id}/payment`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            paymentStatus: "reembolsado",
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        showToast(
          data.error ||
            "No se pudo registrar el reembolso",
          "error"
        );
        return;
      }

      setOrders((current) =>
        current.map((item) =>
          item.id === order.id
            ? {
                ...item,
                paymentStatus: data.paymentStatus,
              }
            : item
        )
      );

      showToast(
        "Pago marcado como reembolsado",
        "success"
      );

      router.refresh();
    } catch {
      showToast("Error de conexión", "error");
    }
  }

  function openCustomerAssignment(order: Order) {
    setToAssignCustomer(order);
    setCustomerName(
      order.clienteId ? order.customer : ""
    );
    setCustomerPhone(
      order.clienteId ? order.phone : ""
    );
    setCustomerEmail(
      order.clienteId ? order.email || "" : ""
    );
    setCustomerFound(!!order.clienteId);
    setCustomerError("");
  }

  function closeCustomerAssignment() {
    if (customerSaving) return;

    setToAssignCustomer(null);
    setCustomerName("");
    setCustomerPhone("");
    setCustomerEmail("");
    setCustomerFound(false);
    setCustomerError("");
  }

  async function lookupCustomer() {
    const phone = customerPhone.trim();

    if (!/^\d{6,15}$/.test(phone)) {
      setCustomerError(
        "Ingresa un WhatsApp válido de 6 a 15 dígitos"
      );
      return;
    }

    setCustomerChecking(true);
    setCustomerError("");
    setCustomerFound(false);

    try {
      const res = await fetch(
        `/api/admin/clientes/lookup?phone=${phone}`,
        {
          cache: "no-store",
        }
      );

      const data = await res.json();

      if (!res.ok) {
        setCustomerError(
          data.error ||
            "No se pudo buscar el cliente"
        );
        return;
      }

      if (data.found) {
        setCustomerName(
          data.cliente.name || ""
        );
        setCustomerEmail(
          data.cliente.email || ""
        );
        setCustomerFound(true);
      } else {
        setCustomerFound(false);
        setCustomerName("");
        setCustomerEmail("");
      }
    } catch {
      setCustomerError(
        "Error de conexión al buscar el cliente"
      );
    } finally {
      setCustomerChecking(false);
    }
  }

  async function saveAssignedCustomer(
    event: React.FormEvent
  ) {
    event.preventDefault();

    if (!toAssignCustomer) return;

    const name = customerName.trim();
    const phone = customerPhone.trim();
    const email = customerEmail.trim();

    if (!name) {
      setCustomerError(
        "Escribe el nombre del cliente"
      );
      return;
    }

    if (!/^\d{6,15}$/.test(phone)) {
      setCustomerError(
        "Ingresa un WhatsApp válido de 6 a 15 dígitos"
      );
      return;
    }

    setCustomerSaving(true);
    setCustomerError("");

    try {
      const res = await fetch(
        `/api/admin/orders/${toAssignCustomer.id}/customer`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name,
            phone,
            email: email || undefined,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        setCustomerError(
          data.error ||
            "No se pudo asignar el cliente"
        );
        return;
      }

      setOrders((current) =>
        current.map((order) =>
          order.id === toAssignCustomer.id
            ? {
                ...order,
                customer: data.customer,
                phone: data.phone,
                email: data.email,
                clienteId: data.clienteId,
              }
            : order
        )
      );

      showToast(
        "Cliente asignado correctamente",
        "success"
      );

      closeCustomerAssignment();
      router.refresh();
    } catch {
      setCustomerError(
        "Error de conexión. Intenta nuevamente"
      );
    } finally {
      setCustomerSaving(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="Pedidos"
        meta={`${orders.length} pedido${
          orders.length === 1 ? "" : "s"
        } online · ${
          orders.filter(
            (order) =>
              order.status === "pendiente"
          ).length
        } pendiente${
          orders.filter(
            (order) =>
              order.status === "pendiente"
          ).length === 1
            ? ""
            : "s"
        }`}
      />

      <div className="relative mb-3">
        <input
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            setPage(1);
          }}
          placeholder="Buscar cliente, teléfono o Nº de pedido..."
          className="w-full bg-panel-surface border border-panel-border rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-brown-dark/40"
        />
      </div>

      <div className="flex gap-2 flex-wrap mb-4">
        {["Todos", ...STATUS_OPTIONS].map(
          (status) => (
            <button
              key={status}
              onClick={() => {
                setStatusFilter(status);
                setPage(1);
              }}
              className={`text-xs font-medium px-3 py-1.5 rounded-full capitalize transition-colors ${
                statusFilter === status
                  ? "bg-brown-dark text-cream"
                  : "bg-panel-surface text-panel-ink-soft border border-panel-border hover:bg-panel-bg"
              }`}
            >
              {status}
            </button>
          )
        )}
      </div>

      {filtered.length === 0 ? (
        <p className="text-sm text-panel-ink-soft text-center py-10">
          No hay pedidos con estos filtros.
        </p>
      ) : (
        <div className="space-y-3">
          {paginated.map((order) => {
            const isOpen = expanded.has(order.id);

            const actions =
              NEXT_ACTIONS[order.status] || [];

            return (
              <div
                key={order.id}
                className="bg-panel-surface border border-panel-border rounded-xl overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() =>
                    toggleExpand(order.id)
                  }
                  className="w-full flex items-center justify-between gap-3 p-4 text-left"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-bold text-panel-ink">
                        Pedido{" "}
                        {operationLabel(
                          order.operationNumber
                        )}
                      </p>

                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize ${
                          PAYMENT_STYLES[
                            order.paymentStatus
                          ] ||
                          "bg-panel-bg text-panel-ink-soft"
                        }`}
                      >
                        Pago {order.paymentStatus}
                      </span>
                    </div>

                    <p
                      className={`text-sm mt-1 truncate ${
                        order.clienteId
                          ? "text-panel-ink"
                          : "text-amber font-semibold"
                      }`}
                    >
                      {order.clienteId
                        ? order.customer
                        : "Sin cliente asignado"}
                    </p>

                    <p className="text-xs text-panel-ink-soft mt-0.5">
                      {new Date(
                        order.createdAt
                      ).toLocaleDateString("es-BO", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}{" "}
                      · {order.items.length} producto
                      {order.items.length === 1
                        ? ""
                        : "s"}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <span
                        className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${
                          STATUS_STYLES[
                            order.status
                          ] ||
                          "bg-panel-bg text-panel-ink-soft"
                        }`}
                      >
                        {order.status}
                      </span>

                      <p className="text-sm font-bold text-brown-dark mt-2">
                        Bs. {order.total.toFixed(2)}
                      </p>
                    </div>

                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 text-panel-ink-soft" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-panel-ink-soft" />
                    )}
                  </div>
                </button>

                {isOpen && (
                  <div className="border-t border-panel-border p-4 space-y-4">
                    {!order.clienteId &&
                      order.status === "pendiente" && (
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-amber-soft/60 border border-amber/20 rounded-xl px-4 py-3">
                          <div>
                            <p className="text-sm font-semibold text-panel-ink">
                              Cliente pendiente de asignación
                            </p>
                            <p className="text-xs text-panel-ink-soft mt-0.5">
                              Registra el nombre y WhatsApp antes de confirmar este pedido.
                            </p>
                          </div>

                          {canEdit && (
                            <button
                              type="button"
                              onClick={() =>
                                openCustomerAssignment(
                                  order
                                )
                              }
                              className="shrink-0 inline-flex items-center justify-center gap-1.5 bg-brown-dark hover:bg-ink text-cream text-xs font-semibold px-3 py-2 rounded-lg transition-colors"
                            >
                              <UserPlus className="w-3.5 h-3.5" />
                              Asignar cliente
                            </button>
                          )}
                        </div>
                      )}

                    <div className="grid sm:grid-cols-2 gap-3 text-xs">
                      <div>
                        <p className="text-panel-ink-soft">
                          Estado del pedido
                        </p>
                        <p className="font-semibold text-panel-ink capitalize">
                          {order.status}
                        </p>
                      </div>

                      <div>
                        <p className="text-panel-ink-soft">
                          Estado del pago
                        </p>

                        <p className="font-semibold text-panel-ink capitalize">
                          {order.paymentStatus}
                          {order.paymentMethod &&
                            ` · ${paymentMethodLabel(
                              order.paymentMethod
                            )}`}
                        </p>

                        {order.paidAt && (
                          <p className="text-panel-ink-soft mt-0.5">
                            Registrado:{" "}
                            {new Date(
                              order.paidAt
                            ).toLocaleDateString(
                              "es-BO"
                            )}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="bg-panel-bg rounded-lg p-3 space-y-2">
                      {order.items.map((item) => (
                        <div
                          key={item.id}
                          className="flex justify-between gap-3 text-sm"
                        >
                          <span className="text-panel-ink">
                            {item.quantity} ×{" "}
                            {item.productName}
                            {item.color
                              ? ` · ${item.color}`
                              : ""}
                          </span>

                          <span className="text-panel-ink-soft shrink-0">
                            Bs.{" "}
                            {(
                              item.price *
                              item.quantity
                            ).toFixed(2)}
                          </span>
                        </div>
                      ))}

                      <div className="border-t border-panel-border pt-2 flex justify-between">
                        <span className="font-semibold">
                          Total
                        </span>

                        <span className="font-bold text-brown-dark">
                          Bs. {order.total.toFixed(2)}
                        </span>
                      </div>
                    </div>

                    {order.paymentStatus ===
                      "pagado" &&
                      order.status !== "entregado" &&
                      order.status !==
                        "cancelado" && (
                        <div className="bg-green-soft/40 rounded-lg px-3 py-2 text-xs text-green-dark">
                          Pago registrado por{" "}
                          {paymentMethodLabel(
                            order.paymentMethod
                          )}.
                        </div>
                      )}

                    {order.paymentStatus ===
                      "reembolsado" && (
                      <div className="bg-red-50 border border-red-100 rounded-lg px-3 py-2 text-xs text-red-600">
                        El pago fue marcado como
                        reembolsado.
                      </div>
                    )}

                    <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-panel-border">
                      {order.clienteId &&
                      order.phone ? (
                        <a
                          href={`https://wa.me/${order.phone.replace(
                            /\D/g,
                            ""
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 text-xs text-panel-ink-soft hover:text-panel-ink"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          {order.phone}
                        </a>
                      ) : (
                        <span className="flex items-center gap-1.5 text-xs text-amber">
                          <MessageCircle className="w-3.5 h-3.5" />
                          WhatsApp pendiente
                        </span>
                      )}

                      <div className="flex items-center gap-2 flex-wrap justify-end">
                        {canEdit &&
                          !!order.clienteId &&
                          order.paymentStatus ===
                            "pendiente" &&
                          order.status !==
                            "cancelado" &&
                          order.status !==
                            "entregado" && (
                            <button
                              type="button"
                              onClick={() =>
                                setToPay(order)
                              }
                              className="flex items-center gap-1.5 text-xs font-semibold bg-brown-dark text-cream px-3 py-1.5 rounded-lg"
                            >
                              <CreditCard className="w-3.5 h-3.5" />
                              Registrar pago
                            </button>
                          )}

                        {canEdit &&
                          order.paymentStatus ===
                            "pagado" &&
                          order.status !==
                            "entregado" &&
                          order.status !==
                            "cancelado" && (
                            <button
                              type="button"
                              onClick={() =>
                                setToRefund(order)
                              }
                              className="flex items-center gap-1.5 text-xs font-semibold text-red-500 px-2 py-1.5"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                              Reembolsar
                            </button>
                          )}

                        {actions.map((action) => {
                          if (
                            action.status ===
                              "confirmado" &&
                            !order.clienteId
                          ) {
                            return null;
                          }

                          if (
                            action.status ===
                              "cancelado" &&
                            order.paymentStatus ===
                              "pagado"
                          ) {
                            return null;
                          }

                          return (
                            <button
                              key={action.status}
                              disabled={
                                updating === order.id
                              }
                              onClick={() =>
                                changeStatus(
                                  order,
                                  action.status
                                )
                              }
                              className={`text-xs font-semibold py-1.5 rounded-lg transition-colors disabled:opacity-50 ${
                                VARIANT_STYLES[
                                  action.variant
                                ]
                              }`}
                            >
                              {action.label}
                            </button>
                          );
                        })}

                        {order.status ===
                          "entregado" && (
                          <Link
                            href="/admin/ventas"
                            className="text-xs font-semibold text-brown-dark px-2 py-1.5"
                          >
                            Ver en Ventas
                          </Link>
                        )}
                      </div>
                    </div>

                    {order.paymentStatus ===
                      "pagado" &&
                      order.status !==
                        "entregado" &&
                      order.status !==
                        "cancelado" && (
                        <p className="text-[11px] text-panel-ink-soft text-right">
                          Para cancelar un pedido
                          pagado, primero registra el
                          reembolso.
                        </p>
                      )}
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
            onClick={() =>
              setPage((value) =>
                Math.max(1, value - 1)
              )
            }
            disabled={currentPage === 1}
            className="text-sm font-medium px-3 py-1.5 rounded-lg border border-panel-border text-panel-ink-soft disabled:opacity-40"
          >
            Anterior
          </button>

          <span className="text-sm text-panel-ink-soft">
            Página {currentPage} de {totalPages}
          </span>

          <button
            onClick={() =>
              setPage((value) =>
                Math.min(
                  totalPages,
                  value + 1
                )
              )
            }
            disabled={
              currentPage === totalPages
            }
            className="text-sm font-medium px-3 py-1.5 rounded-lg border border-panel-border text-panel-ink-soft disabled:opacity-40"
          >
            Siguiente
          </button>
        </div>
      )}

      {toAssignCustomer && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <button
            type="button"
            aria-label="Cerrar"
            onClick={closeCustomerAssignment}
            className="absolute inset-0 bg-black/45"
          />

          <form
            onSubmit={saveAssignedCustomer}
            className="relative z-10 w-full max-w-md bg-panel-surface border border-panel-border rounded-2xl shadow-2xl overflow-hidden"
          >
            <div className="flex items-start justify-between gap-3 px-5 py-4 border-b border-panel-border">
              <div>
                <h2 className="font-display font-bold text-lg text-panel-ink">
                  Asignar cliente
                </h2>
                <p className="text-xs text-panel-ink-soft mt-1">
                  Pedido{" "}
                  {operationLabel(
                    toAssignCustomer.operationNumber
                  )}
                </p>
              </div>

              <button
                type="button"
                onClick={closeCustomerAssignment}
                disabled={customerSaving}
                className="p-1.5 rounded-lg text-panel-ink-soft hover:text-panel-ink hover:bg-panel-bg disabled:opacity-40"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div>
                <label className="text-xs font-medium text-panel-ink-soft block mb-1.5">
                  WhatsApp *
                </label>

                <div className="flex gap-2">
                  <input
                    type="tel"
                    inputMode="numeric"
                    value={customerPhone}
                    onChange={(event) => {
                      setCustomerPhone(
                        event.target.value
                          .replace(/\D/g, "")
                          .slice(0, 15)
                      );
                      setCustomerFound(false);
                      setCustomerError("");
                    }}
                    placeholder="Ej. 70123456"
                    className="flex-1 min-w-0 px-3 py-2.5 rounded-lg border border-panel-border bg-panel-bg text-sm text-panel-ink outline-none focus:ring-2 focus:ring-brown-dark/20"
                  />

                  <button
                    type="button"
                    onClick={lookupCustomer}
                    disabled={customerChecking}
                    className="shrink-0 inline-flex items-center gap-1.5 bg-panel-bg border border-panel-border hover:bg-panel-border/40 text-panel-ink text-xs font-semibold px-3 rounded-lg disabled:opacity-50"
                  >
                    <Search className="w-3.5 h-3.5" />
                    {customerChecking
                      ? "Buscando..."
                      : "Buscar"}
                  </button>
                </div>

                {customerFound && (
                  <p className="text-xs text-green-dark mt-1.5">
                    Cliente existente encontrado. Sus datos fueron cargados.
                  </p>
                )}

                {!customerFound &&
                  /^\d{6,15}$/.test(
                    customerPhone
                  ) && (
                    <p className="text-xs text-panel-ink-soft mt-1.5">
                      Si el número no existe, se creará un nuevo cliente al guardar.
                    </p>
                  )}
              </div>

              <div>
                <label className="text-xs font-medium text-panel-ink-soft block mb-1.5">
                  Nombre *
                </label>

                <input
                  type="text"
                  value={customerName}
                  onChange={(event) =>
                    setCustomerName(
                      event.target.value
                    )
                  }
                  maxLength={150}
                  placeholder="Nombre del cliente"
                  className="w-full px-3 py-2.5 rounded-lg border border-panel-border bg-panel-bg text-sm text-panel-ink outline-none focus:ring-2 focus:ring-brown-dark/20"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-panel-ink-soft block mb-1.5">
                  Email
                  <span className="font-normal">
                    {" "}
                    (opcional)
                  </span>
                </label>

                <input
                  type="email"
                  value={customerEmail}
                  onChange={(event) =>
                    setCustomerEmail(
                      event.target.value
                    )
                  }
                  placeholder="cliente@correo.com"
                  className="w-full px-3 py-2.5 rounded-lg border border-panel-border bg-panel-bg text-sm text-panel-ink outline-none focus:ring-2 focus:ring-brown-dark/20"
                />
              </div>

              {customerError && (
                <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                  {customerError}
                </p>
              )}

              <div className="bg-panel-bg rounded-xl px-3 py-2.5">
                <p className="text-xs text-panel-ink-soft">
                  El pedido no podrá confirmarse hasta que tenga un cliente asignado.
                </p>
              </div>
            </div>

            <div className="flex gap-2 px-5 py-4 border-t border-panel-border">
              <button
                type="button"
                onClick={closeCustomerAssignment}
                disabled={customerSaving}
                className="flex-1 text-sm font-semibold text-panel-ink-soft hover:text-panel-ink py-2.5 rounded-lg"
              >
                Cancelar
              </button>

              <button
                type="submit"
                disabled={customerSaving}
                className="flex-[2] bg-green hover:bg-green-dark disabled:opacity-50 text-white text-sm font-semibold py-2.5 rounded-lg transition-colors"
              >
                {customerSaving
                  ? "Guardando..."
                  : customerFound
                  ? "Asignar cliente"
                  : "Guardar y asignar"}
              </button>
            </div>
          </form>
        </div>
      )}

      <PaymentModal
        open={!!toPay}
        orderLabel={
          toPay
            ? `Pedido ${operationLabel(
                toPay.operationNumber
              )} · ${toPay.customer}`
            : ""
        }
        total={toPay?.total || 0}
        saving={paymentSaving}
        onConfirm={registerPayment}
        onCancel={() =>
          !paymentSaving && setToPay(null)
        }
      />

      <ConfirmModal
        open={!!toRefund}
        title="Registrar reembolso"
        message={
          toRefund
            ? `El pago del pedido ${operationLabel(
                toRefund.operationNumber
              )} por Bs. ${toRefund.total.toFixed(
                2
              )} quedará registrado como reembolsado.`
            : ""
        }
        confirmLabel="Registrar reembolso"
        onConfirm={refundPayment}
        onCancel={() => setToRefund(null)}
      />
    </div>
  );
}
