const estados = {
  PENDIENTE: { texto: 'Pendiente', clase: 'badge-pendiente' },
  PAGADA: { texto: 'Pagada', clase: 'badge-pagada' },
  CON_DIFERENCIA: { texto: 'Con diferencia', clase: 'badge-diferencia' },
} as const;

export function EstadoFactura({ estado }: { estado: keyof typeof estados }) {
  const { texto, clase } = estados[estado];
  return <span className={`badge ${clase}`}>{texto}</span>;
}
