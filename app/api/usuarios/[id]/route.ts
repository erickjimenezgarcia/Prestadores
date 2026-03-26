import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { jsonBigIntSafe } from "@/src/lib/json";

export async function PUT(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await ctx.params;
    if (!id) {
      return NextResponse.json({ error: "Falta id" }, { status: 400 });
    }

    const userId = BigInt(id);

    const exists = await prisma.usuario.findUnique({
      where: { id: userId },
      select: { id: true },
    });

    if (!exists) {
      return NextResponse.json(
        { error: "Usuario no existe" },
        { status: 404 }
      );
    }

    const body = await req.json();
    const nombres = String(body?.nombres ?? "").trim();
    const apellidos = String(body?.apellidos ?? "").trim();
    const correo = String(body?.correo ?? "").trim().toLowerCase();
    const telefono = body?.telefono ? String(body.telefono).trim() : null;

    if (!nombres || !apellidos || !correo) {
      return NextResponse.json(
        { error: "Nombres, apellidos y correo son obligatorios" },
        { status: 400 }
      );
    }

    const correoEnUso = await prisma.usuario.findFirst({
      where: {
        correo,
        NOT: {
          id: userId,
        },
      },
      select: {
        id: true,
      },
    });

    if (correoEnUso) {
      return NextResponse.json(
        { error: "El correo ya está registrado por otro usuario" },
        { status: 409 }
      );
    }

    const usuarioActualizado = await prisma.usuario.update({
      where: { id: userId },
      data: {
        nombres,
        apellidos,
        correo,
        telefono,
      },
    });

    return NextResponse.json(
      jsonBigIntSafe({ ok: true, data: usuarioActualizado })
    );
  } catch (e: any) {
    if (e?.code === "P2002") {
      return NextResponse.json(
        { error: "El correo ya está registrado" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "Error actualizando usuario", detail: String(e?.message ?? e) },
      { status: 500 }
    );
  }
}


export async function DELETE(
  _req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await ctx.params;
    if (!id) {
      return NextResponse.json({ error: "Falta id" }, { status: 400 });
    }

    const userId = BigInt(id);

    const exists = await prisma.usuario.findUnique({
      where: { id: userId },
      select: { id: true, correo: true },
    });

    if (!exists) {
      return NextResponse.json({ error: "Usuario no existe" }, { status: 404 });
    }

    await prisma.$transaction([
      prisma.infraestructuraUsuario.deleteMany({
        where: { usuarioId: userId },
      }),
      prisma.usuario.delete({
        where: { id: userId },
      }),
    ]);

    return NextResponse.json(
      jsonBigIntSafe({
        ok: true,
        message: "Usuario eliminado correctamente",
        usuarioId: userId,
      })
    );
  } catch (e: any) {
    return NextResponse.json(
      { error: "Error eliminando usuario", detail: String(e?.message ?? e) },
      { status: 500 }
    );
  }
}