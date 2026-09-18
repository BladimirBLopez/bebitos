"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Plus,
  Download,
  Search,
  ChevronDown,
  ChevronUp,
  Store,
  Globe2,
} from "lucide-react";
import { jsPDF } from "jspdf";
import PageHeader from "./PageHeader";
import AnularModal from "./AnularModal";
import { useToast } from "@/lib/toast-context";
import { useCurrentUser } from "@/lib/user-context";
import { canWrite } from "@/lib/roles";

type OrderItem = {
  id: string;
  productName: string;
  quantity: number;
  price: number;
};

type Sale = {
  id: string;
  customer: string;
  phone: string;
  email: string | null;
  total: number;
  status: string;
  origin: string;
  paymentMethod: string | null;
  anulado: boolean;
  anuladoEn: string | Date | null;
  motivoAnulacion: string | null;
  items: OrderItem[];
  createdAt: string | Date;
};

const ORIGIN_OPTIONS = [
  { value: "Todos", label: "Todos" },
  { value: "manual", label: "🏪 Mostrador" },
  { value: "online", label: "🌐 Online" },
];

const PAYMENT_OPTIONS = [
  { value: "Todos", label: "Todos" },
  { value: "efectivo", label: "Efectivo" },
  { value: "qr", label: "QR" },
  { value: "transferencia", label: "Transferencia" },
  { value: "sin_registrar", label: "Sin registrar" },
];

const PAYMENT_LABELS: Record<string, string> = {
  efectivo: "Efectivo",
  qr: "QR",
  transferencia: "Transferencia",
};

function paymentLabel(sale: Sale) {
  if (!sale.paymentMethod) return "No registrado";
  return PAYMENT_LABELS[sale.paymentMethod] || sale.paymentMethod;
}

