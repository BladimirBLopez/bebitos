"use client";

import {
  useEffect,
  useState,
  type ReactNode,
} from "react";

import * as Dialog from "@radix-ui/react-dialog";

import {
  HelpCircle,
  X,
  Search,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
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
  ImageIcon,
  Lightbulb,
  CheckCircle2,
  type LucideIcon,
} from "lucide-react";

import { useCurrentUser } from "@/lib/user-context";
import { canAccessSection } from "@/lib/roles";

type TutorialStep = {
  title: string;
  description: string;
  image: string;
  tip?: string;
  warning?: string;
};

type HelpSection = {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  adminOnly?: boolean;
  steps: TutorialStep[];
};

const SECTIONS: HelpSection[] = [
  {
    id: "inicio",
    title: "Cómo usar el panel",
    description:
      "Conoce el flujo general de trabajo dentro del panel administrativo.",
    icon: Sparkles,
    steps: [
      {
        title: "1. Conoce el menú principal",
        description:
          "Utiliza el menú lateral para ingresar a Dashboard, Pedidos, Ventas, Productos, Inventario, Clientes y las demás áreas disponibles según tu rol.",
        image:
          "/tutoriales/inicio/01-menu-principal.webp",
        tip:
          "Las opciones visibles pueden cambiar según seas Administrador, Editor o usuario de Solo lectura.",
      },
      {
        title: "2. Revisa primero el Dashboard",
        description:
          "El Dashboard te permite conocer rápidamente el movimiento del negocio, pedidos pendientes, ventas, productos y alertas importantes.",
        image:
          "/tutoriales/inicio/02-dashboard.webp",
      },
      {
        title: "3. Atiende las operaciones pendientes",
        description:
          "Revisa los pedidos online pendientes y después registra las ventas directas o de mostrador desde el módulo Ventas.",
        image:
          "/tutoriales/inicio/03-operaciones.webp",
      },
      {
        title: "4. Controla el inventario",
        description:
          "El stock se actualiza automáticamente con ventas y pedidos, pero también puedes realizar ajustes autorizados desde Inventario.",
        image:
          "/tutoriales/inicio/04-inventario.webp",
        tip:
          "No existe un botón general de Guardar todo. Las operaciones se guardan en el momento correspondiente.",
      },
    ],
  },

  {
    id: "dashboard",
    title: "Dashboard",
    description:
      "Aprende a interpretar el resumen general del negocio.",
    icon: LayoutDashboard,
    steps: [
      {
        title: "1. Revisa los indicadores",
        description:
          "Al ingresar al Dashboard encontrarás indicadores que resumen ventas, pedidos, productos y otros datos relevantes del negocio.",
        image:
          "/tutoriales/dashboard/01-indicadores.webp",
      },
      {
        title: "2. Identifica alertas",
        description:
          "Utiliza las tarjetas y resúmenes para detectar productos con poco stock, operaciones pendientes o movimientos que requieren atención.",
        image:
          "/tutoriales/dashboard/02-alertas.webp",
      },
      {
        title: "3. Consulta tendencias",
        description:
          "Los gráficos y resúmenes permiten observar cómo se comportan las ventas y otros indicadores registrados en el sistema.",
        image:
          "/tutoriales/dashboard/03-graficos.webp",
        tip:
          "Los datos dependen de la información registrada en Ventas, Pedidos, Inventario y Contabilidad.",
      },
    ],
  },

  {
    id: "ventas",
    title: "Ventas",
    description:
      "Registra correctamente una venta directa o de mostrador.",
    icon: ShoppingCart,
    steps: [
      {
        title: "1. Ingresa a Nueva venta",
        description:
          "Desde el menú lateral entra a Ventas y selecciona Nueva venta para iniciar una operación de mostrador.",
        image:
          "/tutoriales/ventas/01-nueva-venta.webp",
      },
      {
        title: "2. Busca el producto",
        description:
          "Escribe el nombre del producto en el buscador. También puedes ingresar o escanear su código de barras.",
        image:
          "/tutoriales/ventas/02-buscar-producto.webp",
      },
      {
        title: "3. Escanea el código de barras",
        description:
          "Presiona Escanear código de barras, permite el acceso a la cámara y apunta al código del producto hasta que sea detectado.",
        image:
          "/tutoriales/ventas/03-escaner.webp",
        tip:
          "Si escaneas nuevamente el mismo producto, la cantidad aumenta automáticamente hasta alcanzar el stock disponible.",
      },
      {
        title: "4. Revisa el carrito",
        description:
          "Comprueba los productos agregados, sus cantidades, precios unitarios y el total de la venta. Puedes aumentar, disminuir o eliminar productos.",
        image:
          "/tutoriales/ventas/04-carrito.webp",
      },
      {
        title: "5. Registra al cliente",
        description:
          "Ingresa el WhatsApp y los datos solicitados. Si el cliente ya existe, el sistema puede recuperar automáticamente su información.",
        image:
          "/tutoriales/ventas/05-cliente.webp",
      },
      {
        title: "6. Selecciona el método de pago",
        description:
          "Selecciona cómo se realizó el pago: Efectivo, QR o Transferencia.",
        image:
          "/tutoriales/ventas/06-pago.webp",
      },
      {
        title: "7. Registra la venta",
        description:
          "Verifica la información y presiona Registrar venta. La operación quedará registrada y el stock será descontado automáticamente.",
        image:
          "/tutoriales/ventas/07-registrar.webp",
        tip:
          "Una venta directa representa una operación concluida, por lo que queda registrada como entregada y pagada.",
      },
    ],
  },

  {
    id: "pedidos",
    title: "Pedidos",
    description:
      "Gestiona correctamente los pedidos realizados desde la tienda online.",
    icon: ClipboardCheck,
    steps: [
      {
        title: "1. Revisa los pedidos nuevos",
        description:
          "Ingresa a Pedidos para revisar las compras realizadas desde la tienda online. Los pedidos nuevos aparecen inicialmente como pendientes.",
        image:
          "/tutoriales/pedidos/01-lista.webp",
      },
      {
        title: "2. Revisa los datos del pedido",
        description:
          "Abre el pedido para revisar productos, cantidades, colores seleccionados, total y otra información registrada por el cliente.",
        image:
          "/tutoriales/pedidos/02-detalle.webp",
      },
      {
        title: "3. Asigna un cliente",
        description:
          "Si aparece Sin cliente asignado, utiliza la opción correspondiente para registrar el nombre y WhatsApp antes de continuar.",
        image:
          "/tutoriales/pedidos/03-cliente.webp",
      },
      {
        title: "4. Confirma el pedido",
        description:
          "Cuando hayas verificado disponibilidad y datos del cliente, confirma el pedido. El stock se descontará automáticamente.",
        image:
          "/tutoriales/pedidos/04-confirmar.webp",
        warning:
          "Un pedido no puede confirmarse si no existe stock suficiente.",
      },
      {
        title: "5. Actualiza el estado",
        description:
          "El flujo normal del pedido es Pendiente → Confirmado → Enviado → Entregado.",
        image:
          "/tutoriales/pedidos/05-estados.webp",
      },
      {
        title: "6. Registra el pago",
        description:
          "Actualiza la información de pago cuando corresponda para mantener el historial financiero correcto.",
        image:
          "/tutoriales/pedidos/06-pago.webp",
      },
      {
        title: "7. Cancelaciones y anulaciones",
        description:
          "Si una operación debe cancelarse, utiliza el flujo correspondiente. Cuando procede, el sistema devuelve las unidades al stock.",
        image:
          "/tutoriales/pedidos/07-cancelar.webp",
        warning:
          "Los pedidos entregados no deben retroceder de estado. Para deshacer una operación concluida utiliza la anulación correspondiente.",
      },
    ],
  },

  {
    id: "productos",
    title: "Productos",
    description:
      "Crea, edita y organiza los productos de la tienda.",
    icon: Package,
    steps: [
      {
        title: "1. Crea un nuevo producto",
        description:
          "Ingresa a Productos y utiliza el botón Nuevo producto para abrir el formulario de registro.",
        image:
          "/tutoriales/productos/01-nuevo.webp",
      },
      {
        title: "2. Completa la información",
        description:
          "Ingresa nombre, descripción, categoría, características y demás información necesaria para identificar correctamente el producto.",
        image:
          "/tutoriales/productos/02-informacion.webp",
      },
      {
        title: "3. Agrega fotografías",
        description:
          "Sube una o varias imágenes. La primera imagen se utilizará como portada principal del producto.",
        image:
          "/tutoriales/productos/03-imagenes.webp",
      },
      {
        title: "4. Registra precio y costo",
        description:
          "Ingresa el precio de venta y, cuando corresponda, el costo por unidad. El sistema puede mostrar una estimación de ganancia y margen.",
        image:
          "/tutoriales/productos/04-precio.webp",
      },
      {
        title: "5. Configura el inventario",
        description:
          "Para productos nuevos define el stock inicial y el nivel en el que deseas recibir una alerta de stock bajo.",
        image:
          "/tutoriales/productos/05-stock.webp",
      },
      {
        title: "6. Registra el código de barras",
        description:
          "Puedes escribir el código, escanearlo utilizando la cámara o generar un código interno para productos que no tengan código propio.",
        image:
          "/tutoriales/productos/06-barcode.webp",
      },
      {
        title: "7. Guarda el producto",
        description:
          "Revisa toda la información y presiona Crear producto o Guardar cambios.",
        image:
          "/tutoriales/productos/07-guardar.webp",
      },
    ],
  },

  {
    id: "inventario",
    title: "Inventario",
    description:
      "Controla existencias, alertas y disponibilidad de productos.",
    icon: Box,
    steps: [
      {
        title: "1. Revisa el stock actual",
        description:
          "En Inventario encontrarás las unidades disponibles de cada producto y su estado actual.",
        image:
          "/tutoriales/inventario/01-listado.webp",
      },
      {
        title: "2. Identifica los estados",
        description:
          "Los productos pueden mostrarse como Disponible, Stock bajo, Pausado o Agotado.",
        image:
          "/tutoriales/inventario/02-estados.webp",
      },
      {
        title: "3. Ajusta el inventario",
        description:
          "Utiliza la opción Ajustar para corregir las unidades de un producto cuando exista una entrada, corrección o ajuste autorizado.",
        image:
          "/tutoriales/inventario/03-ajustar.webp",
      },
      {
        title: "4. Configura la alerta mínima",
        description:
          "Define cuántas unidades deben quedar para que el sistema considere que existe stock bajo.",
        image:
          "/tutoriales/inventario/04-alerta.webp",
      },
      {
        title: "5. Comprende los movimientos automáticos",
        description:
          "Las ventas, confirmaciones de pedidos, cancelaciones y anulaciones pueden modificar automáticamente las existencias.",
        image:
          "/tutoriales/inventario/05-movimientos.webp",
        tip:
          "Evita modificar el stock manualmente si el cambio corresponde a una venta o pedido que todavía no fue registrado.",
      },
    ],
  },

  {
    id: "categorias",
    title: "Categorías",
    description:
      "Organiza los productos que aparecen en el catálogo.",
    icon: ShoppingBag,
    steps: [
      {
        title: "1. Revisa las categorías",
        description:
          "Ingresa a Categorías para visualizar todas las clasificaciones utilizadas en la tienda.",
        image:
          "/tutoriales/categorias/01-listado.webp",
      },
      {
        title: "2. Crea una categoría",
        description:
          "Agrega una nueva categoría utilizando un nombre claro que permita identificar fácilmente el grupo de productos.",
        image:
          "/tutoriales/categorias/02-crear.webp",
      },
      {
        title: "3. Ordena las categorías",
        description:
          "Ajusta el orden cuando necesites modificar la forma en que se presentan en la tienda.",
        image:
          "/tutoriales/categorias/03-orden.webp",
      },
      {
        title: "4. Edita con cuidado",
        description:
          "Antes de eliminar o cambiar una categoría revisa qué productos están asociados a ella.",
        image:
          "/tutoriales/categorias/04-editar.webp",
      },
    ],
  },

  {
    id: "clientes",
    title: "Clientes",
    description:
      "Consulta y administra la información de compradores.",
    icon: Contact,
    steps: [
      {
        title: "1. Abre el módulo Clientes",
        description:
          "En esta sección encontrarás los compradores registrados desde ventas, pedidos y registros manuales.",
        image:
          "/tutoriales/clientes/01-listado.webp",
      },
      {
        title: "2. Busca un cliente",
        description:
          "Utiliza nombre, WhatsApp u otros datos disponibles para localizar rápidamente al comprador.",
        image:
          "/tutoriales/clientes/02-buscar.webp",
      },
      {
        title: "3. Revisa su información",
        description:
          "Consulta datos como nombre, WhatsApp, email, dirección, notas e historial disponible.",
        image:
          "/tutoriales/clientes/03-detalle.webp",
      },
      {
        title: "4. Actualiza los datos",
        description:
          "Corrige o completa la información del cliente cuando sea necesario.",
        image:
          "/tutoriales/clientes/04-editar.webp",
      },
      {
        title: "5. Utiliza WhatsApp",
        description:
          "Cuando esté disponible, utiliza el acceso directo para comunicarte con el cliente.",
        image:
          "/tutoriales/clientes/05-whatsapp.webp",
      },
    ],
  },

  {
    id: "leads",
    title: "Leads",
    description:
      "Gestiona personas interesadas que todavía no necesariamente realizaron una compra.",
    icon: ClipboardList,
    steps: [
      {
        title: "1. Revisa nuevos contactos",
        description:
          "Los leads provienen de personas que dejaron información mediante formularios públicos u otras acciones comerciales.",
        image:
          "/tutoriales/leads/01-listado.webp",
      },
      {
        title: "2. Consulta los datos",
        description:
          "Revisa nombre, contacto y otra información disponible para realizar seguimiento.",
        image:
          "/tutoriales/leads/02-detalle.webp",
      },
      {
        title: "3. Realiza seguimiento",
        description:
          "Utiliza la información registrada para contactar al interesado y conocer si desea realizar una compra.",
        image:
          "/tutoriales/leads/03-seguimiento.webp",
      },
      {
        title: "4. Convierte cuando corresponda",
        description:
          "Cuando un lead pasa a ser comprador puedes convertirlo o registrarlo como cliente según el flujo disponible.",
        image:
          "/tutoriales/leads/04-convertir.webp",
      },
    ],
  },

  {
    id: "contabilidad",
    title: "Contabilidad",
    description:
      "Revisa ingresos, costos, gastos y resultados financieros.",
    icon: Wallet,
    adminOnly: true,
    steps: [
      {
        title: "1. Revisa el resumen financiero",
        description:
          "Esta sección muestra información financiera generada a partir de ventas y registros contables.",
        image:
          "/tutoriales/contabilidad/01-resumen.webp",
      },
      {
        title: "2. Consulta ingresos",
        description:
          "Revisa los ingresos provenientes de ventas registradas en el sistema.",
        image:
          "/tutoriales/contabilidad/02-ingresos.webp",
      },
      {
        title: "3. Registra un gasto",
        description:
          "Utiliza la opción correspondiente para registrar gastos como transporte, marketing, servicios, insumos, alquiler u otros.",
        image:
          "/tutoriales/contabilidad/03-gastos.webp",
      },
      {
        title: "4. Revisa los resultados",
        description:
          "Compara ingresos, costos y gastos para comprender el resultado del negocio.",
        image:
          "/tutoriales/contabilidad/04-resultados.webp",
      },
      {
        title: "5. Considera anulaciones",
        description:
          "Las anulaciones y reembolsos forman parte del historial financiero y deben mantenerse registrados correctamente.",
        image:
          "/tutoriales/contabilidad/05-anulaciones.webp",
      },
    ],
  },

  {
    id: "usuarios",
    title: "Usuarios y roles",
    description:
      "Administra quién puede ingresar y qué acciones puede realizar.",
    icon: Users,
    adminOnly: true,
    steps: [
      {
        title: "1. Revisa los usuarios",
        description:
          "Ingresa a Usuarios para consultar las cuentas habilitadas dentro del panel.",
        image:
          "/tutoriales/usuarios/01-listado.webp",
      },
      {
        title: "2. Crea una cuenta",
        description:
          "Registra una cuenta independiente para cada persona que utilizará el sistema.",
        image:
          "/tutoriales/usuarios/02-crear.webp",
      },
      {
        title: "3. Selecciona el rol",
        description:
          "ADMIN tiene acceso completo, EDITOR trabaja con módulos operativos y VIEWER dispone principalmente de consulta.",
        image:
          "/tutoriales/usuarios/03-roles.webp",
      },
      {
        title: "4. Activa o desactiva cuentas",
        description:
          "Cuando una persona deja de utilizar el sistema puedes desactivar su cuenta sin necesidad de compartir o modificar otras credenciales.",
        image:
          "/tutoriales/usuarios/04-estado.webp",
      },
      {
        title: "5. Protege las credenciales",
        description:
          "Cada usuario debe utilizar su propia cuenta. Evita compartir contraseñas entre varias personas.",
        image:
          "/tutoriales/usuarios/05-seguridad.webp",
      },
    ],
  },

  {
    id: "configuracion",
    title: "Configuración",
    description:
      "Administra información general y opciones públicas de la tienda.",
    icon: Settings,
    adminOnly: true,
    steps: [
      {
        title: "1. Ingresa a Configuración",
        description:
          "Esta sección está disponible para usuarios con permisos administrativos.",
        image:
          "/tutoriales/configuracion/01-inicio.webp",
      },
      {
        title: "2. Actualiza los datos generales",
        description:
          "Modifica información pública como WhatsApp, horarios, redes sociales y otros datos configurables.",
        image:
          "/tutoriales/configuracion/02-datos.webp",
      },
      {
        title: "3. Configura la tienda",
        description:
          "Activa o desactiva opciones públicas disponibles, como la visualización de precios cuando corresponda.",
        image:
          "/tutoriales/configuracion/03-tienda.webp",
      },
      {
        title: "4. Administra recursos",
        description:
          "Gestiona los contenidos o recursos especiales que se encuentren disponibles dentro de Configuración.",
        image:
          "/tutoriales/configuracion/04-recursos.webp",
      },
      {
        title: "5. Verifica los cambios",
        description:
          "Después de realizar modificaciones revisa la tienda pública para comprobar cómo se visualizan.",
        image:
          "/tutoriales/configuracion/05-verificar.webp",
      },
    ],
  },

  {
    id: "tienda",
    title: "Tienda y accesos externos",
    description:
      "Comprende cómo se relaciona el panel con la tienda pública.",
    icon: Globe,
    steps: [
      {
        title: "1. Abre la tienda pública",
        description:
          "Utiliza Ver tienda para abrir el catálogo público de Bebitos en una nueva pestaña.",
        image:
          "/tutoriales/tienda/01-tienda.webp",
      },
      {
        title: "2. Revisa los productos",
        description:
          "Los productos, precios y disponibilidad configurados desde el panel pueden reflejarse en la tienda pública.",
        image:
          "/tutoriales/tienda/02-productos.webp",
      },
      {
        title: "3. Comprueba el carrito",
        description:
          "El cliente puede agregar productos al carrito y completar la información necesaria antes de enviar su pedido.",
        image:
          "/tutoriales/tienda/03-carrito.webp",
      },
      {
        title: "4. Pedido y WhatsApp",
        description:
          "El sistema registra el pedido antes de continuar hacia WhatsApp para conservar la operación y los productos solicitados.",
        image:
          "/tutoriales/tienda/04-whatsapp.webp",
      },
    ],
  },

  {
    id: "sesion",
    title: "Sesión y seguridad",
    description:
      "Buenas prácticas para utilizar el panel de manera segura.",
    icon: LogOut,
    steps: [
      {
        title: "1. Utiliza tu propia cuenta",
        description:
          "Cada persona debe ingresar con sus propias credenciales para mantener un control adecuado de acceso.",
        image:
          "/tutoriales/sesion/01-login.webp",
      },
      {
        title: "2. Respeta los permisos",
        description:
          "Las acciones disponibles dependen del rol asignado a cada usuario.",
        image:
          "/tutoriales/sesion/02-permisos.webp",
      },
      {
        title: "3. Protege tu contraseña",
        description:
          "No compartas tu contraseña ni la de otros usuarios.",
        image:
          "/tutoriales/sesion/03-password.webp",
      },
      {
        title: "4. Cierra sesión",
        description:
          "Cuando termines de trabajar utiliza Cerrar sesión, especialmente si utilizaste un equipo compartido.",
        image:
          "/tutoriales/sesion/04-cerrar.webp",
      },
    ],
  },
];

