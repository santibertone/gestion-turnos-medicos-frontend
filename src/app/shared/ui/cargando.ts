import { Component } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

/** Indicador de carga centrado, para usar mientras se espera al backend. */
@Component({
  selector: 'app-cargando',
  imports: [MatProgressSpinnerModule],
  template: `<div class="cargando"><mat-spinner diameter="42" /></div>`,
  styles: [`.cargando { display: flex; justify-content: center; padding: 3rem; }`],
})
export class Cargando {}
