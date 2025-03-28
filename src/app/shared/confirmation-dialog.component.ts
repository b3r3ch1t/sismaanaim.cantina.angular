// confirmation-dialog.component.ts
import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogContent, MatDialogActions, MatDialogModule } from '@angular/material/dialog';
import { MatButton, MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-confirmation-dialog',
  template: `
    <h2 mat-dialog-title>{{ data.title }}</h2>
    <mat-dialog-content [innerHTML]="data.message"></mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button [mat-dialog-close]="false">Cancelar</button>
      <button mat-raised-button color="primary" [mat-dialog-close]="true">Confirmar</button>
    </mat-dialog-actions>
  `,
    imports : [
        MatDialogContent,
        MatDialogActions,
        MatDialogModule,
        MatButton,
        MatButtonModule
    ]
})
export class ConfirmationDialogComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { title: string; message: string },
    public dialogRef: MatDialogRef<ConfirmationDialogComponent>
  ) {}
}