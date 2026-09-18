"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Plus, Download, Search } from "lucide-react";
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
    showToast("Generando PDF...", "success");

    try {
      const script = document.createElement("script");
      script.src = "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
      script.onload = () => {
        try {
          // @ts-ignore
          const { jsPDF } = window.jspdf;
          const doc = new jsPDF("p", "mm", "a4");
          const pageWidth = 210;
          const margin = 14;
          const colorVerde = [46, 125, 50];
          const colorMarron = [121, 85, 72];
          const colorCrema = [255, 248, 225];

          doc.setFillColor(colorVerde[0], colorVerde[1], colorVerde[2]);
          doc.rect(0, 0, pageWidth, 8, "F");

          const logoUrl = "https://res.cloudinary.com/dkq95jus0/image/upload/v1788792338/1000608308_1_cdjcwt.png";
          doc.addImage(logoUrl, "PNG", margin, 11, 16, 16);

          doc.setFontSize(20);
          doc.setTextColor(colorMarron[0], colorMarron[1], colorMarron[2]);
          doc.text("Bebitos", margin + 20, 24);
          doc.setFontSize(10);
          doc.setTextColor(100, 100, 100);
          doc.text("Reporte de Ventas", margin + 20, 31);

          doc.setFontSize(8);
          doc.setTextColor(80, 80, 80);
          const fecha = new Date().toLocaleDateString("es-BO", {
            day: "2-digit",
            month: "long",
            year: "numeric",
          });
          doc.text(`Generado: ${fecha}`, margin, 44);
          doc.text(`Total de ventas: ${filtered.length}`, margin, 50);
          doc.text(`Total vendido (sin anuladas): Bs. ${totalVendido.toFixed(2)}`, margin, 55);

          const headers = ["#", "Fecha", "Cliente", "Origen", "Pago", "Total", "Estado"];
          const rows = filtered.map((s, index) => [
            String(index + 1),
            new Date(s.createdAt).toLocaleDateString("es-BO"),
            String(s.customer || ""),
            s.origin === "manual" ? "Mostrador" : "Online",
            paymentLabel(s),
            `Bs. ${s.total.toFixed(2)}`,
            s.anulado ? "Anulado" : "Válida",
          ]);

          let y = 62;
          const colWidths = [8, 22, 45, 24, 28, 26, 22];

          doc.setFillColor(colorVerde[0], colorVerde[1], colorVerde[2]);
          doc.roundedRect(margin, y, pageWidth - margin * 2, 7, 1, 1, "F");
          doc.setTextColor(255, 255, 255);
          doc.setFontSize(8);
          let x = margin + 2;
          headers.forEach((h, i) => {
            doc.text(h, x, y + 5);
            x += colWidths[i];
          });

          doc.setFontSize(7);
          rows.forEach((row, i) => {
            y += 7;
            if (y > 280) {
              doc.addPage();
              y = 20;
            }
            if (i % 2 === 0) {
              doc.setFillColor(colorCrema[0], colorCrema[1], colorCrema[2]);
              doc.rect(margin, y, pageWidth - margin * 2, 6, "F");
            }
            doc.setTextColor(row[6] === "Anulado" ? 200 : 50, row[6] === "Anulado" ? 60 : 50, row[6] === "Anulado" ? 60 : 50);
            let xPos = margin + 2;
            row.forEach((cell, ci) => {
              doc.text(String(cell), xPos, y + 4.5);
              xPos += colWidths[ci];
            });
          });

          const finalY = y + 12;
          doc.setDrawColor(colorMarron[0], colorMarron[1], colorMarron[2]);
          doc.setLineWidth(0.5);
          doc.line(margin, finalY, pageWidth - margin, finalY);

          doc.setFontSize(7);
          doc.setTextColor(150, 150, 150);
          doc.text("Bebitos.online - Todos los derechos reservados", margin, finalY + 6);
          doc.text("Este reporte es confidencial y de uso interno.", margin, finalY + 11);

          doc.save("reporte-ventas-bebitos.pdf");
          showToast("PDF exportado correctamente", "success");
        } catch (error) {
          console.error("Error al generar PDF:", error);
          showToast("Error al generar el PDF", "error");
        } finally {
          setExporting(false);
        }
      };
      script.onerror = () => {
        showToast("Error al cargar la librería PDF", "error");
        setExporting(false);
      };
      document.body.appendChild(script);
    } catch (error) {
      showToast("Error al generar el PDF", "error");
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
