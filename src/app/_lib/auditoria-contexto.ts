import { prisma } from '@/lib/db';

export type FacturaAuditada = { folio: number; montoClp: number };

type EventoConContexto = { userId: string; despues?: unknown };

function facturaId(despues: unknown): string | null {
  if (typeof despues !== 'object' || despues === null) return null;
  const id = (despues as Record<string, unknown>).facturaId;
  return typeof id === 'string' ? id : null;
}

/** Emails and invoices referenced by a page of events, in two batched queries. */
export async function cargarContextoAuditoria(eventos: EventoConContexto[]) {
  const facturaIds = [
    ...new Set(eventos.map((e) => facturaId(e.despues)).filter((id) => id !== null)),
  ];
  const [usuarios, facturas] = await Promise.all([
    prisma.user.findMany({
      where: { id: { in: [...new Set(eventos.map((e) => e.userId))] } },
      select: { id: true, email: true },
    }),
    prisma.factura.findMany({
      where: { id: { in: facturaIds } },
      select: { id: true, folio: true, montoClp: true },
    }),
  ]);
  return {
    correos: new Map(usuarios.map((u) => [u.id, u.email])),
    facturas: new Map<string, FacturaAuditada>(
      facturas.map((f) => [f.id, { folio: f.folio, montoClp: f.montoClp }]),
    ),
  };
}
