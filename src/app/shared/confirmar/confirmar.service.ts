import { Injectable, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Observable, map } from 'rxjs';

import { ConfirmarData, ConfirmarDialog } from './confirmar-dialog';

/** Abre el dialogo de confirmacion y emite true/false segun la eleccion. */
@Injectable({ providedIn: 'root' })
export class ConfirmarService {
  private readonly dialog = inject(MatDialog);

  confirmar(data: ConfirmarData): Observable<boolean> {
    return this.dialog
      .open(ConfirmarDialog, { data, width: '440px', autoFocus: false })
      .afterClosed()
      .pipe(map((resultado) => resultado === true));
  }
}
