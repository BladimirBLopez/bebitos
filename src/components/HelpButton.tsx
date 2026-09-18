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
  Globe,
  LogOut,
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
    title: "Cómo usar el panel",
    icon: Sparkles,
    items: [
      "Empieza revisando Dashboard para ver el estado general del negocio.",
      "Después revisa Pedidos pendientes: los pedidos online primero deben tener un cliente asignado antes de poder confirmarse o cobrarse.",
      "Las ventas directas o de mostrador se registran desde Ventas → Nueva venta.",
      "El stock se controla desde Inventario y también se actualiza automáticamente según las operaciones de pedidos y ventas.",
      "Los cambios importantes se guardan en el momento; no existe un botón general de 'Guardar todo'.",
      "Las opciones disponibles cambian según el rol del usuario: ADMIN, EDITOR o VIEWER.",
    ],
  },

  {
    id: "dashboard",
    title: "Dashboard",
    icon: LayoutDashboard,
    items: [
      "Muestra un resumen rápido del negocio con indicadores de ventas, pedidos, productos y resultados.",
      "Sirve para detectar rápidamente pedidos pendientes, movimiento comercial y productos que requieren atención.",
      "Los datos del Dashboard se alimentan de la información registrada en Ventas, Pedidos, Inventario y Contabilidad.",
    ],
  },

  {
    id: "ventas",
    title: "Ventas",
    icon: ShoppingCart,
    items: [
      "Aquí se consulta el historial de ventas registradas y su información financiera.",
      "El botón de nueva venta permite registrar una venta directa, de mostrador o concretada manualmente.",
      "Una venta manual se registra directamente como entregada y pagada, porque representa una operación ya concluida.",
      "Al registrar una venta manual, el stock se descuenta automáticamente.",
      "El sistema busca al cliente por WhatsApp; si existe lo reutiliza y, si no existe, crea un nuevo registro.",
      "Cada venta conserva el nombre del producto, cantidad, precio, costo y, cuando corresponde, el color elegido.",
      "Una venta entregada puede anularse desde el flujo correspondiente. Al anularla, el stock se devuelve y el pago queda registrado como reembolsado cuando corresponda.",
      "Los reportes permiten revisar y exportar información de ventas.",
    ],
  },

  {
    id: "pedidos",
    title: "Pedidos",
    icon: ClipboardCheck,
    items: [
      "Aquí llegan los pedidos realizados desde la tienda online.",
      "Un pedido online nuevo aparece inicialmente como pendiente y puede mostrarse como 'Sin cliente asignado'.",
      "La vendedora debe usar 'Asignar cliente' para registrar nombre y WhatsApp antes de confirmar o cobrar el pedido.",
      "Al asignar el WhatsApp, el sistema puede encontrar un cliente existente o crear uno nuevo.",
      "El ciclo normal es: pendiente → confirmado → enviado → entregado.",
      "Al confirmar el pedido se descuenta el stock de forma automática y segura.",
      "Un producto sin disponibilidad o sin stock suficiente no puede confirmarse.",
      "Los colores elegidos en la tienda quedan guardados en cada artículo del pedido.",
      "Un pedido pagado debe registrarse como reembolsado antes de poder cancelarse.",
      "Al cancelar un pedido cuyo stock ya fue descontado, las unidades se devuelven automáticamente.",
      "Un pedido entregado ya no retrocede de estado: si es necesario deshacer la operación debe utilizarse la anulación correspondiente.",
      "Los pedidos online pendientes y sin pago pueden cancelarse automáticamente cuando vencen según la configuración del sistema.",
    ],
  },

  {
    id: "productos",
    title: "Productos",
    icon: Package,
    items: [
      "Permite crear y administrar los productos que aparecen en la tienda.",
      "Cada producto puede tener nombre, descripción, categoría, características, fotografías, precio, costo, código de barras y colores.",
      "Las opciones 'Nuevo' y 'Oferta' funcionan de manera independiente.",
      "Una oferta puede tener su propio precio promocional.",
      "El sistema muestra información de costo, utilidad y margen para facilitar el control comercial.",
      "Un producto puede estar activo o pausado sin necesidad de eliminarlo.",
      "Si el stock llega a cero, el producto deja de estar disponible para pedidos.",
      "Puedes buscar productos por nombre, categoría o código de barras.",
      "La selección múltiple permite activar, pausar o eliminar varios productos según los permisos del usuario.",
      "El orden de los productos puede modificarse para cambiar su posición en la tienda.",
      "El stock de productos existentes se administra principalmente desde Inventario para evitar modificaciones accidentales.",
    ],
  },

  {
    id: "inventario",
    title: "Inventario",
    icon: Box,
    items: [
      "Muestra el stock actual de todos los productos y permite identificar rápidamente los agotados o con pocas unidades.",
      "Los estados principales son Disponible, Stock bajo, Pausado y Agotado.",
      "El nivel de 'Stock bajo' depende del límite mínimo configurado para cada producto.",
      "Usa 'Ajustar' para modificar el stock y el nivel mínimo de alerta de un producto.",
      "Cuando el stock llega a cero, el producto queda sin disponibilidad.",
      "El stock también cambia automáticamente cuando se confirma un pedido, se registra una venta, se cancela una operación o se anula una venta.",
      "El sistema realiza comprobaciones para reducir el riesgo de vender más unidades de las disponibles.",
    ],
  },

  {
    id: "categorias",
    title: "Categorías",
    icon: ShoppingBag,
    items: [
      "Las categorías organizan el catálogo y ayudan al cliente a encontrar productos en la tienda.",
      "Puedes crear, ordenar y administrar las categorías disponibles.",
      "El orden configurado se utiliza para presentarlas de manera organizada.",
      "Antes de cambiar o eliminar una categoría, revisa qué productos están asociados a ella.",
    ],
  },

  {
    id: "clientes",
    title: "Clientes",
    icon: Contact,
    items: [
      "Es la base de datos de compradores y contactos comerciales.",
      "Cada cliente puede tener nombre, WhatsApp, email, dirección y notas internas.",
      "Desde una venta manual el sistema puede reutilizar automáticamente un cliente existente según su WhatsApp.",
      "Desde Pedidos también puede asignarse un cliente existente o crear uno nuevo.",
      "La búsqueda por WhatsApp permite reconocer rápidamente clientes que ya compraron anteriormente.",
      "Usa el acceso de WhatsApp para comunicarte directamente con el cliente cuando corresponda.",
    ],
  },

  {
    id: "leads",
    title: "Leads",
    icon: ClipboardList,
    items: [
      "Aquí se registran personas interesadas que dejaron sus datos mediante el formulario público de regalo.",
      "Los leads son contactos potenciales y todavía no necesariamente representan una venta.",
      "Puedes convertir un lead en cliente cuando corresponda.",
      "La información puede exportarse para seguimiento y análisis comercial.",
    ],
  },

  {
    id: "contabilidad",
    title: "Contabilidad",
    icon: Wallet,
    adminOnly: true,
    items: [
      "Esta sección reúne información financiera sensible y está disponible únicamente para ADMIN.",
      "Muestra ingresos provenientes de ventas, gastos registrados y resultados del negocio.",
      "Permite registrar gastos como insumos, transporte, sueldos, marketing, alquiler, servicios y otros.",
      "Las ventas anuladas o reembolsadas se consideran dentro de la lógica financiera correspondiente para mantener el historial.",
      "Revisa esta sección periódicamente para comparar ingresos, costos, gastos y balance.",
    ],
  },

  {
    id: "usuarios",
    title: "Usuarios y roles",
    icon: Users,
    adminOnly: true,
    items: [
      "Esta sección está disponible únicamente para ADMIN.",
      "ADMIN tiene acceso completo al panel, incluyendo Usuarios, Configuración y Contabilidad.",
      "EDITOR puede trabajar en los módulos operativos y realizar cambios permitidos, pero no accede a las áreas administrativas sensibles.",
      "VIEWER puede consultar información pero no realizar cambios.",
      "Los usuarios pueden activarse o desactivarse. Una cuenta desactivada pierde acceso a las operaciones protegidas.",
      "El sistema protege al administrador actual para evitar que se quite accidentalmente sus propios permisos o deje el sistema sin un administrador activo.",
      "Crea una cuenta diferente para cada persona que utilice el panel en lugar de compartir contraseñas.",
    ],
  },

  {
    id: "configuracion",
    title: "Configuración",
    icon: Settings,
    adminOnly: true,
    items: [
      "Esta sección está disponible únicamente para ADMIN.",
      "Aquí se administran datos generales y opciones públicas de la tienda.",
      "Puedes configurar información como WhatsApp, redes sociales, horarios y otros datos visibles para el cliente.",
      "También puedes decidir si los precios se muestran públicamente en la tienda.",
      "Los recursos o contenidos especiales administrados desde Configuración están protegidos para evitar modificaciones por usuarios sin permisos.",
    ],
  },

  {
    id: "tienda",
    title: "Tienda y accesos externos",
    icon: Globe,
    items: [
      "El enlace 'Ver tienda' abre la tienda pública de Bebitos en una nueva pestaña.",
      "El enlace 'Página de enlaces' abre la página pública que reúne accesos y redes de la marca.",
      "Los cambios de productos, disponibilidad, precios y configuración pueden reflejarse en las páginas públicas correspondientes.",
      "El carrito de la tienda registra el pedido antes de abrir WhatsApp para conservar el número de operación y los productos solicitados.",
    ],
  },

  {
    id: "sesion",
    title: "Sesión y seguridad",
    icon: LogOut,
    items: [
      "Usa 'Cerrar Sesión' cuando termines de trabajar, especialmente en computadoras compartidas.",
      "No compartas tu contraseña ni tu cuenta con otras personas.",
      "Las acciones disponibles dependen del rol asignado a cada usuario.",
      "Las operaciones sensibles tienen validaciones adicionales en el servidor aunque un botón no aparezca en pantalla.",
    ],
  },
];

