"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as Dialog from "@radix-ui/react-dialog";
import {
  Plus,
  Trash2,
  Edit,
  X,
  Save,
  MessageCircle,
  Search,
  Users,
  User,
  Phone,
  Mail,
  MapPin,
  StickyNote,
} from "lucide-react";
import PageHeader from "@/components/PageHeader";
import ConfirmModal from "@/components/ConfirmModal";
import { useToast } from "@/lib/toast-context";
import { clienteSchema, ClienteFormValues } from "@/lib/schemas/cliente";
import { useCurrentUser } from "@/lib/user-context";
import { canDelete } from "@/lib/roles";
import { FormInput, FormTextarea } from "@/components/form/FormField";

type Cliente = {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  address: string | null;
  notes: string | null;
  createdAt: string;
};

const emptyForm: ClienteFormValues = { name: "", phone: "", email: "", address: "", notes: "" };

export default function AdminClientesPage() {
  const { showToast } = useToast();
  const { role } = useCurrentUser();
  const canRemove = canDelete(role);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Cliente | null>(null);
  const [toDelete, setToDelete] = useState<Cliente | null>(null);
  const [saving, setSaving] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ClienteFormValues>({
    resolver: zodResolver(clienteSchema),
    defaultValues: emptyForm,
  });

  async function fetchClientes() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/clientes");
      const data = await res.json();
      if (res.ok) {
        setClientes(data);
      } else {
        setError(data.error || "Error al listar clientes");
      }
    } catch {
      setError("Error interno");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchClientes();
  }, []);

  function openNewModal() {
    setEditing(null);
    setError("");
    reset(emptyForm);
    setShowModal(true);
  }

  function openEditModal(cliente: Cliente) {
    setEditing(cliente);
    setError("");
    reset({
      name: cliente.name,
      phone: cliente.phone,
      email: cliente.email || "",
      address: cliente.address || "",
      notes: cliente.notes || "",
    });
    setShowModal(true);
  }

  async function onSubmit(values: ClienteFormValues) {
    setError("");
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/clientes${editing ? `/${editing.id}` : ""}`, {
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
      showToast(editing ? "Cliente actualizado" : "Cliente creado", "success");
      fetchClientes();
    } catch {
      setError("Error interno");
    } finally {
      setSaving(false);
    }
  }

  async function confirmDelete() {
    if (!toDelete) return;
    try {
      const res = await fetch(`/api/admin/clientes/${toDelete.id}`, { method: "DELETE" });
      if (res.ok) {
        setClientes((prev) => prev.filter((c) => c.id !== toDelete.id));
        showToast("Cliente borrado", "success");
      } else {
        showToast("Error al eliminar", "error");
      }
    } catch {
      showToast("Error interno", "error");
    } finally {
      setToDelete(null);
    }
  }

  const filtered = clientes.filter((c) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      c.name.toLowerCase().includes(q) ||
      c.phone.includes(q) ||
      (c.email || "").toLowerCase().includes(q)
    );
  });

  return (
    <div>
      <PageHeader
        title="Clientes"
        meta={loading ? "Cargando..." : `${clientes.length} cliente${clientes.length === 1 ? "" : "s"} registrado${clientes.length === 1 ? "" : "s"}`}
        action={
          <button
            onClick={openNewModal}
            className="flex items-center gap-2 bg-brown-dark hover:bg-ink text-cream text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            Nuevo Cliente
          </button>
        }
      />

      {clientes.length > 0 && (
        <div className="relative mb-4 max-w-sm">
          <Search className="w-4 h-4 text-panel-ink-soft absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por nombre, teléfono o email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border border-panel-border rounded-lg pl-9 pr-3 py-2 text-sm bg-panel-surface"
          />
        </div>
      )}

      {error && (
        <p className="text-red-600 bg-red-50 p-2 rounded mb-4 text-sm">{error}</p>
      )}

      {loading ? (
        <p className="text-panel-ink-soft text-sm">Cargando...</p>
      ) : filtered.length === 0 ? (
        <p className="text-panel-ink-soft text-sm text-center py-10">
          {clientes.length === 0
            ? "Todavía no hay clientes registrados."
            : "No se encontraron clientes con ese criterio."}
        </p>
      ) : (
        <div className="grid gap-3">
          {filtered.map((cliente) => (
            <div
              key={cliente.id}
              className="bg-panel-surface rounded-xl border border-panel-border p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
              style={{ boxShadow: "var(--shadow-panel)" }}
            >
              <div className="min-w-0 flex-1">
                <p className="font-sans font-bold text-panel-ink truncate">{cliente.name}</p>
                <div className="flex items-center gap-2 flex-wrap mt-0.5">
                  <p className="text-sm text-panel-ink-soft">{cliente.phone}</p>
                  {cliente.email && <p className="text-sm text-panel-ink-soft">· {cliente.email}</p>}
                </div>
                {cliente.address && (
                  <p className="text-xs text-panel-ink-soft mt-1 truncate">{cliente.address}</p>
                )}
                {cliente.notes && (
                  <p className="text-xs text-panel-ink-soft mt-1 italic truncate">{cliente.notes}</p>
                )}
              </div>
              <div className="flex gap-2 shrink-0">
                <a
                  href={`https://wa.me/${cliente.phone.startsWith("591") ? cliente.phone : "591" + cliente.phone}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 bg-green/15 hover:bg-green/25 text-green-dark text-sm font-medium px-3 py-2 rounded-lg transition-colors"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  WhatsApp
                </a>
                <button
                  onClick={() => openEditModal(cliente)}
                  className="flex items-center gap-1 text-sm text-brown-dark hover:bg-panel-bg p-2 rounded"
                >
                  <Edit className="w-4 h-4" />
                </button>
                {canRemove && (
                  <button
                    onClick={() => setToDelete(cliente)}
                    className="flex items-center gap-1 text-sm text-red-600 hover:bg-red-50 p-2 rounded"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
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
              <div className="flex items-start justify-between gap-3 px-6 pt-6 pb-4 border-b border-panel-border">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-brown-dark/10 flex items-center justify-center shrink-0">
                    <Users className="w-5 h-5 text-brown-dark" />
                  </div>
                  <div>
                    <Dialog.Title className="text-base font-bold text-panel-ink leading-tight">
                      {editing ? "Editar Cliente" : "Nuevo Cliente"}
                    </Dialog.Title>
                    <Dialog.Description className="text-xs text-panel-ink-soft mt-0.5">
                      {editing ? "Actualiza los datos de contacto" : "Completa los datos de contacto"}
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

              <div className="px-6 py-5 space-y-4 overflow-y-auto">
                <FormInput
                  label="Nombre completo"
                  icon={User}
                  required
                  placeholder="Ej. María Fernández"
                  error={errors.name?.message}
                  {...register("name")}
                />

                <FormInput
                  label="WhatsApp"
                  icon={Phone}
                  required
                  hint="solo números"
                  placeholder="70123456"
                  inputMode="numeric"
                  error={errors.phone?.message}
                  {...register("phone")}
                />

                <FormInput
                  label="Email"
                  icon={Mail}
                  hint="opcional"
                  type="email"
                  placeholder="maria@correo.com"
                  error={errors.email?.message}
                  {...register("email")}
                />

                <FormInput
                  label="Dirección"
                  icon={MapPin}
                  hint="opcional"
                  placeholder="Zona, calle, referencia..."
                  {...register("address")}
                />

                <FormTextarea
                  label="Notas internas"
                  hint="opcional"
                  placeholder="Preferencias, detalles útiles para futuras ventas..."
                  rows={3}
                  {...register("notes")}
                />
              </div>

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
                  {saving ? "Guardando..." : editing ? "Guardar cambios" : "Crear Cliente"}
                </button>
              </div>
            </form>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      <ConfirmModal
        open={!!toDelete}
        title="¿Borrar este cliente?"
        message={toDelete ? `Se eliminará el registro de "${toDelete.name}" permanentemente.` : ""}
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </div>
  );
}
