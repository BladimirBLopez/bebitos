"use client";

import {
  useEffect,
  useMemo,
  useState,
  type ElementType,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";

import {
  AlertTriangle,
  ArrowLeft,
  Barcode,
  Box,
  Camera,
  DollarSign,
  Info,
  Layers,
  Palette,
  Plus,
  Save,
  Tag,
  Trash2,
  TrendingUp,
  X,
} from "lucide-react";

import ConfirmModal from "./ConfirmModal";
import CategoryManagerModal from "./CategoryManagerModal";
import Select from "./ui/Select";
import ToggleSwitch from "./ToggleSwitch";
import {
  FormInput,
  FormTextarea,
} from "./form/FormField";

import { useToast } from "@/lib/toast-context";
import { useCurrentUser } from "@/lib/user-context";
import { canDelete } from "@/lib/roles";

const CLOUD_NAME = "dkq95jus0";
const UPLOAD_PRESET = "bebitos_admin";

type ColorInput = {
  name: string;
  hex: string;
};

type Category = {
  id: string;
  name: string;
};

type ProductFormData = {
  id?: string;

  slug: string;
  name: string;
  description: string;

  features: string[];

  price: string;
  cost: string;

  category: string;

  colors: ColorInput[];
  images: string[];

  stock: string;
  lowStockThreshold: string;

  inStock: boolean;

  isPromo: boolean;
  promoPrice: string;

  isNew: boolean;

  barcode: string;
};

const empty: ProductFormData = {
  slug: "",
  name: "",
  description: "",

  features: [],

  price: "",
  cost: "",

  category: "",

  colors: [],
  images: [],

  stock: "0",
  lowStockThreshold: "5",

  inStock: false,

  isPromo: false,
  promoPrice: "",

  isNew: false,

  barcode: "",
};

const COLOR_PRESETS = [
  {
    name: "Verde",
    hex: "#85BF35",
  },
  {
    name: "Rosado",
    hex: "#F5A3C7",
  },
  {
    name: "Celeste",
    hex: "#8FC7E8",
  },
  {
    name: "Amarillo",
    hex: "#F5D547",
  },
  {
    name: "Blanco",
    hex: "#F5F0E8",
  },
  {
    name: "Gris",
    hex: "#B0AFA8",
  },
];

function SectionCard({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: ElementType;
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section
      className="bg-panel-surface border border-panel-border rounded-2xl overflow-hidden"
      style={{
        boxShadow: "var(--shadow-panel)",
      }}
    >
      <div className="px-5 py-4 border-b border-panel-border bg-panel-bg/40">
        <div className="flex items-start gap-3">
          <span className="w-9 h-9 rounded-xl bg-brown-dark/10 flex items-center justify-center shrink-0">
            <Icon className="w-4 h-4 text-brown-dark" />
          </span>

          <div>
            <h2 className="text-sm font-semibold text-panel-ink">
              {title}
            </h2>

            {description && (
              <p className="text-xs text-panel-ink-soft mt-0.5">
                {description}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="p-5">
        {children}
      </div>
    </section>
  );
}

const inlineInputClass =
  "flex-1 border border-panel-border rounded-xl px-3 py-2.5 text-sm outline-none bg-panel-bg text-panel-ink placeholder:text-panel-ink-soft/60 focus:ring-2 focus:ring-brown-dark/20 focus:border-brown-dark/40 transition-colors";

export default function ProductForm({
  initial,
}: {
  initial?: Partial<ProductFormData>;
}) {
  const router = useRouter();

  const { showToast } = useToast();

  const { role } = useCurrentUser();

  const canRemove = canDelete(role);

  const [form, setForm] =
    useState<ProductFormData>({
      ...empty,
      ...initial,
    });

  const [categories, setCategories] =
    useState<Category[]>([]);

  const [featureInput, setFeatureInput] =
    useState("");

  const [colorName, setColorName] =
    useState("");

  const [colorHex, setColorHex] =
    useState("#85BF35");

  const [uploading, setUploading] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  const [
    confirmDelete,
    setConfirmDelete,
  ] = useState(false);

  const [
    unsavedWarning,
    setUnsavedWarning,
  ] = useState(false);

  const [dirty, setDirty] =
    useState(false);

  const [
    categoryModalOpen,
    setCategoryModalOpen,
  ] = useState(false);

  const isEditing = Boolean(form.id);

  const stockValue = useMemo(() => {
    const value = Number(form.stock);

    if (
      !Number.isFinite(value) ||
      value < 0
    ) {
      return 0;
    }

    return value;
  }, [form.stock]);

  const thresholdValue = useMemo(() => {
    const value = Number(
      form.lowStockThreshold
    );

    if (
      !Number.isFinite(value) ||
      value < 0
    ) {
      return 0;
    }

    return value;
  }, [form.lowStockThreshold]);

  const priceValue = useMemo(() => {
    const value = Number(form.price);

    return Number.isFinite(value)
      ? value
      : 0;
  }, [form.price]);

  const promoPriceValue = useMemo(() => {
    const value = Number(
      form.promoPrice
    );

    return Number.isFinite(value)
      ? value
      : 0;
  }, [form.promoPrice]);

  const costValue = useMemo(() => {
    const value = Number(form.cost);

    return Number.isFinite(value)
      ? value
      : 0;
  }, [form.cost]);

  const salePrice =
    form.isPromo &&
    promoPriceValue > 0
      ? promoPriceValue
      : priceValue;

  const profit =
    salePrice > 0 &&
    form.cost !== ""
      ? salePrice - costValue
      : null;

  const margin =
    profit !== null &&
    salePrice > 0
      ? (profit / salePrice) * 100
      : null;

  const inventoryStatus =
    stockValue <= 0
      ? {
          label: "Agotado",
          description:
            "No hay unidades disponibles.",
          className:
            "bg-red-50 text-red-600 border-red-100",
        }
      : !form.inStock
        ? {
            label: "Pausado",
            description:
              "Tiene stock, pero no está disponible para venta.",
            className:
              "bg-panel-bg text-panel-ink-soft border-panel-border",
          }
        : stockValue <= thresholdValue
          ? {
              label: "Stock bajo",
              description: `${stockValue} unidad${
                stockValue === 1
                  ? ""
                  : "es"
              } disponible${
                stockValue === 1
                  ? ""
                  : "s"
              }.`,
              className:
                "bg-amber-soft text-amber border-amber/20",
            }
          : {
              label: "Disponible",
              description: `${stockValue} unidades disponibles.`,
              className:
                "bg-green-soft text-green-dark border-green/20",
            };

  useEffect(() => {
    fetch("/api/admin/categories")
      .then((res) => {
        if (!res.ok) {
          throw new Error();
        }

        return res.json();
      })
      .then((data: Category[]) => {
        if (!Array.isArray(data)) {
          return;
        }

        setCategories(data);

        if (
          !form.category &&
          data.length > 0
        ) {
          setForm((current) => ({
            ...current,
            category: data[0].name,
          }));
        }
      })
      .catch(() => {
        showToast(
          "No se pudieron cargar las categorías",
          "error"
        );
      });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    function handleBeforeUnload(
      event: BeforeUnloadEvent
    ) {
      if (!dirty) return;

      event.preventDefault();
    }

    window.addEventListener(
      "beforeunload",
      handleBeforeUnload
    );

    return () => {
      window.removeEventListener(
        "beforeunload",
        handleBeforeUnload
      );
    };
  }, [dirty]);

  function update(
    patch: Partial<ProductFormData>
  ) {
    setForm((current) => ({
      ...current,
      ...patch,
    }));

    setDirty(true);
  }

  function slugify(text: string) {
    return text
      .toLowerCase()
      .normalize("NFD")
      .replace(
        /[\u0300-\u036f]/g,
        ""
      )
      .replace(
        /[^a-z0-9]+/g,
        "-"
      )
      .replace(/(^-|-$)/g, "");
  }

  function handleNameChange(
    name: string
  ) {
    update({
      name,
      slug: form.id
        ? form.slug
        : slugify(name),
    });
  }

  function handleInitialStockChange(
    value: string
  ) {
    const next = Number(value);

    const validNext =
      Number.isFinite(next) &&
      next >= 0
        ? next
        : 0;

    update({
      stock: value,
      inStock:
        validNext <= 0
          ? false
          : stockValue <= 0
            ? true
            : form.inStock,
    });
  }

  function addFeature() {
    const clean =
      featureInput.trim();

    if (!clean) return;

    update({
      features: [
        ...form.features,
        clean,
      ],
    });

    setFeatureInput("");
  }

  function removeFeature(
    index: number
  ) {
    update({
      features:
        form.features.filter(
          (_, itemIndex) =>
            itemIndex !== index
        ),
    });
  }

  function addPresetColor(
    preset: ColorInput
  ) {
    const exists =
      form.colors.some(
        (color) =>
          color.name.toLowerCase() ===
          preset.name.toLowerCase()
      );

    if (exists) {
      showToast(
        `${preset.name} ya está agregado`,
        "success"
      );

      return;
    }

    update({
      colors: [
        ...form.colors,
        preset,
      ],
    });
  }

  function addColor() {
    const cleanName =
      colorName.trim();

    if (!cleanName) return;

    const exists =
      form.colors.some(
        (color) =>
          color.name.toLowerCase() ===
          cleanName.toLowerCase()
      );

    if (exists) {
      showToast(
        "Ese color ya está agregado",
        "success"
      );

      return;
    }

    update({
      colors: [
        ...form.colors,
        {
          name: cleanName,
          hex: colorHex,
        },
      ],
    });

    setColorName("");
  }

  function removeColor(
    index: number
  ) {
    update({
      colors:
        form.colors.filter(
          (_, itemIndex) =>
            itemIndex !== index
        ),
    });
  }

  async function handleImageUpload(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file =
      event.target.files?.[0];

    if (!file) return;

    setUploading(true);

    try {
      const formData =
        new FormData();

      formData.append(
        "file",
        file
      );

      formData.append(
        "upload_preset",
        UPLOAD_PRESET
      );

      formData.append(
        "folder",
        "bebitos"
      );

      const response =
        await fetch(
          `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
          {
            method: "POST",
            body: formData,
          }
        );

      if (!response.ok) {
        throw new Error();
      }

      const data =
        await response.json();

      update({
        images: [
          ...form.images,
          data.public_id,
        ],
      });

      showToast(
        "Foto subida correctamente",
        "success"
      );
    } catch {
      showToast(
        "No se pudo subir la imagen",
        "error"
      );
    } finally {
      setUploading(false);

      event.target.value = "";
    }
  }

  function removeImage(
    index: number
  ) {
    update({
      images:
        form.images.filter(
          (_, itemIndex) =>
            itemIndex !== index
        ),
    });
  }

  function makeMainImage(
    index: number
  ) {
    if (index === 0) return;

    const next =
      [...form.images];

    const [chosen] =
      next.splice(index, 1);

    next.unshift(chosen);

    update({
      images: next,
    });
  }

  async function handleSubmit(
    event: React.FormEvent
  ) {
    event.preventDefault();

    if (saving || uploading) {
      return;
    }

    setSaving(true);

    try {
      const url = form.id
        ? `/api/admin/products/${form.id}`
        : "/api/admin/products";

      const method = form.id
        ? "PUT"
        : "POST";

      const response =
        await fetch(url, {
          method,
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify(form),
        });

      const data =
        await response
          .json()
          .catch(() => ({}));

      if (!response.ok) {
        showToast(
          data.error ||
            "No se pudo guardar el producto",
          "error"
        );

        return;
      }

      setDirty(false);

      showToast(
        form.id
          ? "Producto actualizado"
          : "Producto creado",
        "success"
      );

      router.push(
        "/admin/productos"
      );

      router.refresh();
    } catch {
      showToast(
        "Error de conexión al guardar",
        "error"
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!form.id) return;

    setConfirmDelete(false);

    try {
      const response =
        await fetch(
          `/api/admin/products/${form.id}`,
          {
            method: "DELETE",
          }
        );

      const data =
        await response
          .json()
          .catch(() => ({}));

      if (!response.ok) {
        showToast(
          data.error ||
            "No se pudo borrar el producto",
          "error"
        );

        return;
      }

      setDirty(false);

      showToast(
        "Producto borrado",
        "success"
      );

      router.push(
        "/admin/productos"
      );

      router.refresh();
    } catch {
      showToast(
        "Error de conexión al borrar",
        "error"
      );
    }
  }

  function handleBack() {
    if (dirty) {
      setUnsavedWarning(true);
      return;
    }

    router.push(
      "/admin/productos"
    );
  }

  return (
    <div className="max-w-6xl mx-auto pb-24">
      <div className="flex items-start justify-between gap-4 flex-wrap mb-6">
        <div>
          <button
            type="button"
            onClick={handleBack}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-panel-ink-soft hover:text-panel-ink mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Productos
          </button>

          <h1 className="text-xl sm:text-2xl font-bold text-panel-ink">
            {isEditing
              ? form.name ||
                "Editar producto"
              : "Nuevo producto"}
          </h1>

          <p className="text-sm text-panel-ink-soft mt-1">
            {isEditing
              ? "Actualiza la información comercial del producto."
              : "Completa la información para agregarlo a tu catálogo."}
          </p>
        </div>

        <button
          type="submit"
          form="product-form"
          disabled={
            saving ||
            uploading
          }
          className="hidden sm:inline-flex items-center gap-2 bg-green hover:bg-green-dark disabled:opacity-60 text-white font-semibold text-sm px-5 py-2.5 rounded-xl transition-colors"
        >
          <Save className="w-4 h-4" />

          {saving
            ? "Guardando..."
            : isEditing
              ? "Guardar cambios"
              : "Crear producto"}
        </button>
      </div>

      <form
        id="product-form"
        onSubmit={handleSubmit}
        className="grid lg:grid-cols-[minmax(0,1fr)_320px] gap-5 items-start"
      >
        <div className="flex flex-col gap-5 min-w-0">
          <SectionCard
            icon={Info}
            title="Información"
            description="Datos principales que verá el cliente."
          >
            <div className="space-y-4">
              <FormInput
                label="Nombre del producto"
                required
                maxLength={200}
                placeholder="Ej. Set de alimentación de silicona"
                value={form.name}
                onChange={(event) =>
                  handleNameChange(
                    event.target.value
                  )
                }
              />

              <FormTextarea
                label="Descripción"
                required
                rows={4}
                placeholder="Describe el producto, sus beneficios y para qué edad está recomendado..."
                value={
                  form.description
                }
                onChange={(event) =>
                  update({
                    description:
                      event.target
                        .value,
                  })
                }
              />
            </div>
          </SectionCard>

          <SectionCard
            icon={Camera}
            title="Multimedia"
            description="La primera imagen será la portada del producto."
          >
            <label className="min-h-28 flex flex-col items-center justify-center gap-2 border-2 border-dashed border-panel-border rounded-2xl bg-panel-bg/40 text-panel-ink-soft cursor-pointer hover:border-brown-dark/30 hover:bg-panel-bg transition-colors">
              <Camera className="w-5 h-5" />

              <span className="text-sm font-semibold">
                {uploading
                  ? "Subiendo imagen..."
                  : "Agregar imagen"}
              </span>

              <span className="text-[11px]">
                Se recomienda formato cuadrado 1:1
              </span>

              <input
                type="file"
                accept="image/*"
                disabled={uploading}
                onChange={
                  handleImageUpload
                }
                className="hidden"
              />
            </label>

            {form.images.length >
              0 && (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 mt-4">
                {form.images.map(
                  (image, index) => (
                    <div
                      key={`${image}-${index}`}
                      className="relative aspect-square"
                    >
                      <button
                        type="button"
                        onClick={() =>
                          makeMainImage(
                            index
                          )
                        }
                        className="w-full h-full"
                        title={
                          index === 0
                            ? "Imagen principal"
                            : "Usar como imagen principal"
                        }
                      >
                        <img
                          src={`https://res.cloudinary.com/${CLOUD_NAME}/image/upload/w_240,h_240,c_fill/${image}`}
                          alt=""
                          className={`w-full h-full rounded-xl object-cover border ${
                            index === 0
                              ? "border-brown-dark ring-2 ring-brown-dark/15"
                              : "border-panel-border"
                          }`}
                        />
                      </button>

                      {index === 0 && (
                        <span className="absolute left-1.5 bottom-1.5 text-[9px] font-bold bg-brown-dark text-cream px-2 py-0.5 rounded-full">
                          Principal
                        </span>
                      )}

                      <button
                        type="button"
                        onClick={() =>
                          removeImage(
                            index
                          )
                        }
                        className="absolute -top-1.5 -right-1.5 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center shadow"
                        aria-label="Eliminar imagen"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )
                )}
              </div>
            )}
          </SectionCard>

          <SectionCard
            icon={DollarSign}
            title="Precio y rentabilidad"
            description="Información interna de venta y costos."
          >
            <div className="grid sm:grid-cols-2 gap-4">
              <FormInput
                label="Precio de venta"
                hint="BOB"
                type="number"
                min="0"
                step="0.01"
                required
                placeholder="0.00"
                value={form.price}
                onChange={(event) =>
                  update({
                    price:
                      event.target
                        .value,
                  })
                }
              />

              <FormInput
                label="Costo por unidad"
                hint="Opcional · BOB"
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={form.cost}
                onChange={(event) =>
                  update({
                    cost:
                      event.target
                        .value,
                  })
                }
              />
            </div>

            {form.isPromo && (
              <div className="mt-4 max-w-sm">
                <FormInput
                  label="Precio de oferta"
                  hint="BOB"
                  type="number"
                  min="0"
                  step="0.01"
                  required
                  placeholder="0.00"
                  value={
                    form.promoPrice
                  }
                  onChange={(event) =>
                    update({
                      promoPrice:
                        event.target
                          .value,
                    })
                  }
                />
              </div>
            )}

            {profit !== null &&
              salePrice > 0 && (
              <div className="mt-4 bg-panel-bg rounded-xl p-4 grid grid-cols-2 gap-3">
                <div>
                  <p className="text-[11px] text-panel-ink-soft">
                    Ganancia estimada
                  </p>

                  <p
                    className={`text-base font-bold ${
                      profit >= 0
                        ? "text-green-dark"
                        : "text-red-500"
                    }`}
                  >
                    Bs.{" "}
                    {profit.toFixed(
                      2
                    )}
                  </p>
                </div>

                <div>
                  <p className="text-[11px] text-panel-ink-soft">
                    Margen
                  </p>

                  <p
                    className={`text-base font-bold ${
                      (margin || 0) >=
                      0
                        ? "text-panel-ink"
                        : "text-red-500"
                    }`}
                  >
                    {margin?.toFixed(
                      1
                    )}
                    %
                  </p>
                </div>
              </div>
            )}
          </SectionCard>

          <SectionCard
            icon={Box}
            title="Inventario"
            description={
              isEditing
                ? "El stock se controla desde el módulo de Inventario."
                : "Define con cuántas unidades comienza este producto."
            }
          >
            {!isEditing ? (
              <div className="grid sm:grid-cols-2 gap-4">
                <FormInput
                  label="Stock inicial"
                  type="number"
                  min="0"
                  step="1"
                  required
                  value={
                    form.stock
                  }
                  onChange={(event) =>
                    handleInitialStockChange(
                      event.target
                        .value
                    )
                  }
                />

                <FormInput
                  label="Avisar cuando queden"
                  hint="unidades"
                  type="number"
                  min="0"
                  step="1"
                  required
                  value={
                    form.lowStockThreshold
                  }
                  onChange={(event) =>
                    update({
                      lowStockThreshold:
                        event.target
                          .value,
                    })
                  }
                />
              </div>
            ) : (
              <div className="flex items-center justify-between gap-4 bg-panel-bg rounded-xl p-4">
                <div>
                  <p className="text-xs text-panel-ink-soft">
                    Stock actual
                  </p>

                  <p className="text-xl font-bold text-panel-ink">
                    {stockValue}{" "}
                    <span className="text-xs font-medium text-panel-ink-soft">
                      unidades
                    </span>
                  </p>

                  <p className="text-[11px] text-panel-ink-soft mt-1">
                    Alerta configurada en{" "}
                    {
                      thresholdValue
                    }{" "}
                    unidades.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    router.push(
                      "/admin/inventario"
                    )
                  }
                  className="text-xs font-semibold text-brown-dark border border-panel-border bg-panel-surface px-3 py-2 rounded-lg hover:bg-white"
                >
                  Gestionar
                </button>
              </div>
            )}

            <div className="mt-4">
              <FormInput
                label="Código de barras"
                hint="Opcional"
                icon={Barcode}
                maxLength={50}
                placeholder="Escanea o escribe el código"
                value={
                  form.barcode
                }
                onChange={(event) =>
                  update({
                    barcode:
                      event.target
                        .value,
                  })
                }
              />

              <button
                type="button"
                onClick={() =>
                  update({
                    barcode: `BEB-${Date.now()
                      .toString()
                      .slice(-6)}`,
                  })
                }
                className="text-[11px] text-brown-dark/70 hover:text-brown-dark underline mt-2"
              >
                Generar código interno
              </button>
            </div>
          </SectionCard>

          <SectionCard
            icon={Tag}
            title="Características"
            description="Agrega beneficios o especificaciones importantes."
          >
            <div className="flex gap-2">
              <input
                value={
                  featureInput
                }
                maxLength={200}
                onChange={(event) =>
                  setFeatureInput(
                    event.target.value
                  )
                }
                onKeyDown={(event) => {
                  if (
                    event.key ===
                    "Enter"
                  ) {
                    event.preventDefault();
                    addFeature();
                  }
                }}
                className={inlineInputClass}
                placeholder="Ej. Libre de BPA"
              />

              <button
                type="button"
                onClick={addFeature}
                className="w-11 h-11 bg-brown-dark text-white rounded-xl flex items-center justify-center shrink-0"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {form.features.length >
              0 && (
              <div className="space-y-2 mt-3">
                {form.features.map(
                  (
                    feature,
                    index
                  ) => (
                    <div
                      key={`${feature}-${index}`}
                      className="flex items-center justify-between gap-3 bg-panel-bg rounded-xl px-3 py-2.5"
                    >
                      <span className="text-sm text-panel-ink">
                        {feature}
                      </span>

                      <button
                        type="button"
                        onClick={() =>
                          removeFeature(
                            index
                          )
                        }
                        className="text-panel-ink-soft hover:text-red-500"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )
                )}
              </div>
            )}
          </SectionCard>

          <SectionCard
            icon={Palette}
            title="Opciones de color"
            description="Colores que el cliente puede encontrar en este producto."
          >
            <div className="flex flex-wrap gap-2">
              {COLOR_PRESETS.map(
                (preset) => (
                  <button
                    key={
                      preset.name
                    }
                    type="button"
                    onClick={() =>
                      addPresetColor(
                        preset
                      )
                    }
                    className="inline-flex items-center gap-2 border border-panel-border bg-panel-surface hover:bg-panel-bg px-3 py-1.5 rounded-full text-xs text-panel-ink"
                  >
                    <span
                      className="w-3.5 h-3.5 rounded-full border border-black/10"
                      style={{
                        backgroundColor:
                          preset.hex,
                      }}
                    />

                    {preset.name}
                  </button>
                )
              )}
            </div>

            <div className="flex gap-2 items-center mt-4">
              <input
                value={colorName}
                onChange={(event) =>
                  setColorName(
                    event.target.value
                  )
                }
                onKeyDown={(event) => {
                  if (
                    event.key ===
                    "Enter"
                  ) {
                    event.preventDefault();
                    addColor();
                  }
                }}
                className={inlineInputClass}
                placeholder="Otro color..."
              />

              <input
                type="color"
                value={colorHex}
                onChange={(event) =>
                  setColorHex(
                    event.target.value
                  )
                }
                className="w-11 h-11 rounded-xl border border-panel-border bg-panel-surface p-1 shrink-0"
              />

              <button
                type="button"
                onClick={addColor}
                className="w-11 h-11 bg-brown-dark text-white rounded-xl flex items-center justify-center shrink-0"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {form.colors.length >
              0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {form.colors.map(
                  (
                    color,
                    index
                  ) => (
                    <div
                      key={`${color.name}-${index}`}
                      className="inline-flex items-center gap-2 bg-panel-bg border border-panel-border rounded-full pl-2 pr-2.5 py-1.5"
                    >
                      <span
                        className="w-4 h-4 rounded-full border border-black/10"
                        style={{
                          backgroundColor:
                            color.hex,
                        }}
                      />

                      <span className="text-xs font-medium text-panel-ink">
                        {color.name}
                      </span>

                      <button
                        type="button"
                        onClick={() =>
                          removeColor(
                            index
                          )
                        }
                        className="text-panel-ink-soft hover:text-red-500"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  )
                )}
              </div>
            )}
          </SectionCard>
        </div>

        <aside className="flex flex-col gap-5 lg:sticky lg:top-5">
          <SectionCard
            icon={Layers}
            title="Organización"
          >
            <Select
              label="Categoría"
              value={
                form.category
              }
              onChange={(value) =>
                update({
                  category: value,
                })
              }
              placeholder="Seleccionar categoría"
              options={categories.map(
                (category) => ({
                  value:
                    category.name,
                  label:
                    category.name,
                })
              )}
            />

            <button
              type="button"
              onClick={() =>
                setCategoryModalOpen(
                  true
                )
              }
              className="text-[11px] text-brown-dark/70 hover:text-brown-dark underline mt-2"
            >
              Gestionar categorías
            </button>
          </SectionCard>

          <SectionCard
            icon={TrendingUp}
            title="Etiquetas comerciales"
            description="Pueden combinarse entre sí."
          >
            <div className="space-y-4">
              <ToggleSwitch
                checked={
                  form.isNew
                }
                onChange={(value) =>
                  update({
                    isNew: value,
                  })
                }
                label="Producto nuevo"
                description="Muestra la etiqueta Nuevo en el catálogo."
              />

              <div className="border-t border-panel-border" />

              <ToggleSwitch
                checked={
                  form.isPromo
                }
                onChange={(value) =>
                  update({
                    isPromo:
                      value,
                  })
                }
                label="Producto en oferta"
                description="Permite usar un precio promocional."
              />
            </div>
          </SectionCard>

          <SectionCard
            icon={AlertTriangle}
            title="Disponibilidad"
          >
            <div
              className={`border rounded-xl p-3 ${inventoryStatus.className}`}
            >
              <p className="text-sm font-bold">
                {
                  inventoryStatus.label
                }
              </p>

              <p className="text-[11px] mt-0.5 opacity-80">
                {
                  inventoryStatus.description
                }
              </p>
            </div>

            {stockValue > 0 && (
              <div className="mt-4">
                <ToggleSwitch
                  checked={
                    form.inStock
                  }
                  onChange={(value) =>
                    update({
                      inStock:
                        value,
                    })
                  }
                  label="Disponible para venta"
                  description="Puedes pausarlo temporalmente sin cambiar el stock."
                />
              </div>
            )}

            {stockValue <=
              0 && (
              <p className="text-[11px] text-panel-ink-soft mt-3">
                Con stock 0 el producto se marca automáticamente como agotado.
              </p>
            )}
          </SectionCard>

          <SectionCard
            icon={Info}
            title="Resumen"
          >
            <div className="space-y-3 text-xs">
              <div className="flex justify-between gap-3">
                <span className="text-panel-ink-soft">
                  Precio
                </span>

                <span className="font-semibold text-panel-ink">
                  {priceValue >
                  0
                    ? `Bs. ${priceValue.toFixed(
                        2
                      )}`
                    : "Sin definir"}
                </span>
              </div>

              {form.isPromo && (
                <div className="flex justify-between gap-3">
                  <span className="text-panel-ink-soft">
                    Oferta
                  </span>

                  <span className="font-semibold text-green-dark">
                    {promoPriceValue >
                    0
                      ? `Bs. ${promoPriceValue.toFixed(
                          2
                        )}`
                      : "Sin definir"}
                  </span>
                </div>
              )}

              <div className="flex justify-between gap-3">
                <span className="text-panel-ink-soft">
                  Stock
                </span>

                <span className="font-semibold text-panel-ink">
                  {
                    stockValue
                  }
                </span>
              </div>

              <div className="flex justify-between gap-3">
                <span className="text-panel-ink-soft">
                  Imágenes
                </span>

                <span className="font-semibold text-panel-ink">
                  {
                    form.images
                      .length
                  }
                </span>
              </div>

              <div className="flex justify-between gap-3">
                <span className="text-panel-ink-soft">
                  Colores
                </span>

                <span className="font-semibold text-panel-ink">
                  {
                    form.colors
                      .length
                  }
                </span>
              </div>
            </div>
          </SectionCard>

          {isEditing &&
            canRemove && (
              <button
                type="button"
                onClick={() =>
                  setConfirmDelete(
                    true
                  )
                }
                className="w-full flex items-center justify-center gap-2 text-red-500 hover:bg-red-50 border border-red-100 bg-panel-surface rounded-xl py-2.5 text-sm font-semibold transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Eliminar producto
              </button>
            )}
        </aside>
      </form>

      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-panel-border p-3">
        <button
          type="submit"
          form="product-form"
          disabled={
            saving ||
            uploading
          }
          className="w-full flex items-center justify-center gap-2 bg-green hover:bg-green-dark disabled:opacity-60 text-white font-semibold py-3 rounded-xl"
        >
          <Save className="w-4 h-4" />

          {saving
            ? "Guardando..."
            : isEditing
              ? "Guardar cambios"
              : "Crear producto"}
        </button>
      </div>

      <ConfirmModal
        open={confirmDelete}
        title="¿Eliminar producto?"
        message="Esta acción eliminará el producto permanentemente."
        onConfirm={handleDelete}
        onCancel={() =>
          setConfirmDelete(false)
        }
      />

      <CategoryManagerModal
        open={
          categoryModalOpen
        }
        categories={
          categories
        }
        setCategories={
          setCategories
        }
        onSelect={(name) => {
          update({
            category: name,
          });

          setCategoryModalOpen(
            false
          );
        }}
        onClose={() =>
          setCategoryModalOpen(
            false
          )
        }
      />

      <ConfirmModal
        open={
          unsavedWarning
        }
        title="Cambios sin guardar"
        message="Tienes cambios sin guardar. Si sales ahora, se perderán."
        confirmLabel="Salir sin guardar"
        danger={false}
        onConfirm={() =>
          router.push(
            "/admin/productos"
          )
        }
        onCancel={() =>
          setUnsavedWarning(
            false
          )
        }
      />
    </div>
  );
}
