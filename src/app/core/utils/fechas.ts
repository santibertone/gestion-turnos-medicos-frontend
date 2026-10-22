/** Utilidades de fechas usadas en toda la aplicacion. */

/** Convierte un Date a 'YYYY-MM-DD' en horario local (sin desfase de zona). */
export function aFechaISO(fecha: Date): string {
  const anio = fecha.getFullYear();
  const mes = String(fecha.getMonth() + 1).padStart(2, '0');
  const dia = String(fecha.getDate()).padStart(2, '0');
  return `${anio}-${mes}-${dia}`;
}

/** Fecha de hoy en formato 'YYYY-MM-DD'. */
export function hoyISO(): string {
  return aFechaISO(new Date());
}

/** Calcula la edad (en anios) a partir de una fecha de nacimiento 'YYYY-MM-DD'. */
export function calcularEdad(fechaNacimiento: string): number {
  const nac = new Date(`${String(fechaNacimiento).slice(0, 10)}T00:00:00`);
  const hoy = new Date();
  let edad = hoy.getFullYear() - nac.getFullYear();
  const mes = hoy.getMonth() - nac.getMonth();
  if (mes < 0 || (mes === 0 && hoy.getDate() < nac.getDate())) {
    edad--;
  }
  return edad;
}
