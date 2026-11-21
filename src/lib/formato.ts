const clp = new Intl.NumberFormat('es-CL', {
  style: 'currency',
  currency: 'CLP',
  maximumFractionDigits: 0,
});

export function formatearClp(montoClp: number): string {
  return clp.format(montoClp);
}

// Dates are stored as UTC midnight (from <input type="date">), so format in UTC.
export function formatearFecha(fecha: Date): string {
  const [anio, mes, dia] = fechaParaInput(fecha).split('-');
  return `${dia}-${mes}-${anio}`;
}

export function fechaParaInput(fecha: Date): string {
  return fecha.toISOString().slice(0, 10);
}
