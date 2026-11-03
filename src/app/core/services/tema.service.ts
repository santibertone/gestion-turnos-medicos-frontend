import { Injectable, signal } from '@angular/core';

const CLAVE = 'turnos_tema';

/**
 * Maneja el tema visual (oscuro / claro). Por defecto oscuro.
 * Aplica/quita la clase `tema-claro` en <html> y persiste la eleccion.
 */
@Injectable({ providedIn: 'root' })
export class TemaService {
  readonly oscuro = signal<boolean>(this.leerPreferencia());

  constructor() {
    this.aplicar(this.oscuro());
  }

  alternar(): void {
    const nuevo = !this.oscuro();
    this.oscuro.set(nuevo);
    localStorage.setItem(CLAVE, nuevo ? 'oscuro' : 'claro');
    this.aplicar(nuevo);
  }

  private leerPreferencia(): boolean {
    const guardado = localStorage.getItem(CLAVE);
    // Sin preferencia guardada => oscuro por defecto.
    return guardado ? guardado === 'oscuro' : true;
  }

  private aplicar(oscuro: boolean): void {
    document.documentElement.classList.toggle('tema-claro', !oscuro);
  }
}
