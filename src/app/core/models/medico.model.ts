import { Especialidad } from './especialidad.model';

/** Medico con sus especialidades (sin otros datos personales). */
export interface Medico {
  id: number;
  nombre: string;
  apellido: string;
  especialidades: Especialidad[];
}
