import {
  CircleCheck,
  CopyMinus,
  FilePlus2,
  Info,
  type LucideIcon,
} from 'lucide-react';
import { Card, CardTitle } from '@/components/ui/card';
import { cn } from '@/components/ui/cn';
import type { ResultadoVisible } from '@/lib/cartola/resultado';

function Cifra({
  valor,
  etiqueta,
  Icono,
  destacada,
}: {
  valor: number;
  etiqueta: string;
  Icono: LucideIcon;
  destacada?: boolean;
}) {
  return (
    <div
      className={cn(
        'flex items-start gap-3 rounded-lg border p-4',
        destacada ? 'border-ok-border bg-ok-soft' : 'border-border bg-background',
      )}
    >
      <span
        className={cn(
          'flex size-10 shrink-0 items-center justify-center rounded-md bg-surface',
          destacada ? 'text-ok-text' : 'text-muted',
        )}
      >
        <Icono aria-hidden="true" className="size-5" />
      </span>
      {/* dt must come before dd; flex-col-reverse keeps the number on top visually. */}
      <div className="flex min-w-0 flex-col-reverse gap-1">
        <dt className="text-sm text-muted">{etiqueta}</dt>
        <dd className="text-4xl font-bold leading-none tabular">{valor}</dd>
      </div>
    </div>
  );
}

export function ResultadoImportacion({
  resultado,
}: {
  resultado: NonNullable<ResultadoVisible>;
}) {
  const repetida = resultado.tipo === 'repetida';
  const Icono = repetida ? Info : CircleCheck;
  return (
    <Card
      role="status"
      aria-labelledby="resultado"
      className={cn('border-l-4', repetida ? 'border-l-warn-text' : 'border-l-ok-text')}
    >
      <CardTitle id="resultado" className="flex items-center gap-2">
        <Icono
          aria-hidden="true"
          className={cn('size-5', repetida ? 'text-warn-text' : 'text-ok-text')}
        />
        {repetida ? 'Archivo ya importado' : 'Importación completa'}
      </CardTitle>
      {repetida ? (
        <p className="mt-1 text-sm text-muted">
          Este archivo ya fue importado antes, así que no se hicieron cambios.
          Si es otra cartola, revisa que sea el archivo correcto.
        </p>
      ) : (
        <dl className="mt-4 grid grid-cols-1 gap-3 min-[420px]:grid-cols-2">
          <Cifra valor={resultado.nuevas} etiqueta="Movimientos nuevos" Icono={FilePlus2} destacada />
          <Cifra valor={resultado.omitidas} etiqueta="Duplicados ignorados" Icono={CopyMinus} />
        </dl>
      )}
    </Card>
  );
}
