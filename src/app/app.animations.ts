import { animate, query, style, transition, trigger } from '@angular/animations';

/**
 * Transicion entre rutas: fundido suave de la pantalla entrante.
 * Es solo opacidad (sin desplazamiento) para que no haya saltos de layout:
 * la pantalla saliente se quita al instante y la nueva aparece con fade-in.
 */
export const routeAnimations = trigger('routeAnimations', [
  transition('* <=> *', [
    query(':enter', [style({ opacity: 0 })], { optional: true }),
    query(
      ':enter',
      [animate('220ms ease-out', style({ opacity: 1 }))],
      { optional: true },
    ),
  ]),
]);
