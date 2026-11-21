import Link from 'next/link';
import { requerirSesion } from '@/app/_lib/autorizacion';
import { listarAuditoria } from '@/lib/auditoria';
import {
  ACCIONES,
  leerFiltros,
  type FiltrosAuditoria,
} from '@/lib/auditoria-filtros';
import { prisma } from '@/lib/db';
import { fechaParaInput, formatearClp } from '@/lib/formato';
import { puede } from '@/lib/rbac';

const nombreAccion: Record<(typeof ACCIONES)[number], string> = {
  CONCILIACION_CONFIRMADA: 'Conciliación confirmada',
};

const fechaHora = new Intl.DateTimeFormat('es-CL', {
  dateStyle: 'short',
  timeStyle: 'short',
  timeZone: 'America/Santiago',
});

function urlPagina(f: FiltrosAuditoria, pagina: number): string {
  const p = new URLSearchParams({ pagina: String(pagina) });
  if (f.accion) p.set('accion', f.accion);
  if (f.desde) p.set('desde', fechaParaInput(f.desde));
  if (f.hasta) p.set('hasta', fechaParaInput(f.hasta));
  return `/auditoria?${p.toString()}`;
}

function detalle(despues: unknown): string {
  if (typeof despues !== 'object' || despues === null) return '';
  const d = despues as Record<string, unknown>;
  const partes = [
    typeof d.factura === 'string' ? `Factura ${d.factura.toLowerCase()}` : '',
    typeof d.regla === 'string' ? d.regla : '',
  ];
  if (typeof d.diferenciaClp === 'number' && d.diferenciaClp !== 0)
    partes.push(`dif. ${formatearClp(d.diferenciaClp)}`);
  return partes.filter(Boolean).join(' · ');
}

export default async function AuditoriaPage({
  searchParams,
}: PageProps<'/auditoria'>) {
  const session = await requerirSesion();
  if (!puede(session.user.role, 'auditoria:ver')) {
    return (
      <div className="contenedor">
        <h1 className="titulo">Auditoría</h1>
        <p className="tarjeta mt-4">
          Tu rol no permite ver el registro de auditoría.
        </p>
      </div>
    );
  }

  const filtros = leerFiltros(await searchParams);
  const { eventos, total, paginas } = await listarAuditoria(filtros);
  const usuarios = await prisma.user.findMany({
    where: { id: { in: [...new Set(eventos.map((e) => e.userId))] } },
    select: { id: true, email: true },
  });
  const correo = new Map(usuarios.map((u) => [u.id, u.email]));

  return (
    <div className="contenedor flex flex-col gap-6">
      <div>
        <h1 className="titulo">Auditoría</h1>
        <p className="texto-suave mt-1">
          Registro de solo lectura: {total} eventos.
        </p>
      </div>

      <form
        method="get"
        className="tarjeta grid grid-cols-1 gap-4 sm:grid-cols-4 sm:items-end"
      >
        <div>
          <label htmlFor="accion" className="etiqueta">
            Acción
          </label>
          <select
            id="accion"
            name="accion"
            defaultValue={filtros.accion ?? ''}
            className="campo"
          >
            <option value="">Todas</option>
            {ACCIONES.map((a) => (
              <option key={a} value={a}>
                {nombreAccion[a]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="desde" className="etiqueta">
            Desde
          </label>
          <input
            id="desde"
            name="desde"
            type="date"
            defaultValue={filtros.desde ? fechaParaInput(filtros.desde) : ''}
            className="campo"
          />
        </div>
        <div>
          <label htmlFor="hasta" className="etiqueta">
            Hasta
          </label>
          <input
            id="hasta"
            name="hasta"
            type="date"
            defaultValue={filtros.hasta ? fechaParaInput(filtros.hasta) : ''}
            className="campo"
          />
        </div>
        <button type="submit" className="btn btn-primario">
          Filtrar
        </button>
      </form>

      {eventos.length === 0 ? (
        <p className="tarjeta">No hay eventos con estos filtros.</p>
      ) : (
        <div className="tabla-scroll">
          <table className="tabla">
            <caption className="sr-only">
              Eventos de auditoría, página {filtros.pagina} de {paginas}
            </caption>
            <thead>
              <tr>
                <th scope="col">Fecha</th>
                <th scope="col">Usuario</th>
                <th scope="col">Acción</th>
                <th scope="col">Detalle</th>
              </tr>
            </thead>
            <tbody>
              {eventos.map((e) => (
                <tr key={e.id}>
                  <td className="whitespace-nowrap tabular-nums">
                    {fechaHora.format(e.fecha)}
                  </td>
                  <td>{correo.get(e.userId) ?? 'Usuario eliminado'}</td>
                  <td>
                    {nombreAccion[e.accion as keyof typeof nombreAccion] ??
                      e.accion}
                  </td>
                  <td>{detalle(e.despues)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {paginas > 1 && (
        <nav
          aria-label="Paginación"
          className="flex items-center justify-between gap-4"
        >
          {filtros.pagina > 1 ? (
            <Link
              href={urlPagina(filtros, filtros.pagina - 1)}
              className="enlace inline-flex min-h-11 items-center"
            >
              ← Anterior
            </Link>
          ) : (
            <span />
          )}
          <span className="texto-suave">
            Página {filtros.pagina} de {paginas}
          </span>
          {filtros.pagina < paginas ? (
            <Link
              href={urlPagina(filtros, filtros.pagina + 1)}
              className="enlace inline-flex min-h-11 items-center"
            >
              Siguiente →
            </Link>
          ) : (
            <span />
          )}
        </nav>
      )}
    </div>
  );
}
