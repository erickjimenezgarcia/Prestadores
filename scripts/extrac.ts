import * as XLSX from "xlsx";
import { prisma } from "../src/lib/prisma";

async function main() {
  const outputPath = process.argv[2] || "infraestructura_junin.xlsx";

  console.log("🔍 Consultando datos del departamento JUNIN...");

  const rows = await prisma.infraestructura.findMany({
    where: {
      departamen: {
        equals: "JUNIN",
        mode: "insensitive", // por si acaso hay variaciones de mayúsculas
      },
    },
    orderBy: [{ provincia: "asc" }, { distrito: "asc" }],
  });

  console.log(`📦 Registros encontrados: ${rows.length}`);

  if (rows.length === 0) {
    console.warn("⚠️  No se encontraron registros para JUNIN.");
    await prisma.$disconnect();
    return;
  }

  // Convertir BigInt a number para que XLSX pueda serializarlo
  const data = rows.map((r) => ({
    objectid: Number(r.objectid),
    tipo_cap: r.tipoCap ?? "",
    tipodefuen: r.tipodefuen ?? "",
    eps_correc: r.epsCorrec ?? "",
    nombre: r.nombre ?? "",
    prestador: r.prestador ?? "",
    x: r.x ?? "",
    y: r.y ?? "",
    tipo_prest: r.tipoPrest ?? "",
    tipo_infra: r.tipoInfra ?? "",
    departamen: r.departamen ?? "",
    provincia: r.provincia ?? "",
    distrito: r.distrito ?? "",
  }));

  const ws = XLSX.utils.json_to_sheet(data);

  // Ajustar ancho de columnas automáticamente
  const colWidths = Object.keys(data[0]).map((key) => {
    const maxLen = Math.max(
      key.length,
      ...data.map((row) => String((row as any)[key]).length)
    );
    return { wch: Math.min(maxLen + 2, 50) };
  });
  ws["!cols"] = colWidths;

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "JUNIN");

  XLSX.writeFile(wb, outputPath);

  console.log(`✅ Archivo generado: ${outputPath}`);
  console.log(`📊 Total exportado: ${rows.length} registros`);

  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error("❌ Error:", e);
  try {
    await prisma.$disconnect();
  } catch {}
  process.exit(1);
});