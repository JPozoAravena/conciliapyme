'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { sesionConPermiso } from '@/app/_lib/autorizacion';
import {
  ConciliacionError,
  confirmarConciliacion,
} from '@/lib/conciliacion/confirmar';
import { idSchema } from '@/lib/schemas';
import { conAviso } from '@/lib/url';

const RUTA = '/conciliacion';

export async function confirmarAction(
  movimientoIdCrudo: string,
  facturaIdCrudo: string,
): Promise<void> {
  const session = await sesionConPermiso('conciliacion:confirmar');
  if (!session) redirect(conAviso(RUTA, { error: 'sin_permiso' }));
  const movimientoId = idSchema.safeParse(movimientoIdCrudo);
  const facturaId = idSchema.safeParse(facturaIdCrudo);
  if (!movimientoId.success || !facturaId.success)
    redirect(conAviso(RUTA, { error: 'no_encontrado' }));

  let destino = conAviso(RUTA, { ok: 'conciliacion_confirmada' });
  try {
    await confirmarConciliacion({
      movimientoId: movimientoId.data,
      facturaId: facturaId.data,
      userId: session.user.id,
    });
  } catch (e) {
    if (!(e instanceof ConciliacionError)) {
      console.error(
        `confirmarConciliacion failed: ${e instanceof Error ? e.name : 'UnknownError'}`,
      );
    }
    destino = conAviso(RUTA, {
      error: e instanceof ConciliacionError ? e.codigo : 'conciliacion_fallida',
    });
  }
  revalidatePath(RUTA);
  redirect(destino);
}
