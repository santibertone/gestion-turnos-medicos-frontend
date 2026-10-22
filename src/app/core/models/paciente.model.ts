/** Paciente tal como lo devuelve la busqueda (operador / medico / admin). */
export interface Paciente {
  id: number;
  nombre: string;
  apellido: string;
  dni: string;
  email: string;
  telefono: string | null;
  fecha_nacimiento: string;
  id_cobertura: number | null;
  cobertura: string | null;
}

/** Datos que el paciente puede editar de si mismo. */
export interface MisDatosRequest {
  email: string;
  telefono: string;
  id_cobertura: number;
  password?: string;
}
