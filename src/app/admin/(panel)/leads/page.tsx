"use client";

import { useEffect, useState } from "react";
import { Download, Trash2, MessageCircle } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import ConfirmModal from "@/components/ConfirmModal";
import { useToast } from "@/lib/toast-context";
import jsPDF from "jspdf";

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
    showToast("Generando PDF...", "info");

    try {
      const doc = new jsPDF("p", "mm", "a4");
      const pageWidth = 210;
      const margin = 14;
      const colorVerde = [46, 125, 50];
      const colorMarron = [121, 85, 72];
      const colorCrema = [255, 248, 225];

      // === HEADER ===
      doc.setFillColor(colorVerde[0], colorVerde[1], colorVerde[2]);
      doc.rect(0, 0, pageWidth, 8, "F");

      // Logo redondo
      const logoUrl = "https://res.cloudinary.com/dkq95jus0/image/upload/v1788792338/1000608308_1_cdjcwt.png";
      const imgX = margin;
      const imgY = 12;
      const imgSize = 18;

      doc.setFillColor(255, 255, 255);
      doc.circle(imgX + imgSize/2, imgY + imgSize/2, imgSize/2, "F");
      doc.saveGraphicsState();
      doc.ellipse(imgX + imgSize/2, imgY + imgSize/2, imgSize/2, imgSize/2, "clip");
      doc.addImage(logoUrl, "PNG", imgX, imgY, imgSize, imgSize);
      doc.restoreGraphicsState();
      doc.setDrawColor(colorVerde[0], colorVerde[1], colorVerde[2]);
      doc.setLineWidth(0.8);
      doc.circle(imgX + imgSize/2, imgY + imgSize/2, imgSize/2, "S");

      // Título
      doc.setFontSize(22);
      doc.setTextColor(colorMarron[0], colorMarron[1], colorMarron[2]);
      doc.text("Bebitos", margin + 22, 26);
      doc.setFontSize(11);
      doc.setTextColor(100, 100, 100);
      doc.text("Reporte de Leads", margin + 22, 33);

      // === INFO ===
      doc.setFontSize(9);
      doc.setTextColor(80, 80, 80);
      const fecha = new Date().toLocaleDateString("es-BO", {
        day: "2-digit",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
      doc.text(`Generado: ${fecha}`, margin, 48);
      doc.text(`Total de leads: ${leads.length}`, margin, 54);

      // === TABLA ===
      const headers = ["#", "Nombre", "WhatsApp", "Edad", "Fecha"];
      const rows = leads.map((lead, index) => [
        index + 1,
        lead.name,
        lead.whatsapp,
        lead.babyAge || "No especificada",
        new Date(lead.createdAt).toLocaleDateString("es-BO"),
      ]);

      let y = 62;
      const colWidths = [10, 50, 35, 30, 35];

      doc.setFillColor(colorVerde[0], colorVerde[1], colorVerde[2]);
      doc.roundedRect(margin, y, pageWidth - margin * 2, 8, 2, 2, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(9);
      let x = margin + 2;
      headers.forEach((h, i) => {
        doc.text(h, x, y + 5.5);
        x += colWidths[i];
      });

      doc.setTextColor(50, 50, 50);
      doc.setFontSize(8);
      rows.forEach((row, i) => {
        y += 8;
        if (i % 2 === 0) {
          doc.setFillColor(colorCrema[0], colorCrema[1], colorCrema[2]);
          doc.rect(margin, y, pageWidth - margin * 2, 7, "F");
        }
        let xPos = margin + 2;
        row.forEach((cell, j) => {
          doc.text(String(cell), xPos, y + 5);
          xPos += colWidths[j];
        });
      });

      // === FOOTER ===
      const finalY = y + 12;
      doc.setDrawColor(colorMarron[0], colorMarron[1], colorMarron[2]);
      doc.setLineWidth(0.5);
      doc.line(margin, finalY, pageWidth - margin, finalY);

      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text("Bebitos.online - Todos los derechos reservados", margin, finalY + 6);
      doc.text("Este reporte es confidencial y de uso interno.", margin, finalY + 12);

      const pageCount = doc.internal.getNumberOfPages();
      doc.text(`Página 1 de ${pageCount}`, pageWidth - margin - 20, finalY + 6);

      doc.setFillColor(colorVerde[0], colorVerde[1], colorVerde[2]);
      doc.rect(0, 297 - 6, pageWidth, 6, "F");

      doc.save("leads-bebitos.pdf");
      showToast("PDF exportado correctamente", "success");
    } catch (error) {
      console.error("Error al generar PDF:", error);
      showToast("Error al generar el PDF. Revisa la consola.", "error");
    } finally {
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
