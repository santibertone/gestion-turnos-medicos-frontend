/** Indicadores del dashboard de reportes (rol administrador). */

export interface TurnosPorEspecialidad {
  id_especialidad: number;
  especialidad: string;
  cantidad_turnos: number;
}

export interface TurnosPorSede {
  id_sede: number;
  sede: string;
  cantidad_turnos: number;
}

export interface RankingMedico {
  id_medico: number;
  medico: string;
  turnos_atendidos: number;
}

export interface TasaCancelacion {
  total_turnos: number;
  cancelados: number;
  tasa_cancelacion: number;
  porcentaje: string;
}
