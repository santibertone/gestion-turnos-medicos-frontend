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

/** Usuario tal como lo devuelve el listado de administracion (con nombres resueltos). */
export interface UsuarioAdmin extends Usuario {
  sede?: string | null;
  cobertura?: string | null;
  especialidades?: { id: number; descripcion: string }[];
}

/** Pagina de resultados del listado de usuarios. */
export interface UsuariosPagina {
  total: number;
  pagina: number;
  limite: number;
  usuarios: UsuarioAdmin[];
}

/** Datos para crear un usuario (operador / medico / administrador). */
export interface UsuarioCrear {
  nombre: string;
  apellido: string;
  dni: string;
  email: string;
  password: string;
  fecha_nacimiento: string;
  rol: Rol;
  telefono?: string;
  id_sede?: number | null;
  especialidades?: number[];
}

/** Datos para editar un usuario (incluye pacientes). */
export interface UsuarioEditar {
  nombre: string;
  apellido: string;
  dni: string;
  email: string;
  fecha_nacimiento: string;
  telefono?: string;
  id_sede?: number | null;
  id_cobertura?: number | null;
  password?: string;
  especialidades?: number[];
}
