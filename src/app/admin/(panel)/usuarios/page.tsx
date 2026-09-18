"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Controller,
  useForm,
} from "react-hook-form";

import {
  zodResolver,
} from "@hookform/resolvers/zod";

import * as Dialog from "@radix-ui/react-dialog";

import {
  CheckCircle2,
  Edit,
  Eye,
  Lock,
  Mail,
  Plus,
  Save,
  Shield,
  ShieldCheck,
  Trash2,
  User,
  UserX,
  X,
} from "lucide-react";

import PageHeader from "@/components/PageHeader";
import ConfirmModal from "@/components/ConfirmModal";
import Select from "@/components/ui/Select";
import ToggleSwitch from "@/components/ToggleSwitch";
import MetricCard from "@/components/dashboard/MetricCard";

import {
  FormInput,
} from "@/components/form/FormField";

import {
  ROLE_DESCRIPTIONS,
  ROLE_LABELS,
  USER_ROLES,
  usuarioSchema,
  type UsuarioFormValues,
} from "@/lib/schemas/usuario";

import { useToast } from "@/lib/toast-context";
import { useCurrentUser } from "@/lib/user-context";

type Usuario = {
  id: string;
  name: string;
  email: string;
  role:
    (typeof USER_ROLES)[number];
  active: boolean;
  createdAt?: string;
};

const emptyForm: UsuarioFormValues = {
  name: "",
  email: "",
  password: "",
  role: "VIEWER",
  active: true,
};

