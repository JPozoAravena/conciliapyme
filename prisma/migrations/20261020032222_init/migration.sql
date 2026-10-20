-- CreateEnum
CREATE TYPE "Role" AS ENUM ('CONTADOR', 'DUENO', 'ADMIN');

-- CreateEnum
CREATE TYPE "FacturaEstado" AS ENUM ('PENDIENTE', 'PAGADA', 'CON_DIFERENCIA');

-- CreateEnum
CREATE TYPE "MovimientoEstado" AS ENUM ('SIN_CONCILIAR', 'CONCILIADO');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Cliente" (
    "id" TEXT NOT NULL,
    "rut" TEXT NOT NULL,
    "razonSocial" TEXT NOT NULL,

    CONSTRAINT "Cliente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Factura" (
    "id" TEXT NOT NULL,
    "folio" INTEGER NOT NULL,
    "clienteId" TEXT NOT NULL,
    "montoClp" INTEGER NOT NULL,
    "emision" TIMESTAMP(3) NOT NULL,
    "vencimiento" TIMESTAMP(3) NOT NULL,
    "estado" "FacturaEstado" NOT NULL DEFAULT 'PENDIENTE',

    CONSTRAINT "Factura_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MovimientoBancario" (
    "id" TEXT NOT NULL,
    "importId" TEXT NOT NULL,
    "banco" TEXT NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL,
    "montoClp" INTEGER NOT NULL,
    "descripcion" TEXT NOT NULL,
    "referencia" TEXT,
    "lineHash" TEXT NOT NULL,
    "estado" "MovimientoEstado" NOT NULL DEFAULT 'SIN_CONCILIAR',

    CONSTRAINT "MovimientoBancario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Conciliacion" (
    "id" TEXT NOT NULL,
    "movimientoId" TEXT NOT NULL,
    "facturaId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "regla" TEXT NOT NULL,
    "diferenciaClp" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Conciliacion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Cliente_rut_key" ON "Cliente"("rut");

-- CreateIndex
CREATE UNIQUE INDEX "Factura_folio_key" ON "Factura"("folio");

-- CreateIndex
CREATE UNIQUE INDEX "MovimientoBancario_lineHash_key" ON "MovimientoBancario"("lineHash");

-- CreateIndex
CREATE UNIQUE INDEX "Conciliacion_movimientoId_key" ON "Conciliacion"("movimientoId");

-- AddForeignKey
ALTER TABLE "Factura" ADD CONSTRAINT "Factura_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Conciliacion" ADD CONSTRAINT "Conciliacion_movimientoId_fkey" FOREIGN KEY ("movimientoId") REFERENCES "MovimientoBancario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Conciliacion" ADD CONSTRAINT "Conciliacion_facturaId_fkey" FOREIGN KEY ("facturaId") REFERENCES "Factura"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Conciliacion" ADD CONSTRAINT "Conciliacion_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
