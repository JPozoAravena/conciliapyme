import { z } from 'zod';
import { validarRut } from '@/lib/rut';

// Prisma `Int` columns are 32-bit in PostgreSQL.
const INT_MAX = 2_147_483_647;

// Requiring a non-empty string first stops a missing field (null) from coercing to 1970-01-01.
const fecha = z.string().min(1).pipe(z.coerce.date());

export const clienteSchema = z.object({
  rut: z.string().refine(validarRut, 'RUT inválido'),
  razonSocial: z.string().trim().min(2, 'Ingresa la razón social').max(120),
});

export const facturaSchema = z
  .object({
    folio: z.coerce.number().int().positive().max(INT_MAX),
    clienteId: z.string().min(1),
    montoClp: z.coerce.number().int().positive('El monto debe ser mayor a 0').max(INT_MAX),
    emision: fecha,
    vencimiento: fecha,
  })
  .refine((f) => f.vencimiento >= f.emision, {
    message: 'El vencimiento no puede ser anterior a la emisión',
    path: ['vencimiento'],
  });

export const idSchema = z.string().regex(/^[a-z0-9]{1,40}$/i);
