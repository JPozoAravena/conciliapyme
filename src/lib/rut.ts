function limpiar(input: string): string {
  return input.replace(/[.\-\s]/g, '').toUpperCase();
}

export function validarRut(input: string): boolean {
  const limpio = limpiar(input);
  if (!/^\d{7,8}[0-9K]$/.test(limpio)) return false;
  const cuerpo = limpio.slice(0, -1);
  const dv = limpio.slice(-1);
  let suma = 0;
  let factor = 2;
  for (let i = cuerpo.length - 1; i >= 0; i--) {
    suma += Number(cuerpo[i]) * factor;
    factor = factor === 7 ? 2 : factor + 1;
  }
  const resto = 11 - (suma % 11);
  const esperado = resto === 11 ? '0' : resto === 10 ? 'K' : String(resto);
  return dv === esperado;
}

export function normalizarRut(input: string): string {
  const limpio = limpiar(input);
  return `${limpio.slice(0, -1)}-${limpio.slice(-1)}`;
}