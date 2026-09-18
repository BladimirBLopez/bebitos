"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Plus, Download, Search } from "lucide-react";
import { jsPDF } from "jspdf";
import PageHeader from "./PageHeader";
import { useToast } from "@/lib/toast-context";

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
  total: number;
  status: string;
  origin: string;
  paymentMethod: string | null;
  anulado: boolean;
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
];

const PAYMENT_LABELS: Record<string, string> = {
  efectivo: "Efectivo",
  qr: "QR",
  transferencia: "Transferencia",
};

function paymentLabel(sale: Sale) {
  if (sale.paymentMethod) return PAYMENT_LABELS[sale.paymentMethod] || sale.paymentMethod;
  return sale.origin === "online" ? "Online" : "—";
}

export default function VentasReportClient({ sales }: { sales: Sale[] }) {
  const { showToast } = useToast();
  const [search, setSearch] = useState("");
  const [originFilter, setOriginFilter] = useState("Todos");
  const [paymentFilter, setPaymentFilter] = useState("Todos");
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");
  const [exporting, setExporting] = useState(false);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 20;

  const filtered = useMemo(() => {
    return sales.filter((s) => {
      const matchesOrigin = originFilter === "Todos" || s.origin === originFilter;
      const matchesPayment = paymentFilter === "Todos" || s.paymentMethod === paymentFilter;
      const q = search.trim().toLowerCase();
      const matchesSearch =
        q === "" || s.customer.toLowerCase().includes(q) || s.phone.includes(q);
      const created = new Date(s.createdAt);
      const matchesDesde = !desde || created >= new Date(desde + "T00:00:00");
      const matchesHasta = !hasta || created <= new Date(hasta + "T23:59:59");
      return matchesOrigin && matchesPayment && matchesSearch && matchesDesde && matchesHasta;
    });
  }, [sales, originFilter, paymentFilter, search, desde, hasta]);

  const valid = filtered.filter((s) => !s.anulado);

  const totalVendido = valid.reduce((sum, s) => sum + s.total, 0);
  const totalEfectivo = valid
    .filter((s) => s.paymentMethod === "efectivo")
    .reduce((sum, s) => sum + s.total, 0);
  const totalDigital = valid
    .filter((s) => s.paymentMethod === "qr" || s.paymentMethod === "transferencia")
    .reduce((sum, s) => sum + s.total, 0);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  function exportPDF() {
    if (filtered.length === 0) {
      showToast("No hay ventas para exportar con estos filtros", "error");
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
        doc.setFontSize(7.5);
        doc.setTextColor(255, 255, 255);

        doc.text("#", margin + 2, y + 5.2);
        doc.text("Fecha", margin + 11, y + 5.2);
        doc.text("Cliente", margin + 35, y + 5.2);
        doc.text("Origen", margin + 87, y + 5.2);
        doc.text("Pago", margin + 113, y + 5.2);
        doc.text("Total", margin + 142, y + 5.2);
        doc.text("Estado", margin + 166, y + 5.2);
      }

      drawHeader();

      const fecha = new Date().toLocaleDateString("es-BO", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      });

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(80, 80, 80);

      doc.text(`Generado: ${fecha}`, margin, 40);
      doc.text(
        `Ventas encontradas: ${filtered.length}`,
        margin,
        46
      );
      doc.text(
        `Ventas válidas: ${valid.length}`,
        margin,
        51
      );

      doc.setFillColor(250, 247, 243);
      doc.roundedRect(margin, 56, 58, 20, 2, 2, "F");
      doc.roundedRect(margin + 62, 56, 52, 20, 2, 2, "F");
      doc.roundedRect(margin + 118, 56, 64, 20, 2, 2, "F");

      doc.setFontSize(7);
      doc.setTextColor(110, 110, 110);
      doc.text("TOTAL VENDIDO", margin + 4, 63);
      doc.text("EFECTIVO", margin + 66, 63);
      doc.text("QR + TRANSFERENCIA", margin + 122, 63);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(60, 60, 60);

      doc.text(
        `Bs. ${totalVendido.toFixed(2)}`,
        margin + 4,
        71
      );
      doc.text(
        `Bs. ${totalEfectivo.toFixed(2)}`,
        margin + 66,
        71
      );
      doc.text(
        `Bs. ${totalDigital.toFixed(2)}`,
        margin + 122,
        71
      );

      let y = 83;

      drawTableHeader(y);
      y += 8;

      filtered.forEach((sale, index) => {
        if (y > pageHeight - 24) {
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

        const fechaVenta = new Date(
          sale.createdAt
        ).toLocaleDateString("es-BO");

        const origen =
          sale.origin === "manual"
            ? "Mostrador"
            : "Online";

        const estado = sale.anulado
          ? "Anulado"
          : "Válida";

        doc.setFont("helvetica", "normal");
        doc.setFontSize(7);

        if (sale.anulado) {
          doc.setTextColor(190, 55, 55);
        } else {
          doc.setTextColor(55, 55, 55);
        }

        doc.text(
          String(index + 1),
          margin + 2,
          y + 4.8
        );

        doc.text(
          fechaVenta,
          margin + 11,
          y + 4.8
        );

        doc.text(
          shortText(sale.customer, 25),
          margin + 35,
          y + 4.8
        );

        doc.text(
          origen,
          margin + 87,
          y + 4.8
        );

        doc.text(
          shortText(paymentLabel(sale), 14),
          margin + 113,
          y + 4.8
        );

        doc.text(
          `Bs. ${sale.total.toFixed(2)}`,
          margin + 142,
          y + 4.8
        );

        doc.text(
          estado,
          margin + 166,
          y + 4.8
        );

        y += 7;
      });

      if (y > pageHeight - 25) {
        doc.addPage();
        y = 25;
      }

      y += 7;

      doc.setDrawColor(121, 85, 72);
      doc.setLineWidth(0.3);
      doc.line(
        margin,
        y,
        pageWidth - margin,
        y
      );

      doc.setFont("helvetica", "normal");
      doc.setFontSize(7);
      doc.setTextColor(140, 140, 140);

      doc.text(
        "Bebitos.online · Reporte administrativo",
        margin,
        y + 6
      );

      doc.text(
        "Documento de uso interno.",
        margin,
        y + 11
      );

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
        meta={`${valid.length} venta${valid.length === 1 ? "" : "s"} válida${valid.length === 1 ? "" : "s"} · Bs. ${totalVendido.toFixed(2)} vendido`}
        action={
          <div className="flex gap-2">
            <button
              onClick={exportPDF}
              disabled={exporting}
              className="flex items-center gap-1.5 bg-panel-surface border border-panel-border hover:bg-panel-bg text-panel-ink text-sm font-medium px-3 py-2.5 rounded-lg transition-colors disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" />
              PDF
            </button>
            <Link
              href="/admin/ventas/nueva"
              className="flex items-center gap-1.5 bg-green hover:bg-green-dark text-white font-semibold text-sm px-4 py-2.5 rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              Nueva venta
            </Link>
          </div>
        }
      />

      {/* Resumen */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="bg-panel-surface border border-panel-border rounded-xl p-3">
          <p className="text-[11px] text-panel-ink-soft">Total vendido</p>
          <p className="text-base font-bold text-brown-dark">Bs. {totalVendido.toFixed(2)}</p>
        </div>
        <div className="bg-panel-surface border border-panel-border rounded-xl p-3">
          <p className="text-[11px] text-panel-ink-soft">Efectivo</p>
          <p className="text-base font-bold text-panel-ink">Bs. {totalEfectivo.toFixed(2)}</p>
        </div>
        <div className="bg-panel-surface border border-panel-border rounded-xl p-3">
          <p className="text-[11px] text-panel-ink-soft">QR + Transf.</p>
          <p className="text-base font-bold text-panel-ink">Bs. {totalDigital.toFixed(2)}</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="relative mb-3">
        <Search className="w-4 h-4 text-panel-ink-soft absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          placeholder="Buscar por cliente o teléfono..."
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
          className="flex-1 bg-panel-surface border border-panel-border rounded-xl px-3 py-2 text-xs outline-none focus:border-brown-dark/40"
        />
        <input
          type="date"
          value={hasta}
          onChange={(e) => {
            setHasta(e.target.value);
            setPage(1);
          }}
          className="flex-1 bg-panel-surface border border-panel-border rounded-xl px-3 py-2 text-xs outline-none focus:border-brown-dark/40"
        />
      </div>

      <div className="flex gap-2 flex-wrap mb-2">
        {ORIGIN_OPTIONS.map((o) => (
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
        {PAYMENT_OPTIONS.map((p) => (
          <button
            key={p.value}
            onClick={() => {
              setPaymentFilter(p.value);
              setPage(1);
            }}
            className={`text-xs font-medium px-3 py-1.5 rounded-full transition-colors ${
              paymentFilter === p.value
                ? "bg-brown-dark text-cream"
                : "bg-panel-surface text-panel-ink-soft border border-panel-border hover:bg-panel-bg"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Tabla */}
      {filtered.length === 0 ? (
        <p className="text-sm text-panel-ink-soft text-center py-10">
          No hay ventas con estos filtros.
        </p>
      ) : (
        <div className="space-y-2">
          {paginated.map((sale) => (
            <div
              key={sale.id}
              className={`bg-panel-surface border rounded-xl p-3.5 flex items-center gap-3 ${
                sale.anulado ? "border-red-200 opacity-70" : "border-panel-border"
              }`}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <p className="text-sm font-semibold text-panel-ink truncate">{sale.customer}</p>
                  {sale.anulado && (
                    <span className="text-[10px] font-semibold bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full">
                      Anulado
                    </span>
                  )}
                </div>
                <p className="text-xs text-panel-ink-soft">
                  {new Date(sale.createdAt).toLocaleDateString("es-BO", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}{" "}
                  · {sale.origin === "manual" ? "🏪 Mostrador" : "🌐 Online"} · {paymentLabel(sale)} ·{" "}
                  {sale.items.length} prod.
                </p>
              </div>
              <p
                className={`text-sm font-bold shrink-0 ${sale.anulado ? "line-through text-panel-ink-soft" : "text-brown-dark"}`}
              >
                Bs. {sale.total.toFixed(2)}
              </p>
            </div>
          ))}
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
    </div>
  );
}
