import {
  NextRequest,
  NextResponse,
} from "next/server";

import bcrypt from "bcryptjs";

import { prisma } from "@/lib/prisma";
import { requireAdminOnly } from "@/lib/permissions";
import { usuarioSchema } from "@/lib/schemas/usuario";

async function hasAnotherActiveAdmin(
  excludedUserId: string
) {
  const count =
    await prisma.user.count({
      where: {
        id: {
          not:
            excludedUserId,
        },
        role: "ADMIN",
        active: true,
      },
    });

  return count > 0;
}

export async function PUT(
  req: NextRequest,
  {
    params,
  }: {
    params: Promise<{
      id: string;
    }>;
  }
) {
  const currentUser =
    await requireAdminOnly();

  if (!currentUser) {
    return NextResponse.json(
      {
        error:
          "No tienes permiso para esta acción",
      },
      { status: 403 }
    );
  }

  try {
    const { id } =
      await params;

    const body =
      await req.json();

    const validation =
      usuarioSchema(
        true
      ).safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error:
            validation.error.issues[0]
              ?.message ||
            "Datos inválidos",
        },
        { status: 400 }
      );
    }

    const {
      name,
      email,
      password,
      role,
      active,
    } = validation.data;

    const target =
      await prisma.user.findUnique({
        where: { id },
        select: {
          id: true,
          role: true,
          active: true,
        },
      });

    if (!target) {
      return NextResponse.json(
        {
          error:
            "Usuario no encontrado",
        },
        { status: 404 }
      );
    }

    /*
      El administrador que está usando
      el sistema no puede quitarse a sí
      mismo sus propios permisos ni
      desactivar su propia cuenta.
    */
    if (
      currentUser.id === id
    ) {
      if (
        role !== "ADMIN"
      ) {
        return NextResponse.json(
          {
            error:
              "No puedes quitarte el rol de administrador a ti mismo",
          },
          { status: 400 }
        );
      }

      if (!active) {
        return NextResponse.json(
          {
            error:
              "No puedes desactivar tu propia cuenta",
          },
          { status: 400 }
        );
      }
    }

    /*
      Nunca permitimos dejar al sistema
      sin un administrador activo.
    */
    const removingActiveAdmin =
      target.role ===
        "ADMIN" &&
      target.active &&
      (
        role !== "ADMIN" ||
        !active
      );

    if (
      removingActiveAdmin &&
      !(await hasAnotherActiveAdmin(
        id
      ))
    ) {
      return NextResponse.json(
        {
          error:
            "Debe existir al menos un administrador activo",
        },
        { status: 400 }
      );
    }

    const existingEmail =
      await prisma.user.findFirst({
        where: {
          email,
          id: {
            not: id,
          },
        },
        select: {
          id: true,
        },
      });

    if (existingEmail) {
      return NextResponse.json(
        {
          error:
            "Ya existe otro usuario con ese email",
        },
        { status: 409 }
      );
    }

    const passwordHash =
      password
        ? await bcrypt.hash(
            password,
            12
          )
        : undefined;

    const user =
      await prisma.user.update({
        where: {
          id,
        },

        data: {
          name,
          email,
          role,
          active,

          ...(passwordHash
            ? {
                password:
                  passwordHash,
              }
            : {}),
        },

        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          active: true,
          createdAt: true,
        },
      });

    return NextResponse.json(
      user
    );
  } catch (error: any) {
    if (
      error?.code === "P2002"
    ) {
      return NextResponse.json(
        {
          error:
            "Ya existe otro usuario con ese email",
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        error:
          "No se pudo actualizar el usuario",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  {
    params,
  }: {
    params: Promise<{
      id: string;
    }>;
  }
) {
  const currentUser =
    await requireAdminOnly();

  if (!currentUser) {
    return NextResponse.json(
      {
        error:
          "No tienes permiso para esta acción",
      },
      { status: 403 }
    );
  }

  try {
    const { id } =
      await params;

    if (
      currentUser.id === id
    ) {
      return NextResponse.json(
        {
          error:
            "No puedes eliminar tu propia cuenta",
        },
        { status: 400 }
      );
    }

    const target =
      await prisma.user.findUnique({
        where: {
          id,
        },
        select: {
          role: true,
          active: true,
        },
      });

    if (!target) {
      return NextResponse.json(
        {
          error:
            "Usuario no encontrado",
        },
        { status: 404 }
      );
    }

    if (
      target.role ===
        "ADMIN" &&
      target.active &&
      !(await hasAnotherActiveAdmin(
        id
      ))
    ) {
      return NextResponse.json(
        {
          error:
            "No puedes eliminar al último administrador activo",
        },
        { status: 400 }
      );
    }

    await prisma.user.delete({
      where: {
        id,
      },
    });

    return NextResponse.json({
      ok: true,
    });
  } catch {
    return NextResponse.json(
      {
        error:
          "No se pudo eliminar el usuario",
      },
      { status: 500 }
    );
  }
}
