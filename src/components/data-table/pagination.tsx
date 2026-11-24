import { ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/components/ui/cn';
import { construirUrl, type ParamsUrl } from './url';

type Props = {
  base: string;
  params: ParamsUrl;
  pagina: number;
  paginas: number;
  porPagina: number;
  total: number;
};

function Paso({
  href,
  children,
  sentido,
}: {
  href: string | null;
  children: string;
  sentido: 'atras' | 'adelante';
}) {
  const clase = buttonVariants({ variant: 'secondary' });
  const atras = sentido === 'atras';
  const contenido = (
    <>
      {atras && <ChevronLeft aria-hidden="true" />}
      {children}
      {!atras && <ChevronRight aria-hidden="true" />}
    </>
  );
  if (!href) {
    return (
      <span role="link" aria-disabled="true" className={cn(clase)}>
        {contenido}
      </span>
    );
  }
  return (
    <Link href={href} className={clase}>
      {contenido}
    </Link>
  );
}

/** "Mostrando X–Y de Z" with Anterior/Siguiente links that keep the other params. */
export function Pagination({ base, params, pagina, paginas, porPagina, total }: Props) {
  if (total === 0) return null;
  const desde = (pagina - 1) * porPagina + 1;
  const hasta = Math.min(pagina * porPagina, total);
  const enlace = (p: number) =>
    construirUrl(base, params, { pagina: p === 1 ? undefined : String(p) });
  return (
    <nav
      aria-label="Paginación"
      className="flex flex-wrap items-center justify-between gap-3"
    >
      <p className="text-sm text-muted tabular">
        Mostrando {desde}–{hasta} de {total}
      </p>
      <div className="flex gap-2">
        <Paso sentido="atras" href={pagina > 1 ? enlace(pagina - 1) : null}>Anterior</Paso>
        <Paso sentido="adelante" href={pagina < paginas ? enlace(pagina + 1) : null}>Siguiente</Paso>
      </div>
    </nav>
  );
}
