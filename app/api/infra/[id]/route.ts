import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { jsonBigIntSafe } from "@/src/lib/json";

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await ctx.params;

    if (!id) return NextResponse.json({ error: "Falta id" }, { status: 400 });

    const objectid = BigInt(id);

    const infra = await prisma.infraestructura.findUnique({
      where: { objectid },
      include: {
        usuarios: { include: { usuario: true }, orderBy: { createdAt: "desc" } },
      },
    });

    if (!infra) {
      return NextResponse.json({ mensaje: "No existe infraestructura", estado:false }, { status: 404 });
    }

    const payload = {
      ...infra,
      hasUser: infra.usuarios.length > 0,
      usuarios: infra.usuarios.map((u) => u.usuario),
    };
    
    return NextResponse.json(jsonBigIntSafe(payload));
  } catch (e: any) {
    return NextResponse.json(
      { mensaje: "Error trayendo detalle", detail: String(e?.message ?? e), estado:false },
      { status: 500 }
    );
  }
}