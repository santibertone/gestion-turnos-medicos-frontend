/** Roles posibles en el sistema (coinciden con los del backend). */
export type Rol = 'admin' | 'medico' | 'operador' | 'paciente';

/** Datos del usuario logueado que devuelve GET /auth/perfil. */
export interface Usuario {
  id: number;
  nombre: string;
  apellido: string;
  dni: string;
  email: string;
  telefono: string | null;
  fecha_nacimiento: string;
  rol: Rol;
  id_sede: number | null;
  id_cobertura: number | null;
}

/** Etiquetas legibles para mostrar el rol en la interfaz. */
export const ROL_LABEL: Record<Rol, string> = {
  admin: 'Administrador',
  medico: 'Medico',
  operador: 'Operador',
  paciente: 'Paciente',
};
