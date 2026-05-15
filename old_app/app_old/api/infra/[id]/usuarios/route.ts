import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { jsonBigIntSafe } from "@/src/lib/json";

export async function POST(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await ctx.params; // ✅ fix
    if (!id) return NextResponse.json({ error: "Falta id" }, { status: 400 });

    const objectid = BigInt(id);

    const exists = await prisma.infraestructura.findUnique({
      where: { objectid },
      select: { objectid: true },
    });
    if (!exists) return NextResponse.json({ error: "Infraestructura no existe" }, { status: 404 });

    const body = await req.json();
    const nombres = String(body?.nombres ?? "").trim();
    const apellidos = String(body?.apellidos ?? "").trim();
    const correo = String(body?.correo ?? "").trim().toLowerCase();
    const telefono = body?.telefono ? String(body.telefono).trim() : null;

    if (!nombres || !apellidos || !correo) {
      return NextResponse.json(
        { error: "nombres, apellidos y correo son obligatorios" },
        { status: 400 }
      );
    }

    const usuario = await prisma.usuario.upsert({
      where: { correo },
      create: { nombres, apellidos, correo, telefono },
      update: { nombres, apellidos, telefono },
    });

    await prisma.infraestructuraUsuario.upsert({
      where: { objectid_usuarioId: { objectid, usuarioId: usuario.id } },
      create: { objectid, usuarioId: usuario.id },
      update: {},
    });

    return NextResponse.json(jsonBigIntSafe({ ok: true, usuario }));
  } catch (e: any) {
    return NextResponse.json(
      { error: "Error registrando usuario", detail: String(e?.message ?? e) },
      { status: 500 }
    );
  }
}