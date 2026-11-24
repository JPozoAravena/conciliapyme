'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { toast } from 'sonner';
import type { Aviso } from '@/lib/errores';

const PARAMS_AVISO = ['error', 'ok', 'fila'];

/** Shows the URL notice as a toast once, then drops its params so a reload does not repeat it. */
export function UrlToast({ aviso }: { aviso: Aviso | null }) {
  const router = useRouter();
  const pathname = usePathname();
  const search = useSearchParams();
  const mostrado = useRef<string | null>(null);

  useEffect(() => {
    if (!aviso) {
      mostrado.current = null;
      return;
    }
    const clave = `${aviso.tipo}:${aviso.mensaje}`;
    if (mostrado.current === clave) return;
    mostrado.current = clave;
    if (aviso.tipo === 'ok') toast.success(aviso.mensaje);
    else toast.error(aviso.mensaje);

    const restantes = new URLSearchParams(search.toString());
    for (const clave of PARAMS_AVISO) restantes.delete(clave);
    const query = restantes.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }, [aviso, pathname, router, search]);

  return null;
}
