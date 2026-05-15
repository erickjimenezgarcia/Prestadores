-- CreateTable
CREATE TABLE "prestador" (
    "id_prestador" INTEGER NOT NULL,
    "nombPrestador" TEXT,
    "tipoPrestador" TEXT,
    "formaAsociativa" TEXT,
    "brindaAgua" BOOLEAN,
    "brindaAlcanta" BOOLEAN,
    "brindaSantExc" BOOLEAN,
    "brindaTrataRes" BOOLEAN,
    "anioInfo" TEXT,
    "ordenanzaMuni" BOOLEAN,
    "contabilidadInd" BOOLEAN,
    "tieneEquipo" BOOLEAN,
    "tieneCuaderno" BOOLEAN,
    "proveedorCloro" TEXT,

    CONSTRAINT "prestador_pkey" PRIMARY KEY ("id_prestador")
);

-- CreateTable
CREATE TABLE "centro_poblado" (
    "id" INTEGER NOT NULL,
    "ubigeo" TEXT,
    "nombre" TEXT,

    CONSTRAINT "centro_poblado_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "poblacion_servicio" (
    "id" SERIAL NOT NULL,
    "id_prestador" INTEGER NOT NULL,
    "id_centroP" INTEGER NOT NULL,
    "departamento" TEXT,
    "provincia" TEXT,
    "distrito" TEXT,
    "lat" DOUBLE PRECISION,
    "lng" DOUBLE PRECISION,
    "poblacion" INTEGER,
    "viviendas" INTEGER,

    CONSTRAINT "poblacion_servicio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sistema_agua_global" (
    "id" INTEGER NOT NULL,
    "nombre" TEXT,

    CONSTRAINT "sistema_agua_global_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sistema_agua" (
    "id" SERIAL NOT NULL,
    "id_sistemaAguaGlobal" INTEGER NOT NULL,
    "id_centroP" INTEGER NOT NULL,
    "id_prestador" INTEGER NOT NULL,
    "tipoSistemaAgua" TEXT,
    "numCaptaciones" INTEGER,
    "numReservorios" INTEGER,
    "numPTAP" INTEGER,
    "lcantidadBombeo" BOOLEAN,
    "Origen" TEXT,

    CONSTRAINT "sistema_agua_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fuente" (
    "id_fuente" INTEGER NOT NULL,
    "id_centroP" INTEGER NOT NULL,
    "id_prestador" INTEGER NOT NULL,
    "tipoFuenteAgua" TEXT,
    "subTipoFuente" TEXT,
    "nombFuente" TEXT,
    "lat" DOUBLE PRECISION,
    "lng" DOUBLE PRECISION,

    CONSTRAINT "fuente_pkey" PRIMARY KEY ("id_fuente")
);

-- CreateTable
CREATE TABLE "captacion" (
    "id_captacion" INTEGER NOT NULL,
    "id_sistemaAguaGlobal" INTEGER NOT NULL,
    "id_centroP" INTEGER NOT NULL,
    "tipoCaptacion" TEXT,
    "lcomparte" BOOLEAN,
    "lat" DOUBLE PRECISION,
    "lng" DOUBLE PRECISION,
    "lprotegida" BOOLEAN,
    "antiguedad" INTEGER,
    "estadoOperativo" TEXT,
    "estadoFisico" TEXT,
    "ldesinfectan" BOOLEAN,

    CONSTRAINT "captacion_pkey" PRIMARY KEY ("id_captacion")
);

-- CreateTable
CREATE TABLE "prestador_captacion" (
    "id" INTEGER NOT NULL,
    "id_prestador" INTEGER NOT NULL,
    "id_captacion" INTEGER NOT NULL,

    CONSTRAINT "prestador_captacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ptap" (
    "id_ptap" INTEGER NOT NULL,
    "tipoPtap" TEXT,
    "lat" DOUBLE PRECISION,
    "lng" DOUBLE PRECISION,
    "antiguedad" INTEGER,
    "estadoOperativo" TEXT,
    "estadoFisico" TEXT,
    "ldesinfectan" BOOLEAN,

    CONSTRAINT "ptap_pkey" PRIMARY KEY ("id_ptap")
);

-- CreateTable
CREATE TABLE "detalle_ptap" (
    "id_ptap" INTEGER NOT NULL,
    "id_sistemaAguaGlobal" INTEGER NOT NULL,
    "id_centroP" INTEGER NOT NULL,
    "id_prestador" INTEGER NOT NULL,

    CONSTRAINT "detalle_ptap_pkey" PRIMARY KEY ("id_ptap","id_sistemaAguaGlobal","id_centroP","id_prestador")
);

-- CreateTable
CREATE TABLE "reservorio" (
    "id_reservorio" INTEGER NOT NULL,
    "id_sistemaAguaGlobal" INTEGER NOT NULL,
    "id_centroP" INTEGER NOT NULL,
    "id_prestador" INTEGER NOT NULL,
    "tipoReservorio" TEXT,
    "lat" DOUBLE PRECISION,
    "lng" DOUBLE PRECISION,
    "volumen" DOUBLE PRECISION,
    "antiguedad" INTEGER,
    "estadoOperativo" TEXT,
    "estadoFisico" TEXT,
    "ldesinfectan" BOOLEAN,

    CONSTRAINT "reservorio_pkey" PRIMARY KEY ("id_reservorio")
);

-- CreateTable
CREATE TABLE "sistema_alcan_global" (
    "id_sistemaAlcaGlobal" INTEGER NOT NULL,
    "nombre" TEXT,

    CONSTRAINT "sistema_alcan_global_pkey" PRIMARY KEY ("id_sistemaAlcaGlobal")
);

-- CreateTable
CREATE TABLE "ptar" (
    "id_ptar" INTEGER NOT NULL,
    "id_sistemaAlcaGlobal" INTEGER NOT NULL,
    "id_centroP" INTEGER NOT NULL,
    "id_prestador" INTEGER NOT NULL,
    "tipoPtar" TEXT,
    "lat" DOUBLE PRECISION,
    "lng" DOUBLE PRECISION,
    "antiguedad" INTEGER,
    "estadoOperativo" TEXT,
    "estadoFisico" TEXT,

    CONSTRAINT "ptar_pkey" PRIMARY KEY ("id_ptar")
);

-- CreateTable
CREATE TABLE "disposicion_final" (
    "id_vertimiento" INTEGER NOT NULL,
    "tipoDispo" TEXT,
    "lat" DOUBLE PRECISION,
    "lng" DOUBLE PRECISION,
    "nombFuenteVert" TEXT,
    "lAutorizacion" BOOLEAN,

    CONSTRAINT "disposicion_final_pkey" PRIMARY KEY ("id_vertimiento")
);

-- CreateTable
CREATE TABLE "detalle_vertimiento" (
    "id_vertimiento" INTEGER NOT NULL,
    "id_sistemaAlcaGlobal" INTEGER NOT NULL,
    "id_centroP" INTEGER NOT NULL,
    "id_prestador" INTEGER NOT NULL,

    CONSTRAINT "detalle_vertimiento_pkey" PRIMARY KEY ("id_vertimiento","id_sistemaAlcaGlobal","id_centroP","id_prestador")
);

-- CreateTable
CREATE TABLE "sistema_alcan" (
    "id" SERIAL NOT NULL,
    "id_sistemaAlcaGlobal" INTEGER NOT NULL,
    "id_centroP" INTEGER NOT NULL,
    "id_prestador" INTEGER NOT NULL,
    "tieneUBS" BOOLEAN,
    "tipoUBSoDispoExcreta" TEXT,
    "antiguedad" INTEGER,
    "estadoGeneralUBS" TEXT,
    "estadoOperativo" TEXT,
    "tieneAlcanta" BOOLEAN,
    "tieneBombeo" BOOLEAN,
    "numBombeo" INTEGER,
    "numPtar" INTEGER,
    "numVert" INTEGER,

    CONSTRAINT "sistema_alcan_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "poblacion_servicio_id_prestador_idx" ON "poblacion_servicio"("id_prestador");

-- CreateIndex
CREATE INDEX "poblacion_servicio_id_centroP_idx" ON "poblacion_servicio"("id_centroP");

-- CreateIndex
CREATE INDEX "sistema_agua_id_sistemaAguaGlobal_idx" ON "sistema_agua"("id_sistemaAguaGlobal");

-- CreateIndex
CREATE INDEX "sistema_agua_id_centroP_idx" ON "sistema_agua"("id_centroP");

-- CreateIndex
CREATE INDEX "sistema_agua_id_prestador_idx" ON "sistema_agua"("id_prestador");

-- CreateIndex
CREATE INDEX "fuente_id_centroP_idx" ON "fuente"("id_centroP");

-- CreateIndex
CREATE INDEX "fuente_id_prestador_idx" ON "fuente"("id_prestador");

-- CreateIndex
CREATE INDEX "captacion_id_sistemaAguaGlobal_idx" ON "captacion"("id_sistemaAguaGlobal");

-- CreateIndex
CREATE INDEX "captacion_id_centroP_idx" ON "captacion"("id_centroP");

-- CreateIndex
CREATE INDEX "prestador_captacion_id_prestador_idx" ON "prestador_captacion"("id_prestador");

-- CreateIndex
CREATE INDEX "prestador_captacion_id_captacion_idx" ON "prestador_captacion"("id_captacion");

-- CreateIndex
CREATE UNIQUE INDEX "prestador_captacion_id_prestador_id_captacion_key" ON "prestador_captacion"("id_prestador", "id_captacion");

-- CreateIndex
CREATE INDEX "detalle_ptap_id_sistemaAguaGlobal_idx" ON "detalle_ptap"("id_sistemaAguaGlobal");

-- CreateIndex
CREATE INDEX "detalle_ptap_id_centroP_idx" ON "detalle_ptap"("id_centroP");

-- CreateIndex
CREATE INDEX "detalle_ptap_id_prestador_idx" ON "detalle_ptap"("id_prestador");

-- CreateIndex
CREATE INDEX "reservorio_id_sistemaAguaGlobal_idx" ON "reservorio"("id_sistemaAguaGlobal");

-- CreateIndex
CREATE INDEX "reservorio_id_centroP_idx" ON "reservorio"("id_centroP");

-- CreateIndex
CREATE INDEX "reservorio_id_prestador_idx" ON "reservorio"("id_prestador");

-- CreateIndex
CREATE INDEX "ptar_id_sistemaAlcaGlobal_idx" ON "ptar"("id_sistemaAlcaGlobal");

-- CreateIndex
CREATE INDEX "ptar_id_centroP_idx" ON "ptar"("id_centroP");

-- CreateIndex
CREATE INDEX "ptar_id_prestador_idx" ON "ptar"("id_prestador");

-- CreateIndex
CREATE INDEX "detalle_vertimiento_id_sistemaAlcaGlobal_idx" ON "detalle_vertimiento"("id_sistemaAlcaGlobal");

-- CreateIndex
CREATE INDEX "detalle_vertimiento_id_centroP_idx" ON "detalle_vertimiento"("id_centroP");

-- CreateIndex
CREATE INDEX "detalle_vertimiento_id_prestador_idx" ON "detalle_vertimiento"("id_prestador");

-- CreateIndex
CREATE INDEX "sistema_alcan_id_sistemaAlcaGlobal_idx" ON "sistema_alcan"("id_sistemaAlcaGlobal");

-- CreateIndex
CREATE INDEX "sistema_alcan_id_centroP_idx" ON "sistema_alcan"("id_centroP");

-- CreateIndex
CREATE INDEX "sistema_alcan_id_prestador_idx" ON "sistema_alcan"("id_prestador");

-- AddForeignKey
ALTER TABLE "poblacion_servicio" ADD CONSTRAINT "poblacion_servicio_id_prestador_fkey" FOREIGN KEY ("id_prestador") REFERENCES "prestador"("id_prestador") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "poblacion_servicio" ADD CONSTRAINT "poblacion_servicio_id_centroP_fkey" FOREIGN KEY ("id_centroP") REFERENCES "centro_poblado"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sistema_agua" ADD CONSTRAINT "sistema_agua_id_sistemaAguaGlobal_fkey" FOREIGN KEY ("id_sistemaAguaGlobal") REFERENCES "sistema_agua_global"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sistema_agua" ADD CONSTRAINT "sistema_agua_id_centroP_fkey" FOREIGN KEY ("id_centroP") REFERENCES "centro_poblado"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sistema_agua" ADD CONSTRAINT "sistema_agua_id_prestador_fkey" FOREIGN KEY ("id_prestador") REFERENCES "prestador"("id_prestador") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fuente" ADD CONSTRAINT "fuente_id_centroP_fkey" FOREIGN KEY ("id_centroP") REFERENCES "centro_poblado"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fuente" ADD CONSTRAINT "fuente_id_prestador_fkey" FOREIGN KEY ("id_prestador") REFERENCES "prestador"("id_prestador") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "captacion" ADD CONSTRAINT "captacion_id_sistemaAguaGlobal_fkey" FOREIGN KEY ("id_sistemaAguaGlobal") REFERENCES "sistema_agua_global"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "captacion" ADD CONSTRAINT "captacion_id_centroP_fkey" FOREIGN KEY ("id_centroP") REFERENCES "centro_poblado"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prestador_captacion" ADD CONSTRAINT "prestador_captacion_id_prestador_fkey" FOREIGN KEY ("id_prestador") REFERENCES "prestador"("id_prestador") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prestador_captacion" ADD CONSTRAINT "prestador_captacion_id_captacion_fkey" FOREIGN KEY ("id_captacion") REFERENCES "captacion"("id_captacion") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "detalle_ptap" ADD CONSTRAINT "detalle_ptap_id_ptap_fkey" FOREIGN KEY ("id_ptap") REFERENCES "ptap"("id_ptap") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "detalle_ptap" ADD CONSTRAINT "detalle_ptap_id_sistemaAguaGlobal_fkey" FOREIGN KEY ("id_sistemaAguaGlobal") REFERENCES "sistema_agua_global"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "detalle_ptap" ADD CONSTRAINT "detalle_ptap_id_centroP_fkey" FOREIGN KEY ("id_centroP") REFERENCES "centro_poblado"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "detalle_ptap" ADD CONSTRAINT "detalle_ptap_id_prestador_fkey" FOREIGN KEY ("id_prestador") REFERENCES "prestador"("id_prestador") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservorio" ADD CONSTRAINT "reservorio_id_sistemaAguaGlobal_fkey" FOREIGN KEY ("id_sistemaAguaGlobal") REFERENCES "sistema_agua_global"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservorio" ADD CONSTRAINT "reservorio_id_centroP_fkey" FOREIGN KEY ("id_centroP") REFERENCES "centro_poblado"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservorio" ADD CONSTRAINT "reservorio_id_prestador_fkey" FOREIGN KEY ("id_prestador") REFERENCES "prestador"("id_prestador") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ptar" ADD CONSTRAINT "ptar_id_sistemaAlcaGlobal_fkey" FOREIGN KEY ("id_sistemaAlcaGlobal") REFERENCES "sistema_alcan_global"("id_sistemaAlcaGlobal") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ptar" ADD CONSTRAINT "ptar_id_centroP_fkey" FOREIGN KEY ("id_centroP") REFERENCES "centro_poblado"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ptar" ADD CONSTRAINT "ptar_id_prestador_fkey" FOREIGN KEY ("id_prestador") REFERENCES "prestador"("id_prestador") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "detalle_vertimiento" ADD CONSTRAINT "detalle_vertimiento_id_vertimiento_fkey" FOREIGN KEY ("id_vertimiento") REFERENCES "disposicion_final"("id_vertimiento") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "detalle_vertimiento" ADD CONSTRAINT "detalle_vertimiento_id_sistemaAlcaGlobal_fkey" FOREIGN KEY ("id_sistemaAlcaGlobal") REFERENCES "sistema_alcan_global"("id_sistemaAlcaGlobal") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "detalle_vertimiento" ADD CONSTRAINT "detalle_vertimiento_id_centroP_fkey" FOREIGN KEY ("id_centroP") REFERENCES "centro_poblado"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "detalle_vertimiento" ADD CONSTRAINT "detalle_vertimiento_id_prestador_fkey" FOREIGN KEY ("id_prestador") REFERENCES "prestador"("id_prestador") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sistema_alcan" ADD CONSTRAINT "sistema_alcan_id_sistemaAlcaGlobal_fkey" FOREIGN KEY ("id_sistemaAlcaGlobal") REFERENCES "sistema_alcan_global"("id_sistemaAlcaGlobal") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sistema_alcan" ADD CONSTRAINT "sistema_alcan_id_centroP_fkey" FOREIGN KEY ("id_centroP") REFERENCES "centro_poblado"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sistema_alcan" ADD CONSTRAINT "sistema_alcan_id_prestador_fkey" FOREIGN KEY ("id_prestador") REFERENCES "prestador"("id_prestador") ON DELETE CASCADE ON UPDATE CASCADE;
