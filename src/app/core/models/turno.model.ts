/** Estados posibles de un turno. */
export type EstadoTurno = 'confirmado' | 'cancelado' | 'atendido';

/**
 * Turno. Segun el endpoint que lo devuelve vienen distintos datos resueltos
 * (del medico, del paciente, de la sede), por eso varios campos son opcionales.
 */
export interface Turno {
  id: number;
  fecha: string;
  hora: string;
  nota: string | null;
  estado: EstadoTurno;
  // Datos del medico / especialidad / sede.
  id_medico?: number;
  medico_apellido?: string;
  medico_nombre?: string;
  especialidad?: string;
  id_sede?: number;
  sede?: string;
  // Datos del paciente.
  id_paciente?: number;
  paciente_apellido?: string;
  paciente_nombre?: string;
  paciente_fecha_nacimiento?: string;
}

/** Datos para solicitar un turno. */
export interface TurnoRequest {
  id_especialidad: number;
  id_sede: number;
  id_medico: number;
  fecha: string;
  hora: string;
  nota: string;
  // Solo cuando lo saca un operador en representacion de un paciente.
  id_paciente?: number;
}
