import { CurrencyPipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, inject, Inject, signal, ViewChild } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { ApiResponse } from 'app/core/api/api-response.types';
import { AuthService } from 'app/core/auth/auth.service';
import { environment } from 'app/environments/environment';
import { CustomCurrencyPipe } from 'app/pipes/custom-currency.pipe';
import { CustomDatePipe } from 'app/pipes/custom-date.pipe';
import { ConfirmationService } from 'app/services/confirmation.service';
import { SnackbarService } from 'app/services/snackbar.service';
import { catchError } from 'rxjs';
import { CashierEventDetailComponent } from '../cashier-event-detail/cashier-event-detail-component';
import { EventStatus } from '../event-status.enum';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { HistoryAttendantComponent } from '../../history-attendant/history-attendant.component';

@Component({
    selector: 'app-attendants-event-detail',
    imports: [
        MatDialogModule,
        FormsModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatButtonModule,
        MatInputModule,
        MatCheckboxModule,
        MatTableModule,
        MatSelectModule,
        CustomCurrencyPipe,

        MatTableModule,
        MatPaginator,
        MatSortModule,
    ],
    providers: [
        CurrencyPipe,
        CustomCurrencyPipe,
        CustomDatePipe
    ],
    templateUrl: './attendants-event-detail.component.html',
    styleUrl: './attendants-event-detail.component.scss'
})
export class AttendantsEventDetailComponent {

    private readonly _httpClient = inject(HttpClient)
    private readonly _authService = inject(AuthService)

    @ViewChild(MatPaginator, { static: true }) paginator!: MatPaginator;
    @ViewChild(MatSort, { static: true }) sort!: MatSort;


    public event: any;
    attendants = signal(new MatTableDataSource([]));

    displayedColumns: string[] = ['nome', 'cpf', 'Actions'];
    eventStatus = EventStatus;

    constructor(
        private readonly dialog: MatDialog,
        private readonly dialogRef: MatDialogRef<CashierEventDetailComponent>,
        private readonly snackbarService: SnackbarService,
        private readonly confirmationService: ConfirmationService,

        @Inject(MAT_DIALOG_DATA) public data: any
    ) {
        this.event = data;
        this.fetchAttendantsList();
    }

    ngOnInit(): void {

    }

    closeDialog() {
        this.dialogRef.close();
    }



    attendantDetails(cashier: any) {
        const dialogRef = this.dialog.open(HistoryAttendantComponent, {
            data: cashier,
            width: "95%"
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                // Aqui você pode executar sua lógica após o fechamento
                this.fetchAttendantsList();
            }
        });
    }


    fetchAttendantsList() {
        this._httpClient.get(`${environment.API_URL}atendente/gettodosatendentesbyeventoid/${this.event.id}`, {
            headers: {
                Authorization: 'Bearer ' + this._authService.accessToken
            }
        }).pipe(catchError(error => {
            throw error
        })).subscribe((data: ApiResponse<any>) => {

            if (data.success) {


                const sortedAttendants = data.result.sort((a, b) =>
                    a.nome.localeCompare(b.nome)
                );

                const dataSource = new MatTableDataSource(sortedAttendants)
                if (dataSource) {



                    dataSource.sortingDataAccessor = (item: any, property) => {
                        switch (property) {
                            case 'nome':
                                return item.nome.toLowerCase();
                            case 'cpf':
                                return item.cpf;
                            default:
                                return item[property];
                        }
                    };

                    dataSource.paginator = this.paginator;
                    dataSource.sort = this.sort;
                    this.attendants.set(dataSource);
                }


            }
        })
    }


    applyFilter(event: Event) {
        const filterValue = (event.target as HTMLInputElement).value;
        this.attendants().filter = filterValue.trim().toLowerCase();
    }

}
