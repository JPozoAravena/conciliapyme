import { randomUUID } from 'node:crypto';
import { PrismaClient } from '@prisma/client';
import { expect, test } from '@playwright/test';

// Self-contained data: its own client and invoice, so the test does not depend on (or change)
// seeded invoices. Needs the seeded user contador@demo.cl.
const prisma = new PrismaClient();
const id = randomUUID().slice(0, 8);
const folio = 800_000_000 + Math.floor(Math.random() * 1_000_000);
const descripcion = `E2E ${id} FAC ${folio}`;
let clienteId = '';

test.beforeAll(async () => {
  const cliente = await prisma.cliente.create({
    data: { rut: `E2E-${id}`, razonSocial: `Cliente E2E ${id}` },
  });
  clienteId = cliente.id;
  await prisma.factura.create({
    data: {
      folio,
      clienteId,
      montoClp: 1_190_000,
      emision: new Date('2026-09-01T00:00:00Z'),
      vencimiento: new Date('2026-09-10T00:00:00Z'),
    },
  });
});

test.afterAll(async () => {
  const movimientos = await prisma.movimientoBancario.findMany({
    where: { descripcion },
    select: { id: true },
  });
  const ids = movimientos.map((m) => m.id);
  await prisma.conciliacion.deleteMany({
    where: { movimientoId: { in: ids } },
  });
  await prisma.movimientoBancario.deleteMany({ where: { id: { in: ids } } });
  await prisma.factura.deleteMany({ where: { clienteId } });
  await prisma.cliente.deleteMany({ where: { id: clienteId } });
  await prisma.$disconnect();
});

test('contador inicia sesión, importa una cartola y confirma una coincidencia', async ({
  page,
}) => {
  await page.goto('/login');
  await page.getByLabel('Correo').fill('contador@demo.cl');
  await page.getByLabel('Contraseña').fill('Demo1234!');
  await page.getByRole('button', { name: 'Ingresar' }).click();
  await expect(page).toHaveURL('/');

  await page.goto('/importar');
  const csv = `Fecha;Descripción;Cargo;Abono;Saldo\n09/09/2026;${descripcion};;1.190.000;1.190.000\n`;
  await page.getByLabel('Archivo CSV').setInputFiles({
    name: `cartola-${id}.csv`,
    mimeType: 'text/csv',
    buffer: Buffer.from(csv, 'utf8'),
  });
  await page.getByRole('button', { name: 'Importar cartola' }).click();
  await expect(page.getByRole('status')).toContainText('Importación completa');

  await page.goto('/conciliacion');
  await page
    .getByRole('button', {
      name: `Confirmar factura ${folio} para ${descripcion}`,
    })
    .click();
  await page
    .getByRole('button', { name: 'Confirmar conciliación', exact: true })
    .click();
  await expect(page.getByRole('status')).toContainText(
    'Conciliación confirmada.',
  );

  const factura = await prisma.factura.findUniqueOrThrow({ where: { folio } });
  expect(factura.estado).toBe('PAGADA');
});
