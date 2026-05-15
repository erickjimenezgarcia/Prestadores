import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";

function toInt(value: string | null) {
  if (!value) return null;

  const n = Number(value);
  return Number.isInteger(n) && n > 0 ? n : null;
}

function cleanText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function cleanCorreo(value: unknown) {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

/**
 * GET /api/usuarios/prestador?idPrestador=25
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const idPrestador = toInt(searchParams.get("idPrestador"));

    if (!idPrestador) {
      return NextResponse.json(
        { success: false, message: "idPrestador inválido o requerido" },
        { status: 400 }
      );
    }

    const usuarios = await prisma.prestadorUsuario.findMany({
      where: {
        idPrestador,
      },
      include: {
        usuario: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      data: usuarios.map((item) => ({
        idRelacion: item.id,
        idUsuario: item.usuario.id,
        idPrestador: item.idPrestador,
        nombres: item.usuario.nombres,
        apellidos: item.usuario.apellidos,
        telefono: item.usuario.telefono,
        correo: item.usuario.correo,
        createdAt: item.usuario.createdAt,
        updatedAt: item.usuario.updatedAt,
      })),
    });
  } catch (error) {
    console.error("GET /api/usuarios/prestador error:", error);

    return NextResponse.json(
      { success: false, message: "Error al obtener usuarios del prestador" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/usuarios/prestador
 *
 * Body:
 * {
 *   "idPrestador": 25,
 *   "nombres": "Juan",
 *   "apellidos": "Pérez",
 *   "telefono": "999888777",
 *   "correo": "juan@gmail.com"
 * }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const idPrestador = Number(body.idPrestador);
    const nombres = cleanText(body.nombres);
    const apellidos = cleanText(body.apellidos);
    const telefono = cleanText(body.telefono);
    const correo = cleanCorreo(body.correo);

    if (!Number.isInteger(idPrestador) || idPrestador <= 0) {
      return NextResponse.json(
        { success: false, message: "idPrestador inválido o requerido" },
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

    const prestador = await prisma.prestador.findUnique({
      where: {
        id: idPrestador,
      },
      select: {
        id: true,
      },
    });

    if (!prestador) {
      return NextResponse.json(
        { success: false, message: "El prestador no existe" },
        { status: 404 }
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      const usuarioPorCorreo = await tx.usuario.findUnique({
        where: {
          correo,
        },
      });

      const usuarioPorTelefono = await tx.usuario.findUnique({
        where: {
          telefono,
        },
      });

      if (
        usuarioPorCorreo &&
        usuarioPorTelefono &&
        usuarioPorCorreo.id !== usuarioPorTelefono.id
      ) {
        throw new Error("CONFLICT_CORREO_TELEFONO");
      }

      const usuarioExistente = usuarioPorCorreo || usuarioPorTelefono;

      let usuario;

      if (usuarioExistente) {
        if (
          usuarioExistente.correo !== correo ||
          usuarioExistente.telefono !== telefono
        ) {
          throw new Error("CONFLICT_DATOS_USUARIO");
        }

        usuario = usuarioExistente;
      } else {
        usuario = await tx.usuario.create({
          data: {
            nombres,
            apellidos,
            telefono,
            correo,
          },
        });
      }

      const relacionExistente = await tx.prestadorUsuario.findFirst({
        where: {
          idPrestador,
          idUsuario: usuario.id,
        },
      });

      if (relacionExistente) {
        throw new Error("RELACION_EXISTENTE");
      }

      const relacion = await tx.prestadorUsuario.create({
        data: {
          idPrestador,
          idUsuario: usuario.id,
        },
        include: {
          usuario: true,
        },
      });

      return relacion;
    });

    return NextResponse.json(
      {
        success: true,
        message: "Usuario registrado y asociado al prestador correctamente",
        data: {
          idRelacion: result.id,
          idUsuario: result.usuario.id,
          idPrestador: result.idPrestador,
          nombres: result.usuario.nombres,
          apellidos: result.usuario.apellidos,
          telefono: result.usuario.telefono,
          correo: result.usuario.correo,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("POST /api/usuarios/prestador error:", error);

    if (error?.message === "CONFLICT_CORREO_TELEFONO") {
      return NextResponse.json(
        {
          success: false,
          message:
            "El correo y el teléfono pertenecen a usuarios diferentes. Verifica los datos.",
        },
        { status: 409 }
      );
    }

    if (error?.message === "CONFLICT_DATOS_USUARIO") {
      return NextResponse.json(
        {
          success: false,
          message:
            "Ya existe un usuario con ese correo o teléfono, pero los datos no coinciden.",
        },
        { status: 409 }
      );
    }

    if (error?.message === "RELACION_EXISTENTE") {
      return NextResponse.json(
        {
          success: false,
          message: "Este usuario ya está asociado a este prestador",
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { success: false, message: "Error al registrar usuario" },
      { status: 500 }
    );
  }
}