function reference(id: string) {
  return id.slice(-6).toUpperCase();
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
  const [originFilter, setOriginFilter] = useState("Todos");
  const [paymentFilter, setPaymentFilter] = useState("Todos");
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");
  const [exporting, setExporting] = useState(false);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [toAnular, setToAnular] = useState<Sale | null>(null);
  const [page, setPage] = useState(1);

  const PAGE_SIZE = 20;

  const filtered = useMemo(() => {
    return localSales.filter((sale) => {
      const matchesOrigin =
        originFilter === "Todos" || sale.origin === originFilter;

      const matchesPayment =
        paymentFilter === "Todos"
          ? true
          : paymentFilter === "sin_registrar"
            ? !sale.paymentMethod
            : sale.paymentMethod === paymentFilter;

      const q = search.trim().toLowerCase();

      const matchesSearch =
        q === "" ||
        sale.customer.toLowerCase().includes(q) ||
        sale.phone.includes(q) ||
        reference(sale.id).toLowerCase().includes(q);

      const created = new Date(sale.createdAt);

      const matchesDesde =
        !desde || created >= new Date(desde + "T00:00:00");

      const matchesHasta =
        !hasta || created <= new Date(hasta + "T23:59:59");

      return (
        matchesOrigin &&
        matchesPayment &&
        matchesSearch &&
        matchesDesde &&
        matchesHasta
      );
    });
  }, [
    localSales,
    originFilter,
    paymentFilter,
    search,
    desde,
    hasta,
  ]);

  const valid = filtered.filter((sale) => !sale.anulado);

  const totalVendido = valid.reduce(
    (sum, sale) => sum + sale.total,
    0
  );

  const totalEfectivo = valid
    .filter((sale) => sale.paymentMethod === "efectivo")
    .reduce((sum, sale) => sum + sale.total, 0);

  const totalDigital = valid
    .filter(
      (sale) =>
        sale.paymentMethod === "qr" ||
        sale.paymentMethod === "transferencia"
    )
    .reduce((sum, sale) => sum + sale.total, 0);

  const totalSinMetodo = valid
    .filter((sale) => !sale.paymentMethod)
    .reduce((sum, sale) => sum + sale.total, 0);

  const totalPages = Math.max(
    1,
    Math.ceil(filtered.length / PAGE_SIZE)
  );

  const currentPage = Math.min(page, totalPages);

  const paginated = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  function toggleExpanded(id: string) {
    setExpanded((previous) => {
      const next = new Set(previous);

      if (next.has(id)) next.delete(id);
      else next.add(id);

      return next;
    });
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
          data.error || "No se pudo anular la venta",
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
                motivoAnulacion: data.motivoAnulacion,
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
        "No hay ventas para exportar con estos filtros",
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

      const pageWidth = 210;
      const pageHeight = 297;
      const margin = 14;

      function shortText(value: unknown, max: number) {
        const text = String(value ?? "");
        return text.length > max
          ? text.slice(0, max - 1) + "…"
          : text;
      }

      function drawHeader() {
        doc.setFillColor(46, 125, 50);
        doc.rect(0, 0, pageWidth, 8, "F");

        doc.setFont("helvetica", "bold");
        doc.setFontSize(20);
        doc.setTextColor(121, 85, 72);
        doc.text("Bebitos", margin, 22);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.setTextColor(90, 90, 90);
        doc.text("Reporte de Ventas", margin, 29);
      }

      function drawTableHeader(y: number) {
        doc.setFillColor(46, 125, 50);
        doc.roundedRect(
          margin,
          y,
          pageWidth - margin * 2,
          8,
          1,
          1,
          "F"
        );

        doc.setFont("helvetica", "bold");
        doc.setFontSize(7);
        doc.setTextColor(255, 255, 255);

        doc.text("Ref.", margin + 2, y + 5);
        doc.text("Fecha", margin + 19, y + 5);
        doc.text("Cliente", margin + 43, y + 5);
        doc.text("Canal", margin + 94, y + 5);
        doc.text("Pago", margin + 121, y + 5);
        doc.text("Total", margin + 150, y + 5);
        doc.text("Estado", margin + 171, y + 5);
      }

      drawHeader();

      const fecha = new Date().toLocaleDateString("es-BO", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      });

      doc.setFontSize(8);
      doc.setTextColor(80, 80, 80);

      doc.text(`Generado: ${fecha}`, margin, 40);
      doc.text(
        `Ventas válidas: ${valid.length}`,
        margin,
        46
      );
      doc.text(
        `Total vendido: Bs. ${totalVendido.toFixed(2)}`,
        margin,
        52
      );

      let y = 62;

      drawTableHeader(y);
      y += 8;

      filtered.forEach((sale, index) => {
        if (y > pageHeight - 22) {
          doc.addPage();
          drawHeader();
          y = 36;
          drawTableHeader(y);
          y += 8;
        }

        if (index % 2 === 0) {
          doc.setFillColor(255, 248, 238);
          doc.rect(
            margin,
            y,
            pageWidth - margin * 2,
            7,
            "F"
          );
        }

        doc.setFont("helvetica", "normal");
        doc.setFontSize(6.8);

        if (sale.anulado) {
          doc.setTextColor(190, 55, 55);
        } else {
          doc.setTextColor(55, 55, 55);
        }

        doc.text(reference(sale.id), margin + 2, y + 4.8);
        doc.text(
          new Date(sale.createdAt).toLocaleDateString("es-BO"),
          margin + 19,
          y + 4.8
        );
        doc.text(
          shortText(sale.customer, 22),
          margin + 43,
          y + 4.8
        );
        doc.text(
          sale.origin === "manual"
            ? "Mostrador"
            : "Online",
          margin + 94,
          y + 4.8
        );
        doc.text(
          shortText(paymentLabel(sale), 14),
          margin + 121,
          y + 4.8
        );
        doc.text(
          `Bs. ${sale.total.toFixed(2)}`,
          margin + 150,
          y + 4.8
        );
        doc.text(
          sale.anulado ? "Anulada" : "Válida",
          margin + 171,
          y + 4.8
        );

        y += 7;
      });

      const fileDate = new Date()
        .toISOString()
        .slice(0, 10);

      doc.save(
        `reporte-ventas-bebitos-${fileDate}.pdf`
      );

      showToast(
        "PDF generado correctamente",
        "success"
      );
    } catch (error) {
      console.error("Error generando PDF:", error);
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
        meta={`${valid.length} venta${valid.length === 1 ? "" : "s"} válida${valid.length === 1 ? "" : "s"} · Bs. ${totalVendido.toFixed(2)} vendido`}
        action={
          <div className="flex gap-2">
            <button
              onClick={exportPDF}
              disabled={exporting}
              className="flex items-center gap-1.5 bg-panel-surface border border-panel-border hover:bg-panel-bg text-panel-ink text-sm font-medium px-3 py-2.5 rounded-lg disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" />
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

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 mb-5">
        <div className="bg-panel-surface border border-panel-border rounded-xl p-3">
          <p className="text-[11px] text-panel-ink-soft">
            Total vendido
          </p>
          <p className="text-base font-bold text-brown-dark">
            Bs. {totalVendido.toFixed(2)}
          </p>
        </div>

        <div className="bg-panel-surface border border-panel-border rounded-xl p-3">
          <p className="text-[11px] text-panel-ink-soft">
            Efectivo
          </p>
          <p className="text-base font-bold text-panel-ink">
            Bs. {totalEfectivo.toFixed(2)}
          </p>
        </div>

        <div className="bg-panel-surface border border-panel-border rounded-xl p-3">
          <p className="text-[11px] text-panel-ink-soft">
            QR + Transferencia
          </p>
          <p className="text-base font-bold text-panel-ink">
            Bs. {totalDigital.toFixed(2)}
          </p>
        </div>

        <div className="bg-panel-surface border border-panel-border rounded-xl p-3">
          <p className="text-[11px] text-panel-ink-soft">
            Pago sin registrar
          </p>
          <p className="text-base font-bold text-amber">
            Bs. {totalSinMetodo.toFixed(2)}
          </p>
        </div>
      </div>

      <div className="relative mb-3">
        <Search className="w-4 h-4 text-panel-ink-soft absolute left-3 top-1/2 -translate-y-1/2" />

        <input
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          placeholder="Buscar cliente, teléfono o referencia..."
          className="w-full bg-panel-surface border border-panel-border rounded-xl pl-9 pr-3.5 py-2.5 text-sm outline-none focus:border-brown-dark/40"
        />
      </div>

      <div className="flex gap-2 mb-3">
        <input
          type="date"
          value={desde}
          onChange={(e) => {
            setDesde(e.target.value);
            setPage(1);
          }}
          className="flex-1 bg-panel-surface border border-panel-border rounded-xl px-3 py-2 text-xs outline-none"
        />

        <input
          type="date"
          value={hasta}
          onChange={(e) => {
            setHasta(e.target.value);
            setPage(1);
          }}
          className="flex-1 bg-panel-surface border border-panel-border rounded-xl px-3 py-2 text-xs outline-none"
        />
      </div>

      <div className="flex gap-2 flex-wrap mb-2">
        {ORIGIN_OPTIONS.map((option) => (
          <button
            key={option.value}
            onClick={() => {
              setOriginFilter(option.value);
              setPage(1);
            }}
            className={`text-xs font-medium px-3 py-1.5 rounded-full ${
              originFilter === option.value
                ? "bg-panel-ink text-white"
                : "bg-panel-surface text-panel-ink-soft border border-panel-border"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      <div className="flex gap-2 flex-wrap mb-4">
        {PAYMENT_OPTIONS.map((option) => (
          <button
            key={option.value}
            onClick={() => {
              setPaymentFilter(option.value);
              setPage(1);
            }}
            className={`text-xs font-medium px-3 py-1.5 rounded-full ${
              paymentFilter === option.value
                ? "bg-brown-dark text-cream"
                : "bg-panel-surface text-panel-ink-soft border border-panel-border"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="text-sm text-panel-ink-soft text-center py-10">
          No hay ventas con estos filtros.
        </p>
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

                      {sale.anulado && (
                        <span className="text-[9px] font-bold bg-red-100 text-red-600 px-2 py-0.5 rounded-full">
                          ANULADA
                        </span>
                      )}
                    </div>

                    <p className="text-[11px] text-panel-ink-soft mt-0.5">
                      Ref. {reference(sale.id)} ·{" "}
                      {new Date(
                        sale.createdAt
                      ).toLocaleDateString("es-BO", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}{" "}
                      · {paymentLabel(sale)}
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

                    <p className="text-[10px] text-panel-ink-soft">
                      {sale.origin === "manual"
                        ? "Mostrador"
                        : "Online"}
                    </p>
                  </div>

                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-panel-ink-soft" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-panel-ink-soft" />
                  )}
                </button>

                {isOpen && (
                  <div className="border-t border-panel-border p-4">
                    <div className="grid sm:grid-cols-2 gap-3 mb-4 text-xs">
                      <div>
                        <p className="text-panel-ink-soft">
                          Cliente
                        </p>
                        <p className="font-semibold text-panel-ink">
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
                        <p className="font-semibold text-panel-ink">
                          {sale.origin === "manual"
                            ? "Venta de mostrador"
                            : "Pedido online entregado"}
                        </p>
                        <p className="text-panel-ink-soft">
                          Pago: {paymentLabel(sale)}
                        </p>
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
                            ` · ${new Date(
                              sale.anuladoEn
                            ).toLocaleDateString(
                              "es-BO"
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
                        <div className="flex justify-end mt-3">
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
              setPage((p) =>
                Math.max(1, p - 1)
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
              setPage((p) =>
                Math.min(totalPages, p + 1)
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

      <AnularModal
        open={!!toAnular}
        orderLabel={
          toAnular
            ? `${toAnular.customer} · Bs. ${toAnular.total.toFixed(2)}`
            : ""
        }
        onConfirm={handleAnular}
        onCancel={() => setToAnular(null)}
      />
    </div>
  );
}
