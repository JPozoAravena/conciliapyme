import mongoose, { Schema, type InferSchemaType, type Model } from 'mongoose';
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
  accion: 'CONCILIACION_CONFIRMADA';
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
