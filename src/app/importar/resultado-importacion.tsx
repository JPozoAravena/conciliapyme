import type { ResultadoVisible } from '@/lib/cartola/resultado';

function Cifra({
  valor,
  etiqueta,
  destacada,
}: {
  valor: number;
  etiqueta: string;
  destacada?: boolean;
}) {
  return (
    <div
      className={`flex flex-col-reverse gap-2 rounded-lg border p-4 ${
        destacada
          ? 'border-[var(--ok-border)] bg-[var(--ok-soft)]'
          : 'border-[var(--border)] bg-[var(--background)]'
      }`}
    >
      {/* dt must come before dd; flex-col-reverse keeps the number on top visually. */}
      <dt className="texto-suave">{etiqueta}</dt>
      <dd className="text-4xl font-bold tabular-nums leading-none">{valor}</dd>
    </div>
  );
}

export function ResultadoImportacion({
  resultado,
}: {
  resultado: NonNullable<ResultadoVisible>;
}) {
  const repetida = resultado.tipo === 'repetida';
  return (
    <section
      role="status"
      aria-labelledby="resultado"
      className={`tarjeta border-l-4 ${repetida ? 'border-l-[var(--warn-text)]' : 'border-l-[var(--brand)]'}`}
    >
      <h2 id="resultado" className="subtitulo flex items-center gap-2">
        <span aria-hidden="true">{repetida ? 'ⓘ' : '✓'}</span>
        {repetida ? 'Archivo ya importado' : 'Importación completa'}
      </h2>
      {repetida ? (
        <p className="texto-suave mt-1">
          Este archivo ya fue importado antes, así que no se hicieron cambios.
          Si es otra cartola, revisa que sea el archivo correcto.
        </p>
      ) : (
        <dl className="mt-4 grid grid-cols-1 gap-3 min-[420px]:grid-cols-2">
          <Cifra
            valor={resultado.nuevas}
            etiqueta="Movimientos nuevos"
            destacada
          />
          <Cifra valor={resultado.omitidas} etiqueta="Ya existían (omitidos)" />
        </dl>
      )}
    </section>
  );
}
