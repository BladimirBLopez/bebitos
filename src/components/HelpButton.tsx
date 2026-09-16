"use client";

import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import {
  HelpCircle,
  X,
  Search,
  ChevronDown,
  LayoutDashboard,
  Package,
  ShoppingBag,
  Box,
  ShoppingCart,
  ClipboardCheck,
  Wallet,
  Contact,
  ClipboardList,
  Users,
  Settings,
  Sparkles,
} from "lucide-react";
import { useCurrentUser } from "@/lib/user-context";
import { canAccessSection } from "@/lib/roles";

type HelpSection = {
  id: string;
  title: string;
  icon: typeof LayoutDashboard;
  adminOnly?: boolean;
  items: string[];
};

const SECTIONS: HelpSection[] = [
  {
    id: "inicio",
    title: "Primeros pasos",
    icon: Sparkles,
    items: [
      "Cada mañana revisa Pedidos: confirma los que están en 'pendiente' para que descuenten stock automáticamente.",
      "Cuando llegue mercadería nueva, actualiza el stock desde Productos o Inventario.",
      "Usa el buscador en cada sección para encontrar algo rápido, sin scrollear listas largas.",
      "Todo lo que haces queda guardado al instante, no hay un botón de 'guardar todo' al final.",
    ],
  },
  {
    id: "dashboard",
    title: "Dashboard",
    icon: LayoutDashboard,
    items: [
      "Resumen general: ventas del mes, pedidos pendientes y productos con poco stock.",
      "Es la primera pantalla al entrar, pensada para un vistazo rápido del negocio.",
    ],
  },
  {
    id: "productos",
    title: "Productos",
    icon: Package,
    items: [
      "Botón 'Nuevo producto' para agregar uno con fotos, precio, categoría y colores.",
      "El interruptor activa o desactiva un producto de la tienda sin borrarlo.",
      "Las flechas ↑↓ reordenan cómo se ven en la tienda (solo funciona sin filtros de búsqueda activos).",
      "Selecciona varios con el check para activar, desactivar o eliminar en lote.",
      "Marca 'Oferta' para mostrar precio promocional tachado, o 'Nuevo' para la etiqueta 🆕.",
    ],
  },
  {
    id: "categorias",
    title: "Categorías",
    icon: ShoppingBag,
    items: [
      "Organizan tus productos para que los clientes filtren en la tienda.",
      "Si renombras una categoría, todos los productos que la usaban se actualizan solos.",
      "Si borras una, sus productos quedan como 'Sin categoría' (no se borran).",
    ],
  },
  {
    id: "inventario",
    title: "Inventario",
    icon: Box,
    items: [
      "Vista rápida del stock de todos los productos, para detectar lo que se está por agotar.",
      "El stock también baja automáticamente cuando confirmas un pedido.",
    ],
  },
  {
    id: "pedidos",
    title: "Pedidos",
    icon: ClipboardCheck,
    items: [
      "Ciclo de vida: pendiente → confirmado → enviado → entregado (o cancelado en cualquier momento).",
      "Al confirmar un pedido se descuenta el stock. Si lo cancelas después, el stock se devuelve solo.",
      "Toca un pedido para ver el detalle de productos y el botón de WhatsApp del cliente.",
    ],
  },
  {
    id: "ventas",
    title: "Ventas",
    icon: ShoppingCart,
    items: [
      "Registra aquí una venta manual (cliente que compra en persona o por WhatsApp).",
      "Se crea automáticamente como pedido 'pendiente' y se vincula al cliente (o lo crea si es nuevo).",
    ],
  },
  {
    id: "clientes",
    title: "Clientes",
    icon: Contact,
    items: [
      "Base de datos de contactos: nombre, WhatsApp, email, dirección y notas internas.",
      "Botón de WhatsApp para escribirle directo desde el panel.",
    ],
  },
  {
    id: "leads",
    title: "Leads",
    icon: ClipboardList,
    items: [
      "Personas que dejaron sus datos en el formulario de regalo de la tienda (/regalo).",
      "El botón 'Convertir' lo pasa a Clientes automáticamente y lo saca de esta lista.",
      "Puedes exportar todo a PDF para revisarlo fuera del panel.",
    ],
  },
  {
    id: "contabilidad",
    title: "Contabilidad",
    icon: Wallet,
    adminOnly: true,
    items: [
      "Resumen financiero: ingresos por ventas, gastos registrados y ganancia neta.",
      "Sección de Gastos para registrar compras, servicios y otros costos del negocio.",
      "Solo visible para el rol ADMIN — información sensible del negocio.",
    ],
  },
  {
    id: "usuarios",
    title: "Usuarios y roles",
    icon: Users,
    adminOnly: true,
    items: [
      "ADMIN: acceso total, incluyendo Usuarios, Configuración y Contabilidad.",
      "EDITOR: crea y edita en los módulos operativos, pero no puede borrar ni ver zonas sensibles.",
      "VIEWER: solo puede ver, sin botones de crear, editar ni borrar.",
      "Crea una cuenta por cada persona que use el panel — evita compartir la tuya.",
    ],
  },
  {
    id: "configuracion",
    title: "Configuración",
    icon: Settings,
    adminOnly: true,
    items: [
      "Datos generales de la tienda: WhatsApp, redes sociales, horarios y textos de envío.",
      "Aquí también decides si se muestran los precios públicamente en la tienda.",
    ],
  },
];

