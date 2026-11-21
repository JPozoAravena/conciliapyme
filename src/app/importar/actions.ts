'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { sesionConPermiso } from '@/app/_lib/autorizacion';
import { validarArchivo } from '@/lib/cartola/archivo';
import { importarCartola } from '@/lib/cartola/importar';
import { CartolaError } from '@/lib/cartola/parse';
import { urlResultado } from '@/lib/cartola/resultado';
import { conAviso } from '@/lib/url';

const RUTA = '/importar';

/** Logs only the error type and code: never the file contents or the user's data. */
function registrarFallo(e: unknown): void {
  const nombre = e instanceof Error ? e.name : 'UnknownError';
  const codigo =
    typeof e === 'object' && e !== null && 'code' in e ? String(e.code) : '-';
  console.error(`importarCartola failed: ${nombre} (${codigo})`);
}

export async function importarCartolaAction(formData: FormData): Promise<void> {
  const session = await sesionConPermiso('cartola:importar');
  if (!session) redirect(conAviso(RUTA, { error: 'sin_permiso' }));

  const entrada = formData.get('archivo');
  const archivo = entrada instanceof File ? entrada : null;
  const invalido = validarArchivo(archivo);
  if (invalido || !archivo)
    redirect(conAviso(RUTA, { error: invalido ?? 'archivo_requerido' }));

  let destino: string;
  try {
    const resultado = await importarCartola({
      bytes: new Uint8Array(await archivo.arrayBuffer()),
      nombreArchivo: archivo.name,
      userId: session.user.id,
    });
    destino = urlResultado(resultado);
  } catch (e) {
    if (e instanceof CartolaError) {
      destino = conAviso(RUTA, { error: e.codigo, fila: e.fila });
    } else {
      registrarFallo(e);
      destino = conAviso(RUTA, { error: 'importacion_fallida' });
    }
  }
  revalidatePath(RUTA);
  redirect(destino);
}
