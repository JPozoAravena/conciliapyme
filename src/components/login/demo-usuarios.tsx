import { Button } from '@/components/ui/button';

const USUARIOS = [
  { email: 'contador@demo.cl', rol: 'Contador' },
  { email: 'dueno@demo.cl', rol: 'Dueño, solo lectura' },
  { email: 'admin@demo.cl', rol: 'Administrador' },
] as const;

/** Demo credentials helper. Callers decide whether it may be rendered. */
export function DemoUsuarios({ onUsar }: { onUsar: (email: string) => void }) {
  return (
    <section
      aria-labelledby="demo-usuarios"
      className="mt-5 rounded-md border border-dashed border-border bg-background p-3 text-xs"
    >
      <h2 id="demo-usuarios" className="text-sm font-semibold">
        Usuarios de demostración
      </h2>
      <p className="mt-1 text-muted">
        Contraseña para todos: <code className="font-mono text-foreground">Demo1234!</code>
      </p>
      <ul className="mt-2 flex flex-col divide-y divide-border">
        {USUARIOS.map((u) => (
          <li key={u.email} className="flex items-center justify-between gap-2 py-1">
            <span className="min-w-0">
              <span className="block truncate font-mono text-foreground">{u.email}</span>
              <span className="mt-0.5 inline-block rounded-full border border-border bg-surface px-2 py-0.5 text-[0.6875rem] font-medium text-muted">
                {u.rol}
              </span>
            </span>
            <Button
              variant="ghost"
              onClick={() => onUsar(u.email)}
              aria-label={`Usar ${u.email}`}
              className="min-h-11 shrink-0 px-3 text-sm"
            >
              Usar
            </Button>
          </li>
        ))}
      </ul>
    </section>
  );
}