export default function HelpButton() {
  const { role } = useCurrentUser();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState<string | null>("inicio");

  const visibleSections = SECTIONS.filter(
    (s) => !s.adminOnly || canAccessSection(role, s.id)
  );

  const filtered = visibleSections.filter((s) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return (
      s.title.toLowerCase().includes(q) ||
      s.items.some((i) => i.toLowerCase().includes(q))
    );
  });

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="Ayuda del panel"
        className="fixed bottom-5 right-5 sm:bottom-7 sm:right-7 z-40 w-14 h-14 rounded-full bg-brown-dark hover:bg-ink text-cream flex items-center justify-center transition-all hover:scale-105 active:scale-95"
        style={{ boxShadow: "0 8px 24px rgba(0,0,0,0.25)" }}
      >
        <HelpCircle className="w-6 h-6" />
      </button>

      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-ink/40 backdrop-blur-[2px] z-[95]" />
          <Dialog.Content className="fixed z-[96] right-0 top-0 h-full w-full sm:w-[420px] bg-panel-surface shadow-2xl flex flex-col focus:outline-none">
            <div className="flex items-start justify-between gap-3 px-5 pt-5 pb-4 border-b border-panel-border shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-brown-dark/10 flex items-center justify-center shrink-0">
                  <HelpCircle className="w-5 h-5 text-brown-dark" />
                </div>
                <div>
                  <Dialog.Title className="text-base font-bold text-panel-ink leading-tight">
                    Guía del panel
                  </Dialog.Title>
                  <Dialog.Description className="text-xs text-panel-ink-soft mt-0.5">
                    Cómo manejar cada sección
                  </Dialog.Description>
                </div>
              </div>
              <Dialog.Close asChild>
                <button
                  type="button"
                  className="text-panel-ink-soft hover:text-panel-ink hover:bg-panel-bg rounded-lg p-1.5 transition-colors shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              </Dialog.Close>
            </div>

            <div className="px-5 py-3 border-b border-panel-border shrink-0">
              <div className="relative">
                <Search className="w-4 h-4 text-panel-ink-soft absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Buscar en la guía..."
                  className="w-full bg-panel-bg border border-panel-border rounded-lg pl-9 pr-3 py-2 text-sm outline-none focus:border-brown-dark/40"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-2">
              {filtered.length === 0 && (
                <p className="text-sm text-panel-ink-soft text-center py-8">
                  No encontramos nada con &quot;{query}&quot;.
                </p>
              )}
              {filtered.map((section) => {
                const Icon = section.icon;
                const isOpen = expanded === section.id;
                return (
                  <div
                    key={section.id}
                    className="border border-panel-border rounded-xl overflow-hidden"
                  >
                    <button
                      onClick={() => setExpanded(isOpen ? null : section.id)}
                      className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left bg-panel-bg/40 hover:bg-panel-bg transition-colors"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Icon className="w-4 h-4 text-brown-dark shrink-0" />
                        <span className="text-sm font-semibold text-panel-ink truncate">
                          {section.title}
                        </span>
                      </div>
                      <ChevronDown
                        className={`w-4 h-4 text-panel-ink-soft shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`}
                      />
                    </button>
                    {isOpen && (
                      <ul className="px-4 py-3 space-y-2 bg-panel-surface">
                        {section.items.map((item, i) => (
                          <li key={i} className="flex gap-2 text-sm text-panel-ink-soft leading-relaxed">
                            <span className="text-brown-dark mt-1 shrink-0">•</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="px-5 py-3 border-t border-panel-border shrink-0 bg-panel-bg/50">
              <p className="text-[11px] text-panel-ink-soft text-center">
                Bebitos Admin · Guía interna del panel
              </p>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}
