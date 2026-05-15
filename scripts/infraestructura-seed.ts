

import { PrismaClient } from "@prisma/client";
import * as XLSX from "xlsx";

const prisma = new PrismaClient();

const filePath = "INFRAESTRUCTURAS.xlsx";

function readSheet(workbook: XLSX.WorkBook, sheetName: string) {
  const sheet = workbook.Sheets[sheetName];
  if (!sheet) {
    throw new Error(`No existe la hoja: ${sheetName}`);
  }

  return XLSX.utils.sheet_to_json<Record<string, any>>(sheet, {
    defval: null,
  });
}

function toInt(value: any): number | null {
  if (value === null || value === undefined || value === "") return null;
  const n = Number(value);
  return Number.isNaN(n) ? null : Math.trunc(n);
}

function toFloat(value: any): number | null {
  if (value === null || value === undefined || value === "") return null;
  const n = Number(value);
  return Number.isNaN(n) ? null : n;
}

function toStringValue(value: any): string | null {
  if (value === null || value === undefined || value === "") return null;
  return String(value).trim();
}

function toBool(value: any): boolean | null {
  if (value === null || value === undefined || value === "") return null;

  if (typeof value === "boolean") return value;

  const text = String(value).trim().toLowerCase();

  if (["true", "1", "si", "sí", "s"].includes(text)) return true;
  if (["false", "0", "no", "n"].includes(text)) return false;

  return null;
}

