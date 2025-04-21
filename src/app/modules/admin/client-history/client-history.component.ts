import { CurrencyPipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, inject, OnInit, signal, ViewChild } from '@angular/core';
import { AuthService } from 'app/core/auth/auth.service';
import { CustomCurrencyPipe } from 'app/pipes/custom-currency.pipe';
import { ConfirmationService } from 'app/services/confirmation.service';
import { SnackbarService } from 'app/services/snackbar.service';
import { MatInputModule } from '@angular/material/input';
import { environment } from 'app/environments/environment';
import { catchError } from 'rxjs';
import { ApiResponse } from 'app/core/api/api-response.types';
import { MatButtonModule } from '@angular/material/button';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { CustomDatePipe } from 'app/pipes/custom-date.pipe';
import { MatDialog } from '@angular/material/dialog';
import { ClientHistoryModalComponent } from './client-history-modal/client-history-modal.component';


@Component({
    selector: 'app-client-history',
    templateUrl: './client-history.component.html',
    styleUrls: ['./client-history.component.css'],
    providers: [
        CurrencyPipe,
        CustomCurrencyPipe,
        CustomDatePipe
    ],
    imports: [
        MatInputModule,
        MatButtonModule,
        MatTableModule,
        MatSortModule,
        MatSort,
        MatPaginator,
        CustomCurrencyPipe
    ]
})

export class ClientHistoryComponent implements OnInit {

    private readonly _httpClient = inject(HttpClient)
    private readonly _authService = inject(AuthService)


    showClearButton = signal(false);
    selectedClient = signal(null);
    clientDataSource = signal(new MatTableDataSource([]));
    noClientFound = signal(false);


    displayedColumns = [
        "Nome",
        "CPF",
        "Saldo",
        "Historico",
    ]

    @ViewChild('nameInput', { static: false }) nameInput: ElementRef;
    @ViewChild('cpfInput', { static: false }) cpfInput: ElementRef;
    @ViewChild(MatPaginator, { static: false }) paginator!: MatPaginator;
    @ViewChild(MatSort, { static: false }) sort!: MatSort;

    constructor(
        private readonly snackbar: SnackbarService,
        private readonly confirmationService: ConfirmationService,
        private readonly dialog: MatDialog,
    ) { }

    ngOnInit(): void {
        // Set default sort to 'Data' column in descending order
        if (this.sort) {
            this.sort.active = 'nome';
            this.sort.direction = 'desc';
        }
    }
    handleNameInput(event: InputEvent) {

        this.noClientFound.set(false)

        const input = event.target as HTMLInputElement;
        if (input.value.length >= 4) {
            // this.inputDisabled.set(true);
            // TODO : Move this to an API service
            this._httpClient.get(`${environment.API_URL}clientes/getclientesbynome/${input.value}`, {
                headers: {
                    "Authorization": `Bearer ${this._authService.accessToken}`
                }
            })
                .pipe(catchError((error) => {
                    console.log(error);
                    throw error;
                }))
                // TODO : Create datatype for Client
                .subscribe((data: ApiResponse<Array<{ id: string, nome: string }>>) => {
                    if (data.result) {
                        const dataSource = new MatTableDataSource(data.result);

                        // Set default sort to 'Data' column in descending order
                        if (this.sort) {
                            this.sort.active = 'nome';
                            this.sort.direction = 'asc';
                        }

                        // Set the paginator and sort
                        dataSource.paginator = this.paginator;
                        dataSource.sort = this.sort;
                        // Update the signal
                        this.clientDataSource.set(dataSource);

                    }
                    this.showClearButton.set(true)
                });

        } else {
            this.showClearButton.set(false)
        }
    }


    applyFilter(event: Event) {

        const filterValue = (event.target as HTMLInputElement).value;
        this.clientDataSource().filter = filterValue.trim().toLowerCase();


    }

    handleCpfInput(event: InputEvent) {

        this.noClientFound.set(false)

        const input = event.target as HTMLInputElement;
        if (input.value.length >= 4) {

            this._httpClient.get(`${environment.API_URL}clientes/getclientesbycpf/${input.value}`, {
                headers: {
                    "Authorization": `Bearer ${this._authService.accessToken}`
                }
            })
                .pipe(catchError((error) => {
                    console.log(error);
                    throw error;
                }))
                .subscribe((data: ApiResponse<Array<{ id: string, nome: string }>>) => {
                    if (data.success) {
                        const dataSource = new MatTableDataSource(data.result);

                        // Set default sort to 'Data' column in descending order
                        if (this.sort) {
                            this.sort.active = 'nome';
                            this.sort.direction = 'asc';
                        }

                        console.log(data.result);

                        dataSource.sortingDataAccessor = (item: any, property) => {
                            switch (property) {
                                case 'Nome':
                                    return item.nome;
                                case 'CPF':
                                    return item.cpf;
                                case 'Saldo':
                                    return item.saldo;
                                default:
                                    return item[property];
                            }
                        };

                        // Set the paginator and sort
                        dataSource.paginator = this.paginator;
                        dataSource.sort = this.sort;
                        // Update the signal
                        this.clientDataSource.set(dataSource);
                    }
                    this.showClearButton.set(true)
                });

        } else {
            this.showClearButton.set(false)
        }
    }

    clearInputs() {
        this.showClearButton.set(false);
        this.selectedClient.set(null);
        this.clientDataSource.set(new MatTableDataSource([]));
        this.noClientFound.set(false);


        this.cpfInput.nativeElement.value = '';
        this.nameInput.nativeElement.value = '';
    }



    showHistorico(client) {
        const dialogRef = this.dialog.open(ClientHistoryModalComponent, {
            data: client,
            width: "98%",
            height: "98%",
        })

        dialogRef.afterClosed().subscribe(result => {
           this.clearInputs();
        });

    }


}
