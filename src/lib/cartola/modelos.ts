import mongoose, { Schema, type InferSchemaType, type Model } from 'mongoose';

const importacionSchema = new Schema(
  {
    fileHash: { type: String, required: true, unique: true },
    nombreArchivo: { type: String, required: true, maxlength: 255 },
    banco: { type: String, required: true },
    userId: { type: String, required: true },
    totalFilas: { type: Number, required: true },
    estado: { type: String, enum: ['PROCESANDO', 'COMPLETA'], default: 'PROCESANDO' },
  },
  { timestamps: true, strict: 'throw' },
);

/** Original row as the bank sent it (only known columns), so new bank formats need no migration. */
const lineaSchema = new Schema(
  {
    importId: { type: String, required: true, index: true },
    fila: { type: Number, required: true },
    raw: { type: Map, of: String, required: true },
  },
  { strict: 'throw' },
);

export type ImportacionDoc = InferSchemaType<typeof importacionSchema>;
export type CartolaLineaDoc = InferSchemaType<typeof lineaSchema>;

export const Importacion: Model<ImportacionDoc> =
  mongoose.models.Importacion ?? mongoose.model('Importacion', importacionSchema);
export const CartolaLinea: Model<CartolaLineaDoc> =
  mongoose.models.CartolaLinea ?? mongoose.model('CartolaLinea', lineaSchema);