const ROLE_LABELS: Record<string, string> = {
  ADMIN: "Administrador",
  EDITOR: "Editor",
  VIEWER: "Solo lectura",
};

function TutorialImage({
  src,
  alt,
}: {
  src: string;
  alt: string;
}) {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [src]);

  if (failed) {
    return (
      <div className="w-full aspect-[16/10] rounded-xl border border-dashed border-panel-border bg-panel-bg flex flex-col items-center justify-center text-center p-5">
        <ImageIcon className="w-8 h-8 text-panel-ink-soft/50 mb-2" />

        <p className="text-xs font-semibold text-panel-ink">
          Imagen del tutorial
        </p>

        <p className="text-[10px] text-panel-ink-soft mt-1 break-all">
          {src}
        </p>

        <p className="text-[10px] text-panel-ink-soft mt-2">
          Coloca tu captura en esta ruta.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl overflow-hidden border border-panel-border bg-panel-bg">
      <img
        src={src}
        alt={alt}
        className="w-full h-auto object-contain"
        onError={() => setFailed(true)}
      />
    </div>
  );
}

function InfoBox({
  icon,
  children,
  variant = "tip",
}: {
  icon: ReactNode;
  children: ReactNode;
  variant?: "tip" | "warning";
}) {
  const classes =
    variant === "warning"
      ? "bg-amber-50 border-amber-200 text-amber-900"
      : "bg-green/10 border-green/20 text-panel-ink";

  return (
    <div
      className={`flex items-start gap-2.5 border rounded-xl px-3 py-3 ${classes}`}
    >
      <span className="shrink-0 mt-0.5">
        {icon}
      </span>

      <p className="text-xs leading-relaxed">
        {children}
      </p>
    </div>
  );
}

