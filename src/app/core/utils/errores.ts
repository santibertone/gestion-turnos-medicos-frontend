import { HttpErrorResponse } from '@angular/common/http';

/**
 * Extrae un mensaje legible de un error HTTP.
 * El backend responde los errores con { codigo, estado, datos }, donde "estado"
 * trae el texto descriptivo. Si no hay respuesta (p. ej. backend caido), se
 * devuelve un mensaje generico.
 */
export function mensajeError(error: unknown): string {
  if (error instanceof HttpErrorResponse) {
    const estado = error.error?.estado;
    if (typeof estado === 'string' && estado.trim()) {
      return estado;
    }
    if (error.status === 0) {
      return 'No se pudo conectar con el servidor. Verifica que el backend este encendido.';
    }
  }
  return 'Ocurrio un error inesperado. Intenta nuevamente.';
}
