/** Notificacion interna de un usuario. */
export interface Notificacion {
  id: number;
  tipo: string;
  mensaje: string;
  leida: 0 | 1;
  fecha: string;
}
