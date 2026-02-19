-- CreateTable
CREATE TABLE "infraestructura" (
    "objectid" BIGINT NOT NULL,
    "tipo_cap" TEXT,
    "tipodefuen" TEXT,
    "eps_correc" TEXT,
    "nombre" TEXT,
    "prestador" TEXT,
    "x" DOUBLE PRECISION,
    "y" DOUBLE PRECISION,
    "tipo_prest" TEXT,
    "tipo_infra" TEXT,
    "departamen" TEXT,
    "provincia" TEXT,
    "distrito" TEXT,

    CONSTRAINT "infraestructura_pkey" PRIMARY KEY ("objectid")
);

-- CreateTable
CREATE TABLE "usuarios" (
    "id" BIGSERIAL NOT NULL,
    "nombres" TEXT NOT NULL,
    "apellidos" TEXT NOT NULL,
    "correo" TEXT NOT NULL,
    "telefono" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "infraestructura_usuarios" (
    "id" BIGSERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "objectid" BIGINT NOT NULL,
    "usuarioId" BIGINT NOT NULL,

    CONSTRAINT "infraestructura_usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "infraestructura_departamen_provincia_distrito_idx" ON "infraestructura"("departamen", "provincia", "distrito");

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_correo_key" ON "usuarios"("correo");

-- CreateIndex
CREATE INDEX "infraestructura_usuarios_objectid_idx" ON "infraestructura_usuarios"("objectid");

-- CreateIndex
CREATE INDEX "infraestructura_usuarios_usuarioId_idx" ON "infraestructura_usuarios"("usuarioId");

-- CreateIndex
CREATE UNIQUE INDEX "infraestructura_usuarios_objectid_usuarioId_key" ON "infraestructura_usuarios"("objectid", "usuarioId");

-- AddForeignKey
ALTER TABLE "infraestructura_usuarios" ADD CONSTRAINT "infraestructura_usuarios_objectid_fkey" FOREIGN KEY ("objectid") REFERENCES "infraestructura"("objectid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "infraestructura_usuarios" ADD CONSTRAINT "infraestructura_usuarios_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;