const ROLE_LABELS: Record<string, string> = {
  ADMIN: "Administrador",
  EDITOR: "Editor",
  VIEWER: "Solo lectura",
};

export default function HelpButton() {
  const { role } = useCurrentUser();

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] =
    useState<string | null>("inicio");

  const visibleSections = SECTIONS.filter(
    (section) =>
      !section.adminOnly ||
      canAccessSection(role, section.id)
  );

  const filtered = visibleSections.filter(
    (section) => {
      const q = query.trim().toLowerCase();

      if (!q) return true;

      return (
        section.title.toLowerCase().includes(q) ||
        section.items.some((item) =>
          item.toLowerCase().includes(q)
        )
      );
    }
  );

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Abrir guía del panel"
        className="fixed bottom-5 left-5 sm:bottom-7 sm:left-7 z-40 flex items-center justify-center gap-2 h-12 sm:h-11 px-3 sm:px-4 rounded-full bg-brown-dark hover:bg-ink text-cream transition-all hover:scale-[1.03] active:scale-95"
        style={{
          boxShadow:
            "0 8px 24px rgba(0,0,0,0.25)",
        }}
      >
        <HelpCircle className="w-5 h-5 shrink-0" />
        <span className="hidden sm:inline text-sm font-semibold">
          Ayuda
        </span>
      </button>

      <Dialog.Root
        open={open}
        onOpenChange={setOpen}
      >
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-ink/40 backdrop-blur-[2px] z-[95]" />

          <Dialog.Content className="fixed z-[96] right-0 top-0 h-full w-full sm:w-[460px] bg-panel-surface shadow-2xl flex flex-col focus:outline-none">
            <div className="flex items-start justify-between gap-3 px-5 pt-5 pb-4 border-b border-panel-border shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-full bg-brown-dark/10 flex items-center justify-center shrink-0">
                  <HelpCircle className="w-5 h-5 text-brown-dark" />
                </div>

                <div className="min-w-0">
                  <Dialog.Title className="text-base font-bold text-panel-ink leading-tight">
                    Guía completa del panel
                  </Dialog.Title>

                  <Dialog.Description className="text-xs text-panel-ink-soft mt-0.5">
                    {visibleSections.length} temas ·{" "}
                    {ROLE_LABELS[role] || role}
                  </Dialog.Description>
                </div>
              </div>

              <Dialog.Close asChild>
                <button
                  type="button"
                  aria-label="Cerrar guía"
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
                  onChange={(event) =>
                    setQuery(event.target.value)
                  }
                  placeholder="Buscar: pedido, stock, cliente, pago..."
                  className="w-full bg-panel-bg border border-panel-border rounded-lg pl-9 pr-3 py-2.5 text-sm outline-none focus:border-brown-dark/40"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-2">
              {filtered.length === 0 && (
                <p className="text-sm text-panel-ink-soft text-center py-8">
                  No encontramos información sobre
                  &quot;{query}&quot;.
                </p>
              )}

              {filtered.map((section) => {
                const Icon = section.icon;
                const isOpen =
                  expanded === section.id;

                return (
                  <div
                    key={section.id}
                    className="border border-panel-border rounded-xl overflow-hidden"
                  >
                    <button
                      type="button"
                      onClick={() =>
                        setExpanded(
                          isOpen
                            ? null
                            : section.id
                        )
                      }
                      className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left bg-panel-bg/40 hover:bg-panel-bg transition-colors"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Icon className="w-4 h-4 text-brown-dark shrink-0" />

                        <span className="text-sm font-semibold text-panel-ink truncate">
                          {section.title}
                        </span>
                      </div>

                      <ChevronDown
                        className={`w-4 h-4 text-panel-ink-soft shrink-0 transition-transform ${
                          isOpen
                            ? "rotate-180"
                            : ""
                        }`}
                      />
                    </button>

                    {isOpen && (
                      <ul className="px-4 py-3 space-y-2.5 bg-panel-surface">
                        {section.items.map(
                          (item, index) => (
                            <li
                              key={index}
                              className="flex gap-2 text-sm text-panel-ink-soft leading-relaxed"
                            >
                              <span className="text-brown-dark mt-1 shrink-0">
                                •
                              </span>

                              <span>{item}</span>
                            </li>
                          )
                        )}
                      </ul>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="px-5 py-3 border-t border-panel-border shrink-0 bg-panel-bg/50">
              <p className="text-[11px] text-panel-ink-soft text-center">
                Bebitos Admin · Guía interna
                actualizada
              </p>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}
