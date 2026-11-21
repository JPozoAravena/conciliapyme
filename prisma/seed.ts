import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Refusing to seed demo data in production');
  }
  const passwordHash = await bcrypt.hash('Demo1234!', 12);
  const usuarios = [
    { email: 'contador@demo.cl', role: Role.CONTADOR },
    { email: 'dueno@demo.cl', role: Role.DUENO },
    { email: 'admin@demo.cl', role: Role.ADMIN },
  ];
  for (const u of usuarios) {
    await prisma.user.upsert({ where: { email: u.email }, update: {}, create: { ...u, passwordHash } });
  }

  const clientes = [
    { rut: '76000000-0', razonSocial: 'Constructora Los Alerces SpA' },
    { rut: '12345678-5', razonSocial: 'Panadería San Martín' },
    { rut: '10000013-K', razonSocial: 'Clínica Dental Ñuñoa' },
    { rut: '14000000-0', razonSocial: 'Transportes Andes Sur' },
  ];
  for (const c of clientes) {
    await prisma.cliente.upsert({ where: { rut: c.rut }, update: {}, create: c });
  }

  const hoy = new Date();
  const enDias = (n: number) => new Date(hoy.getTime() + n * 86_400_000);
  const facturas = [
    { folio: 1001, rut: '76000000-0', montoClp: 1_190_000, dias: 10 },
    { folio: 1002, rut: '12345678-5', montoClp: 238_000, dias: 5 },
    { folio: 1003, rut: '10000013-K', montoClp: 595_000, dias: -3 },
    { folio: 1004, rut: '14000000-0', montoClp: 1_785_000, dias: 20 },
  ];
  for (const f of facturas) {
    const cliente = await prisma.cliente.findUniqueOrThrow({ where: { rut: f.rut } });
    await prisma.factura.upsert({
      where: { folio: f.folio },
      update: {},
      create: {
        folio: f.folio,
        clienteId: cliente.id,
        montoClp: f.montoClp,
        emision: enDias(f.dias - 30),
        vencimiento: enDias(f.dias),
      },
    });
  }
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());