export default function Cargando() {
  return (
    <div className='contenedor flex flex-col gap-4' aria-busy='true'>
      <p className='sr-only' role='status'>
        Cargando…
      </p>
      <div className='esqueleto h-9 w-48' />
      <div className='esqueleto h-14 w-full' />
      <div className='esqueleto h-14 w-full' />
      <div className='esqueleto h-14 w-full' />
    </div>
  );
}
