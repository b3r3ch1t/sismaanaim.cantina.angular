import { CurrencyPipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, inject, Inject, OnInit, signal, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInput, MatInputModule } from '@angular/material/input';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { ApiResponse } from 'app/core/api/api-response.types';
import { AuthService } from 'app/core/auth/auth.service';
import { environment } from 'app/environments/environment';
import { CustomCurrencyPipe } from 'app/pipes/custom-currency.pipe';
import { CustomDatePipe } from 'app/pipes/custom-date.pipe';
import { catchError } from 'rxjs';

@Component({
    selector: 'app-client-history-modal',
    imports: [
        MatDialogModule,
        CustomCurrencyPipe,
        MatFormFieldModule,
        MatTableModule,
        MatSortModule,
        MatSort,
        MatPaginator,
        MatInputModule,
        CustomDatePipe
    ],
    providers: [
        CurrencyPipe,
        CustomCurrencyPipe,
        CustomDatePipe
    ],
    templateUrl: './client-history-modal.component.html',
    styleUrl: './client-history-modal.component.scss'
})
export class ClientHistoryModalComponent implements OnInit {


    cliente: any;
    private readonly _httpClient = inject(HttpClient)
    private readonly _authService = inject(AuthService)
    clientDataSource = signal(new MatTableDataSource([]));

    displayedColumns = [
        "Data",
        "Tipo",
        "Valor",
        "Pagamento",
        "Responsável",
        "Transação",
        "Evento"
    ]


    @ViewChild(MatPaginator, { static: false }) paginator!: MatPaginator;
    @ViewChild(MatSort, { static: false }) sort!: MatSort;

    constructor(
        private readonly dialogRef: MatDialogRef<ClientHistoryModalComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any,
    ) {
        this.cliente = data;
    }
    ngOnInit() {
        this.fetchHistory();
    }

    closeDialog() {
        this.dialogRef.close();
    }

    fetchHistory() {

        const clientId = this.cliente.id
        this._httpClient.get(`${environment.API_URL}clientes/getclienthistorybyclientid/${clientId}`, {
            headers: {
                "Authorization": `Bearer ${this._authService.accessToken}`
            }
        }).pipe(catchError((error) => {
            console.log(error)
            throw error
        })).subscribe((response: ApiResponse<any>) => {
            if (response.success) {
                console.log(response.result)
                // Create a new MatTableDataSource instance
                const dataSource = new MatTableDataSource(response.result);

                if (dataSource) {
                    dataSource.sortingDataAccessor = (item: any, property) => {
                        switch (property) {
                            case 'Data':
                                return new Date(item.data);  // Return the actual date object for sorting
                            case 'Valor':
                                return Number(item.valor);   // Return the numeric value for sorting
                            default:
                                return item[property];
                        }
                    };
                }

                // Set default sort to 'Data' column in descending order
                if (this.sort) {
                    this.sort.active = 'Data';
                    this.sort.direction = 'desc';
                }

                // Set the paginator and sort
                dataSource.paginator = this.paginator;
                dataSource.sort = this.sort;
                // Update the signal
                this.clientDataSource.set(dataSource);
            }
        })

    }

    applyFilter(event: Event) {

        const filterValue = (event.target as HTMLInputElement).value;
        this.clientDataSource().filter = filterValue.trim().toLowerCase();
    }
    ngAfterViewInit(): void {
        if (this.clientDataSource) {
            this.clientDataSource().paginator = this.paginator;
            this.clientDataSource().sort = this.sort;
        }
    }
}
