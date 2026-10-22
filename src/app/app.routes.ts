import { Routes } from '@angular/router';

import { authGuard } from './core/guards/auth.guard';
import { rolGuard } from './core/guards/rol.guard';

/**
 * Rutas de la aplicacion.
 *  - Publicas: inicio, login, registro.
 *  - Protegidas por sesion: mi perfil.
 *  - Secciones propias de cada rol (/admin, /medico, /operador, /paciente),
 *    protegidas por rol. Las funciones de semanas futuras muestran "En construccion".
 *  - Comodin (**): pagina "No encontrada".
 */
export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/home/home').then((m) => m.Home),
  },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login').then((m) => m.Login),
  },
  {
    path: 'registro',
    loadComponent: () => import('./features/auth/registro/registro').then((m) => m.Registro),
  },
  {
    path: 'perfil',
    canActivate: [authGuard],
    loadComponent: () => import('./features/perfil/perfil').then((m) => m.Perfil),
  },

  // --- Seccion PACIENTE -----------------------------------------------------
  {
    path: 'paciente',
    canActivate: [rolGuard],
    data: { roles: ['paciente'] },
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'turnos' },
      {
        path: 'turnos',
        data: { titulo: 'Mis turnos' },
        loadComponent: () =>
          import('./features/errores/en-construccion').then((m) => m.EnConstruccion),
      },
      {
        path: 'turnos/nuevo',
        data: { titulo: 'Sacar turno' },
        loadComponent: () =>
          import('./features/errores/en-construccion').then((m) => m.EnConstruccion),
      },
    ],
  },

  // --- Seccion MEDICO -------------------------------------------------------
  {
    path: 'medico',
    canActivate: [rolGuard],
    data: { roles: ['medico'] },
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'agenda' },
      {
        path: 'agenda',
        loadComponent: () => import('./features/medico/agenda/agenda').then((m) => m.MedicoAgenda),
      },
      {
        path: 'turnos',
        loadComponent: () => import('./features/medico/turnos/turnos').then((m) => m.MedicoTurnos),
      },
      {
        path: 'historial',
        loadComponent: () =>
          import('./features/medico/historial/historial').then((m) => m.MedicoHistorial),
      },
    ],
  },

  // --- Seccion OPERADOR -----------------------------------------------------
  {
    path: 'operador',
    canActivate: [rolGuard],
    data: { roles: ['operador'] },
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'agenda' },
      {
        path: 'agenda',
        data: { titulo: 'Agenda medica' },
        loadComponent: () =>
          import('./features/errores/en-construccion').then((m) => m.EnConstruccion),
      },
      {
        path: 'turnos',
        data: { titulo: 'Turnos' },
        loadComponent: () =>
          import('./features/errores/en-construccion').then((m) => m.EnConstruccion),
      },
      {
        path: 'pacientes',
        data: { titulo: 'Pacientes' },
        loadComponent: () =>
          import('./features/errores/en-construccion').then((m) => m.EnConstruccion),
      },
    ],
  },

  // --- Seccion ADMIN --------------------------------------------------------
  {
    path: 'admin',
    canActivate: [rolGuard],
    data: { roles: ['admin'] },
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'usuarios' },
      {
        path: 'usuarios',
        loadComponent: () => import('./features/admin/usuarios/usuarios').then((m) => m.Usuarios),
      },
      {
        path: 'sedes',
        loadComponent: () => import('./features/admin/sedes/sedes').then((m) => m.Sedes),
      },
      {
        path: 'especialidades',
        loadComponent: () =>
          import('./features/admin/especialidades/especialidades').then((m) => m.Especialidades),
      },
      {
        path: 'coberturas',
        loadComponent: () =>
          import('./features/admin/coberturas/coberturas').then((m) => m.Coberturas),
      },
      {
        path: 'reportes',
        loadComponent: () => import('./features/admin/reportes/reportes').then((m) => m.Reportes),
      },
      {
        path: 'auditoria',
        loadComponent: () => import('./features/admin/auditoria/auditoria').then((m) => m.Auditoria),
      },
    ],
  },

  // --- Paginas de estado ----------------------------------------------------
  {
    path: 'acceso-denegado',
    loadComponent: () =>
      import('./features/errores/acceso-denegado').then((m) => m.AccesoDenegado),
  },
  {
    path: '**',
    loadComponent: () => import('./features/errores/no-encontrada').then((m) => m.NoEncontrada),
  },
];
