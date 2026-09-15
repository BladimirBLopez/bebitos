"use client";

import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as Dialog from "@radix-ui/react-dialog";
import {
  Plus,
  Trash2,
  Edit,
  X,
  Save,
  DollarSign,
  TrendingDown,
  Wallet,
  Receipt,
  Tag,
  Calendar,
} from "lucide-react";
import PageHeader from "@/components/PageHeader";
import ConfirmModal from "@/components/ConfirmModal";
import MetricCard from "@/components/dashboard/MetricCard";
import BalanceChart from "@/components/dashboard/BalanceChart";
import GastosPieChart from "@/components/dashboard/GastosPieChart";
import Select from "@/components/ui/Select";
import { useToast } from "@/lib/toast-context";
import { GASTO_CATEGORIES } from "@/lib/types";
import { gastoSchema, GastoFormValues } from "@/lib/schemas/gasto";
import { FormInput, FormTextarea } from "@/components/form/FormField";

type Gasto = {
  id: string;
  concept: string;
  category: string;
  amount: number;
  date: string;
  notes: string | null;
};

type Stats = {
  totalIngresos: number;
  totalGastos: number;
  balance: number;
  monthly: { month: string; ingresos: number; gastos: number }[];
  gastosByCategory: { name: string; value: number }[];
};

const emptyForm: GastoFormValues = {
  concept: "",
  category: GASTO_CATEGORIES[0],
  amount: "",
  date: new Date().toISOString().slice(0, 10),
  notes: "",
};

