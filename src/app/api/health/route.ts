import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { connectMongo } from '@/lib/mongo';
import { revisarSalud } from '@/lib/salud';

export const dynamic = 'force-dynamic';

async function pingMongo(): Promise<void> {
  const conexion = await connectMongo();
  const db = conexion.connection.db;
  if (!db) throw new Error('mongo not connected');
  await db.admin().ping();
}

export async function GET() {
  const { httpStatus, cuerpo } = await revisarSalud({
    postgres: () => prisma.$queryRaw`SELECT 1`,
    mongo: pingMongo,
  });
  return NextResponse.json(cuerpo, {
    status: httpStatus,
    headers: { 'Cache-Control': 'no-store' },
  });
}
