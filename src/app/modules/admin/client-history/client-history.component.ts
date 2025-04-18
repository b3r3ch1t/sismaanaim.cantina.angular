import { CurrencyPipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, inject, OnInit, signal, ViewChild } from '@angular/core';
import { AuthService } from 'app/core/auth/auth.service';
import { UserService } from 'app/core/user/user.service';
import { CustomCurrencyPipe } from 'app/pipes/custom-currency.pipe';
import { ConfirmationService } from 'app/services/confirmation.service';
import { SnackbarService } from 'app/services/snackbar.service';
import { MatInputModule } from '@angular/material/input';
import { environment } from 'app/environments/environment';
import { catchError } from 'rxjs';
import { ApiResponse } from 'app/core/api/api-response.types';
import { MatButtonModule } from '@angular/material/button';
import { MatTable, MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { CustomDatePipe } from 'app/pipes/custom-date.pipe';


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
        CustomDatePipe,
        CustomCurrencyPipe
    ]
})

export class ClientHistoryComponent implements OnInit {

    private readonly _httpClient = inject(HttpClient)
    private readonly _authService = inject(AuthService)
    private readonly _userService = inject(UserService);
    private readonly _customCurrencyPipe = inject(CustomCurrencyPipe)

    clients = signal([]);
    showClearButton = signal(false);
    selectedClient = signal(null);
    clientDataSource = signal(new MatTableDataSource([]));
    noClientFound = signal(false)

    displayedColumns = [
        "Data",
        "Tipo",
        "Valor",
        "Pagamento",
        "Responsável",
        "Transação",
        "Evento",
    ]

    @ViewChild('nameInput', { static: true }) nameInput: ElementRef;
    @ViewChild('cpfInput', { static: true }) cpfInput: ElementRef;
    @ViewChild(MatPaginator, { static: false }) paginator!: MatPaginator;
    @ViewChild(MatSort, { static: false }) sort!: MatSort;

    constructor(
        private readonly snackbar: SnackbarService,
        private readonly confirmationService: ConfirmationService
    ) { }

    ngOnInit(): void {
        // Set default sort to 'Data' column in descending order
        if (this.sort) {
            this.sort.active = 'Data';
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
                        const clients = data.result
                        this.clients.set(clients)

                        this.clients().length === 1 ? this.selectedClient.set(this.clients()[0]) : this.selectedClient.set(null)

                        if (!this.clients().length) {
                            this.noClientFound.set(true)
                        }

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
            // this.inputDisabled.set(true);

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
                        const clients = data.result
                        this.clients.set(clients)

                        this.clients().length === 1 ? this.selectedClient.set(this.clients()[0]) : this.selectedClient.set(null)

                        if (!this.clients().length) {
                            this.noClientFound.set(true)
                        }
                    }
                    this.showClearButton.set(true)
                });

        } else {
            this.showClearButton.set(false)
        }
    }

    clearInputs() {
        this.showClearButton.set(false)
        this.clients.set([])
        this.selectedClient.set(null)
    }

    handleClientSelection(clientId: string) {
        if (clientId) {
            this._httpClient.get(`${environment.API_URL}clientes/getclientebyid/${clientId}`, {
                headers: {
                    "Authorization": `Bearer ${this._authService.accessToken}`
                }
            })
                .pipe(catchError((error) => {
                    console.log(error);
                    throw error;
                }))
                // TODO : Create a datatype for Client
                // TODO : Move this to an API service
                .subscribe((data: ApiResponse<object>) => {
                    console.log(data)
                    if (data.success) {
                        this.selectedClient.set(data.result)
                        console.log(this.selectedClient())
                        this.updateHistoryTable()
                    }
                });
        }
    }


    updateHistoryTable() {
        if (this.selectedClient() != null) {
            const clientId = this.selectedClient().id
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
    }
}
