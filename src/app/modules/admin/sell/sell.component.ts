import { Component, ElementRef, inject, OnInit, signal, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelect, MatSelectModule } from "@angular/material/select"
import { HttpClient } from "@angular/common/http"
import { AuthService } from 'app/core/auth/auth.service';
import { catchError, single } from 'rxjs';
import { ApiResponse } from 'app/core/api/api-response.types';
import { CustomCurrencyPipe } from 'app/pipes/custom-currency.pipe';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { UserService } from 'app/core/user/user.service';
import { MatRadioChange, MatRadioGroup, MatRadioModule } from "@angular/material/radio"
import { MatSelectionListChange, MatSelectionList, MatListModule, MatList } from '@angular/material/list';
import { environment } from 'app/environments/environment';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { SnackbarService } from 'app/services/snackbar.service';
import { CurrencyMaskDirective } from 'app/directives/currency-mask.directive';
import { CurrencyMaskModule } from 'ng2-currency-mask';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { SellModalComponent } from './sell-modal/sell-modal.component';

@Component({
    selector: 'app-sell',
    templateUrl: './sell.component.html',
    styleUrls: ['./sell.component.css'],
    imports: [
        MatButtonModule,
        MatCheckboxModule,
        MatFormFieldModule,
        MatInputModule,
        MatIconModule,
        MatProgressSpinnerModule,
        MatSelectModule,
        CustomCurrencyPipe,
        MatRadioModule,
        MatSnackBarModule,
        MatListModule,
        MatTableModule,
        MatSort,
        MatSortModule,
        MatPaginator,
        CommonModule
    ],
    providers: [CurrencyPipe, CustomCurrencyPipe],
})

export class AttendantSellComponent implements OnInit {
    private readonly _httpClient = inject(HttpClient)
    private readonly _authService = inject(AuthService)
    private readonly _userService = inject(UserService);

    noClientFound = signal(false)
    showClearButton = signal(false);
    inputDisabled = signal(true);
    validPaidInput = signal(null);
    validRechargeInput = signal(null);
    validPaymentMethod = signal(null);
    currentAttendant = signal(null);
    totalClientBalance: number = 0;


    clientDataSource = signal(new MatTableDataSource([]));


    @ViewChild('cpfInput', { static: false }) cpfInput: ElementRef;
    @ViewChild('clientDropdown', { static: false }) clientDropdown: MatRadioGroup;
    @ViewChild('paymentMethodDropdown', { static: false }) paymentMethodDropdown: MatSelect;
    @ViewChild('paidValueInput', { static: false }) paidValueInput: ElementRef;
    @ViewChild('rechargeValueInput', { static: false }) rechargeValueInput: ElementRef;



    @ViewChild(MatPaginator, { static: false }) paginator!: MatPaginator;
    @ViewChild(MatSort, { static: false }) sort!: MatSort;


    displayedColumns = [
        "Nome",
        "CPF",
        "Saldo",
        "Venda",
    ]

    constructor(
        private readonly snackbar: SnackbarService,
        private readonly dialog: MatDialog,
    ) { }

    ngOnInit(): void {
        this.loadAttendant()
    }


    loadAttendant() {
        this._httpClient.get(`${environment.API_URL}atendente/getatendentebyid/${this._userService.user.id}`, {
            headers: {
                Authorization: `Bearer ${this._authService.accessToken}`
            }
        }).pipe(
            catchError((error) => {
                console.log(error);
                throw error
            })
        ).subscribe((response: ApiResponse<any>) => {
            if (response.success) {
                this.currentAttendant.set(response.result)
                this.inputDisabled.set(false)
            }

        });
    }

    handleRechargeValueInput(event: KeyboardEvent) {
        this.onKeyPress(event)
    }

    handlePaidValueInput(event: KeyboardEvent) {
        this.onKeyPress(event)
    }

    onKeyPress(event: KeyboardEvent) {
        console.log(event.key)

        if (event.key === 'Enter' || event.key === '-' || event.key === ',') {
            return
        }

        const allowedChars = /[0-9\.]/; // Allow numbers and a single decimal point
        const inputChar = String.fromCharCode(event.keyCode || event.which);

        if (!allowedChars.test(inputChar)) {
            event.preventDefault();
        }
    }

    handleCpfInput(event: InputEvent) {

        this.noClientFound.set(false);
        this.totalClientBalance = 0;

        const input = event.target as HTMLInputElement;
        if (input.value.length >= 4) {

            this.inputDisabled.set(true);

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
                    else {
                        this.snackbar.error("Nenhum cliente encontrado");
                    }
                    this.showClearButton.set(true)
                });

        } else {
            this.showClearButton.set(false)
        }
    }

    clearInputs() {
        this.showClearButton.set(false)
        this.inputDisabled.set(false)
        this.clientDataSource.set(new MatTableDataSource([]));
        this.noClientFound.set(false);
        this.cpfInput.nativeElement.value = '';
    }


        applyFilter(event: Event) {

            const filterValue = (event.target as HTMLInputElement).value;
            this.clientDataSource().filter = filterValue.trim().toLowerCase();


        }


        handleClientSelection(clientId: string) {



            this.totalClientBalance = 0;
            this.noClientFound.set(false);


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


                            this.totalClientBalance = data.result['saldo'] || 0;

                        }
                    });

            }
        }

        Venda(client) {


            if (client.saldo <= 0) {
                this.snackbar.error(`O cliente:${client.nome} não possui saldo para realizar a venda`);
                return;
            }

            const dialogRef = this.dialog.open(SellModalComponent, {
                data: client,
                width: "98%",
            })

            dialogRef.afterClosed().subscribe(result => {
                this.clearInputs();
            });

        }


    }
