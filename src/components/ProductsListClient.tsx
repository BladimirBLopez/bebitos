"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ImageOff,
  Package,
  PackageX,
  Plus,
  Search,
  Trash2,
} from "lucide-react";

import ConfirmModal from "./ConfirmModal";
import ToggleSwitch from "./ToggleSwitch";
import PageHeader from "./PageHeader";
import Select from "./ui/Select";
import MetricCard from "./dashboard/MetricCard";

import { useToast } from "@/lib/toast-context";
import { useCurrentUser } from "@/lib/user-context";
import { canDelete, canWrite } from "@/lib/roles";

const CLOUD_NAME = "dkq95jus0";

type ProductRow = {
  id: string;
  name: string;
  category: string;

  price: number;
  promoPrice: number | null;

  isPromo: boolean;
  isNew: boolean;
  inStock: boolean;

  stock: number;
  lowStockThreshold: number;

  barcode: string | null;
  images: string[];
};

type Category = {
  id: string;
  name: string;
};

type BulkAction =
  | "activar"
  | "desactivar"
  | "eliminar";

function money(value: number) {
  return new Intl.NumberFormat("es-BO", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function getProductStatus(product: ProductRow) {
  if (product.stock <= 0) {
    return {
      label: "Agotado",
      className:
        "bg-red-soft text-red",
    };
  }

  if (!product.inStock) {
    return {
      label: "Pausado",
      className:
        "bg-panel-bg text-panel-ink-soft",
    };
  }

  if (
    product.stock <=
    (product.lowStockThreshold ?? 5)
  ) {
    return {
      label: "Stock bajo",
      className:
        "bg-amber-soft text-amber",
    };
  }

  return {
    label: "Activo",
    className:
      "bg-green-soft text-green-dark",
  };
}

export default function ProductsListClient({
  products: initialProducts,
  allCategories = [],
  showPrices = true,
}: {
  products: ProductRow[];
  allCategories?: Category[];
  showPrices?: boolean;
}) {
  const router = useRouter();
  const { showToast } = useToast();
  const { role } = useCurrentUser();

  const canEdit = canWrite(role);
  const canRemove = canDelete(role);

  const [products, setProducts] =
    useState(initialProducts);

  const [search, setSearch] =
    useState("");

  const [category, setCategory] =
    useState("Todas");

  const [selected, setSelected] =
    useState<Set<string>>(
      new Set()
    );

  const [toDelete, setToDelete] =
    useState<ProductRow | null>(
      null
    );

  const [
    bulkDeleteOpen,
    setBulkDeleteOpen,
  ] = useState(false);

  const [bulkBusy, setBulkBusy] =
    useState(false);

  const [
    updatingId,
    setUpdatingId,
  ] = useState<string | null>(
    null
  );

  const [reordering, setReordering] =
    useState(false);

  const [page, setPage] =
    useState(1);

  const PAGE_SIZE = 20;

  const categories = useMemo(
    () => [
      "Todas",
      ...allCategories.map(
        (item) => item.name
      ),
    ],
    [allCategories]
  );

  const summary = useMemo(() => {
    const active =
      products.filter(
        (product) =>
          product.stock > 0 &&
          product.inStock
      ).length;

    const lowStock =
      products.filter(
        (product) =>
          product.stock > 0 &&
          product.stock <=
            (product.lowStockThreshold ??
              5)
      ).length;

    const outOfStock =
      products.filter(
        (product) =>
          product.stock <= 0
      ).length;

    return {
      total: products.length,
      active,
      lowStock,
      outOfStock,
    };
  }, [products]);

  const filtersActive =
    search.trim() !== "" ||
    category !== "Todas";

  const filtered = useMemo(() => {
    const query =
      search.trim().toLowerCase();

    return products.filter(
      (product) => {
        const matchesSearch =
          query === "" ||
          product.name
            .toLowerCase()
            .includes(query) ||
          product.category
            .toLowerCase()
            .includes(query) ||
          (product.barcode || "")
            .toLowerCase()
            .includes(query);

        const matchesCategory =
          category === "Todas" ||
          product.category ===
            category;

        return (
          matchesSearch &&
          matchesCategory
        );
      }
    );
  }, [
    products,
    search,
    category,
  ]);

  const totalPages = Math.max(
    1,
    Math.ceil(
      filtered.length /
        PAGE_SIZE
    )
  );

  const currentPage = Math.min(
    page,
    totalPages
  );

  const paginated =
    filtered.slice(
      (currentPage - 1) *
        PAGE_SIZE,
      currentPage * PAGE_SIZE
    );

  const visibleIds =
    paginated.map(
      (product) => product.id
    );

  const allVisibleSelected =
    visibleIds.length > 0 &&
    visibleIds.every((id) =>
      selected.has(id)
    );

  function toggleSelect(
    id: string
  ) {
    if (!canEdit) return;

    setSelected((current) => {
      const next =
        new Set(current);

      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }

      return next;
    });
  }

  function toggleVisibleSelection() {
    if (!canEdit) return;

    setSelected((current) => {
      const next =
        new Set(current);

      if (allVisibleSelected) {
        visibleIds.forEach(
          (id) => next.delete(id)
        );
      } else {
        visibleIds.forEach(
          (id) => next.add(id)
        );
      }

      return next;
    });
  }

  async function runBulk(
    action: BulkAction
  ) {
    const ids =
      Array.from(selected);

    if (
      ids.length === 0 ||
      bulkBusy
    ) {
      return;
    }

    setBulkBusy(true);

    try {
      const res =
        await fetch(
          "/api/admin/products/bulk",
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              ids,
              action,
            }),
          }
        );

      const data =
        await res
          .json()
          .catch(() => ({}));

      if (!res.ok) {
        showToast(
          data.error ||
            "No se pudo completar la acción",
          "error"
        );
        return;
      }

      if (
        action === "eliminar"
      ) {
        setProducts(
          (current) =>
            current.filter(
              (product) =>
                !ids.includes(
                  product.id
                )
            )
        );

        showToast(
          `${data.updated ?? ids.length} producto(s) eliminado(s)`,
          "success"
        );
      }

      if (
        action === "activar"
      ) {
        setProducts(
          (current) =>
            current.map(
              (product) =>
                ids.includes(
                  product.id
                ) &&
                product.stock > 0
                  ? {
                      ...product,
                      inStock:
                        true,
                    }
                  : product
            )
        );

        if (
          Number(
            data.skipped
          ) > 0
        ) {
          showToast(
            `${data.updated} activado(s). ${data.skipped} agotado(s) no se activaron`,
            "success"
          );
        } else {
          showToast(
            `${data.updated} producto(s) activado(s)`,
            "success"
          );
        }
      }

      if (
        action === "desactivar"
      ) {
        setProducts(
          (current) =>
            current.map(
              (product) =>
                ids.includes(
                  product.id
                )
                  ? {
                      ...product,
                      inStock:
                        false,
                    }
                  : product
            )
        );

        showToast(
          `${data.updated} producto(s) pausado(s)`,
          "success"
        );
      }

      setSelected(
        new Set()
      );

      setBulkDeleteOpen(
        false
      );

      router.refresh();
    } catch {
      showToast(
        "Error de conexión",
        "error"
      );
    } finally {
      setBulkBusy(false);
    }
  }

  async function handleDelete() {
    if (!toDelete) return;

    const product =
      toDelete;

    setToDelete(null);

    try {
      const res =
        await fetch(
          `/api/admin/products/${product.id}`,
          {
            method:
              "DELETE",
          }
        );

      const data =
        await res
          .json()
          .catch(() => ({}));

      if (!res.ok) {
        showToast(
          data.error ||
            "No se pudo borrar el producto",
          "error"
        );
        return;
      }

      setProducts(
        (current) =>
          current.filter(
            (item) =>
              item.id !==
              product.id
          )
      );

      setSelected(
        (current) => {
          const next =
            new Set(current);

          next.delete(
            product.id
          );

          return next;
        }
      );

      showToast(
        `"${product.name}" fue eliminado`,
        "success"
      );

      router.refresh();
    } catch {
      showToast(
        "Error de conexión",
        "error"
      );
    }
  }

  async function toggleActive(
    product: ProductRow
  ) {
    if (
      !canEdit ||
      updatingId
    ) {
      return;
    }

    const newValue =
      !product.inStock;

    if (
      newValue &&
      product.stock <= 0
    ) {
      showToast(
        "No puedes activar un producto con stock 0",
        "error"
      );
      return;
    }

    setUpdatingId(
      product.id
    );

    setProducts(
      (current) =>
        current.map(
          (item) =>
            item.id ===
            product.id
              ? {
                  ...item,
                  inStock:
                    newValue,
                }
              : item
        )
    );

    try {
      const res =
        await fetch(
          "/api/admin/products/bulk",
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              ids: [
                product.id,
              ],
              action:
                newValue
                  ? "activar"
                  : "desactivar",
            }),
          }
        );

      const data =
        await res
          .json()
          .catch(() => ({}));

      if (!res.ok) {
        throw new Error(
          data.error ||
            "Error"
        );
      }
    } catch {
      setProducts(
        (current) =>
          current.map(
            (item) =>
              item.id ===
              product.id
                ? {
                    ...item,
                    inStock:
                      product.inStock,
                  }
                : item
          )
      );

      showToast(
        "No se pudo cambiar la disponibilidad",
        "error"
      );
    } finally {
      setUpdatingId(null);
    }
  }

  async function move(
    index: number,
    direction: -1 | 1
  ) {
    if (
      !canEdit ||
      reordering ||
      filtersActive
    ) {
      return;
    }

    const targetIndex =
      index + direction;

    if (
      targetIndex < 0 ||
      targetIndex >=
        products.length
    ) {
      return;
    }

    const previous =
      [...products];

    const reordered =
      [...products];

    [
      reordered[index],
      reordered[targetIndex],
    ] = [
      reordered[
        targetIndex
      ],
      reordered[index],
    ];

    setProducts(reordered);
    setReordering(true);

    try {
      const items =
        reordered.map(
          (product, order) => ({
            id: product.id,
            order,
          })
        );

      const res =
        await fetch(
          "/api/admin/products/reorder",
          {
            method: "PUT",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              items,
            }),
          }
        );

      if (!res.ok) {
        throw new Error();
      }
    } catch {
      setProducts(previous);

      showToast(
        "No se pudo guardar el nuevo orden",
        "error"
      );
    } finally {
      setReordering(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="Productos"
        meta={`${products.length} producto${
          products.length === 1
            ? ""
            : "s"
        } en tu catálogo`}
        action={
          canEdit ? (
            <Link
              href="/admin/productos/nuevo"
              className="flex items-center gap-2 bg-green hover:bg-green-dark text-white font-semibold text-sm px-4 py-2.5 rounded-xl transition-colors"
            >
              <Plus className="w-4 h-4" />
              Nuevo producto
            </Link>
          ) : undefined
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        <MetricCard
          title="Productos"
          value={
            summary.total
          }
          icon={Package}
          color="brown"
        />

        <MetricCard
          title="Activos"
          value={
            summary.active
          }
          icon={
            CheckCircle2
          }
          color="green"
        />

        <MetricCard
          title="Stock bajo"
          value={
            summary.lowStock
          }
          icon={
            AlertTriangle
          }
          color="amber"
        />

        <MetricCard
          title="Agotados"
          value={
            summary.outOfStock
          }
          icon={PackageX}
          color="red"
        />
      </div>

      {!showPrices && (
        <div className="mb-4 flex items-start gap-2.5 bg-amber-soft/60 border border-amber/15 rounded-xl px-4 py-3">
          <AlertTriangle className="w-4 h-4 text-amber shrink-0 mt-0.5" />

          <p className="text-xs text-panel-ink">
            Los precios están ocultos en la tienda pública. Aquí seguirás viéndolos porque forman parte de la administración interna.
          </p>
        </div>
      )}

      <div className="bg-panel-surface border border-panel-border rounded-2xl p-3 sm:p-4 mb-4">
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-panel-ink-soft absolute left-3 top-1/2 -translate-y-1/2" />

            <input
              value={search}
              onChange={(
                event
              ) => {
                setSearch(
                  event.target
                    .value
                );
                setPage(1);
              }}
              placeholder="Buscar por nombre, categoría o código..."
              className="w-full bg-panel-bg border border-panel-border rounded-xl pl-9 pr-3 py-2.5 text-sm text-panel-ink outline-none focus:ring-2 focus:ring-brown-dark/20 focus:border-brown-dark/40"
            />
          </div>

          <div className="w-full sm:w-52">
            <Select
              value={category}
              onChange={(
                value
              ) => {
                setCategory(
                  value
                );
                setPage(1);
              }}
              options={categories.map(
                (item) => ({
                  value: item,
                  label: item,
                })
              )}
            />
          </div>
        </div>

        {filtersActive && (
          <p className="text-[11px] text-panel-ink-soft mt-2">
            El orden del catálogo solo se puede modificar cuando no hay filtros activos.
          </p>
        )}
      </div>

      {selected.size > 0 &&
        canEdit && (
          <div className="flex items-center gap-2 bg-brown-dark rounded-xl px-4 py-3 mb-4 flex-wrap">
            <span className="text-cream text-sm font-semibold mr-2">
              {selected.size} seleccionado
              {selected.size === 1
                ? ""
                : "s"}
            </span>

            <button
              type="button"
              disabled={
                bulkBusy
              }
              onClick={() =>
                runBulk(
                  "activar"
                )
              }
              className="bg-cream/15 hover:bg-cream/25 disabled:opacity-50 text-cream text-xs font-semibold px-3 py-1.5 rounded-full"
            >
              Activar
            </button>

            <button
              type="button"
              disabled={
                bulkBusy
              }
              onClick={() =>
                runBulk(
                  "desactivar"
                )
              }
              className="bg-cream/15 hover:bg-cream/25 disabled:opacity-50 text-cream text-xs font-semibold px-3 py-1.5 rounded-full"
            >
              Pausar
            </button>

            {canRemove && (
              <button
                type="button"
                disabled={
                  bulkBusy
                }
                onClick={() =>
                  setBulkDeleteOpen(
                    true
                  )
                }
                className="bg-red-500/80 hover:bg-red-500 disabled:opacity-50 text-white text-xs font-semibold px-3 py-1.5 rounded-full"
              >
                Eliminar
              </button>
            )}
          </div>
        )}

      {filtered.length === 0 ? (
        <div className="bg-panel-surface border border-panel-border rounded-2xl py-14 text-center">
          <Package className="w-9 h-9 text-panel-ink-soft/30 mx-auto mb-3" />

          <p className="font-semibold text-panel-ink">
            No se encontraron productos
          </p>

          <p className="text-xs text-panel-ink-soft mt-1">
            Prueba con otro nombre o categoría.
          </p>
        </div>
      ) : (
        <div className="bg-panel-surface border border-panel-border rounded-2xl overflow-hidden">
          <div className="hidden lg:grid grid-cols-[34px_50px_minmax(240px,1fr)_140px_130px_130px_90px] gap-3 items-center px-4 py-3 bg-panel-bg border-b border-panel-border text-[11px] uppercase tracking-wide font-semibold text-panel-ink-soft">
            <div>
              {canEdit && (
                <button
                  type="button"
                  onClick={
                    toggleVisibleSelection
                  }
                  className={`w-5 h-5 rounded-md border flex items-center justify-center ${
                    allVisibleSelected
                      ? "bg-brown-dark border-brown-dark"
                      : "border-panel-border bg-panel-surface"
                  }`}
                >
                  {allVisibleSelected && (
                    <Check className="w-3.5 h-3.5 text-white" />
                  )}
                </button>
              )}
            </div>

            <span>Orden</span>
            <span>Producto</span>
            <span>Precio</span>
            <span>Inventario</span>
            <span>Estado</span>
            <span className="text-right">
              Acción
            </span>
          </div>

          {paginated.map(
            (product) => {
              const status =
                getProductStatus(
                  product
                );

              const isSelected =
                selected.has(
                  product.id
                );

              const realIndex =
                products.findIndex(
                  (item) =>
                    item.id ===
                    product.id
                );

              return (
                <div
                  key={
                    product.id
                  }
                  className={`border-b border-panel-border last:border-b-0 transition-colors ${
                    isSelected
                      ? "bg-brown-dark/[0.035]"
                      : "hover:bg-panel-bg/50"
                  }`}
                >
                  <div className="hidden lg:grid grid-cols-[34px_50px_minmax(240px,1fr)_140px_130px_130px_90px] gap-3 items-center px-4 py-3.5">
                    <div>
                      {canEdit && (
                        <button
                          type="button"
                          onClick={() =>
                            toggleSelect(
                              product.id
                            )
                          }
                          className={`w-5 h-5 rounded-md border flex items-center justify-center ${
                            isSelected
                              ? "bg-brown-dark border-brown-dark"
                              : "border-panel-border"
                          }`}
                        >
                          {isSelected && (
                            <Check className="w-3.5 h-3.5 text-white" />
                          )}
                        </button>
                      )}
                    </div>

                    <div>
                      {canEdit &&
                      !filtersActive ? (
                        <div className="flex flex-col gap-0.5">
                          <button
                            type="button"
                            disabled={
                              realIndex ===
                                0 ||
                              reordering
                            }
                            onClick={() =>
                              move(
                                realIndex,
                                -1
                              )
                            }
                            className="w-7 h-5 rounded-md bg-panel-bg flex items-center justify-center text-brown-dark disabled:opacity-25"
                            title="Subir"
                          >
                            <ChevronUp className="w-3 h-3" />
                          </button>

                          <button
                            type="button"
                            disabled={
                              realIndex ===
                                products.length -
                                  1 ||
                              reordering
                            }
                            onClick={() =>
                              move(
                                realIndex,
                                1
                              )
                            }
                            className="w-7 h-5 rounded-md bg-panel-bg flex items-center justify-center text-brown-dark disabled:opacity-25"
                            title="Bajar"
                          >
                            <ChevronDown className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-panel-ink-soft">
                          {realIndex +
                            1}
                        </span>
                      )}
                    </div>

                    <Link
                      href={`/admin/productos/${product.id}`}
                      className="min-w-0 flex items-center gap-3"
                    >
                      <div className="w-12 h-12 rounded-xl bg-cream shrink-0 overflow-hidden flex items-center justify-center border border-panel-border">
                        {product.images
                          .length >
                        0 ? (
                          <img
                            src={`https://res.cloudinary.com/${CLOUD_NAME}/image/upload/w_100,h_100,c_fill/${product.images[0]}`}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <ImageOff className="w-5 h-5 text-brown/25" />
                        )}
                      </div>

                      <div className="min-w-0">
                        <p className="font-semibold text-panel-ink truncate">
                          {
                            product.name
                          }
                        </p>

                        <div className="flex items-center gap-1.5 flex-wrap mt-1">
                          <span className="text-xs text-panel-ink-soft">
                            {
                              product.category
                            }
                          </span>

                          {product.isNew && (
                            <span className="text-[9px] font-bold bg-blue-50 text-blue-500 px-1.5 py-0.5 rounded-full">
                              Nuevo
                            </span>
                          )}

                          {product.isPromo && (
                            <span className="text-[9px] font-bold bg-green/15 text-green-dark px-1.5 py-0.5 rounded-full">
                              Oferta
                            </span>
                          )}
                        </div>

                        {product.barcode && (
                          <p className="text-[10px] text-panel-ink-soft mt-0.5 truncate">
                            Código:{" "}
                            {
                              product.barcode
                            }
                          </p>
                        )}
                      </div>
                    </Link>

                    <div>
                      {product.isPromo &&
                      product.promoPrice ? (
                        <>
                          <p className="text-[11px] text-panel-ink-soft line-through">
                            Bs.{" "}
                            {money(
                              product.price
                            )}
                          </p>

                          <p className="text-sm font-bold text-green-dark">
                            Bs.{" "}
                            {money(
                              product.promoPrice
                            )}
                          </p>
                        </>
                      ) : (
                        <p className="text-sm font-bold text-panel-ink">
                          Bs.{" "}
                          {money(
                            product.price
                          )}
                        </p>
                      )}

                      {!showPrices && (
                        <p className="text-[9px] text-amber mt-0.5">
                          Oculto al público
                        </p>
                      )}
                    </div>

                    <div>
                      <p className="text-sm font-bold text-panel-ink">
                        {
                          product.stock
                        }{" "}
                        un.
                      </p>

                      <p className="text-[10px] text-panel-ink-soft">
                        Alerta:{" "}
                        {product.lowStockThreshold ??
                          5}
                      </p>
                    </div>

                    <div>
                      <span
                        className={`inline-flex text-[10px] font-bold px-2.5 py-1 rounded-full ${status.className}`}
                      >
                        {
                          status.label
                        }
                      </span>
                    </div>

                    <div className="flex items-center justify-end gap-2">
                      {canEdit ? (
                        <div
                          className={
                            updatingId ===
                            product.id
                              ? "opacity-50 pointer-events-none"
                              : ""
                          }
                        >
                          <ToggleSwitch
                            checked={
                              product.inStock
                            }
                            onChange={() =>
                              toggleActive(
                                product
                              )
                            }
                            label=""
                          />
                        </div>
                      ) : (
                        <span className="text-xs text-panel-ink-soft">
                          Solo lectura
                        </span>
                      )}

                      {canRemove && (
                        <button
                          type="button"
                          onClick={() =>
                            setToDelete(
                              product
                            )
                          }
                          className="text-red-300 hover:text-red-500 p-1.5"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="lg:hidden p-3.5">
                    <div className="flex items-start gap-3">
                      {canEdit && (
                        <button
                          type="button"
                          onClick={() =>
                            toggleSelect(
                              product.id
                            )
                          }
                          className={`mt-1 w-5 h-5 rounded-md border shrink-0 flex items-center justify-center ${
                            isSelected
                              ? "bg-brown-dark border-brown-dark"
                              : "border-panel-border"
                          }`}
                        >
                          {isSelected && (
                            <Check className="w-3.5 h-3.5 text-white" />
                          )}
                        </button>
                      )}

                      <Link
                        href={`/admin/productos/${product.id}`}
                        className="flex gap-3 flex-1 min-w-0"
                      >
                        <div className="w-16 h-16 rounded-xl bg-cream shrink-0 overflow-hidden flex items-center justify-center border border-panel-border">
                          {product.images
                            .length >
                          0 ? (
                            <img
                              src={`https://res.cloudinary.com/${CLOUD_NAME}/image/upload/w_120,h_120,c_fill/${product.images[0]}`}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <ImageOff className="w-5 h-5 text-brown/25" />
                          )}
                        </div>

                        <div className="min-w-0">
                          <p className="font-semibold text-panel-ink truncate">
                            {
                              product.name
                            }
                          </p>

                          <p className="text-xs text-panel-ink-soft mt-0.5">
                            {
                              product.category
                            }
                          </p>

                          <div className="flex gap-1.5 mt-1.5 flex-wrap">
                            <span
                              className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${status.className}`}
                            >
                              {
                                status.label
                              }
                            </span>

                            {product.isNew && (
                              <span className="text-[9px] font-bold bg-blue-50 text-blue-500 px-2 py-0.5 rounded-full">
                                Nuevo
                              </span>
                            )}

                            {product.isPromo && (
                              <span className="text-[9px] font-bold bg-green/15 text-green-dark px-2 py-0.5 rounded-full">
                                Oferta
                              </span>
                            )}
                          </div>
                        </div>
                      </Link>
                    </div>

                    <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-panel-border">
                      <div>
                        <p className="text-[10px] text-panel-ink-soft">
                          Precio
                        </p>

                        <p className="text-xs font-bold text-panel-ink mt-0.5">
                          Bs.{" "}
                          {money(
                            product.isPromo &&
                              product.promoPrice
                              ? product.promoPrice
                              : product.price
                          )}
                        </p>
                      </div>

                      <div>
                        <p className="text-[10px] text-panel-ink-soft">
                          Stock
                        </p>

                        <p className="text-xs font-bold text-panel-ink mt-0.5">
                          {
                            product.stock
                          }{" "}
                          un.
                        </p>
                      </div>

                      <div className="flex items-end justify-end gap-2">
                        {canEdit && (
                          <div
                            className={
                              updatingId ===
                              product.id
                                ? "opacity-50 pointer-events-none"
                                : ""
                            }
                          >
                            <ToggleSwitch
                              checked={
                                product.inStock
                              }
                              onChange={() =>
                                toggleActive(
                                  product
                                )
                              }
                              label=""
                            />
                          </div>
                        )}

                        {canRemove && (
                          <button
                            type="button"
                            onClick={() =>
                              setToDelete(
                                product
                              )
                            }
                            className="text-red-400 p-1.5"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            }
          )}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 mt-5">
          <button
            type="button"
            onClick={() =>
              setPage(
                (current) =>
                  Math.max(
                    1,
                    current - 1
                  )
              )
            }
            disabled={
              currentPage === 1
            }
            className="text-sm font-medium px-3 py-2 rounded-lg border border-panel-border text-panel-ink-soft disabled:opacity-40"
          >
            Anterior
          </button>

          <span className="text-sm text-panel-ink-soft">
            Página{" "}
            {currentPage} de{" "}
            {totalPages}
          </span>

          <button
            type="button"
            onClick={() =>
              setPage(
                (current) =>
                  Math.min(
                    totalPages,
                    current + 1
                  )
              )
            }
            disabled={
              currentPage ===
              totalPages
            }
            className="text-sm font-medium px-3 py-2 rounded-lg border border-panel-border text-panel-ink-soft disabled:opacity-40"
          >
            Siguiente
          </button>
        </div>
      )}

      <ConfirmModal
        open={!!toDelete}
        title="¿Eliminar producto?"
        message={
          toDelete
            ? `"${toDelete.name}" se eliminará permanentemente. Esta acción no se puede deshacer.`
            : ""
        }
        onConfirm={
          handleDelete
        }
        onCancel={() =>
          setToDelete(null)
        }
      />

      <ConfirmModal
        open={
          bulkDeleteOpen
        }
        title={`¿Eliminar ${selected.size} producto(s)?`}
        message="Los productos seleccionados se eliminarán permanentemente."
        onConfirm={() =>
          runBulk("eliminar")
        }
        onCancel={() =>
          setBulkDeleteOpen(
            false
          )
        }
      />
    </div>
  );
}
