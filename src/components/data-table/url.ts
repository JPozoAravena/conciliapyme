export type ParamsUrl = Record<string, string | undefined>;

/** `base` plus the non-empty params; `cambios` override `params` (undefined removes a key). */
export function construirUrl(base: string, params: ParamsUrl, cambios: ParamsUrl = {}): string {
  const query = new URLSearchParams();
  for (const [clave, valor] of Object.entries({ ...params, ...cambios })) {
    if (valor) query.set(clave, valor);
  }
  const texto = query.toString();
  return texto ? `${base}?${texto}` : base;
}
