/** Registro de auditoria de una accion sensible. */
export interface Auditoria {
  id: number;
  id_usuario: number;
  usuario: string;
  accion: 'ALTA' | 'BAJA' | 'MODIFICACION';
  entidad: string;
  id_entidad: number | null;
  detalle: string;
  fecha: string;
}
