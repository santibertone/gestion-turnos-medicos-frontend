import { Rol } from './usuario.model';

/** Cuerpo del POST /auth/login. */
export interface LoginRequest {
  dni: string;
  password: string;
}

/** Datos que devuelve POST /auth/login. */
export interface LoginResponse {
  token: string;
}

/** Cuerpo del POST /auth/registro (alta de paciente). */
export interface RegistroRequest {
  nombre: string;
  apellido: string;
  dni: string;
  email: string;
  password: string;
  fecha_nacimiento: string;
  id_cobertura: number;
  telefono?: string;
}

/** Datos que devuelve POST /auth/registro. */
export interface RegistroResponse {
  id: number;
  rol: Rol;
}
