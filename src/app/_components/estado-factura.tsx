import { Badge } from '@/components/ui/badge';

const estados = {
  PENDIENTE: { texto: 'Pendiente', tone: 'warning' },
  PAGADA: { texto: 'Pagada', tone: 'success' },
  CON_DIFERENCIA: { texto: 'Con diferencia', tone: 'danger' },
} as const;

export function EstadoFactura({ estado }: { estado: keyof typeof estados }) {
  const { texto, tone } = estados[estado];
  return <Badge tone={tone}>{texto}</Badge>;
}
