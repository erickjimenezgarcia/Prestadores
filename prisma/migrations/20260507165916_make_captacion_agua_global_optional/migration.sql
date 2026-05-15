/*
  Warnings:

  - The primary key for the `detalle_ptap` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `detalle_vertimiento` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - Added the required column `id` to the `detalle_ptap` table without a default value. This is not possible if the table is not empty.
  - Added the required column `id` to the `detalle_vertimiento` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "captacion" DROP CONSTRAINT "captacion_id_sistemaAguaGlobal_fkey";

-- DropForeignKey
ALTER TABLE "detalle_ptap" DROP CONSTRAINT "detalle_ptap_id_sistemaAguaGlobal_fkey";

-- DropForeignKey
ALTER TABLE "detalle_vertimiento" DROP CONSTRAINT "detalle_vertimiento_id_sistemaAlcaGlobal_fkey";

-- DropForeignKey
ALTER TABLE "reservorio" DROP CONSTRAINT "reservorio_id_sistemaAguaGlobal_fkey";

-- DropForeignKey
ALTER TABLE "sistema_agua" DROP CONSTRAINT "sistema_agua_id_sistemaAguaGlobal_fkey";

-- AlterTable
ALTER TABLE "captacion" ALTER COLUMN "id_sistemaAguaGlobal" DROP NOT NULL;

-- AlterTable
ALTER TABLE "detalle_ptap" DROP CONSTRAINT "detalle_ptap_pkey",
ADD COLUMN     "id" TEXT NOT NULL,
ALTER COLUMN "id_sistemaAguaGlobal" DROP NOT NULL,
ADD CONSTRAINT "detalle_ptap_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "detalle_vertimiento" DROP CONSTRAINT "detalle_vertimiento_pkey",
ADD COLUMN     "id" TEXT NOT NULL,
ALTER COLUMN "id_sistemaAlcaGlobal" DROP NOT NULL,
ADD CONSTRAINT "detalle_vertimiento_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "reservorio" ALTER COLUMN "id_sistemaAguaGlobal" DROP NOT NULL;

-- AlterTable
ALTER TABLE "sistema_agua" ALTER COLUMN "id_sistemaAguaGlobal" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "detalle_ptap_id_ptap_idx" ON "detalle_ptap"("id_ptap");

-- CreateIndex
CREATE INDEX "detalle_vertimiento_id_vertimiento_idx" ON "detalle_vertimiento"("id_vertimiento");

-- AddForeignKey
ALTER TABLE "sistema_agua" ADD CONSTRAINT "sistema_agua_id_sistemaAguaGlobal_fkey" FOREIGN KEY ("id_sistemaAguaGlobal") REFERENCES "sistema_agua_global"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "captacion" ADD CONSTRAINT "captacion_id_sistemaAguaGlobal_fkey" FOREIGN KEY ("id_sistemaAguaGlobal") REFERENCES "sistema_agua_global"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "detalle_ptap" ADD CONSTRAINT "detalle_ptap_id_sistemaAguaGlobal_fkey" FOREIGN KEY ("id_sistemaAguaGlobal") REFERENCES "sistema_agua_global"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservorio" ADD CONSTRAINT "reservorio_id_sistemaAguaGlobal_fkey" FOREIGN KEY ("id_sistemaAguaGlobal") REFERENCES "sistema_agua_global"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "detalle_vertimiento" ADD CONSTRAINT "detalle_vertimiento_id_sistemaAlcaGlobal_fkey" FOREIGN KEY ("id_sistemaAlcaGlobal") REFERENCES "sistema_alcan_global"("id_sistemaAlcaGlobal") ON DELETE SET NULL ON UPDATE CASCADE;
