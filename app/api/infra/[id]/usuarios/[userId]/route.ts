import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { jsonBigIntSafe } from "@/src/lib/json";

export async function DELETE(
  _req: Request,
  ctx: { params: Promise<{ id: string; userId: string }> }
) {
  try {
    const { id, userId } = await ctx.params;

    if (!id || !userId) {
      return NextResponse.json(
        { error: "Falta objectid o userId" },
        { status: 400 }
      );
    }

    const objectid = BigInt(id);
    const usuarioId = BigInt(userId);

    const relacion = await prisma.infraestructuraUsuario.findUnique({
      where: {
        objectid_usuarioId: {
          objectid,
          usuarioId,
        },
      },
      select: {
        id: true,
      },
    });

    if (!relacion) {
      return NextResponse.json(
        { error: "La relación usuario-infraestructura no existe" },
        { status: 404 }
      );
    }

    await prisma.$transaction(async (tx) => {
      // 1. Eliminar solo la relación de esta infraestructura
      await tx.infraestructuraUsuario.delete({
        where: {
          objectid_usuarioId: {
            objectid,
            usuarioId,
          },
        },
      });

      // 2. Verificar si el usuario aún tiene otras relaciones
      const relacionesRestantes = await tx.infraestructuraUsuario.count({
        where: {
          usuarioId,
        },
      });

      // 3. Si ya no tiene ninguna, eliminar usuario
      if (relacionesRestantes === 0) {
        await tx.usuario.delete({
          where: {
            id: usuarioId,
          },
        });
      }
    });

    return NextResponse.json(
      jsonBigIntSafe({
        ok: true,
        message: "Relación eliminada correctamente",
        objectid,
        usuarioId,
      })
    );
  } catch (e: any) {
    return NextResponse.json(
      { error: "Error eliminando relación", detail: String(e?.message ?? e) },
      { status: 500 }
    );
  }
}