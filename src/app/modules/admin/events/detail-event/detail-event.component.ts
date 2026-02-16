import { DatePipe } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { SummaryComponent } from '../../summary/summary.component';
import { SummaryByEventComponent } from '../../summaryByEvent/summary-by-event.component';

@Component({
    selector: 'app-detail-event',
    imports: [
        SummaryComponent,
        SummaryByEventComponent,
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


    }

    closeDialog() {
        this.dialogRef.close();
    }

}