export default function ContabilidadPage() {
  const { showToast } = useToast();
  const [stats, setStats] = useState<Stats | null>(null);
  const [gastos, setGastos] = useState<Gasto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Gasto | null>(null);
  const [toDelete, setToDelete] = useState<Gasto | null>(null);
  const [saving, setSaving] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<GastoFormValues>({
    resolver: zodResolver(gastoSchema),
    defaultValues: emptyForm,
  });

  async function fetchAll() {
    setLoading(true);
    try {
      const [statsRes, gastosRes] = await Promise.all([
        fetch("/api/admin/contabilidad"),
        fetch("/api/admin/gastos"),
      ]);
      const statsData = await statsRes.json();
      const gastosData = await gastosRes.json();
      if (statsRes.ok) setStats(statsData);
      if (gastosRes.ok) setGastos(gastosData);
    } catch {
      setError("Error al cargar datos");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchAll();
  }, []);

  function openNewModal() {
    setEditing(null);
    setError("");
    reset(emptyForm);
    setShowModal(true);
  }

  function openEditModal(gasto: Gasto) {
    setEditing(gasto);
    setError("");
    reset({
      concept: gasto.concept,
      category: gasto.category,
      amount: String(gasto.amount),
      date: gasto.date.slice(0, 10),
      notes: gasto.notes || "",
    });
    setShowModal(true);
  }

  async function onSubmit(values: GastoFormValues) {
    setError("");
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/gastos${editing ? `/${editing.id}` : ""}`, {
        method: editing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Error al guardar");
        setSaving(false);
        return;
      }
      setShowModal(false);
      setEditing(null);
      reset(emptyForm);
      showToast(editing ? "Gasto actualizado" : "Gasto registrado", "success");
      fetchAll();
    } catch {
      setError("Error interno");
    } finally {
      setSaving(false);
    }
  }

  async function confirmDelete() {
    if (!toDelete) return;
    try {
      const res = await fetch(`/api/admin/gastos/${toDelete.id}`, { method: "DELETE" });
      if (res.ok) {
        showToast("Gasto eliminado", "success");
        fetchAll();
      } else {
        showToast("Error al eliminar", "error");
      }
    } catch {
      showToast("Error interno", "error");
    } finally {
      setToDelete(null);
    }
  }

  return (
    <div>
      <PageHeader
        title="Contabilidad"
        meta="Balance de ingresos y gastos del negocio"
        action={
          <button
            onClick={openNewModal}
            className="flex items-center gap-2 bg-brown-dark hover:bg-ink text-cream text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            Nuevo Gasto
          </button>
        }
      />

      {loading || !stats ? (
        <p className="text-panel-ink-soft text-sm">Cargando...</p>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <MetricCard
              title="Ingresos"
              value={`Bs. ${stats.totalIngresos.toFixed(2)}`}
              icon={DollarSign}
              color="green"
            />
            <MetricCard
              title="Gastos"
              value={`Bs. ${stats.totalGastos.toFixed(2)}`}
              icon={TrendingDown}
              color="red"
            />
            <MetricCard
              title="Balance"
              value={`Bs. ${stats.balance.toFixed(2)}`}
              icon={Wallet}
              color={stats.balance >= 0 ? "green" : "red"}
              emphasis
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <div className="lg:col-span-2 bg-panel-surface p-4 rounded-xl shadow-panel border border-panel-border">
              <BalanceChart data={stats.monthly} />
            </div>
            <div className="bg-panel-surface p-4 rounded-xl shadow-panel border border-panel-border">
              <GastosPieChart data={stats.gastosByCategory} />
            </div>
          </div>
        </>
      )}

      {error && (
        <p className="text-red-600 bg-red-50 p-2 rounded mb-4 text-sm">{error}</p>
      )}

      <h2 className="text-lg font-semibold text-panel-ink mb-3">Gastos Registrados</h2>

      {!loading && gastos.length === 0 ? (
        <p className="text-panel-ink-soft text-sm text-center py-10">
          Todavía no hay gastos registrados.
        </p>
      ) : (
        <div className="grid gap-3">
          {gastos.map((gasto) => (
            <div
              key={gasto.id}
              className="bg-panel-surface rounded-xl border border-panel-border p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
              style={{ boxShadow: "var(--shadow-panel)" }}
            >
              <div className="min-w-0 flex-1">
                <p className="font-sans font-bold text-panel-ink truncate">{gasto.concept}</p>
                <div className="flex items-center gap-2 flex-wrap mt-0.5">
                  <span className="text-[11px] font-medium bg-brown-dark/10 text-brown-dark px-2 py-0.5 rounded-full">
                    {gasto.category}
                  </span>
                  <p className="text-xs text-panel-ink-soft">
                    {new Date(gasto.date).toLocaleDateString("es-BO", { day: "2-digit", month: "short", year: "numeric" })}
                  </p>
                </div>
                {gasto.notes && (
                  <p className="text-xs text-panel-ink-soft mt-1 italic truncate">{gasto.notes}</p>
                )}
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <p className="font-semibold text-panel-ink">Bs. {gasto.amount.toFixed(2)}</p>
                <button
                  onClick={() => openEditModal(gasto)}
                  className="flex items-center gap-1 text-sm text-brown-dark hover:bg-panel-bg p-2 rounded"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setToDelete(gasto)}
                  className="flex items-center gap-1 text-sm text-red-600 hover:bg-red-50 p-2 rounded"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog.Root open={showModal} onOpenChange={setShowModal}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-ink/40 backdrop-blur-[2px] z-50" />
          <Dialog.Content className="fixed z-[51] left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100%-2rem)] max-w-md bg-panel-surface rounded-2xl shadow-xl max-h-[90vh] flex flex-col focus:outline-none overflow-hidden">
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col min-h-0">
              {/* Header */}
              <div className="flex items-start justify-between gap-3 px-6 pt-6 pb-4 border-b border-panel-border">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-red/10 flex items-center justify-center shrink-0">
                    <TrendingDown className="w-5 h-5 text-red" />
                  </div>
                  <div>
                    <Dialog.Title className="text-base font-bold text-panel-ink leading-tight">
                      {editing ? "Editar Gasto" : "Nuevo Gasto"}
                    </Dialog.Title>
                    <Dialog.Description className="text-xs text-panel-ink-soft mt-0.5">
                      {editing ? "Actualiza los datos del gasto" : "Registra una salida de dinero"}
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

              {/* Body */}
              <div className="px-6 py-5 space-y-4 overflow-y-auto">
                <FormInput
                  label="Concepto"
                  icon={Receipt}
                  required
                  placeholder="Ej. Compra de cajas"
                  error={errors.concept?.message}
                  {...register("concept")}
                />

                <div>
                  <Controller
                    name="category"
                    control={control}
                    render={({ field }) => (
                      <div>
                        <label className="text-xs font-semibold text-panel-ink tracking-wide mb-1.5 block">
                          Categoría<span className="text-amber ml-0.5">*</span>
                        </label>
                        <Select
                          value={field.value}
                          onChange={field.onChange}
                          options={GASTO_CATEGORIES.map((cat) => ({ value: cat, label: cat }))}
                        />
                      </div>
                    )}
                  />
                  {errors.category && (
                    <p className="text-red text-xs mt-1.5">{errors.category.message}</p>
                  )}
                </div>

                <FormInput
                  label="Monto"
                  icon={DollarSign}
                  required
                  hint="en Bs."
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  error={errors.amount?.message}
                  {...register("amount")}
                />

                <FormInput
                  label="Fecha"
                  icon={Calendar}
                  required
                  type="date"
                  error={errors.date?.message}
                  {...register("date")}
                />

                <FormTextarea
                  label="Notas"
                  hint="opcional"
                  placeholder="Detalles del gasto..."
                  rows={2}
                  {...register("notes")}
                />
              </div>

              {/* Footer */}
              <div className="flex gap-2 px-6 py-4 border-t border-panel-border bg-panel-bg/50">
                <Dialog.Close asChild>
                  <button
                    type="button"
                    className="flex-1 text-sm font-semibold text-panel-ink-soft hover:text-panel-ink py-2.5 rounded-lg transition-colors"
                  >
                    Cancelar
                  </button>
                </Dialog.Close>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-[2] flex items-center justify-center gap-2 bg-brown-dark hover:bg-ink text-cream font-semibold text-sm py-2.5 rounded-lg disabled:opacity-50 transition-colors"
                >
                  <Save className="w-4 h-4" />
                  {saving ? "Guardando..." : editing ? "Guardar cambios" : "Registrar Gasto"}
                </button>
              </div>
            </form>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      <ConfirmModal
        open={!!toDelete}
        title="¿Borrar este gasto?"
        message={toDelete ? `Se eliminará el registro de "${toDelete.concept}" permanentemente.` : ""}
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </div>
  );
}
