import { Aviso } from '@/app/_components/aviso';
import { requerirSesion } from '@/app/_lib/autorizacion';
import { FormatosAceptados } from '@/components/importar/formatos-aceptados';
import { FormularioImportar } from '@/components/importar/formulario-importar';
import { ResultadoImportacion } from '@/components/importar/resultado-importacion';
import { Card, CardTitle } from '@/components/ui/card';
import { leerResultadoImportacion } from '@/lib/cartola/resultado';
import { leerAviso } from '@/lib/errores';
import { puede } from '@/lib/rbac';

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
        <Card aria-labelledby="subir">
          <CardTitle id="subir" className="mb-4">
            Subir archivo
          </CardTitle>
          <FormularioImportar />
        </Card>
      ) : (
        <p className="tarjeta texto-suave">
          Tu rol permite ver la información, pero no importar cartolas.
        </p>
      )}

      <FormatosAceptados />
    </div>
  );
}
