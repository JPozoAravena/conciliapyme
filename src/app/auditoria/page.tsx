import { ScrollText } from 'lucide-react';
import Link from 'next/link';
import { cargarContextoAuditoria } from '@/app/_lib/auditoria-contexto';
import { requerirSesion } from '@/app/_lib/autorizacion';
import { AuditoriaFiltrosForm } from '@/components/auditoria/auditoria-filtros-form';
import { LineaTiempo } from '@/components/auditoria/linea-tiempo';
import { Pagination } from '@/components/data-table/pagination';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { listarAuditoria } from '@/lib/auditoria';
import { leerFiltros, POR_PAGINA } from '@/lib/auditoria-filtros';
import { fechaParaInput } from '@/lib/formato';
import { puede } from '@/lib/rbac';

export default async function AuditoriaPage({ searchParams }: PageProps<'/auditoria'>) {
  const session = await requerirSesion();
  if (!puede(session.user.role, 'auditoria:ver')) {
    return (
      <div className="contenedor">
        <h1 className="titulo">Auditoría</h1>
        <p className="mt-4 rounded-lg border border-border bg-surface p-5">
          Tu rol no permite ver el registro de auditoría.
        </p>
      </div>
    );
  }

  const filtros = leerFiltros(await searchParams);
  const { eventos, total, paginas } = await listarAuditoria(filtros);
  const { correos, facturas } = await cargarContextoAuditoria(eventos);
  const conFiltros = Boolean(filtros.accion || filtros.desde || filtros.hasta);
  const params = {
    accion: filtros.accion,
    desde: filtros.desde && fechaParaInput(filtros.desde),
    hasta: filtros.hasta && fechaParaInput(filtros.hasta),
  };

  return (
    <div className="contenedor flex flex-col gap-6">
      <div>
        <h1 className="titulo">Auditoría</h1>
        <p className="mt-1 text-muted">Registro de solo lectura: {total} eventos.</p>
      </div>
      <AuditoriaFiltrosForm filtros={filtros} />
      {eventos.length === 0 ? (
        <EmptyState
          icon={ScrollText}
          title={conFiltros ? 'No hay eventos con estos filtros' : 'Aún no hay eventos'}
          description={
            conFiltros
              ? undefined
              : 'Aparecerán cuando se importen cartolas o se confirmen conciliaciones.'
          }
          action={
            conFiltros ? (
              <Button asChild variant="secondary">
                <Link href="/auditoria">Limpiar filtros</Link>
              </Button>
            ) : undefined
          }
        />
      ) : (
        <>
          <LineaTiempo eventos={eventos} correos={correos} facturas={facturas} />
          <Pagination
            base="/auditoria"
            params={params}
            pagina={filtros.pagina}
            paginas={paginas}
            porPagina={POR_PAGINA}
            total={total}
          />
        </>
      )}
    </div>
  );
}
