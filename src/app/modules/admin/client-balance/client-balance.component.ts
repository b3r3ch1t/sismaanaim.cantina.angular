import { CurrencyPipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, inject, OnInit, signal, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
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
        MatSort,
        MatPaginator,
        CustomCurrencyPipe
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
    clientBalanceDataSource = signal(new MatTableDataSource([]));
    inputDisabled = signal(false);
    noClientFound = signal(false);

    clientDataSource = signal(new MatTableDataSource([]));

    totalClientBalance = 0;

    displayedColumns = [
        "Nome",
        "CPF",
        "Saldo"
    ]

    @ViewChild(MatPaginator, { static: false }) paginator!: MatPaginator;
    @ViewChild(MatSort, { static: false }) sort!: MatSort;
    @ViewChild('cpfInput', { static: false }) cpfInput!: ElementRef;

    constructor() { }

    ngOnInit() {

        // Set default sort to 'Data' column in descending order
        if (this.sort) {
            this.sort.active = 'nome';
            this.sort.direction = 'asc';
        }
    }

    applyFilter(event: Event) {

        const filterValue = (event.target as HTMLInputElement).value;
        this.clientDataSource().filter = filterValue.trim().toLowerCase();


    }




    getTotalBalance(): number {
        return this.clientBalanceDataSource().data.reduce((acc, client) => acc + client.saldo, 0);
    }

    handleCpfInput(event: InputEvent) {
        this.noClientFound.update(old => false)
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
                .subscribe((data: ApiResponse<Array<any>>) => {
                    if (data.success) {

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


                    } else {
                        this.noClientFound.set(true)
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
        this.inputDisabled.set(false);
        this.noClientFound.set(false);
        this.cpfInput.nativeElement.value = '';
        this.clientDataSource.set(new MatTableDataSource([]));
        this.clientBalanceDataSource.set(new MatTableDataSource([]));
    }


}
