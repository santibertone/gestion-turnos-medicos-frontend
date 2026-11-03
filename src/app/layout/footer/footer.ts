import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

/** Pie de pagina con los datos de contacto de la clinica. */
@Component({
  selector: 'app-footer',
  imports: [MatIconModule],
  templateUrl: './footer.html',
  styleUrl: './footer.scss',
})
export class Footer {
  readonly anio = new Date().getFullYear();
}
