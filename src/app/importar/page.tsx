import { Aviso } from '@/app/_components/aviso';
import { BotonEnviar } from '@/app/_components/boton-enviar';
import { requerirSesion } from '@/app/_lib/autorizacion';
import { leerAviso } from '@/lib/errores';
import { leerResultadoImportacion } from '@/lib/cartola/resultado';
import { puede } from '@/lib/rbac';
import { importarCartolaAction } from './actions';
import { FormatosAceptados } from './formatos-aceptados';
import { ResultadoImportacion } from './resultado-importacion';
import { SelectorArchivo } from './selector-archivo';

export default async function ImportarPage({
  searchParams,
}: PageProps<'/importar'>) {
  const session = await requerirSesion();
  const params = await searchParams;
  const aviso = leerAviso({ error: params.error, fila: params.fila });
  const resultado = leerResultadoImportacion(params);
  const puedeImportar = puede(session.user.role, 'cartola:importar');

  return (
    <div className="contenedor flex flex-col gap-6">
      <div>
        <h1 className="titulo">Importar cartola</h1>
        <p className="texto-suave mt-1">
          Sube la cartola de tu banco en CSV. Si un archivo o un movimiento ya
          existe, no se duplica.
        </p>
      </div>
      <Aviso aviso={aviso} />
      {resultado && <ResultadoImportacion resultado={resultado} />}

      {puedeImportar ? (
        <section aria-labelledby="subir" className="tarjeta">
          <h2 id="subir" className="subtitulo mb-4">
            Subir archivo
          </h2>
          <form
            action={importarCartolaAction}
            className="flex flex-col gap-4 sm:max-w-xl"
          >
            <SelectorArchivo />
            <BotonEnviar
              texto="Importar cartola"
              textoPendiente="Importando…"
              className="w-full sm:w-auto sm:self-start"
            />
          </form>
        </section>
      ) : (
        <p className="tarjeta texto-suave">
          Tu rol permite ver la información, pero no importar cartolas.
        </p>
      )}

      <FormatosAceptados />
    </div>
  );
}
