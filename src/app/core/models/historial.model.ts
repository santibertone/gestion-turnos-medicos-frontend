/** Registro de historial clinico de un turno atendido. */
export interface Historial {
  id: number;
  id_turno: number;
  diagnostico: string;
  tratamiento: string | null;
  observaciones: string | null;
  fecha_registro: string;
  id_medico: number;
  medico_apellido: string;
  medico_nombre: string;
  id_paciente: number;
  paciente_apellido: string;
  paciente_nombre: string;
  turno_fecha: string;
  turno_hora: string;
}

/** Datos para registrar el historial de un turno atendido. */
export interface HistorialRequest {
  id_turno: number;
  diagnostico: string;
  tratamiento?: string;
  observaciones?: string;
}
