import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class SnackbarService {
  constructor(private snackBar: MatSnackBar) {}

  success(message: string, duration: number = 3000) {
    this.snackBar.open(message, 'Fechar', {
      duration,
      horizontalPosition: 'right',
      verticalPosition: 'top',
      panelClass: ['success-snackbar']
    });
  }

  error(message: string, duration: number = 3000) {
    this.snackBar.open(message, 'Fechar', {
      duration,
      horizontalPosition: 'right',
      verticalPosition: 'top',
      panelClass: ['error-snackbar']
    });
  }

  info(message: string, duration: number = 3000) {
    this.snackBar.open(message, 'Fechar', {
      duration,
      horizontalPosition: 'right',
      verticalPosition: 'top'
    });
  }
}