export default function AdminUsuariosPage() {
  const currentUser =
    useCurrentUser();

  const { showToast } =
    useToast();

  const [users, setUsers] =
    useState<Usuario[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [
    showModal,
    setShowModal,
  ] = useState(false);

  const [
    editing,
    setEditing,
  ] = useState<Usuario | null>(
    null
  );

  const [
    toDelete,
    setToDelete,
  ] = useState<Usuario | null>(
    null
  );

  const [saving, setSaving] =
    useState(false);

  const isSelf =
    editing?.id ===
    currentUser.id;

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: {
      errors,
    },
  } =
    useForm<UsuarioFormValues>({
      resolver: zodResolver(
        usuarioSchema(
          Boolean(editing)
        )
      ),
      defaultValues:
        emptyForm,
    });

  const summary =
    useMemo(() => {
      return {
        total:
          users.length,

        admins:
          users.filter(
            (user) =>
              user.role ===
                "ADMIN" &&
              user.active
          ).length,

        active:
          users.filter(
            (user) =>
              user.active
          ).length,

        inactive:
          users.filter(
            (user) =>
              !user.active
          ).length,
      };
    }, [users]);

  async function fetchUsers() {
    setLoading(true);
    setError("");

    try {
      const res =
        await fetch(
          "/api/admin/users",
          {
            cache:
              "no-store",
          }
        );

      const data =
        await res.json();

      if (!res.ok) {
        setError(
          data.error ||
            "Error al listar usuarios"
        );
        return;
      }

      setUsers(
        Array.isArray(data)
          ? data
          : []
      );
    } catch {
      setError(
        "No se pudo conectar con el servidor"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchUsers();
  }, []);

  function openNewModal() {
    setEditing(null);
    setError("");
    reset(emptyForm);
    setShowModal(true);
  }

  function openEditModal(
    user: Usuario
  ) {
    setEditing(user);
    setError("");

    reset({
      name:
        user.name,

      email:
        user.email,

      password:
        "",

      role:
        user.role,

      active:
        user.active,
    });

    setShowModal(true);
  }

  async function onSubmit(
    values: UsuarioFormValues
  ) {
    if (saving) return;

    setError("");
    setSaving(true);

    try {
      const payload:
        Record<
          string,
          unknown
        > = {
        ...values,
      };

      if (
        editing &&
        !values.password
      ) {
        delete payload.password;
      }

      const res =
        await fetch(
          `/api/admin/users${
            editing
              ? `/${editing.id}`
              : ""
          }`,
          {
            method:
              editing
                ? "PUT"
                : "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify(
                payload
              ),
          }
        );

      const data =
        await res
          .json()
          .catch(() => ({}));

      if (!res.ok) {
        setError(
          data.error ||
            "No se pudo guardar el usuario"
        );
        return;
      }

      setShowModal(false);
      setEditing(null);
      reset(emptyForm);

      showToast(
        editing
          ? "Usuario actualizado"
          : "Usuario creado",
        "success"
      );

      await fetchUsers();
    } catch {
      setError(
        "Error de conexión"
      );
    } finally {
      setSaving(false);
    }
  }

  async function confirmDelete() {
    if (!toDelete) return;

    const user =
      toDelete;

    setToDelete(null);

    try {
      const res =
        await fetch(
          `/api/admin/users/${user.id}`,
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
            "No se pudo eliminar el usuario",
          "error"
        );
        return;
      }

      setUsers(
        (current) =>
          current.filter(
            (item) =>
              item.id !==
              user.id
          )
      );

      showToast(
        "Usuario eliminado",
        "success"
      );
    } catch {
      showToast(
        "Error de conexión",
        "error"
      );
    }
  }

  return (
    <div>
      <PageHeader
        title="Usuarios y permisos"
        meta="Administra quién puede acceder al panel y qué puede hacer"
        action={
          <button
            type="button"
            onClick={
              openNewModal
            }
            className="flex items-center gap-2 bg-brown-dark hover:bg-ink text-cream text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors"
          >
            <Plus className="w-4 h-4" />
            Nuevo usuario
          </button>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        <MetricCard
          title="Usuarios"
          value={
            summary.total
          }
          icon={User}
          color="brown"
        />

        <MetricCard
          title="Administradores"
          value={
            summary.admins
          }
          icon={ShieldCheck}
          color="green"
        />

        <MetricCard
          title="Activos"
          value={
            summary.active
          }
          icon={
            CheckCircle2
          }
          color="ink"
        />

        <MetricCard
          title="Inactivos"
          value={
            summary.inactive
          }
          icon={UserX}
          color="red"
        />
      </div>

      {error &&
        !showModal && (
          <p className="text-red-600 bg-red-50 border border-red-100 p-3 rounded-xl mb-4 text-sm">
            {error}
          </p>
        )}

      {loading ? (
        <p className="text-panel-ink-soft text-sm">
          Cargando usuarios...
        </p>
      ) : (
        <div className="bg-panel-surface border border-panel-border rounded-2xl overflow-hidden">
          <div className="hidden md:grid grid-cols-[minmax(0,1.5fr)_170px_120px_150px] gap-4 px-4 py-3 bg-panel-bg border-b border-panel-border text-[11px] uppercase tracking-wide font-semibold text-panel-ink-soft">
            <span>Usuario</span>
            <span>Rol</span>
            <span>Estado</span>
            <span className="text-right">
              Acciones
            </span>
          </div>

          {users.map(
            (user) => {
              const self =
                user.id ===
                currentUser.id;

              return (
                <div
                  key={
                    user.id
                  }
                  className="grid md:grid-cols-[minmax(0,1.5fr)_170px_120px_150px] gap-3 md:gap-4 items-center px-4 py-4 border-b border-panel-border last:border-b-0 hover:bg-panel-bg/40 transition-colors"
                >
                  <div className="min-w-0 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-brown-dark/10 flex items-center justify-center shrink-0">
                      <User className="w-4 h-4 text-brown-dark" />
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-panel-ink truncate">
                          {
                            user.name
                          }
                        </p>

                        {self && (
                          <span className="text-[9px] font-bold bg-brown-dark/10 text-brown-dark px-2 py-0.5 rounded-full">
                            Tú
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-panel-ink-soft truncate">
                        {
                          user.email
                        }
                      </p>
                    </div>
                  </div>

                  <div>
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-panel-ink">
                      <Shield className="w-3.5 h-3.5 text-panel-ink-soft" />
                      {
                        ROLE_LABELS[
                          user.role
                        ]
                      }
                    </span>
                  </div>

                  <div>
                    <span
                      className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        user.active
                          ? "bg-green-soft text-green-dark"
                          : "bg-red-soft text-red"
                      }`}
                    >
                      {user.active
                        ? "Activo"
                        : "Inactivo"}
                    </span>
                  </div>

                  <div className="flex md:justify-end gap-1">
                    <button
                      type="button"
                      onClick={() =>
                        openEditModal(
                          user
                        )
                      }
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-brown-dark hover:bg-panel-bg px-3 py-2 rounded-lg"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      Editar
                    </button>

                    {!self && (
                      <button
                        type="button"
                        onClick={() =>
                          setToDelete(
                            user
                          )
                        }
                        className="text-red-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-lg"
                        title="Eliminar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            }
          )}
        </div>
      )}

      <Dialog.Root
        open={showModal}
        onOpenChange={(open) => {
          if (saving) return;

          setShowModal(open);

          if (!open) {
            setEditing(
              null
            );
            setError("");
            reset(
              emptyForm
            );
          }
        }}
      >
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-ink/40 backdrop-blur-[2px] z-50" />

          <Dialog.Content className="fixed z-[51] left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100%-2rem)] max-w-md bg-panel-surface rounded-2xl shadow-xl max-h-[90vh] flex flex-col focus:outline-none overflow-hidden">
            <form
              onSubmit={handleSubmit(
                onSubmit
              )}
              className="flex flex-col min-h-0"
            >
              <div className="flex items-start justify-between gap-3 px-6 pt-6 pb-4 border-b border-panel-border">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-brown-dark/10 flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-5 h-5 text-brown-dark" />
                  </div>

                  <div>
                    <Dialog.Title className="text-base font-bold text-panel-ink leading-tight">
                      {editing
                        ? "Editar usuario"
                        : "Nuevo usuario"}
                    </Dialog.Title>

                    <Dialog.Description className="text-xs text-panel-ink-soft mt-0.5">
                      {editing
                        ? "Actualiza sus datos, permisos y acceso."
                        : "Crea una cuenta para acceder al panel."}
                    </Dialog.Description>
                  </div>
                </div>

                <Dialog.Close asChild>
                  <button
                    type="button"
                    className="text-panel-ink-soft hover:text-panel-ink hover:bg-panel-bg rounded-lg p-1.5"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </Dialog.Close>
              </div>

              <div className="px-6 py-5 space-y-4 overflow-y-auto">
                {error && (
                  <p className="text-red-600 bg-red-50 border border-red-100 p-3 rounded-xl text-sm">
                    {error}
                  </p>
                )}

                <FormInput
                  label="Nombre"
                  icon={User}
                  required
                  placeholder="Ej. Ana Pérez"
                  error={
                    errors.name
                      ?.message
                  }
                  {...register(
                    "name"
                  )}
                />

                <FormInput
                  label="Email"
                  icon={Mail}
                  required
                  type="email"
                  autoCapitalize="none"
                  autoComplete="email"
                  placeholder="ana@bebitos.com"
                  error={
                    errors.email
                      ?.message
                  }
                  {...register(
                    "email"
                  )}
                />

                <FormInput
                  label="Contraseña"
                  icon={Lock}
                  required={
                    !editing
                  }
                  hint={
                    editing
                      ? "Déjala vacía para mantener la actual"
                      : undefined
                  }
                  type="password"
                  autoComplete={
                    editing
                      ? "new-password"
                      : "new-password"
                  }
                  placeholder={
                    editing
                      ? "Nueva contraseña"
                      : "Mínimo 8 caracteres"
                  }
                  error={
                    errors.password
                      ?.message
                  }
                  {...register(
                    "password"
                  )}
                />

                <div>
                  <label className="text-xs font-semibold text-panel-ink tracking-wide mb-1.5 block">
                    Rol
                    <span className="text-amber ml-0.5">
                      *
                    </span>
                  </label>

                  {isSelf ? (
                    <div className="border border-panel-border bg-panel-bg rounded-xl px-3 py-2.5">
                      <p className="text-sm font-semibold text-panel-ink">
                        Administrador
                      </p>

                      <p className="text-[11px] text-panel-ink-soft mt-0.5">
                        No puedes quitarte tus propios permisos administrativos.
                      </p>
                    </div>
                  ) : (
                    <Controller
                      name="role"
                      control={
                        control
                      }
                      render={({
                        field,
                      }) => (
                        <Select
                          value={
                            field.value
                          }
                          onChange={
                            field.onChange
                          }
                          options={USER_ROLES.map(
                            (
                              role
                            ) => ({
                              value:
                                role,
                              label:
                                ROLE_LABELS[
                                  role
                                ],
                            })
                          )}
                        />
                      )}
                    />
                  )}

                  {!isSelf && (
                    <Controller
                      name="role"
                      control={
                        control
                      }
                      render={({
                        field,
                      }) => (
                        <p className="text-[11px] text-panel-ink-soft mt-2">
                          {
                            ROLE_DESCRIPTIONS[
                              field.value
                            ]
                          }
                        </p>
                      )}
                    />
                  )}

                  {errors.role && (
                    <p className="text-red text-xs mt-1.5">
                      {
                        errors.role
                          .message
                      }
                    </p>
                  )}
                </div>

                <div className="border-t border-panel-border pt-4">
                  {isSelf ? (
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-dark mt-0.5" />

                      <div>
                        <p className="text-sm font-semibold text-panel-ink">
                          Tu cuenta está activa
                        </p>

                        <p className="text-xs text-panel-ink-soft">
                          No puedes desactivar la cuenta con la que estás usando el sistema.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <Controller
                      name="active"
                      control={
                        control
                      }
                      render={({
                        field,
                      }) => (
                        <ToggleSwitch
                          checked={
                            field.value
                          }
                          onChange={
                            field.onChange
                          }
                          label="Acceso activo"
                          description="Si lo desactivas, el usuario ya no podrá iniciar ni usar el panel."
                        />
                      )}
                    />
                  )}
                </div>
              </div>

              <div className="flex gap-2 px-6 py-4 border-t border-panel-border bg-panel-bg/50">
                <Dialog.Close asChild>
                  <button
                    type="button"
                    disabled={
                      saving
                    }
                    className="flex-1 text-sm font-semibold text-panel-ink-soft hover:text-panel-ink py-2.5 rounded-lg"
                  >
                    Cancelar
                  </button>
                </Dialog.Close>

                <button
                  type="submit"
                  disabled={
                    saving
                  }
                  className="flex-[2] flex items-center justify-center gap-2 bg-brown-dark hover:bg-ink text-cream font-semibold text-sm py-2.5 rounded-xl disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />

                  {saving
                    ? "Guardando..."
                    : editing
                      ? "Guardar cambios"
                      : "Crear usuario"}
                </button>
              </div>
            </form>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      <ConfirmModal
        open={
          Boolean(
            toDelete
          )
        }
        title="¿Eliminar usuario?"
        message={
          toDelete
            ? `Se eliminará permanentemente el acceso de "${toDelete.name}".`
            : ""
        }
        onConfirm={
          confirmDelete
        }
        onCancel={() =>
          setToDelete(null)
        }
      />
    </div>
  );
}
