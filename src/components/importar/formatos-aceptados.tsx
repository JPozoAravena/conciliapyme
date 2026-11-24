import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';

const formatos = [
  {
    banco: 'Banco A',
    separador: 'Punto y coma (;)',
    columnas: ['Fecha', 'Descripción', 'Cargo', 'Abono', 'Saldo'],
    nota: 'Fecha en formato dd/mm/aaaa.',
  },
  {
    banco: 'Banco B',
    separador: 'Coma (,)',
    columnas: ['date', 'detail', 'amount', 'reference'],
    nota: 'Fecha aaaa-mm-dd; amount con signo.',
  },
];

export function FormatosAceptados() {
  return (
    <Card aria-labelledby="formatos" className="flex flex-col gap-4 bg-background p-4 shadow-none sm:p-5">
      <div>
        <h2 id="formatos" className="text-base font-semibold tracking-tight">
          Formatos aceptados
        </h2>
        <p className="text-sm text-muted">
          El banco se detecta solo a partir de las columnas del archivo.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {formatos.map((f) => (
          <div key={f.banco} className="flex min-w-0 flex-col gap-2 rounded-md border border-border bg-surface p-3">
            <h3 className="flex flex-wrap items-center justify-between gap-2 text-sm font-semibold">
              {f.banco}
              <Badge tone="muted">{f.separador}</Badge>
            </h3>
            <ul aria-label={`Columnas de ${f.banco}`} className="flex flex-wrap gap-1.5">
              {f.columnas.map((c) => (
                <li key={c}>
                  <code className="rounded bg-brand-soft px-1.5 py-0.5 text-sm text-brand">
                    {c}
                  </code>
                </li>
              ))}
            </ul>
            <p className="text-sm text-muted">{f.nota}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}
