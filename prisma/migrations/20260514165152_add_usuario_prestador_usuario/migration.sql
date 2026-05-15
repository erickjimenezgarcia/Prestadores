-- CreateTable
CREATE TABLE "usuario" (
    "id" SERIAL NOT NULL,
    "nombres" TEXT NOT NULL,
    "apellidos" TEXT NOT NULL,
    "telefono" TEXT NOT NULL,
    "correo" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "prestador_usuario" (
    "id" SERIAL NOT NULL,
    "id_prestador" INTEGER NOT NULL,
    "id_usuario" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "prestador_usuario_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuario_telefono_key" ON "usuario"("telefono");

-- CreateIndex
CREATE UNIQUE INDEX "usuario_correo_key" ON "usuario"("correo");

-- CreateIndex
CREATE INDEX "prestador_usuario_id_prestador_idx" ON "prestador_usuario"("id_prestador");

-- CreateIndex
CREATE INDEX "prestador_usuario_id_usuario_idx" ON "prestador_usuario"("id_usuario");

-- CreateIndex
CREATE UNIQUE INDEX "prestador_usuario_id_prestador_id_usuario_key" ON "prestador_usuario"("id_prestador", "id_usuario");

-- AddForeignKey
ALTER TABLE "prestador_usuario" ADD CONSTRAINT "prestador_usuario_id_prestador_fkey" FOREIGN KEY ("id_prestador") REFERENCES "prestador"("id_prestador") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prestador_usuario" ADD CONSTRAINT "prestador_usuario_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;
