import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

/** Pantalla placeholder para funciones que se desarrollan en semanas futuras. */
@Component({
  selector: 'app-en-construccion',
  imports: [RouterLink, MatButtonModule, MatIconModule],
  templateUrl: './en-construccion.html',
  styleUrl: './estado.scss',
})
export class EnConstruccion {
  /** Titulo de la seccion (viene de data.titulo en la ruta). */
  readonly titulo = inject(ActivatedRoute).snapshot.data['titulo'] ?? 'Seccion';
}
