/** Spanish labels for audit enums. Unknown values are shown as received. */
const ACCIONES: Record<string, string> = {
  CONCILIACION_CONFIRMADA: 'Conciliación confirmada',
};

const REGLAS: Record<string, string> = {
  MONTO_Y_FOLIO: 'Monto y folio',
  MONTO_Y_FECHA: 'Monto y fecha',
  DIFERENCIA_MENOR: 'Diferencia menor',
};

const ESTADOS_FACTURA: Record<string, string> = {
  PENDIENTE: 'pendiente',
  PAGADA: 'pagada',
  CON_DIFERENCIA: 'con diferencia',
};

export const etiquetaAccion = (accion: string) => ACCIONES[accion] ?? accion;
export const etiquetaRegla = (regla: string) => REGLAS[regla] ?? regla;
export const etiquetaEstadoFactura = (estado: string) => ESTADOS_FACTURA[estado] ?? estado;

const fechaHora = new Intl.DateTimeFormat('es-CL', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
  timeZone: 'America/Santiago',
});

/** dd-mm-aaaa HH:mm in Chile time. */
export function formatearFechaHora(fecha: Date): string {
  return fechaHora.format(fecha).replaceAll('/', '-').replace(',', '');
}
