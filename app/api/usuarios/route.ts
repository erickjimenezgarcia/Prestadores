import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";

function cleanText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function cleanCorreo(value: unknown) {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

function parseId(value: unknown) {
  const n = Number(value);
  return Number.isInteger(n) && n > 0 ? n : null;
}

/**
 * PUT /api/usuarios
 *
 * Body:
 * {
 *   "idUsuario": 1,
 *   "nombres": "Juan",
 *   "apellidos": "Pérez",
 *   "telefono": "999888777",
 *   "correo": "juan@gmail.com"
 * }
 */
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();

    const idUsuario = parseId(body.idUsuario);
    const nombres = cleanText(body.nombres);
    const apellidos = cleanText(body.apellidos);
    const telefono = cleanText(body.telefono);
    const correo = cleanCorreo(body.correo);

    if (!idUsuario) {
      return NextResponse.json(
        { success: false, message: "idUsuario inválido o requerido" },
        { status: 400 }
      );
    }

    if (!nombres || !apellidos || !telefono || !correo) {
      return NextResponse.json(
        {
          success: false,
          message: "nombres, apellidos, telefono y correo son obligatorios",
        },
        { status: 400 }
      );
    }

    const usuarioActual = await prisma.usuario.findUnique({
      where: {
        id: idUsuario,
      },
    });

    if (!usuarioActual) {
      return NextResponse.json(
        { success: false, message: "El usuario no existe" },
        { status: 404 }
      );
    }

    const usuarioCorreo = await prisma.usuario.findUnique({
      where: {
        correo,
      },
    });

    if (usuarioCorreo && usuarioCorreo.id !== idUsuario) {
      return NextResponse.json(
        { success: false, message: "Ya existe otro usuario con ese correo" },
        { status: 409 }
      );
    }

    const usuarioTelefono = await prisma.usuario.findUnique({
      where: {
        telefono,
      },
    });

    if (usuarioTelefono && usuarioTelefono.id !== idUsuario) {
      return NextResponse.json(
        { success: false, message: "Ya existe otro usuario con ese teléfono" },
        { status: 409 }
      );
    }

    const usuario = await prisma.usuario.update({
      where: {
        id: idUsuario,
      },
      data: {
        nombres,
        apellidos,
        telefono,
        correo,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Usuario actualizado correctamente",
      data: usuario,
    });
  } catch (error) {
    console.error("PUT /api/usuarios error:", error);

    return NextResponse.json(
      { success: false, message: "Error al actualizar usuario" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/usuarios?idUsuario=1
 *
 * Elimina la relación y también el usuario.
 */
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const idUsuario = parseId(searchParams.get("idUsuario"));

    if (!idUsuario) {
      return NextResponse.json(
        { success: false, message: "idUsuario inválido o requerido" },
        { status: 400 }
      );
    }

    const usuario = await prisma.usuario.findUnique({
      where: {
        id: idUsuario,
      },
      select: {
        id: true,
      },
    });

    if (!usuario) {
      return NextResponse.json(
        { success: false, message: "El usuario no existe" },
        { status: 404 }
      );
    }

    await prisma.$transaction(async (tx) => {
      await tx.prestadorUsuario.deleteMany({
        where: {
          idUsuario,
        },
      });

      await tx.usuario.delete({
        where: {
          id: idUsuario,
        },
      });
    });

    return NextResponse.json({
      success: true,
      message: "Usuario y relaciones eliminados correctamente",
    });
  } catch (error) {
    console.error("DELETE /api/usuarios error:", error);

    return NextResponse.json(
      { success: false, message: "Error al eliminar usuario" },
      { status: 500 }
    );
  }
}