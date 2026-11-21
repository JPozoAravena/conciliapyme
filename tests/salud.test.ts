import { describe, expect, it } from 'vitest';
import { revisarSalud } from '@/lib/salud';

const ok = () => Promise.resolve();
const falla = () =>
  Promise.reject(
    new Error('connect ECONNREFUSED 10.0.0.5:5432 password=secreto'),
  );
const cuelga = () => new Promise<void>(() => {});

describe('revisarSalud', () => {
  it('200 y todo ok cuando ambos servicios responden', async () => {
    expect(await revisarSalud({ postgres: ok, mongo: ok })).toEqual({
      httpStatus: 200,
      cuerpo: { status: 'ok', postgres: 'ok', mongo: 'ok' },
    });
  });

  it('503 e indica qué servicio falló', async () => {
    expect(await revisarSalud({ postgres: falla, mongo: ok })).toEqual({
      httpStatus: 503,
      cuerpo: { status: 'error', postgres: 'error', mongo: 'ok' },
    });
    expect((await revisarSalud({ postgres: ok, mongo: falla })).cuerpo).toEqual(
      {
        status: 'error',
        postgres: 'ok',
        mongo: 'error',
      },
    );
  });

  it('no expone mensajes de error ni datos de conexión', async () => {
    const { cuerpo } = await revisarSalud({ postgres: falla, mongo: falla });
    expect(Object.keys(cuerpo).sort()).toEqual(['mongo', 'postgres', 'status']);
    expect(JSON.stringify(cuerpo)).not.toMatch(
      /ECONNREFUSED|10\.0\.0\.5|secreto|Error/,
    );
  });

  it('marca error un servicio que no responde a tiempo', async () => {
    const r = await revisarSalud({ postgres: cuelga, mongo: ok }, 20);
    expect(r).toEqual({
      httpStatus: 503,
      cuerpo: { status: 'error', postgres: 'error', mongo: 'ok' },
    });
  });

  it('marca error si el chequeo lanza de forma síncrona', async () => {
    const lanza = () => {
      throw new Error('MONGODB_URI is not set');
    };
    expect(
      (await revisarSalud({ postgres: ok, mongo: lanza })).cuerpo.mongo,
    ).toBe('error');
  });
});
