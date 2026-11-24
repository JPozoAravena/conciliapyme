import { CircleAlert, CircleCheck, CircleDot } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

/** Score bands match the rule scores in src/lib/conciliacion/sugerir.ts (100 / 70 / 40). */
export function ScoreBadge({ puntaje }: { puntaje: number }) {
  const [tone, Icon, nivel] =
    puntaje >= 100
      ? (['success', CircleCheck, 'Alta'] as const)
      : puntaje >= 70
        ? (['info', CircleDot, 'Media'] as const)
        : (['warning', CircleAlert, 'Baja'] as const);

  return (
    <span className="inline-flex items-center gap-2">
      <Badge tone={tone}>
        <Icon aria-hidden="true" />
        {nivel}
      </Badge>
      <span className="text-sm text-muted tabular">Puntaje {puntaje}</span>
    </span>
  );
}
