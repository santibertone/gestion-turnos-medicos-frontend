import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

/** Se muestra cuando un usuario intenta entrar a una seccion de otro rol. */
@Component({
  selector: 'app-acceso-denegado',
  imports: [RouterLink, MatButtonModule, MatIconModule],
  templateUrl: './acceso-denegado.html',
  styleUrl: './estado.scss',
})
export class AccesoDenegado {}
