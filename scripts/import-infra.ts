import * as XLSX from "xlsx";
import { prisma } from "../src/lib/prisma";

function toBigInt(v: any): bigint {
  if (typeof v === "bigint") return v;
  if (typeof v === "number") return BigInt(Math.trunc(v));
  if (typeof v === "string") return BigInt(v.trim());
  throw new Error(`No puedo convertir a BigInt: ${v}`);
}
function normStr(v: any): string | null {
  if (v === null || v === undefined) return null;
  const s = String(v).trim();
  return s.length ? s : null;
}
function toFloatOrNull(v: any): number | null {
  if (v === null || v === undefined || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}
function getCI(row: Record<string, any>, key: string) {
  const k = key.toLowerCase();
  for (const kk of Object.keys(row)) if (kk.toLowerCase() === k) return row[kk];
  return undefined;
}

async function main() {
  const filePath = process.argv[2];
  const sheetName = process.argv[3] || "Sheet1";
  if (!filePath) throw new Error(`Uso: pnpm import:infra "<ruta_excel.xlsx>" [hoja]`);

  const wb = XLSX.readFile(filePath, { cellDates: true });
  const ws = wb.Sheets[sheetName];
  if (!ws) throw new Error(`No existe la hoja '${sheetName}'. Hojas: ${wb.SheetNames.join(", ")}`);

  const rows = XLSX.utils.sheet_to_json<Record<string, any>>(ws, { defval: null });
  console.log(`📄 Hoja: ${sheetName} | Filas: ${rows.length}`);

  // ✅ Si quieres empezar limpio (recomendado)
  // await prisma.infraestructura.deleteMany();

  const data = rows.map((r) => {
    const objectid = toBigInt(getCI(r, "objectid"));
    return {
      objectid,
      tipoCap: normStr(getCI(r, "tipo_cap")),
      tipodefuen: normStr(getCI(r, "tipodefuen")),
      epsCorrec: normStr(getCI(r, "eps_correc")),
      nombre: normStr(getCI(r, "nombre")),
      prestador: normStr(getCI(r, "prestador")),
      x: toFloatOrNull(getCI(r, "x")),
      y: toFloatOrNull(getCI(r, "y")),
      tipoPrest: normStr(getCI(r, "tipo_prest")),
      tipoInfra: normStr(getCI(r, "tipo_infra")),
      departamen: normStr(getCI(r, "departamen")),
      provincia: normStr(getCI(r, "provincia")),
      distrito: normStr(getCI(r, "distrito")),
    };
  });

  const BATCH = 1000;
  for (let i = 0; i < data.length; i += BATCH) {
    const chunk = data.slice(i, i + BATCH);

    // createMany es mucho más rápido y no usa transacción interactiva larga
    await prisma.infraestructura.createMany({
      data: chunk,
      skipDuplicates: true, // si ya existía el objectid
    });

    console.log(`✅ Insertado: ${Math.min(i + BATCH, data.length)}/${data.length}`);
  }

  await prisma.$disconnect();
  console.log("🏁 Import terminado");
}

main().catch(async (e) => {
  console.error("❌ Error:", e);
  try { await prisma.$disconnect(); } catch {}
  process.exit(1);
});