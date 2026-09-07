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
    // Cargar jsPDF desde CDN
    const script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
    script.onload = () => {
      // @ts-ignore
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF();

      // Título
      doc.setFontSize(18);
      doc.text("Leads - Bebitos", 14, 22);
      doc.setFontSize(11);
      doc.text(`Generado: ${new Date().toLocaleDateString("es-BO")}`, 14, 30);
      doc.text(`Total: ${leads.length} leads`, 14, 37);

      // Tabla (manual)
      const headers = ["#", "Nombre", "WhatsApp", "Edad", "Fecha"];
      const rows = leads.map((lead, index) => [
        index + 1,
        lead.name,
        lead.whatsapp,
        lead.babyAge || "No especificada",
        new Date(lead.createdAt).toLocaleDateString("es-BO"),
      ]);

      let y = 45;
      // Dibujar encabezados
      doc.setFillColor(139, 92, 246);
      doc.rect(14, y, 182, 8, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(9);
      let x = 16;
      headers.forEach((h) => {
        doc.text(h, x, y + 6);
        x += 36;
      });

      // Dibujar filas
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(8);
      rows.forEach((row, i) => {
        y += 8;
        if (i % 2 === 0) {
          doc.setFillColor(240, 240, 240);
          doc.rect(14, y, 182, 7, "F");
        }
        let xPos = 16;
        row.forEach((cell) => {
          doc.text(String(cell), xPos, y + 5);
          xPos += 36;
        });
      });

      doc.save("leads-bebitos.pdf");
      showToast("PDF exportado correctamente", "success");
    };
    document.body.appendChild(script);
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
              className="flex items-center gap-1.5 bg-brown-dark hover:bg-ink text-cream text-sm font-medium px-4 py-2 rounded-lg transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              Exportar PDF
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
