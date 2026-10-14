import { Rol } from '../core/models/usuario.model';

/** Una opcion del menu de navegacion. */
export interface NavItem {
  label: string;
  icon: string;
  ruta: string;
}

/**
 * Opciones del menu segun el rol del usuario logueado.
 * Varias apuntan a secciones que se completan en semanas futuras: por ahora
 * muestran una pantalla "En construccion", pero ya quedan visibles y protegidas
 * por rol.
 */
export const NAV_POR_ROL: Record<Rol, NavItem[]> = {
  paciente: [
    { label: 'Inicio', icon: 'home', ruta: '/' },
    { label: 'Mi perfil', icon: 'account_circle', ruta: '/perfil' },
    { label: 'Sacar turno', icon: 'event_available', ruta: '/paciente/turnos/nuevo' },
    { label: 'Mis turnos', icon: 'event_note', ruta: '/paciente/turnos' },
  ],
  medico: [
    { label: 'Inicio', icon: 'home', ruta: '/' },
    { label: 'Mi perfil', icon: 'account_circle', ruta: '/perfil' },
    { label: 'Mi agenda', icon: 'calendar_month', ruta: '/medico/agenda' },
    { label: 'Turnos del dia', icon: 'event', ruta: '/medico/turnos' },
  ],
  operador: [
    { label: 'Inicio', icon: 'home', ruta: '/' },
    { label: 'Mi perfil', icon: 'account_circle', ruta: '/perfil' },
    { label: 'Agenda medica', icon: 'calendar_month', ruta: '/operador/agenda' },
    { label: 'Turnos', icon: 'event', ruta: '/operador/turnos' },
    { label: 'Pacientes', icon: 'groups', ruta: '/operador/pacientes' },
  ],
  admin: [
    { label: 'Inicio', icon: 'home', ruta: '/' },
    { label: 'Mi perfil', icon: 'account_circle', ruta: '/perfil' },
    { label: 'Coberturas', icon: 'health_and_safety', ruta: '/admin/coberturas' },
    { label: 'Sedes', icon: 'business', ruta: '/admin/sedes' },
    { label: 'Especialidades', icon: 'medical_services', ruta: '/admin/especialidades' },
    { label: 'Reportes', icon: 'bar_chart', ruta: '/admin/reportes' },
    { label: 'Auditoria', icon: 'fact_check', ruta: '/admin/auditoria' },
  ],
};
