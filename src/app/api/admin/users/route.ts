import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

import bcrypt from "bcryptjs";

import { prisma } from "@/lib/prisma";
import { requireAdminOnly } from "@/lib/permissions";
import { usuarioSchema } from "@/lib/schemas/usuario";

export async function GET() {
  const currentUser =
    await requireAdminOnly();

  if (!currentUser) {
    return NextResponse.json(
      {
        error:
          "No tienes permiso para ver esta sección",
      },
      { status: 403 }
    );
  }

  try {
    const users =
      await prisma.user.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          active: true,
          createdAt: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      });

    return NextResponse.json(
      users,
      {
        headers: {
          "Cache-Control":
            "no-store, no-cache, must-revalidate",
        },
      }
    );
  } catch {
    return NextResponse.json(
      {
        error:
          "No se pudieron cargar los usuarios",
      },
      { status: 500 }
    );
  }
}

export async function POST(
  req: Request
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
    const body =
      await req.json();

    const validation =
      usuarioSchema(
        false
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

    const existing =
      await prisma.user.findUnique({
        where: {
          email,
        },
        select: {
          id: true,
        },
      });

    if (existing) {
      return NextResponse.json(
        {
          error:
            "Ya existe un usuario con ese email",
        },
        { status: 409 }
      );
    }

    if (!password) {
      return NextResponse.json(
        {
          error:
            "La contraseña es obligatoria",
        },
        { status: 400 }
      );
    }

    const passwordHash =
      await bcrypt.hash(
        password,
        12
      );

    const user =
      await prisma.user.create({
        data: {
          name,
          email,
          password:
            passwordHash,

          role:
            role ||
            "VIEWER",

          active,
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
      user,
      { status: 201 }
    );
  } catch (error: any) {
    if (
      error?.code === "P2002"
    ) {
      return NextResponse.json(
        {
          error:
            "Ya existe un usuario con ese email",
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        error:
          "No se pudo crear el usuario",
      },
      { status: 500 }
    );
  }
}
