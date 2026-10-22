import { Component, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

/** Mensaje de "sin resultados" para listados vacios (en lugar de una tabla vacia). */
@Component({
  selector: 'app-sin-datos',
  imports: [MatIconModule],
  template: `
    <div class="sin-datos">
      <mat-icon>{{ icono() }}</mat-icon>
      <p>{{ mensaje() }}</p>
    </div>
  `,
  styles: [`
    .sin-datos {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
      padding: 2.5rem 1rem;
      color: var(--mat-sys-on-surface-variant);
      text-align: center;
    }
    .sin-datos mat-icon {
      font-size: 2.5rem;
      width: 2.5rem;
      height: 2.5rem;
      opacity: 0.6;
    }
    .sin-datos p { margin: 0; }
  `],
})
export class SinDatos {
  readonly mensaje = input('No hay resultados para mostrar.');
  readonly icono = input('inbox');
}
