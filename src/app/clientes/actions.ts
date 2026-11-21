'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { tienePermiso } from '@/app/_lib/autorizacion';
import { prisma } from '@/lib/db';
import { codigoValidacion, ejecutarConCodigo, type CodigoError } from '@/lib/errores';
import { normalizarRut } from '@/lib/rut';
import { clienteSchema, facturaSchema, idSchema } from '@/lib/schemas';
import { conAviso } from '@/lib/url';

const LISTA = '/clientes';
const detalle = (id: string) => `${LISTA}/${id}`;

const mapaCliente: Record<string, CodigoError> = {
  rut: 'rut_invalido',
  razonSocial: 'razon_social_invalida',
};

const mapaFactura: Record<string, CodigoError> = {
  folio: 'folio_invalido',
  montoClp: 'monto_invalido',
  emision: 'fecha_invalida',
  vencimiento: 'fecha_invalida',
  'vencimiento:custom': 'vencimiento_anterior',
};

function fallar(ruta: string, error: CodigoError): never {
  redirect(conAviso(ruta, { error }));
}

async function exigirGestion(ruta: string): Promise<void> {
  if (!(await tienePermiso('cliente:gestionar'))) fallar(ruta, 'sin_permiso');
}

function leerId(valor: unknown): string {
  const id = idSchema.safeParse(valor);
  if (!id.success) fallar(LISTA, 'no_encontrado');
  return id.data;
}

function leerCliente(formData: FormData) {
  return clienteSchema.safeParse({
    rut: formData.get('rut'),
    razonSocial: formData.get('razonSocial'),
  });
}

export async function crearCliente(formData: FormData): Promise<void> {
  await exigirGestion(LISTA);
  const parsed = leerCliente(formData);
  if (!parsed.success) fallar(LISTA, codigoValidacion(parsed.error, mapaCliente));

  const data = { rut: normalizarRut(parsed.data.rut), razonSocial: parsed.data.razonSocial };
  const codigo = await ejecutarConCodigo(() => prisma.cliente.create({ data }), {
    duplicado: 'rut_duplicado',
  });
  if (codigo) fallar(LISTA, codigo);

  revalidatePath(LISTA);
  redirect(conAviso(LISTA, { ok: 'cliente_creado' }));
}

export async function actualizarCliente(idCrudo: string, formData: FormData): Promise<void> {
  const id = leerId(idCrudo);
  await exigirGestion(detalle(id));
  const parsed = leerCliente(formData);
  if (!parsed.success) fallar(detalle(id), codigoValidacion(parsed.error, mapaCliente));

  const data = { rut: normalizarRut(parsed.data.rut), razonSocial: parsed.data.razonSocial };
  const codigo = await ejecutarConCodigo(() => prisma.cliente.update({ where: { id }, data }), {
    duplicado: 'rut_duplicado',
  });
  if (codigo) fallar(detalle(id), codigo);

  revalidatePath(LISTA);
  revalidatePath(detalle(id));
  redirect(conAviso(detalle(id), { ok: 'cliente_actualizado' }));
}

export async function eliminarCliente(idCrudo: string): Promise<void> {
  const id = leerId(idCrudo);
  await exigirGestion(detalle(id));

  const codigo = await ejecutarConCodigo(() => prisma.cliente.delete({ where: { id } }), {
    enUso: 'cliente_con_facturas',
  });
  if (codigo === 'no_encontrado') fallar(LISTA, codigo);
  if (codigo) fallar(detalle(id), codigo);

  revalidatePath(LISTA);
  redirect(conAviso(LISTA, { ok: 'cliente_eliminado' }));
}

export async function crearFactura(clienteIdCrudo: string, formData: FormData): Promise<void> {
  const clienteId = leerId(clienteIdCrudo);
  await exigirGestion(detalle(clienteId));
  const parsed = facturaSchema.safeParse({
    folio: formData.get('folio'),
    clienteId,
    montoClp: formData.get('montoClp'),
    emision: formData.get('emision'),
    vencimiento: formData.get('vencimiento'),
  });
  if (!parsed.success) fallar(detalle(clienteId), codigoValidacion(parsed.error, mapaFactura));

  const codigo = await ejecutarConCodigo(() => prisma.factura.create({ data: parsed.data }), {
    duplicado: 'folio_duplicado',
    enUso: 'no_encontrado',
  });
  if (codigo === 'no_encontrado') fallar(LISTA, codigo);
  if (codigo) fallar(detalle(clienteId), codigo);

  revalidatePath(detalle(clienteId));
  redirect(conAviso(detalle(clienteId), { ok: 'factura_creada' }));
}
