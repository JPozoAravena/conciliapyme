import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { connectMongo } from '@/lib/mongo';

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    const mongo = await connectMongo();
    await mongo.connection.db?.admin().ping();
    return NextResponse.json({ status: 'ok' });
  } catch {
    return NextResponse.json({ status: 'error' }, { status: 503 });
  }
}