async function main() {
  const workbook = XLSX.readFile(filePath);

  /**
   * IMPORTANTE:
   * Primero eliminamos tablas hijas y luego tablas padre.
   */
  await prisma.$transaction([
    prisma.sistemaAlcantarillado.deleteMany(),
    prisma.detalleVertimiento.deleteMany(),
    prisma.disposicionFinal.deleteMany(),
    prisma.pTAR.deleteMany(),
    prisma.sistemaAlcantaGlobal.deleteMany(),

    prisma.reservorio.deleteMany(),
    prisma.detallePTAP.deleteMany(),
    prisma.pTAP.deleteMany(),
    prisma.prestadorCaptacion.deleteMany(),
    prisma.captacion.deleteMany(),
    prisma.fuente.deleteMany(),
    prisma.sistemaAgua.deleteMany(),
    prisma.sistemaAguaGlobal.deleteMany(),

    prisma.poblacionServicio.deleteMany(),
    prisma.centroPoblado.deleteMany(),
    prisma.prestador.deleteMany(),
  ]);

  /**
   * 1. Prestador
   */
  const prestadores = readSheet(workbook, "prestador");

  await prisma.prestador.createMany({
    data: prestadores.map((r) => ({
      id: toInt(r.id_prestador)!,
      nombPrestador: toStringValue(r.nombPrestador),
      tipoPrestador: toStringValue(r.tipoPrestador),
      formaAsociativa: toStringValue(r.formaAsociativa),
      brindaAgua: toBool(r.brindaAgua),
      brindaAlcanta: toBool(r.brindaAlcanta),
      brindaSantExc: toBool(r.brindaSantExc),
      brindaTrataRes: toBool(r.brindaTrataRes),
      anioInfo: toStringValue(r.anioInfo),
      ordenanzaMuni: toBool(r.ordenanzaMuni),
      contabilidadInd: toBool(r.contabilidadInd),
      tieneEquipo: toBool(r.tieneEquipo),
      tieneCuaderno: toBool(r.tieneCuaderno),
      proveedorCloro: toStringValue(r.proveedorCloro),
    })),
    skipDuplicates: true,
  });

  /**
   * 2. Centro poblado
   */
  const centros = readSheet(workbook, "centroPoblado");

  await prisma.centroPoblado.createMany({
    data: centros.map((r) => ({
      id: toInt(r.id)!,
      ubigeo: toStringValue(r.ubigeo),
      nombre: toStringValue(r.nombre),
    })),
    skipDuplicates: true,
  });

  /**
   * 3. Población servicio
   */
  const poblacion = readSheet(workbook, "poblacion_servicio");

  await prisma.poblacionServicio.createMany({
    data: poblacion.map((r) => ({
      idPrestador: toInt(r.id_prestador)!,
      idCentroP: toInt(r.id_centroP)!,
      departamento: toStringValue(r.departamento),
      provincia: toStringValue(r.provincia),
      distrito: toStringValue(r.distrito),
      poblacion: toInt(r.poblacion),
      viviendas: toInt(r.viviendas),
      lat: toFloat(r.lat),
      lng: toFloat(r.lng),
    })),
  });

  /**
   * 4. Sistema agua global
   */
  const sistemasAguaGlobal = readSheet(workbook, "sistema_agua_global");

  await prisma.sistemaAguaGlobal.createMany({
    data: sistemasAguaGlobal.map((r) => ({
      id: toInt(r.id)!,
      nombre: toStringValue(r.nombre),
    })),
    skipDuplicates: true,
  });

  /**
   * 5. Sistema agua
   */
  const sistemasAgua = readSheet(workbook, "sistema_agua");

  await prisma.sistemaAgua.createMany({
    data: sistemasAgua.map((r) => ({
      idSistemaAguaGlobal: toInt(r.id_sistemaAguaGlobal),
      idPrestador: toInt(r.id_prestador)!,
      idCentroP: toInt(r.id_centroP)!,
      tipoSistemaAgua: toStringValue(r.tipoSistemaAgua),
      numCaptaciones: toInt(r.numCaptaciones),
      numReservorios: toInt(r.numReservorios),
      numPTAP: toInt(r.numPTAP),
      lcantidadBombeo: toBool(r.lcantidadBombeo),
      origen: toStringValue(r.Origen),
    })),
  });

  /**
   * 6. Fuente
   */
  const fuentes = readSheet(workbook, "fuente");

  await prisma.fuente.createMany({
    data: fuentes.map((r) => ({
      id: toInt(r.id_fuente)!,
      idPrestador: toInt(r.id_prestador)!,
      idCentroP: toInt(r.id_centroP)!,
      tipoFuenteAgua: toStringValue(r.tipoFuenteAgua),
      subTipoFuente: toStringValue(r.subTipoFuente),
      nombFuente: toStringValue(r.nombFuente),
      lat: toFloat(r.lat),
      lng: toFloat(r.lng),
    })),
    skipDuplicates: true,
  });

  /**
   * 7. Captación
   */
  const captaciones = readSheet(workbook, "captacion");

  await prisma.captacion.createMany({
    data: captaciones.map((r) => ({
      id: toInt(r.id_captacion)!,
      idSistemaAguaGlobal: toInt(r.id_sistemaAguaGlobal),
      idCentroP: toInt(r.id_centroP)!,
      tipoCaptacion: toStringValue(r.tipoCaptacion),
      lcomparte: toBool(r.lcomparte),
      lprotegida: toBool(r.lprotegida),
      antiguedad: toInt(r.antiguedad),
      estadoOperativo: toStringValue(r.estadoOperativo),
      estadoFisico: toStringValue(r.estadoFisico),
      ldesinfectan: toBool(r.ldesinfectan),
      lat: toFloat(r.lat),
      lng: toFloat(r.lng),
    })),
    skipDuplicates: true,
  });

  /**
   * 8. Prestador captación
   */
  const prestadorCaptacion = readSheet(workbook, "prestador_captacion");

  await prisma.prestadorCaptacion.createMany({
    data: prestadorCaptacion.map((r) => ({
      id: toInt(r.id)!,
      idPrestador: toInt(r.id_prestador)!,
      idCaptacion: toInt(r.id_captacion)!,
    })),
    skipDuplicates: true,
  });

  /**
   * 9. PTAP
   */
  const ptaps = readSheet(workbook, "ptap");

  await prisma.pTAP.createMany({
    data: ptaps.map((r) => ({
      idPtap: toInt(r.id_ptap)!,
      tipoPtap: toStringValue(r.tipoPtap),
      antiguedad: toInt(r.antiguedad),
      estadoOperativo: toStringValue(r.estadoOperativo),
      estadoFisico: toStringValue(r.estadoFisico),
      ldesinfectan: toBool(r.ldesinfectan),
      lat: toFloat(r.lat),
      lng: toFloat(r.lng),
    })),
    skipDuplicates: true,
  });

  /**
   * 10. Detalle PTAP
   */
  const detallePtap = readSheet(workbook, "detalle_ptap");

    await prisma.detallePTAP.createMany({
    data: detallePtap.map((r, index) => ({
        id: `detalle_ptap_${index + 1}`,
        idPtap: toInt(r.id_ptap)!,
        idSistemaAguaGlobal: toInt(r.id_sistemaAguaGlobal),
        idCentroP: toInt(r.id_centroP)!,
        idPrestador: toInt(r.id_prestador)!,
    })),
    skipDuplicates: true,
    });

  /**
   * 11. Reservorio
   */
  const reservorios = readSheet(workbook, "reservorio");

  await prisma.reservorio.createMany({
    data: reservorios.map((r) => ({
      id: toInt(r.id_reservorio)!,
      idPrestador: toInt(r.id_prestador)!,
      idSistemaAguaGlobal: toInt(r.id_sistemaAguaGlobal),
      idCentroP: toInt(r.id_centroP)!,
      tipoReservorio: toStringValue(r.tipoReservorio),
      volumen: toFloat(r.volumen),
      antiguedad: toInt(r.antiguedad),
      estadoOperativo: toStringValue(r.estadoOperativo),
      estadoFisico: toStringValue(r.estadoFisico),
      ldesinfectan: toBool(r.ldesinfectan),
      lat: toFloat(r.lat),
      lng: toFloat(r.lng),
    })),
    skipDuplicates: true,
  });

  /**
   * 12. Sistema alcantarillado global
   */
  const sistemasAlcanGlobal = readSheet(workbook, "sistema_alcan_global");

  await prisma.sistemaAlcantaGlobal.createMany({
    data: sistemasAlcanGlobal.map((r) => ({
      id: toInt(r.id_sistemaAlcaGlobal)!,
      nombre: toStringValue(r.nombre),
    })),
    skipDuplicates: true,
  });

  /**
   * 13. PTAR
   */
  const ptars = readSheet(workbook, "ptar");

  await prisma.pTAR.createMany({
    data: ptars.map((r) => ({
      id: toInt(r.id_ptar)!,
      idSistemaAlcantarillaGlobal: toInt(r.id_sistemaAlcaGlobal),
      idPrestador: toInt(r.id_prestador)!,
      idCentroP: toInt(r.id_centroP)!,
      tipoPtar: toStringValue(r.tipoPtar),
      antiguedad: toInt(r.antiguedad),
      estadoOperativo: toStringValue(r.estadoOperativo),
      estadoFisico: toStringValue(r.estadoFisico),
      lat: toFloat(r.lat),
      lng: toFloat(r.lng),
    })),
    skipDuplicates: true,
  });

  /**
   * 14. Disposición final
   */
  const disposiciones = readSheet(workbook, "disposicion_final");

  await prisma.disposicionFinal.createMany({
    data: disposiciones.map((r) => ({
      idVertimiento: toInt(r.id_vertimiento)!,
      tipoDispo: toStringValue(r.tipoDispo),
      nombFuenteVert: toStringValue(r.nombFuenteVert),
      lAutorizacion: toBool(r.lAutorizacion),
      lat: toFloat(r.lat),
      lng: toFloat(r.lng),
    })),
    skipDuplicates: true,
  });

  /**
   * 15. Detalle vertimiento
   */
  const detalleVertimiento = readSheet(workbook, "detalle_vertimiento");

await prisma.detalleVertimiento.createMany({
  data: detalleVertimiento.map((r, index) => ({
    id: `detalle_vertimiento_${index + 1}`,
    idVertimiento: toInt(r.id_vertimiento)!,
    idSistemaAlcantarillaGlobal: toInt(r.id_sistemaAlcaGlobal),
    idCentroP: toInt(r.id_centroP)!,
    idPrestador: toInt(r.id_prestador)!,
  })),
  skipDuplicates: true,
});

  /**
   * 16. Sistema alcantarillado
   */
  const sistemasAlcan = readSheet(workbook, "sistema_alcan");

  await prisma.sistemaAlcantarillado.createMany({
    data: sistemasAlcan.map((r) => ({
      idPrestador: toInt(r.id_prestador)!,
      idSistemaAlcantarillaGlobal: toInt(r.id_sistemaAlcaGlobal),
      idCentroP: toInt(r.id_centroP),
      tieneUBS: toBool(r.tieneUBS),
      tipoUBSoDispoExcreta: toStringValue(r.tipoUBSoDispoExcreta),
      antiguedad: toInt(r.antiguedad),
      estadoGeneralUBS: toStringValue(r.estadoGeneralUBS),
      tieneAlcanta: toBool(r.tieneAlcanta),
      estadoOperativo: toStringValue(r.estadoOperativo),
      tieneBombeo: toBool(r.tieneBombeo),
      numBombeo: toInt(r.numBombeo),
      numPtar: toInt(r.numPtar),
      numVert: toInt(r.numVert),
    })),
  });

  console.log("Carga completada correctamente.");
}

main()
  .catch((error) => {
    console.error("Error cargando Excel:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });