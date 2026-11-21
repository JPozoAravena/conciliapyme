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
    <section aria-labelledby="formatos" className="flex flex-col gap-3">
      <h2 id="formatos" className="subtitulo">
        Formatos aceptados
      </h2>
      <div className="grid gap-3 sm:grid-cols-2">
        {formatos.map((f) => (
          <article key={f.banco} className="tarjeta flex flex-col gap-2">
            <h3 className="flex flex-wrap items-center justify-between gap-2 font-semibold">
              {f.banco}
              <span className="badge badge-neutro">{f.separador}</span>
            </h3>
            <p className="texto-suave">Columnas:</p>
            <ul className="flex flex-wrap gap-1.5">
              {f.columnas.map((c) => (
                <li key={c}>
                  <code className="rounded bg-[var(--brand-soft)] px-1.5 py-0.5 text-sm text-[var(--brand)]">
                    {c}
                  </code>
                </li>
              ))}
            </ul>
            <p className="texto-suave">{f.nota}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
