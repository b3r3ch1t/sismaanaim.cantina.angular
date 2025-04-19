import { CommonModule, CurrencyPipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, inject, OnInit, signal, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortable, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { ApiResponse } from 'app/core/api/api-response.types';
import { AuthService } from 'app/core/auth/auth.service';
import { UserService } from 'app/core/user/user.service';
import { environment } from 'app/environments/environment';
import { CustomCurrencyPipe } from 'app/pipes/custom-currency.pipe';
import { CustomDatePipe } from 'app/pipes/custom-date.pipe';
import { catchError } from 'rxjs';

@Component({
    selector: 'app-client-balance',
    templateUrl: './client-balance.component.html',
    styleUrls: ['./client-balance.component.css'],
    imports: [
        MatInputModule,
        MatButtonModule,
        MatTableModule,
        MatSortModule,
        MatSort,
        MatPaginator,
        MatFormFieldModule,
        CommonModule,
        CustomCurrencyPipe,
        MatPaginatorModule,
    ],
    providers: [
        CurrencyPipe,
        CustomCurrencyPipe,
        CustomDatePipe
    ],
})
export class ClientBalanceComponent implements OnInit {

    private readonly _httpClient = inject(HttpClient)
    private readonly _authService = inject(AuthService)
    private readonly _userService = inject(UserService);
    private readonly _customCurrencyPipe = inject(CustomCurrencyPipe)

    showClearButton = signal(false);
    selectedClient = signal(null);
    // clientBalanceDataSource = signal(new MatTableDataSource([]));
    inputDisabled = signal(false);
    noClientFound = signal(false);

    clientDataSource = new MatTableDataSource([]);

    totalClientBalance = 0;

    displayedColumns = [
        "clienteNome",
        "clienteCPF",
        "saldo"
    ]



    @ViewChild(MatPaginator, { static: false }) paginator!: MatPaginator;
    @ViewChild(MatSort, { static: false }) sort!: MatSort;
    @ViewChild('cpfInput', { static: false }) cpfInput!: ElementRef;

    constructor() { }

    ngOnInit() {
    }

    // ngAfterViewInit() {
    //     const ds = this.clientDataSource;
    //     setTimeout(() => {
    //         ds.paginator = this.paginator;
    //         ds.sort = this.sort;
    //         ds._updateChangeSubscription();
    //     });
    // }

    handleCpfInput(event: InputEvent) {
        this.noClientFound.update(old => false);
        const input = event.target as HTMLInputElement;

        if (input.value.length >= 4) {
            this._httpClient.get(`${environment.API_URL}clientes/getclientesbycpf/${input.value}`, {
                headers: {
                    "Authorization": `Bearer ${this._authService.accessToken}`
                }
            })
                .pipe(catchError((error) => {
                    console.error(error);
                    throw error;
                }))
                .subscribe((data: ApiResponse<Array<any>>) => {
                    if (data.success) {

                        const dataSource = new MatTableDataSource(data.result);


                        if (dataSource) {

                            dataSource.sortingDataAccessor = (item, property) => {
                                switch (property) {
                                    case 'saldo':
                                        return item.saldo;
                                    default:
                                        return item[property];
                                }
                            };

                        }

                        // Set default sort to 'Data' column in descending order
                        if (this.sort) {
                            this.sort.active = 'nome';
                            this.sort.direction = 'desc';
                        }


                        // Set the paginator and sort
                        dataSource.paginator = this.paginator;
                        dataSource.sort = this.sort;


                        this.clientDataSource = dataSource;
                        this.noClientFound.set(data.result.length === 0);


                    } else {
                        this.noClientFound.set(true);
                    }
                    this.showClearButton.set(true);
                });
        }
    }



    clearInputs() {
        this.showClearButton.set(false);
        this.selectedClient.set(null);
        this.inputDisabled.set(false);
        this.noClientFound.set(false);
        this.cpfInput.nativeElement.value = '';
        this.clientDataSource.data = []; // Clear the data source
        this.clientDataSource.filter = ''; // Clear the filter
    }

    applyFilter(event: Event) {

        const filterValue = (event.target as HTMLInputElement).value;
        this.clientDataSource.filter = filterValue.trim().toLowerCase();

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
                .subscribe((data: ApiResponse<any>) => {
                    console.log(data)
                    if (data.success) {
                        this.selectedClient.set(data.result)
                        console.log(this.selectedClient())

                        this.totalClientBalance = data.result.saldo;


                    }
                });
        }
    }


}
