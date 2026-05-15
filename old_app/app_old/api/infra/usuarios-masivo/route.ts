import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { jsonBigIntSafe } from "@/src/lib/json";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const rawObjectids = Array.isArray(body?.objectids) ? body.objectids : [];
    const nombres = String(body?.nombres ?? "").trim();
    const apellidos = String(body?.apellidos ?? "").trim();
    const correo = String(body?.correo ?? "").trim().toLowerCase();
    const telefono = body?.telefono ? String(body.telefono).trim() : null;

    if (!rawObjectids.length) {
      return NextResponse.json(
        { error: "No se recibieron infraestructuras" },
        { status: 400 }
      );
    }

    if (!nombres || !apellidos || !correo) {
      return NextResponse.json(
        { error: "Nombres, apellidos y correo son obligatorios" },
        { status: 400 }
      );
    }

    const objectids = rawObjectids
      .map((v: string | number) => String(v).trim())
      .filter(Boolean)
      .map((v: string) => BigInt(v));

    const infraCount = await prisma.infraestructura.count({
      where: {
        objectid: {
          in: objectids,
        },
      },
    });

    if (infraCount === 0) {
      return NextResponse.json(
        { error: "No se encontraron infraestructuras válidas" },
        { status: 404 }
      );
    }

    let usuario = await prisma.usuario.findUnique({
      where: { correo },
    });

    if (!usuario) {
      usuario = await prisma.usuario.create({
        data: {
          nombres,
          apellidos,
          correo,
          telefono,
        },
      });
    }

    

    await prisma.$transaction(
      objectids.map((objectid: bigint) =>
        prisma.infraestructuraUsuario.upsert({
          where: {
            objectid_usuarioId: {
              objectid,
              usuarioId: usuario.id,
            },
          },
          create: {
            objectid,
            usuarioId: usuario.id,
          },
          update: {},
        })
      )
    );

    return NextResponse.json(
      jsonBigIntSafe({
        ok: true,
        usuario,
        count: objectids.length,
      })
    );
  } catch (e: any) {
    if (e?.code === "P2002") {
      return NextResponse.json(
        { error: "El correo ya está registrado" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "Error en asignación masiva", detail: String(e?.message ?? e) },
      { status: 500 }
    );
  }
}