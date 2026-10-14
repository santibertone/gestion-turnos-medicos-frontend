import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

/** Pantalla para rutas inexistentes (comodin **). */
@Component({
  selector: 'app-no-encontrada',
  imports: [RouterLink, MatButtonModule, MatIconModule],
  templateUrl: './no-encontrada.html',
  styleUrl: './estado.scss',
})
export class NoEncontrada {}
