/** Rango horario de la agenda de un medico (incluye nombres resueltos). */
export interface Agenda {
  id: number;
  hora_entrada: string;
  hora_salida: string;
  fecha: string;
  id_medico: number;
  medico_apellido: string;
  medico_nombre: string;
  id_especialidad: number;
  especialidad: string;
  id_sede: number;
  sede: string;
}

/** Datos para dar de alta o modificar un rango horario de agenda. */
export interface AgendaRequest {
  hora_entrada: string;
  hora_salida: string;
  fecha: string;
  id_medico: number;
  id_especialidad: number;
  id_sede: number;
}
