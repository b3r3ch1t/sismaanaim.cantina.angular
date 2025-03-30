import { DatePipe } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';

@Component({
    selector: 'app-detail-event',
    imports: [

        MatDialogModule,
        DatePipe
    ],
    providers: [DatePipe],
    templateUrl: './detail-event.component.html',
    styleUrl: './detail-event.component.scss'
})
export class DetailEventComponent {

    evento: any;

    constructor(
        private readonly dialogRef: MatDialogRef<DetailEventComponent>,

        @Inject(MAT_DIALOG_DATA) public data: any

    ) {
        this.evento = data;

        console.log(this.evento);

    }

    closeDialog() {
        this.dialogRef.close();
    }

}
