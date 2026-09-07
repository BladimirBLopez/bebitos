"use client";

import { useEffect, useState } from "react";
import { Download, Trash2, MessageCircle } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import ConfirmModal from "@/components/ConfirmModal";
import { useToast } from "@/lib/toast-context";

type Lead = {
  id: string;
  name: string;
  whatsapp: string;
  babyAge: string;
  source: string;
  createdAt: string;
};

export default function LeadsPage() {
  const { showToast } = useToast();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [toDelete, setToDelete] = useState<Lead | null>(null);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    fetch("/api/admin/leads")
      .then((res) => res.json())
      .then((data) => {
        setLeads(data);
        setLoading(false);
      });
  }, []);

  async function confirmDelete() {
    if (!toDelete) return;
    await fetch(`/api/admin/leads/${toDelete.id}`, { method: "DELETE" });
    setLeads((prev) => prev.filter((l) => l.id !== toDelete.id));
    showToast("Lead borrado", "success");
    setToDelete(null);
  }

  function exportPDF() {
    if (leads.length === 0) {
      showToast("No hay leads para exportar", "error");
      return;
    }

    setExporting(true);
    showToast("Generando PDF...", "success");

    try {
      // Usar la versión CDN para evitar problemas
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

          // HEADER
          doc.setFillColor(colorVerde[0], colorVerde[1], colorVerde[2]);
          doc.rect(0, 0, pageWidth, 8, "F");

          // Logo (sin clip para evitar errores)
          const logoUrl = "https://res.cloudinary.com/dkq95jus0/image/upload/v1788792338/1000608308_1_cdjcwt.png";
          doc.addImage(logoUrl, "PNG", margin, 11, 16, 16);

          // Título
          doc.setFontSize(20);
          doc.setTextColor(colorMarron[0], colorMarron[1], colorMarron[2]);
          doc.text("Bebitos", margin + 20, 24);
          doc.setFontSize(10);
          doc.setTextColor(100, 100, 100);
          doc.text("Reporte de Leads", margin + 20, 31);

          // INFO
          doc.setFontSize(8);
          doc.setTextColor(80, 80, 80);
          const fecha = new Date().toLocaleDateString("es-BO", {
            day: "2-digit",
            month: "long",
            year: "numeric",
          });
          doc.text(`Generado: ${fecha}`, margin, 44);
          doc.text(`Total de leads: ${leads.length}`, margin, 50);

          // TABLA
          const headers = ["#", "Nombre", "WhatsApp", "Edad", "Fecha"];
          const rows = leads.map((lead, index) => [
            String(index + 1),
            String(lead.name || ""),
            String(lead.whatsapp || ""),
            String(lead.babyAge || "No especificada"),
            new Date(lead.createdAt).toLocaleDateString("es-BO"),
          ]);

          let y = 58;
          const colWidths = [10, 50, 35, 30, 35];

          // Cabecera
          doc.setFillColor(colorVerde[0], colorVerde[1], colorVerde[2]);
          doc.roundedRect(margin, y, pageWidth - margin * 2, 7, 1, 1, "F");
          doc.setTextColor(255, 255, 255);
          doc.setFontSize(8);
          let x = margin + 2;
          headers.forEach((h, i) => {
            doc.text(h, x, y + 5);
            x += colWidths[i];
          });

          // Filas
          doc.setTextColor(50, 50, 50);
          doc.setFontSize(7);
          rows.forEach((row, i) => {
            y += 7;
            if (i % 2 === 0) {
              doc.setFillColor(colorCrema[0], colorCrema[1], colorCrema[2]);
              doc.rect(margin, y, pageWidth - margin * 2, 6, "F");
            }
            let xPos = margin + 2;
            row.forEach((cell) => {
              doc.text(String(cell), xPos, y + 4.5);
              xPos += colWidths[row.indexOf(cell)];
            });
          });

          // FOOTER
          const finalY = y + 12;
          doc.setDrawColor(colorMarron[0], colorMarron[1], colorMarron[2]);
          doc.setLineWidth(0.5);
          doc.line(margin, finalY, pageWidth - margin, finalY);

          doc.setFontSize(7);
          doc.setTextColor(150, 150, 150);
          doc.text("Bebitos.online - Todos los derechos reservados", margin, finalY + 6);
          doc.text("Este reporte es confidencial y de uso interno.", margin, finalY + 11);

          doc.setFillColor(colorVerde[0], colorVerde[1], colorVerde[2]);
          doc.rect(0, 297 - 5, pageWidth, 5, "F");

          doc.save("leads-bebitos.pdf");
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
      console.error("Error:", error);
      showToast("Error al generar el PDF", "error");
      setExporting(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="Leads"
        meta={loading ? "Personas que dejaron sus datos por el regalo" : `${leads.length} lead${leads.length === 1 ? "" : "s"} capturado${leads.length === 1 ? "" : "s"}`}
        action={
          leads.length > 0 ? (
            <button
              onClick={exportPDF}
              disabled={exporting}
              className="flex items-center gap-1.5 bg-brown-dark hover:bg-ink text-cream text-sm font-medium px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" />
              {exporting ? "Generando..." : "Exportar PDF"}
            </button>
          ) : undefined
        }
      />

      {!loading && leads.length === 0 && (
        <p className="text-panel-ink-soft text-sm text-center py-10">
          Todavía no hay leads. Se registran cuando alguien completa el formulario en{" "}
          <span className="font-medium">/regalo</span>.
        </p>
      )}

      {leads.length > 0 && (
        <div className="flex flex-col gap-2">
          {leads.map((lead) => (
            <div
              key={lead.id}
              className="bg-panel-surface border border-panel-border rounded-xl p-4 flex items-center gap-3"
              style={{ boxShadow: "var(--shadow-panel)" }}
            >
              <div className="flex-1 min-w-0">
                <p className="font-medium text-panel-ink truncate">{lead.name}</p>
                <div className="flex items-center gap-2 flex-wrap mt-0.5">
                  {lead.babyAge && (
                    <span className="text-[11px] font-medium bg-green/15 text-green-dark px-2 py-0.5 rounded-full">
                      {lead.babyAge}
                    </span>
                  )}
                  <p className="text-xs text-panel-ink-soft">
                    {new Date(lead.createdAt).toLocaleDateString("es-BO", { day: "2-digit", month: "short", year: "numeric" })}
                  </p>
                </div>
              </div>
              <a
                href={`https://wa.me/${lead.whatsapp.startsWith("591") ? lead.whatsapp : "591" + lead.whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 bg-green/15 hover:bg-green/25 text-green-dark text-sm font-medium px-3 py-2 rounded-lg transition-colors shrink-0"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                {lead.whatsapp}
              </a>
              <button
                onClick={() => setToDelete(lead)}
                className="text-red-300 hover:text-red-500 transition-colors p-1.5 shrink-0"
                title="Borrar"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      <ConfirmModal
        open={!!toDelete}
        title="¿Borrar este lead?"
        message={toDelete ? `Se eliminará el registro de "${toDelete.name}" permanentemente.` : ""}
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </div>
  );
}
