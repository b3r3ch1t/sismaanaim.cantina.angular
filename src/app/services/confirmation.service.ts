import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { ConfirmationDialogComponent } from 'app/shared/confirmation-dialog.component';

@Injectable({
    providedIn: 'root'
})
export class ConfirmationService {
    constructor(private dialog: MatDialog) { }

    confirm(title: string, message: string): Observable<boolean> {
        return this.dialog.open(ConfirmationDialogComponent, {
            data: { title, message },
            width: '400px'
        }).afterClosed();
    }
}