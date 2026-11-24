import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react';
import Link from 'next/link';
import { TH } from '@/components/ui/table';
import { construirUrl, type ParamsUrl } from './url';

type Props = {
  label: string;
  /** Value of the `orden` param that sorts by this column. */
  columna: string;
  orden: string;
  dir: 'asc' | 'desc';
  /** Direction applied the first time a column is chosen. */
  dirInicial?: 'asc' | 'desc';
  base: string;
  params: ParamsUrl;
  numeric?: boolean;
};

/** Column header whose sort control is a plain link, so it works without JavaScript. */
export function SortableTH({
  label,
  columna,
  orden,
  dir,
  dirInicial = 'asc',
  base,
  params,
  numeric,
}: Props) {
  const activa = orden === columna;
  const siguiente = activa ? (dir === 'asc' ? 'desc' : 'asc') : dirInicial;
  const Icono = !activa ? ArrowUpDown : dir === 'asc' ? ArrowUp : ArrowDown;
  const href = construirUrl(base, params, {
    orden: columna,
    dir: siguiente,
    pagina: undefined,
  });
  return (
    <TH
      numeric={numeric}
      aria-sort={activa ? (dir === 'asc' ? 'ascending' : 'descending') : undefined}
    >
      <Link
        href={href}
        className={`group -mx-2 inline-flex min-h-11 items-center gap-1 rounded-md px-2 uppercase transition-colors hover:bg-brand-soft hover:text-foreground ${activa ? 'text-foreground' : ''}`}
      >
        {label}
        <Icono
          aria-hidden="true"
          className={`size-3.5 ${activa ? 'text-brand' : 'opacity-60 group-hover:opacity-100'}`}
        />
        <span className="sr-only">
          {siguiente === 'asc' ? ', ordenar ascendente' : ', ordenar descendente'}
        </span>
      </Link>
    </TH>
  );
}
