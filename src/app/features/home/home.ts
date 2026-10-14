import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';

import { AuthService } from '../../core/services/auth.service';
import { ROL_LABEL } from '../../core/models/usuario.model';

/** Pantalla principal: cambia segun haya o no sesion iniciada. */
@Component({
  selector: 'app-home',
  imports: [RouterLink, MatButtonModule, MatIconModule, MatCardModule],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {
  private readonly auth = inject(AuthService);

  readonly isAuthenticated = this.auth.isAuthenticated;
  readonly usuario = this.auth.usuario;
  readonly rol = this.auth.rol;
  readonly rolLabel = ROL_LABEL;

  /** Funcionalidades que se le explican a un paciente registrado. */
  readonly funcionalidades = [
    {
      icon: 'event_available',
      titulo: 'Sacar turnos',
      texto: 'Reserva turnos con el especialista que necesites, segun la agenda disponible.',
    },
    {
      icon: 'event_note',
      titulo: 'Gestionar tus turnos',
      texto: 'Consulta tus proximos turnos y cancela los que ya no necesites.',
    },
    {
      icon: 'health_and_safety',
      titulo: 'Tu cobertura',
      texto: 'Registra tu obra social o prepaga para agilizar la atencion.',
    },
    {
      icon: 'account_circle',
      titulo: 'Tu perfil',
      texto: 'Accede a tus datos personales desde cualquier dispositivo.',
    },
  ];
}
