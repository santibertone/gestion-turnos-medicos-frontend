import { Component, computed, inject, signal } from '@angular/core';
import { forkJoin } from 'rxjs';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { BaseChartDirective } from 'ng2-charts';
import { ChartData } from 'chart.js';

import { ReporteService } from '../../../core/services/reporte.service';
import {
  RankingMedico,
  TasaCancelacion,
  TurnosPorEspecialidad,
  TurnosPorSede,
} from '../../../core/models/reporte.model';
import { Cargando } from '../../../shared/ui/cargando';
import { SinDatos } from '../../../shared/ui/sin-datos';
import { aFechaISO } from '../../../core/utils/fechas';

/** Dashboard de reportes y estadisticas (rol administrador). */
@Component({
  selector: 'app-reportes',
  imports: [
    MatCardModule, MatTableModule, MatFormFieldModule, MatInputModule,
    MatDatepickerModule, MatButtonModule, MatIconModule, BaseChartDirective,
    Cargando, SinDatos,
  ],
  templateUrl: './reportes.html',
  styleUrl: './reportes.scss',
})
export class Reportes {
  private readonly reporteService = inject(ReporteService);

  readonly cargando = signal(true);
  readonly desde = signal<Date | null>(null);
  readonly hasta = signal<Date | null>(null);

  readonly porEspecialidad = signal<TurnosPorEspecialidad[]>([]);
  readonly porSede = signal<TurnosPorSede[]>([]);
  readonly ranking = signal<RankingMedico[]>([]);
  readonly tasa = signal<TasaCancelacion | null>(null);
  readonly columnasRanking = ['medico', 'turnos'];

  // Grafico de barras: turnos por especialidad.
  readonly barData = computed<ChartData<'bar'>>(() => ({
    labels: this.porEspecialidad().map((e) => e.especialidad),
    datasets: [
      {
        data: this.porEspecialidad().map((e) => Number(e.cantidad_turnos)),
        label: 'Turnos',
        backgroundColor: '#1565c0',
        borderRadius: 6,
      },
    ],
  }));

  // Grafico de torta: turnos por sede.
  readonly pieData = computed<ChartData<'doughnut'>>(() => ({
    labels: this.porSede().map((s) => s.sede),
    datasets: [
      {
        data: this.porSede().map((s) => Number(s.cantidad_turnos)),
        backgroundColor: ['#1565c0', '#42a5f5', '#90caf9', '#0d47a1', '#64b5f6'],
      },
    ],
  }));

  readonly opciones = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: { y: { beginAtZero: true, ticks: { precision: 0 } } },
  };
  readonly opcionesTorta = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'bottom' as const } },
  };

  readonly hayDatos = computed(
    () => this.porEspecialidad().length > 0 || this.porSede().length > 0 || this.ranking().length > 0,
  );

  constructor() {
    this.cargar();
  }

  cargar(): void {
    this.cargando.set(true);
    const rango = {
      desde: this.desde() ? aFechaISO(this.desde()!) : undefined,
      hasta: this.hasta() ? aFechaISO(this.hasta()!) : undefined,
    };
    forkJoin({
      esp: this.reporteService.turnosPorEspecialidad(rango),
      sede: this.reporteService.turnosPorSede(rango),
      ranking: this.reporteService.rankingMedicos(rango),
      tasa: this.reporteService.tasaCancelacion(rango),
    }).subscribe({
      next: (r) => {
        this.porEspecialidad.set(r.esp.datos ?? []);
        this.porSede.set(r.sede.datos ?? []);
        this.ranking.set(r.ranking.datos ?? []);
        this.tasa.set(r.tasa.datos);
        this.cargando.set(false);
      },
      error: () => this.cargando.set(false),
    });
  }

  limpiar(): void {
    this.desde.set(null);
    this.hasta.set(null);
    this.cargar();
  }
}