export default function HelpButton() {
  const { role } = useCurrentUser();

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const [expanded, setExpanded] =
    useState<string | null>("inicio");

  const [activeSteps, setActiveSteps] =
    useState<Record<string, number>>({});

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
        section.title
          .toLowerCase()
          .includes(q) ||
        section.description
          .toLowerCase()
          .includes(q) ||
        section.steps.some(
          (step) =>
            step.title
              .toLowerCase()
              .includes(q) ||
            step.description
              .toLowerCase()
              .includes(q) ||
            step.tip
              ?.toLowerCase()
              .includes(q) ||
            step.warning
              ?.toLowerCase()
              .includes(q)
        )
      );
    }
  );

  function getActiveStep(
    sectionId: string,
    total: number
  ) {
    const value =
      activeSteps[sectionId] ?? 0;

    if (value < 0) return 0;
    if (value >= total)
      return total - 1;

    return value;
  }

  function setStep(
    sectionId: string,
    nextStep: number
  ) {
    setActiveSteps((current) => ({
      ...current,
      [sectionId]: nextStep,
    }));
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Abrir tutoriales del panel"
        className="fixed bottom-5 left-5 sm:bottom-7 sm:left-7 z-40 flex items-center justify-center gap-2 h-12 sm:h-11 px-3 sm:px-4 rounded-full bg-brown-dark hover:bg-ink text-cream transition-all hover:scale-[1.03] active:scale-95"
        style={{
          boxShadow:
            "0 8px 24px rgba(0,0,0,0.25)",
        }}
      >
        <HelpCircle className="w-5 h-5 shrink-0" />

        <span className="hidden sm:inline text-sm font-semibold">
          Tutoriales
        </span>
      </button>

      <Dialog.Root
        open={open}
        onOpenChange={setOpen}
      >
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-ink/40 backdrop-blur-[2px] z-[95]" />

          <Dialog.Content className="fixed z-[96] right-0 top-0 h-full w-full sm:w-[560px] bg-panel-surface shadow-2xl flex flex-col focus:outline-none">
            <div className="flex items-start justify-between gap-3 px-5 pt-5 pb-4 border-b border-panel-border shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-full bg-brown-dark/10 flex items-center justify-center shrink-0">
                  <HelpCircle className="w-5 h-5 text-brown-dark" />
                </div>

                <div className="min-w-0">
                  <Dialog.Title className="text-base font-bold text-panel-ink leading-tight">
                    Tutoriales del panel
                  </Dialog.Title>

                  <Dialog.Description className="text-xs text-panel-ink-soft mt-0.5">
                    Guías visuales paso a paso ·{" "}
                    {ROLE_LABELS[role] ||
                      role}
                  </Dialog.Description>
                </div>
              </div>

              <Dialog.Close asChild>
                <button
                  type="button"
                  aria-label="Cerrar tutoriales"
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
                    setQuery(
                      event.target.value
                    )
                  }
                  placeholder="Buscar tutorial..."
                  className="w-full bg-panel-bg border border-panel-border rounded-lg pl-9 pr-3 py-2.5 text-sm outline-none focus:border-brown-dark/40"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-4 sm:px-5 py-4 space-y-3">
              {filtered.length === 0 && (
                <div className="text-center py-10">
                  <Search className="w-8 h-8 text-panel-ink-soft/40 mx-auto mb-2" />

                  <p className="text-sm font-semibold text-panel-ink">
                    No encontramos ese tutorial
                  </p>

                  <p className="text-xs text-panel-ink-soft mt-1">
                    Intenta buscar otra palabra.
                  </p>
                </div>
              )}

              {filtered.map((section) => {
                const Icon = section.icon;

                const isOpen =
                  expanded === section.id;

                const stepIndex =
                  getActiveStep(
                    section.id,
                    section.steps.length
                  );

                const step =
                  section.steps[stepIndex];

                return (
                  <div
                    key={section.id}
                    className="border border-panel-border rounded-2xl overflow-hidden bg-panel-surface"
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
                      className="w-full flex items-start justify-between gap-3 px-4 py-3.5 text-left bg-panel-bg/40 hover:bg-panel-bg transition-colors"
                    >
                      <div className="flex items-start gap-3 min-w-0">
                        <span className="w-9 h-9 rounded-xl bg-brown-dark/10 flex items-center justify-center shrink-0">
                          <Icon className="w-4 h-4 text-brown-dark" />
                        </span>

                        <div className="min-w-0">
                          <span className="block text-sm font-semibold text-panel-ink">
                            {section.title}
                          </span>

                          <span className="block text-[11px] text-panel-ink-soft mt-0.5 leading-relaxed">
                            {
                              section.description
                            }
                          </span>
                        </div>
                      </div>

                      <ChevronDown
                        className={`w-4 h-4 text-panel-ink-soft shrink-0 mt-2 transition-transform ${
                          isOpen
                            ? "rotate-180"
                            : ""
                        }`}
                      />
                    </button>

                    {isOpen && (
                      <div className="p-4 border-t border-panel-border">
                        <div className="flex items-center justify-between gap-3 mb-3">
                          <span className="text-[11px] font-semibold text-brown-dark bg-brown-dark/10 px-2.5 py-1 rounded-full">
                            Paso{" "}
                            {stepIndex + 1} de{" "}
                            {
                              section.steps
                                .length
                            }
                          </span>

                          <div className="flex gap-1">
                            {section.steps.map(
                              (_, index) => (
                                <button
                                  key={
                                    index
                                  }
                                  type="button"
                                  aria-label={`Ir al paso ${
                                    index +
                                    1
                                  }`}
                                  onClick={() =>
                                    setStep(
                                      section.id,
                                      index
                                    )
                                  }
                                  className={`h-1.5 rounded-full transition-all ${
                                    index ===
                                    stepIndex
                                      ? "w-5 bg-brown-dark"
                                      : "w-1.5 bg-panel-border"
                                  }`}
                                />
                              )
                            )}
                          </div>
                        </div>

                        <TutorialImage
                          src={step.image}
                          alt={step.title}
                        />

                        <div className="mt-4">
                          <h3 className="text-base font-bold text-panel-ink">
                            {step.title}
                          </h3>

                          <p className="text-sm text-panel-ink-soft leading-relaxed mt-1.5">
                            {
                              step.description
                            }
                          </p>
                        </div>

                        {step.tip && (
                          <div className="mt-3">
                            <InfoBox
                              icon={
                                <Lightbulb className="w-4 h-4 text-green-dark" />
                              }
                            >
                              <strong>
                                Consejo:{" "}
                              </strong>
                              {step.tip}
                            </InfoBox>
                          </div>
                        )}

                        {step.warning && (
                          <div className="mt-3">
                            <InfoBox
                              variant="warning"
                              icon={
                                <HelpCircle className="w-4 h-4 text-amber-600" />
                              }
                            >
                              <strong>
                                Importante:{" "}
                              </strong>
                              {
                                step.warning
                              }
                            </InfoBox>
                          </div>
                        )}

                        <div className="flex items-center justify-between gap-3 mt-5 pt-4 border-t border-panel-border">
                          <button
                            type="button"
                            disabled={
                              stepIndex === 0
                            }
                            onClick={() =>
                              setStep(
                                section.id,
                                stepIndex - 1
                              )
                            }
                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-panel-ink border border-panel-border px-3 py-2 rounded-lg hover:bg-panel-bg disabled:opacity-30 disabled:pointer-events-none"
                          >
                            <ChevronLeft className="w-3.5 h-3.5" />
                            Anterior
                          </button>

                          {stepIndex <
                          section.steps
                              .length -
                            1 ? (
                            <button
                              type="button"
                              onClick={() =>
                                setStep(
                                  section.id,
                                  stepIndex +
                                    1
                                )
                              }
                              className="inline-flex items-center gap-1.5 text-xs font-semibold bg-brown-dark text-cream px-3 py-2 rounded-lg hover:bg-ink"
                            >
                              Siguiente
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-green-dark">
                              <CheckCircle2 className="w-4 h-4" />
                              Tutorial completado
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="px-5 py-3 border-t border-panel-border shrink-0 bg-panel-bg/50">
              <p className="text-[11px] text-panel-ink-soft text-center">
                Bebitos Admin · Tutoriales
                visuales
              </p>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}
