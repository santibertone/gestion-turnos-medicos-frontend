/**
 * Estructura uniforme con la que responde el backend en TODOS los endpoints,
 * tanto en exito como en error: { codigo, estado, datos }.
 *   - codigo: codigo numerico (normalmente el status HTTP).
 *   - estado: "ok" si salio bien, o un mensaje descriptivo si fallo.
 *   - datos:  la informacion solicitada (o null cuando no corresponde).
 */
export interface ApiResponse<T> {
  codigo: number;
  estado: string;
  datos: T;
}
