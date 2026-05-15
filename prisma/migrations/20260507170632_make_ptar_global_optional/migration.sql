-- DropForeignKey
ALTER TABLE "ptar" DROP CONSTRAINT "ptar_id_sistemaAlcaGlobal_fkey";

-- DropForeignKey
ALTER TABLE "sistema_alcan" DROP CONSTRAINT "sistema_alcan_id_sistemaAlcaGlobal_fkey";

-- AlterTable
ALTER TABLE "ptar" ALTER COLUMN "id_sistemaAlcaGlobal" DROP NOT NULL;

-- AlterTable
ALTER TABLE "sistema_alcan" ALTER COLUMN "id_sistemaAlcaGlobal" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "ptar" ADD CONSTRAINT "ptar_id_sistemaAlcaGlobal_fkey" FOREIGN KEY ("id_sistemaAlcaGlobal") REFERENCES "sistema_alcan_global"("id_sistemaAlcaGlobal") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sistema_alcan" ADD CONSTRAINT "sistema_alcan_id_sistemaAlcaGlobal_fkey" FOREIGN KEY ("id_sistemaAlcaGlobal") REFERENCES "sistema_alcan_global"("id_sistemaAlcaGlobal") ON DELETE SET NULL ON UPDATE CASCADE;
