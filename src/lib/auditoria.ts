import mongoose, { Schema, type InferSchemaType, type Model } from 'mongoose';
import {
  consultaMongo,
  POR_PAGINA,
  type AccionAuditoria,
  type FiltrosAuditoria,
} from '@/lib/auditoria-filtros';
import { connectMongo } from '@/lib/mongo';

/** Append-only audit log: this module exposes no update or delete. */
const auditoriaSchema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    accion: { type: String, required: true, index: true },
    entidad: { type: String, required: true },
    entidadId: { type: String, required: true, index: true },
    antes: Schema.Types.Mixed,
    despues: Schema.Types.Mixed,
    fecha: { type: Date, required: true, default: Date.now, index: true },
  },
  { strict: 'throw' },
);

export const Auditoria: Model<InferSchemaType<typeof auditoriaSchema>> =
  mongoose.models.Auditoria ?? mongoose.model('Auditoria', auditoriaSchema);

export type EventoAuditoria = {
  userId: string;
  accion: AccionAuditoria;
  entidad: string;
  entidadId: string;
  antes?: Record<string, unknown>;
  despues?: Record<string, unknown>;
};

/**
 * Written after the business transaction commits. PostgreSQL and MongoDB share no transaction, so a
 * failure here does not undo the operation; it is logged (type only). An outbox table would make
 * this durable (future work, ADR 0003).
 */
export async function registrarAuditoria(
  evento: EventoAuditoria,
): Promise<boolean> {
  try {
    await connectMongo();
    await Auditoria.create({ ...evento, fecha: new Date() });
    return true;
  } catch (e) {
    console.error(
      `registrarAuditoria failed: ${e instanceof Error ? e.name : 'UnknownError'}`,
    );
    return false;
  }
}

export type PaginaAuditoria = {
  eventos: {
    id: string;
    userId: string;
    accion: string;
    entidad: string;
    entidadId: string;
    fecha: Date;
    despues?: unknown;
  }[];
  total: number;
  paginas: number;
};

/** Newest first, POR_PAGINA per page. */
export async function listarAuditoria(
  filtros: FiltrosAuditoria,
): Promise<PaginaAuditoria> {
  await connectMongo();
  const consulta = consultaMongo(filtros);
  const [docs, total] = await Promise.all([
    Auditoria.find(consulta)
      .sort({ fecha: -1, _id: -1 })
      .skip((filtros.pagina - 1) * POR_PAGINA)
      .limit(POR_PAGINA)
      .lean(),
    Auditoria.countDocuments(consulta),
  ]);
  return {
    eventos: docs.map((d) => ({
      id: String(d._id),
      userId: d.userId,
      accion: d.accion,
      entidad: d.entidad,
      entidadId: d.entidadId,
      fecha: d.fecha,
      despues: d.despues,
    })),
    total,
    paginas: Math.max(1, Math.ceil(total / POR_PAGINA)),
  };
}
