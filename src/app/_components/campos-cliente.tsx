import { Campo } from './campo';

type Props = { rut?: string; razonSocial?: string };

export function CamposCliente({ rut, razonSocial }: Props) {
  return (
    <>
      <Campo
        id='rut'
        etiqueta='RUT'
        required
        defaultValue={rut}
        placeholder='12.345.678-5'
        autoComplete='off'
        ayuda='Con o sin puntos, con guion y dígito verificador. Ej: 12.345.678-5'
      />
      <Campo id='razonSocial' etiqueta='Razón social' required minLength={2} defaultValue={razonSocial} />
    </>
  );
}
