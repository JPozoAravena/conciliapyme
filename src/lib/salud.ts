export type EstadoServicio = 'ok' | 'error';
export type CuerpoSalud = {
  status: EstadoServicio;
  postgres: EstadoServicio;
  mongo: EstadoServicio;
};
export type Chequeo = () => Promise<unknown>;

/** Per-check limit, so a hung database answers 503 instead of hanging the health probe. */
const MS_LIMITE = 3000;

async function estado(
  chequeo: Chequeo,
  msLimite: number,
): Promise<EstadoServicio> {
  let temporizador: ReturnType<typeof setTimeout> | undefined;
  const limite = new Promise<never>((_, rechazar) => {
    temporizador = setTimeout(() => rechazar(new Error('timeout')), msLimite);
  });
  try {
    await Promise.race([Promise.resolve().then(chequeo), limite]);
    return 'ok';
  } catch {
    // Only the state is reported: error messages may contain hosts or credentials.
    return 'error';
  } finally {
    clearTimeout(temporizador);
  }
}

export async function revisarSalud(
  chequeos: { postgres: Chequeo; mongo: Chequeo },
  msLimite = MS_LIMITE,
): Promise<{ httpStatus: 200 | 503; cuerpo: CuerpoSalud }> {
  const [postgres, mongo] = await Promise.all([
    estado(chequeos.postgres, msLimite),
    estado(chequeos.mongo, msLimite),
  ]);
  const ok = postgres === 'ok' && mongo === 'ok';
  return {
    httpStatus: ok ? 200 : 503,
    cuerpo: { status: ok ? 'ok' : 'error', postgres, mongo },
  };
}
