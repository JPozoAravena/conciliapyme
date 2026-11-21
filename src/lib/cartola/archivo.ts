import type { CodigoError } from '@/lib/errores';
import { MAX_BYTES } from './limites';

export { MAX_BYTES } from './limites';

// Browsers report CSV files inconsistently (Excel on Windows uses application/vnd.ms-excel, systems
// without a mapping send octet-stream or nothing). The type is client-controlled anyway: the real
// check is parsing the content.
const TIPOS_PERMITIDOS: ReadonlySet<string> = new Set([
  '',
  'text/csv',
  'text/plain',
  'application/csv',
  'application/vnd.ms-excel',
  'application/octet-stream',
]);

export type DatosArchivo = { name: string; size: number; type: string };

export function validarArchivo(archivo: DatosArchivo | null): CodigoError | null {
  if (!archivo || archivo.size === 0) return 'archivo_requerido';
  if (!archivo.name.toLowerCase().endsWith('.csv') || !TIPOS_PERMITIDOS.has(archivo.type)) {
    return 'archivo_tipo';
  }
  if (archivo.size > MAX_BYTES) return 'archivo_grande';
  return null;
}

/** Chilean bank exports are often Windows-1252; fall back to it when the bytes are not valid UTF-8. */
export function decodificarCsv(bytes: Uint8Array): string {
  try {
    return new TextDecoder('utf-8', { fatal: true }).decode(bytes);
  } catch {
    return new TextDecoder('windows-1252').decode(bytes);
  }
}
