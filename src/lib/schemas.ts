import { z } from 'zod';
import { validarRut } from '@/lib/rut';

export const clienteSchema = z.object({
  rut: z.string().refine(validarRut, 'RUT inválido'),
  razonSocial: z.string().trim().min(2, 'Ingresa la razón social'),
});

export const facturaSchema = z
  .object({
    folio: z.coerce.number().int().positive(),
    clienteId: z.string().min(1),
    montoClp: z.coerce.number().int().positive('El monto debe ser mayor a 0'),
    emision: z.coerce.date(),
    vencimiento: z.coerce.date(),
  })
  .refine((f) => f.vencimiento >= f.emision, {
    message: 'El vencimiento no puede ser anterior a la emisión',
    path: ['vencimiento'],
  });