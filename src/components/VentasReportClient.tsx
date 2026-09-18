"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import * as Dialog from "@radix-ui/react-dialog";
import {
  Plus,
  Download,
  Search,
  ChevronDown,
  ChevronUp,
  Store,
  Globe2,
  SlidersHorizontal,
  X,
  CalendarDays,
} from "lucide-react";
import { jsPDF } from "jspdf";
import PageHeader from "./PageHeader";
import AnularModal from "./AnularModal";
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

type Sale = {
  id: string;
  operationNumber: number;
  customer: string;
  phone: string;
  email: string | null;
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

const PAYMENT_LABELS: Record<string, string> = {
  efectivo: "Efectivo",
  qr: "QR",
  transferencia: "Transferencia",
};

const PAYMENT_STATUS_LABELS: Record<string, string> = {
  pendiente: "Pendiente",
  pagado: "Pagado",
  reembolsado: "Reembolsado",
};

const QUICK_FILTERS = [
  { value: "todos", label: "Todos" },
  { value: "pendiente", label: "Por cobrar" },
  { value: "pagado", label: "Pagados" },
  { value: "anulado", label: "Anulados" },
];

function paymentLabel(sale: Sale) {
  if (!sale.paymentMethod) return "No registrado";
  return PAYMENT_LABELS[sale.paymentMethod] || sale.paymentMethod;
}

function operationLabel(operationNumber: number) {
  return String(operationNumber).padStart(6, "0");
}

function saleDate(sale: Sale) {
  return new Date(sale.deliveredAt ?? sale.createdAt);
}

function formatDate(value: string | Date) {
  return new Date(value).toLocaleDateString("es-BO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatInputDate(value: string) {
  if (!value) return "";
  return new Date(value + "T00:00:00").toLocaleDateString(
    "es-BO",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );
}

export default function VentasReportClient({
  sales,
}: {
  sales: Sale[];
}) {
  const { showToast } = useToast();
  const { role } = useCurrentUser();
  const canEdit = canWrite(role);

  const [localSales, setLocalSales] = useState(sales);

  const [search, setSearch] = useState("");
  const [quickFilter, setQuickFilter] = useState("todos");

  const [originFilter, setOriginFilter] = useState("Todos");
  const [paymentFilter, setPaymentFilter] = useState("Todos");
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");

  const [filterOpen, setFilterOpen] = useState(false);

  const [draftQuick, setDraftQuick] = useState("todos");
  const [draftOrigin, setDraftOrigin] = useState("Todos");
  const [draftPayment, setDraftPayment] = useState("Todos");
  const [draftDesde, setDraftDesde] = useState("");
  const [draftHasta, setDraftHasta] = useState("");

  const [exporting, setExporting] = useState(false);

  const [expanded, setExpanded] = useState<Set<string>>(
    new Set()
  );

  const [toAnular, setToAnular] = useState<Sale | null>(
    null
  );

  const [toPay, setToPay] = useState<Sale | null>(null);

  const [paymentSaving, setPaymentSaving] =
    useState(false);

  const [page, setPage] = useState(1);

  const PAGE_SIZE = 20;

  const filtered = useMemo(() => {
    return localSales.filter((sale) => {
      const q = search.trim().toLowerCase();

      const matchesSearch =
        q === "" ||
        sale.customer.toLowerCase().includes(q) ||
        sale.phone.includes(q) ||
        operationLabel(sale.operationNumber).includes(
          q.replace("#", "")
        );

      let matchesQuick = true;

      if (quickFilter === "pendiente") {
        matchesQuick =
          !sale.anulado &&
          sale.paymentStatus === "pendiente";
      }

      if (quickFilter === "pagado") {
        matchesQuick =
          !sale.anulado &&
          sale.paymentStatus === "pagado";
      }

      if (quickFilter === "anulado") {
        matchesQuick = sale.anulado;
      }

      if (quickFilter === "reembolsado") {
        matchesQuick =
          sale.paymentStatus === "reembolsado";
      }

      const matchesOrigin =
        originFilter === "Todos" ||
        sale.origin === originFilter;

      const matchesPayment =
        paymentFilter === "Todos"
          ? true
          : paymentFilter === "sin_registrar"
            ? !sale.paymentMethod
            : sale.paymentMethod === paymentFilter;

      const date = saleDate(sale);

      const matchesDesde =
        !desde ||
        date >= new Date(desde + "T00:00:00");

      const matchesHasta =
        !hasta ||
        date <= new Date(hasta + "T23:59:59");

      return (
        matchesSearch &&
        matchesQuick &&
        matchesOrigin &&
        matchesPayment &&
        matchesDesde &&
        matchesHasta
      );
    });
  }, [
    localSales,
    search,
    quickFilter,
    originFilter,
    paymentFilter,
    desde,
    hasta,
  ]);

  const valid = filtered.filter(
    (sale) => !sale.anulado
  );

  const totalVendido = valid.reduce(
    (sum, sale) => sum + sale.total,
    0
  );

  const totalCobrado = valid
    .filter(
      (sale) => sale.paymentStatus === "pagado"
    )
    .reduce((sum, sale) => sum + sale.total, 0);

  const totalPendiente = valid
    .filter(
      (sale) => sale.paymentStatus === "pendiente"
    )
    .reduce((sum, sale) => sum + sale.total, 0);

  const anuladas = filtered.filter(
    (sale) => sale.anulado
  );

  const totalAnulado = anuladas.reduce(
    (sum, sale) => sum + sale.total,
    0
  );

  const totalPages = Math.max(
    1,
    Math.ceil(filtered.length / PAGE_SIZE)
  );

  const currentPage = Math.min(page, totalPages);

  const paginated = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const activeFilterCount =
    (quickFilter !== "todos" ? 1 : 0) +
    (originFilter !== "Todos" ? 1 : 0) +
    (paymentFilter !== "Todos" ? 1 : 0) +
    (desde || hasta ? 1 : 0);

  function toggleExpanded(id: string) {
    setExpanded((previous) => {
      const next = new Set(previous);

      if (next.has(id)) next.delete(id);
      else next.add(id);

      return next;
    });
  }

  function openFilters() {
    setDraftQuick(quickFilter);
    setDraftOrigin(originFilter);
    setDraftPayment(paymentFilter);
    setDraftDesde(desde);
    setDraftHasta(hasta);
    setFilterOpen(true);
  }

  function applyFilters() {
    setQuickFilter(draftQuick);
    setOriginFilter(draftOrigin);
    setPaymentFilter(draftPayment);
    setDesde(draftDesde);
    setHasta(draftHasta);
    setPage(1);
    setFilterOpen(false);
  }

  function clearFilters() {
    setQuickFilter("todos");
    setOriginFilter("Todos");
    setPaymentFilter("Todos");
    setDesde("");
    setHasta("");

    setDraftQuick("todos");
    setDraftOrigin("Todos");
    setDraftPayment("Todos");
    setDraftDesde("");
    setDraftHasta("");

    setPage(1);
    setFilterOpen(false);
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

      setLocalSales((current) =>
        current.map((sale) =>
          sale.id === toPay.id
            ? {
                ...sale,
                paymentStatus: data.paymentStatus,
                paymentMethod: data.paymentMethod,
                paidAt: data.paidAt,
              }
            : sale
        )
      );

      setToPay(null);

      showToast(
        "Cobro registrado correctamente",
        "success"
      );
    } catch {
      showToast("Error de conexión", "error");
    } finally {
      setPaymentSaving(false);
    }
  }

  async function handleAnular(motivo: string) {
    if (!toAnular) return;

    try {
      const res = await fetch(
        `/api/admin/orders/${toAnular.id}/anular`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ motivo }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        showToast(
          data.error ||
            "No se pudo anular la venta",
          "error"
        );
        return;
      }

      setLocalSales((current) =>
        current.map((sale) =>
          sale.id === toAnular.id
            ? {
                ...sale,
                anulado: true,
                anuladoEn: data.anuladoEn,
                motivoAnulacion:
                  data.motivoAnulacion,
                paymentStatus:
                  data.paymentStatus,
                paidAt: data.paidAt,
              }
            : sale
        )
      );

      showToast(
        "Venta anulada y stock devuelto",
        "success"
      );
    } catch {
      showToast("Error de conexión", "error");
    } finally {
      setToAnular(null);
    }
  }

  function exportPDF() {
    if (filtered.length === 0) {
      showToast(
        "No hay ventas para exportar",
        "error"
      );
      return;
    }

    setExporting(true);

    try {
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const width = 210;
      const height = 297;
      const margin = 14;

      function shortText(
        value: unknown,
        max: number
      ) {
        const text = String(value ?? "");

        return text.length > max
          ? text.slice(0, max - 1) + "…"
          : text;
      }

      function header() {
        doc.setFillColor(46, 125, 50);
        doc.rect(0, 0, width, 8, "F");

        doc.setFont("helvetica", "bold");
        doc.setFontSize(20);
        doc.setTextColor(121, 85, 72);
        doc.text("Bebitos", margin, 22);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.setTextColor(90, 90, 90);
        doc.text(
          "Reporte de ventas",
          margin,
          29
        );
      }

      function tableHeader(y: number) {
        doc.setFillColor(46, 125, 50);

        doc.roundedRect(
          margin,
          y,
          width - margin * 2,
          8,
          1,
          1,
          "F"
        );

        doc.setFont("helvetica", "bold");
        doc.setFontSize(6.7);
        doc.setTextColor(255, 255, 255);

        doc.text("Venta", margin + 2, y + 5);
        doc.text("Entrega", margin + 22, y + 5);
        doc.text("Cliente", margin + 48, y + 5);
        doc.text("Canal", margin + 98, y + 5);
        doc.text("Pago", margin + 123, y + 5);
        doc.text("Total", margin + 151, y + 5);
        doc.text("Estado", margin + 172, y + 5);
      }

      header();

      doc.setFontSize(8);
      doc.setTextColor(80, 80, 80);

      doc.text(
        `Generado: ${new Date().toLocaleDateString(
          "es-BO"
        )}`,
        margin,
        40
      );

      doc.text(
        `Ventas netas: Bs. ${totalVendido.toFixed(
          2
        )}`,
        margin,
        46
      );

      doc.text(
        `Cobrado: Bs. ${totalCobrado.toFixed(
          2
        )} · Por cobrar: Bs. ${totalPendiente.toFixed(
          2
        )}`,
        margin,
        52
      );

      let y = 62;

      tableHeader(y);
      y += 8;

      filtered.forEach((sale, index) => {
        if (y > height - 22) {
          doc.addPage();
          header();
          y = 36;
          tableHeader(y);
          y += 8;
        }

        if (index % 2 === 0) {
          doc.setFillColor(255, 248, 238);
          doc.rect(
            margin,
            y,
            width - margin * 2,
            7,
            "F"
          );
        }

        doc.setFont(
          "helvetica",
          "normal"
        );

        doc.setFontSize(6.6);

        doc.setTextColor(
          sale.anulado ? 190 : 55,
          sale.anulado ? 55 : 55,
          sale.anulado ? 55 : 55
        );

        doc.text(
          `#${operationLabel(
            sale.operationNumber
          )}`,
          margin + 2,
          y + 4.8
        );

        doc.text(
          saleDate(sale).toLocaleDateString(
            "es-BO"
          ),
          margin + 22,
          y + 4.8
        );

        doc.text(
          shortText(sale.customer, 21),
          margin + 48,
          y + 4.8
        );

        doc.text(
          sale.origin === "manual"
            ? "Mostrador"
            : "Online",
          margin + 98,
          y + 4.8
        );

        doc.text(
          shortText(
            sale.anulado
              ? "Reembolsado"
              : PAYMENT_STATUS_LABELS[
                  sale.paymentStatus
                ] || sale.paymentStatus,
            13
          ),
          margin + 123,
          y + 4.8
        );

        doc.text(
          `Bs. ${sale.total.toFixed(2)}`,
          margin + 151,
          y + 4.8
        );

        doc.text(
          sale.anulado
            ? "Anulada"
            : "Válida",
          margin + 172,
          y + 4.8
        );

        y += 7;
      });

      const date = new Date()
        .toISOString()
        .slice(0, 10);

      doc.save(
        `reporte-ventas-bebitos-${date}.pdf`
      );

      showToast(
        "PDF generado correctamente",
        "success"
      );
    } catch (error) {
      console.error(
        "Error generando PDF:",
        error
      );

      showToast(
        "No se pudo generar el PDF",
        "error"
      );
    } finally {
      setExporting(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="Ventas"
        meta={`${valid.length} venta${
          valid.length === 1 ? "" : "s"
        } neta${
          valid.length === 1 ? "" : "s"
        } · Bs. ${totalVendido.toFixed(2)}`}
        action={
          <div className="flex gap-2">
            <button
              onClick={exportPDF}
              disabled={exporting}
              className="flex items-center gap-1.5 bg-panel-surface border border-panel-border hover:bg-panel-bg text-panel-ink text-sm font-medium px-3 py-2.5 rounded-lg disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              {exporting ? "Generando..." : "PDF"}
            </button>

            <Link
              href="/admin/ventas/nueva"
              className="flex items-center gap-1.5 bg-green hover:bg-green-dark text-white font-semibold text-sm px-4 py-2.5 rounded-lg"
            >
              <Plus className="w-4 h-4" />
              Nueva venta
            </Link>
          </div>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        <div className="bg-panel-surface border border-panel-border rounded-xl p-4">
          <p className="text-xs text-panel-ink-soft">
            Ventas netas
          </p>

          <p className="text-lg font-bold text-brown-dark mt-1">
            Bs. {totalVendido.toFixed(2)}
          </p>
        </div>

        <div className="bg-panel-surface border border-panel-border rounded-xl p-4">
          <p className="text-xs text-panel-ink-soft">
            Cobrado
          </p>

          <p className="text-lg font-bold text-green-dark mt-1">
            Bs. {totalCobrado.toFixed(2)}
          </p>
        </div>

        <div className="bg-panel-surface border border-panel-border rounded-xl p-4">
          <p className="text-xs text-panel-ink-soft">
            Por cobrar
          </p>

          <p className="text-lg font-bold text-amber mt-1">
            Bs. {totalPendiente.toFixed(2)}
          </p>
        </div>

        <div className="bg-panel-surface border border-panel-border rounded-xl p-4">
          <p className="text-xs text-panel-ink-soft">
            Anulaciones
          </p>

          <p className="text-lg font-bold text-red-500 mt-1">
            Bs. {totalAnulado.toFixed(2)}
          </p>

          <p className="text-[10px] text-panel-ink-soft mt-0.5">
            {anuladas.length} operación
            {anuladas.length === 1 ? "" : "es"}
          </p>
        </div>
      </div>

      <div className="flex gap-2 mb-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-panel-ink-soft absolute left-3 top-1/2 -translate-y-1/2" />

          <input
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
            placeholder="Buscar cliente, teléfono o Nº venta..."
            className="w-full bg-panel-surface border border-panel-border rounded-xl pl-9 pr-3.5 py-2.5 text-sm outline-none focus:border-brown-dark/40"
          />
        </div>

        <button
          type="button"
          onClick={openFilters}
          className={`shrink-0 flex items-center gap-1.5 border rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors ${
            activeFilterCount > 0
              ? "bg-brown-dark text-cream border-brown-dark"
              : "bg-panel-surface text-panel-ink border-panel-border"
          }`}
        >
          <SlidersHorizontal className="w-4 h-4" />

          <span className="hidden sm:inline">
            Filtros
          </span>

          {activeFilterCount > 0 && (
            <span className="min-w-5 h-5 px-1 rounded-full bg-white/20 flex items-center justify-center text-[10px]">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 mb-2">
        {QUICK_FILTERS.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => {
              setQuickFilter(option.value);
              setPage(1);
            }}
            className={`shrink-0 text-xs font-semibold px-3.5 py-2 rounded-full border transition-colors ${
              quickFilter === option.value
                ? option.value === "anulado"
                  ? "bg-red-500 text-white border-red-500"
                  : option.value === "pendiente"
                    ? "bg-amber text-white border-amber"
                    : option.value === "pagado"
                      ? "bg-green-dark text-white border-green-dark"
                      : "bg-panel-ink text-white border-panel-ink"
                : "bg-panel-surface text-panel-ink-soft border-panel-border"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      {(originFilter !== "Todos" ||
        paymentFilter !== "Todos" ||
        desde ||
        hasta) && (
        <div className="flex gap-2 flex-wrap items-center mb-4">
          {originFilter !== "Todos" && (
            <button
              onClick={() => {
                setOriginFilter("Todos");
                setPage(1);
              }}
              className="flex items-center gap-1 bg-panel-bg border border-panel-border rounded-full px-2.5 py-1 text-[11px] text-panel-ink-soft"
            >
              {originFilter === "manual"
                ? "Mostrador"
                : "Online"}
              <X className="w-3 h-3" />
            </button>
          )}

          {paymentFilter !== "Todos" && (
            <button
              onClick={() => {
                setPaymentFilter("Todos");
                setPage(1);
              }}
              className="flex items-center gap-1 bg-panel-bg border border-panel-border rounded-full px-2.5 py-1 text-[11px] text-panel-ink-soft"
            >
              {paymentFilter === "sin_registrar"
                ? "Sin método"
                : PAYMENT_LABELS[
                    paymentFilter
                  ] || paymentFilter}
              <X className="w-3 h-3" />
            </button>
          )}

          {(desde || hasta) && (
            <button
              onClick={() => {
                setDesde("");
                setHasta("");
                setPage(1);
              }}
              className="flex items-center gap-1 bg-panel-bg border border-panel-border rounded-full px-2.5 py-1 text-[11px] text-panel-ink-soft"
            >
              <CalendarDays className="w-3 h-3" />

              {desde
                ? formatInputDate(desde)
                : "Inicio"}{" "}
              –{" "}
              {hasta
                ? formatInputDate(hasta)
                : "Hoy"}

              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-sm font-semibold text-panel-ink">
            No encontramos ventas
          </p>

          <p className="text-xs text-panel-ink-soft mt-1">
            Prueba cambiando la búsqueda o los filtros.
          </p>

          {activeFilterCount > 0 && (
            <button
              onClick={clearFilters}
              className="text-xs font-semibold text-brown-dark mt-3"
            >
              Limpiar filtros
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {paginated.map((sale) => {
            const isOpen = expanded.has(sale.id);

            return (
              <div
                key={sale.id}
                className={`bg-panel-surface border rounded-xl overflow-hidden ${
                  sale.anulado
                    ? "border-red-200"
                    : "border-panel-border"
                }`}
              >
                <button
                  type="button"
                  onClick={() =>
                    toggleExpanded(sale.id)
                  }
                  className="w-full p-4 flex items-center gap-3 text-left"
                >
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                      sale.origin === "manual"
                        ? "bg-green/10 text-green-dark"
                        : "bg-blue-50 text-blue-600"
                    }`}
                  >
                    {sale.origin === "manual" ? (
                      <Store className="w-4 h-4" />
                    ) : (
                      <Globe2 className="w-4 h-4" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex gap-2 items-center flex-wrap">
                      <p className="text-sm font-semibold text-panel-ink truncate">
                        {sale.customer}
                      </p>

                      {sale.anulado ? (
                        <span className="text-[9px] font-bold bg-red-100 text-red-600 px-2 py-0.5 rounded-full">
                          ANULADA
                        </span>
                      ) : (
                        <span
                          className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                            sale.paymentStatus ===
                            "pagado"
                              ? "bg-green-soft text-green-dark"
                              : "bg-amber-soft text-amber"
                          }`}
                        >
                          {sale.paymentStatus ===
                          "pagado"
                            ? "PAGADO"
                            : "POR COBRAR"}
                        </span>
                      )}
                    </div>

                    <p className="text-[11px] text-panel-ink-soft mt-0.5">
                      Venta #
                      {operationLabel(
                        sale.operationNumber
                      )}{" "}
                      · {formatDate(saleDate(sale))}
                    </p>

                    <p className="text-[11px] text-panel-ink-soft mt-0.5">
                      {sale.origin === "manual"
                        ? "Mostrador"
                        : "Online"}{" "}
                      ·{" "}
                      {sale.paymentMethod
                        ? paymentLabel(sale)
                        : "Método no registrado"}
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <p
                      className={`text-sm font-bold ${
                        sale.anulado
                          ? "line-through text-panel-ink-soft"
                          : "text-brown-dark"
                      }`}
                    >
                      Bs. {sale.total.toFixed(2)}
                    </p>

                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 text-panel-ink-soft ml-auto mt-2" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-panel-ink-soft ml-auto mt-2" />
                    )}
                  </div>
                </button>

                {isOpen && (
                  <div className="border-t border-panel-border p-4">
                    <div className="grid sm:grid-cols-2 gap-4 mb-4 text-xs">
                      <div>
                        <p className="text-panel-ink-soft">
                          Cliente
                        </p>

                        <p className="font-semibold text-panel-ink mt-0.5">
                          {sale.customer}
                        </p>

                        <p className="text-panel-ink-soft">
                          {sale.phone}
                        </p>
                      </div>

                      <div>
                        <p className="text-panel-ink-soft">
                          Operación
                        </p>

                        <p className="font-semibold text-panel-ink mt-0.5">
                          {sale.origin === "manual"
                            ? "Venta de mostrador"
                            : "Pedido online entregado"}
                        </p>

                        <p className="text-panel-ink-soft mt-1">
                          Entregada:{" "}
                          {formatDate(saleDate(sale))}
                        </p>

                        <p className="text-panel-ink-soft mt-1">
                          Pago:{" "}
                          {PAYMENT_STATUS_LABELS[
                            sale.paymentStatus
                          ] ||
                            sale.paymentStatus}
                          {sale.paymentMethod
                            ? ` · ${paymentLabel(
                                sale
                              )}`
                            : ""}
                        </p>

                        {sale.paidAt && (
                          <p className="text-panel-ink-soft mt-1">
                            Cobrado:{" "}
                            {formatDate(sale.paidAt)}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="bg-panel-bg rounded-lg p-3 space-y-2">
                      {sale.items.map((item) => (
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
                        <span className="font-semibold text-panel-ink">
                          Total
                        </span>

                        <span className="font-bold text-brown-dark">
                          Bs. {sale.total.toFixed(2)}
                        </span>
                      </div>
                    </div>

                    {sale.anulado ? (
                      <div className="mt-3 bg-red-50 border border-red-100 rounded-lg px-3 py-2 text-xs text-red-600">
                        <p className="font-semibold">
                          Venta anulada
                          {sale.anuladoEn &&
                            ` · ${formatDate(
                              sale.anuladoEn
                            )}`}
                        </p>

                        {sale.motivoAnulacion && (
                          <p className="mt-1">
                            {sale.motivoAnulacion}
                          </p>
                        )}
                      </div>
                    ) : (
                      canEdit && (
                        <div className="flex flex-wrap justify-end gap-2 mt-3">
                          {sale.paymentStatus ===
                            "pendiente" && (
                            <button
                              type="button"
                              onClick={() =>
                                setToPay(sale)
                              }
                              className="text-xs font-semibold bg-brown-dark text-cream px-3 py-2 rounded-lg"
                            >
                              Registrar cobro
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() =>
                              setToAnular(sale)
                            }
                            className="text-xs font-semibold text-red-500 hover:text-red-600 px-3 py-2"
                          >
                            Anular venta
                          </button>
                        </div>
                      )
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

      <Dialog.Root
        open={filterOpen}
        onOpenChange={(open) => {
          if (open) {
            openFilters();
          } else {
            setFilterOpen(false);
          }
        }}
      >
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-[60] bg-ink/45 backdrop-blur-[2px]" />

          <Dialog.Content className="fixed z-[61] bottom-0 left-0 right-0 sm:bottom-auto sm:left-1/2 sm:right-auto sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 w-full sm:max-w-lg bg-panel-surface rounded-t-2xl sm:rounded-2xl shadow-xl max-h-[90vh] overflow-y-auto focus:outline-none">
            <div className="flex items-start justify-between gap-3 px-5 py-4 border-b border-panel-border sticky top-0 bg-panel-surface z-10">
              <div>
                <Dialog.Title className="font-bold text-panel-ink">
                  Filtrar ventas
                </Dialog.Title>

                <Dialog.Description className="text-xs text-panel-ink-soft mt-0.5">
                  Ajusta solo lo que necesites.
                </Dialog.Description>
              </div>

              <Dialog.Close asChild>
                <button
                  type="button"
                  className="p-2 rounded-lg text-panel-ink-soft hover:bg-panel-bg"
                >
                  <X className="w-4 h-4" />
                </button>
              </Dialog.Close>
            </div>

            <div className="p-5 space-y-5">
              <div>
                <p className="text-xs font-semibold text-panel-ink mb-2">
                  Estado
                </p>

                <select
                  value={draftQuick}
                  onChange={(event) =>
                    setDraftQuick(
                      event.target.value
                    )
                  }
                  className="w-full border border-panel-border bg-panel-surface rounded-xl px-3 py-3 text-sm text-panel-ink outline-none"
                >
                  <option value="todos">
                    Todos
                  </option>
                  <option value="pendiente">
                    Por cobrar
                  </option>
                  <option value="pagado">
                    Pagados
                  </option>
                  <option value="anulado">
                    Anulados
                  </option>
                  <option value="reembolsado">
                    Reembolsados
                  </option>
                </select>
              </div>

              <div>
                <p className="text-xs font-semibold text-panel-ink mb-2">
                  Período
                </p>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] text-panel-ink-soft block mb-1.5">
                      Desde
                    </label>

                    <div className="border border-panel-border rounded-xl px-3 py-2 bg-panel-surface">
                      <div className="flex items-center gap-2">
                        <CalendarDays className="w-4 h-4 text-panel-ink-soft shrink-0" />

                        <input
                          type="date"
                          value={draftDesde}
                          onChange={(event) =>
                            setDraftDesde(
                              event.target.value
                            )
                          }
                          className="w-full min-w-0 bg-transparent text-sm text-panel-ink outline-none"
                        />
                      </div>

                      <p className="text-[10px] text-panel-ink-soft mt-1">
                        {draftDesde
                          ? formatInputDate(
                              draftDesde
                            )
                          : "Sin fecha inicial"}
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] text-panel-ink-soft block mb-1.5">
                      Hasta
                    </label>

                    <div className="border border-panel-border rounded-xl px-3 py-2 bg-panel-surface">
                      <div className="flex items-center gap-2">
                        <CalendarDays className="w-4 h-4 text-panel-ink-soft shrink-0" />

                        <input
                          type="date"
                          value={draftHasta}
                          onChange={(event) =>
                            setDraftHasta(
                              event.target.value
                            )
                          }
                          className="w-full min-w-0 bg-transparent text-sm text-panel-ink outline-none"
                        />
                      </div>

                      <p className="text-[10px] text-panel-ink-soft mt-1">
                        {draftHasta
                          ? formatInputDate(
                              draftHasta
                            )
                          : "Sin fecha final"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-panel-ink mb-2">
                  Canal
                </p>

                <select
                  value={draftOrigin}
                  onChange={(event) =>
                    setDraftOrigin(
                      event.target.value
                    )
                  }
                  className="w-full border border-panel-border bg-panel-surface rounded-xl px-3 py-3 text-sm text-panel-ink outline-none"
                >
                  <option value="Todos">
                    Todos los canales
                  </option>
                  <option value="manual">
                    Mostrador
                  </option>
                  <option value="online">
                    Online
                  </option>
                </select>
              </div>

              <div>
                <p className="text-xs font-semibold text-panel-ink mb-2">
                  Método de pago
                </p>

                <select
                  value={draftPayment}
                  onChange={(event) =>
                    setDraftPayment(
                      event.target.value
                    )
                  }
                  className="w-full border border-panel-border bg-panel-surface rounded-xl px-3 py-3 text-sm text-panel-ink outline-none"
                >
                  <option value="Todos">
                    Todos los métodos
                  </option>
                  <option value="efectivo">
                    Efectivo
                  </option>
                  <option value="qr">
                    QR
                  </option>
                  <option value="transferencia">
                    Transferencia
                  </option>
                  <option value="sin_registrar">
                    Sin registrar
                  </option>
                </select>
              </div>
            </div>

            <div className="sticky bottom-0 bg-panel-surface border-t border-panel-border p-4 flex gap-2">
              <button
                type="button"
                onClick={clearFilters}
                className="flex-1 text-sm font-semibold text-panel-ink-soft py-2.5 rounded-xl border border-panel-border"
              >
                Limpiar
              </button>

              <button
                type="button"
                onClick={applyFilters}
                className="flex-[2] text-sm font-semibold bg-brown-dark text-cream py-2.5 rounded-xl"
              >
                Aplicar filtros
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      <PaymentModal
        open={!!toPay}
        orderLabel={
          toPay
            ? `Venta #${operationLabel(
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

      <AnularModal
        open={!!toAnular}
        orderLabel={
          toAnular
            ? `Venta #${operationLabel(
                toAnular.operationNumber
              )} · ${toAnular.customer}`
            : ""
        }
        onConfirm={handleAnular}
        onCancel={() => setToAnular(null)}
      />
    </div>
  );
}
