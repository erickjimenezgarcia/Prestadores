-- DropForeignKey
ALTER TABLE "sistema_alcan" DROP CONSTRAINT "sistema_alcan_id_centroP_fkey";

-- AlterTable
ALTER TABLE "sistema_alcan" ALTER COLUMN "id_centroP" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "sistema_alcan" ADD CONSTRAINT "sistema_alcan_id_centroP_fkey" FOREIGN KEY ("id_centroP") REFERENCES "centro_poblado"("id") ON DELETE SET NULL ON UPDATE CASCADE;
