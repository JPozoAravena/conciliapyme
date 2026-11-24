'use client';

import { useState, type FormEvent } from 'react';
import { importarCartolaAction } from '@/app/importar/actions';
import { Field } from '@/components/ui/field';
import { SubmitButton } from '@/components/ui/submit-button';
import { MAX_BYTES } from '@/lib/cartola/limites';
import { ZonaArchivo } from './zona-archivo';

/** Mirrors the server checks (validarArchivo) to give feedback before the upload. */
function validar(entrada: FormDataEntryValue | null): string | null {
  if (!(entrada instanceof File) || entrada.size === 0)
    return 'Selecciona un archivo CSV.';
  if (!entrada.name.toLowerCase().endsWith('.csv'))
    return 'El archivo debe ser un CSV (.csv).';
  if (entrada.size > MAX_BYTES)
    return `El archivo supera el tamaño máximo de ${MAX_BYTES / 1024} KB.`;
  return null;
}

export function FormularioImportar() {
  const [error, setError] = useState<string | null>(null);

  function alEnviar(e: FormEvent<HTMLFormElement>) {
    const mensaje = validar(new FormData(e.currentTarget).get('archivo'));
    if (!mensaje) return;
    e.preventDefault();
    setError(mensaje);
  }

  return (
    <form
      action={importarCartolaAction}
      onSubmit={alEnviar}
      noValidate
      className="flex flex-col gap-4 sm:max-w-xl"
    >
      <Field
        label="Archivo CSV"
        hint={`Máximo ${MAX_BYTES / 1024} KB y 5.000 movimientos.`}
        error={error ?? undefined}
      >
        <ZonaArchivo
          name="archivo"
          accept=".csv,text/csv"
          required
          onSeleccion={() => setError(null)}
        />
      </Field>
      <SubmitButton pendingText="Importando…" className="w-full sm:w-auto sm:self-start">
        Importar cartola
      </SubmitButton>
    </form>
  );
}
