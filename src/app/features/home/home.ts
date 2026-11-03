import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';

import { AuthService } from '../../core/services/auth.service';
import { ROL_LABEL } from '../../core/models/usuario.model';
import { NAV_POR_ROL } from '../../layout/navigation';

/** Pantalla principal: landing sin sesion / dashboard con accesos al iniciar. */
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

  /** Descripcion breve de cada funcion, para las tarjetas del dashboard. */
  private readonly descripciones: Record<string, string> = {
    '/perfil': 'Consulta tus datos personales',
    '/paciente/turnos/nuevo': 'Solicita un turno paso a paso con el especialista que necesites',
    '/paciente/turnos': 'Consulta el estado de tus turnos y cancela los que no necesites',
    '/paciente/mis-datos': 'Actualiza tu email, telefono, cobertura y contrasena',
    '/medico/agenda': 'Carga y edita tus rangos horarios de atencion',
    '/medico/turnos': 'Atende, cancela y registra el historial de tus turnos',
    '/medico/historial': 'Busca un paciente y consulta el historial que le registraste',
    '/operador/agenda': 'Gestiona la agenda y los turnos de tu sede',
    '/operador/turnos': 'Busca un paciente y asignale un turno',
    '/operador/pacientes': 'Da de alta nuevos pacientes',
    '/admin/usuarios': 'Crea y edita usuarios del sistema',
    '/admin/sedes': 'Administra las sedes de la clinica',
    '/admin/especialidades': 'Administra las especialidades medicas',
    '/admin/coberturas': 'Administra obras sociales y prepagas',
    '/admin/reportes': 'Estadisticas e indicadores de la clinica',
    '/admin/auditoria': 'Registro de acciones sensibles del sistema',
  };

  /** Accesos directos del rol (todas las opciones del menu menos "Inicio"). */
  readonly accesos = computed(() => {
    const r = this.rol();
    if (!r) return [];
    return NAV_POR_ROL[r]
      .filter((item) => item.ruta !== '/')
      .map((item) => ({ ...item, descripcion: this.descripciones[item.ruta] ?? '' }));
  });

  /** Funcionalidades que se le explican a un paciente sin sesion. */
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
