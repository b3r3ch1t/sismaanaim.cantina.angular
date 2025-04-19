import { Navigation } from './../../../core/navigation/navigation.types';
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
import { catchError } from 'rxjs';
import { ApiResponse } from 'app/core/api/api-response.types';
import { CustomCurrencyPipe } from 'app/pipes/custom-currency.pipe';
import { CurrencyPipe } from '@angular/common';
import { UserService } from 'app/core/user/user.service';
import { MatRadioChange, MatRadioGroup, MatRadioModule } from "@angular/material/radio"
import { MatSelectionListChange, MatSelectionList, MatListModule, MatList } from '@angular/material/list';
import { environment } from 'app/environments/environment';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { SnackbarService } from 'app/services/snackbar.service';
import { CurrencyMaskModule } from "ng2-currency-mask";
import { Router } from '@angular/router';
import { ConfirmationService } from 'app/services/confirmation.service';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { ReplenishmentModalComponent } from './replenishment-modal/replenishment-modal.component';

@Component({
    selector: 'app-replenishment',
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
        CurrencyMaskModule,


        MatTableModule,
        MatSort,
        MatPaginator,
    ],
    providers: [CurrencyPipe, CustomCurrencyPipe],
    templateUrl: './replenishment.component.html',
    styleUrl: './replenishment.component.scss'
})

export class ReplenishmentComponent implements OnInit {

    private readonly _httpClient = inject(HttpClient)
    private readonly _authService = inject(AuthService)
    private readonly _userService = inject(UserService);
    noClientFound = signal(false)
    clients = signal([]);
    paymentMethods = signal([]);
    showClearButton = signal(false);
    inputDisabled = signal(false);
    selectedClient = signal(null);
    selectedPaymentMethod = signal(null);
    disableClientDropdown = signal(false);
    disablePaymentMethodDropdown = signal(false);
    validPaidInput = signal(null);
    validRechargeInput = signal(null);
    validPaymentMethod = signal(null);
    currentEvent = signal(null);
    selectedClientBalance = signal([])
    balanceAgainstPaymentMethod = signal(null)

    clientDataSource = signal(new MatTableDataSource([]));

    displayedColumns = [
        "Nome",
        "CPF",
        "Abastecer"
    ]

    @ViewChild('nameInput', { static: false }) nameInput: ElementRef;
    @ViewChild('cpfInput', { static: false }) cpfInput: ElementRef;
    @ViewChild('clientDropdown', { static: false }) clientDropdown: MatRadioGroup;
    @ViewChild('paymentMethodDropdown', { static: false }) paymentMethodDropdown: MatSelect;
    @ViewChild('paidValueInput', { static: false }) paidValueInput: ElementRef;
    @ViewChild('rechargeValueInput', { static: false }) rechargeValueInput: ElementRef;

    @ViewChild(MatPaginator, { static: false }) paginator!: MatPaginator;
    @ViewChild(MatSort, { static: false }) sort!: MatSort;


    constructor(
        private readonly snackbar: SnackbarService,
        private readonly dialog: MatDialog,
        private readonly confirmationService: ConfirmationService,
    ) { }

    ngOnInit(): void {

    }

    applyFilter(event: Event) {

        const filterValue = (event.target as HTMLInputElement).value;
        this.clientDataSource().filter = filterValue.trim().toLowerCase();
    }


    // handleSubmit() {

    //     const paidValue = parseFloat(this.paidValueInput.nativeElement.value.replace(".", "").replace(",", "."))
    //     const rechargeValue = parseFloat(this.rechargeValueInput.nativeElement.value.replace(".", "").replace(",", "."))
    //     const troco = paidValue - rechargeValue;

    //     const formatter = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
    //     const confirmationMessage = `
    //     Nome: ${this.selectedClient()?.nome} <br>
    //     Forma de pagamento: ${this.selectedPaymentMethod().descricao} <br>
    //     Valor da Recarga: ${formatter.format(rechargeValue)} <br>
    //     Valor Pago: ${formatter.format(paidValue)} <br>
    //     Troco: ${formatter.format(troco)} <br>`;

    //     this.confirmationService.confirm("Confirmar", confirmationMessage).subscribe(result => {
    //         if (result) {


    //             if (this.selectedPaymentMethod() == null) {
    //                 this.validPaymentMethod.set(false)
    //                 return
    //             }

    //             if (this.rechargeValueInput.nativeElement.value == "") {
    //                 this.validRechargeInput.set(false)
    //                 return
    //             }

    //             if (this.paidValueInput.nativeElement.value == "") {
    //                 this.validPaidInput.set(false)
    //                 return
    //             }


    //             if (rechargeValue > paidValue) {
    //                 this.snackbar.error("O valor da recarga deve ser igual ou menor que o valor pago", 30 * 1000);
    //                 this.validRechargeInput.set(false)
    //                 return
    //             }

    //             if (this.currentEvent() === null) {
    //                 console.log('current event (cash register) is null')
    //                 return
    //             }

    //             this._httpClient.post(`${environment.API_URL}caixa/adicionarcredito`, {
    //                 "caixaId": this.currentEvent().id,
    //                 "valor": rechargeValue,
    //                 "formaPagamentoId": this.selectedPaymentMethod().id,
    //                 "clienteId": this.selectedClient().id
    //             }).pipe(
    //                 catchError((error) => {
    //                     console.log(error);
    //                     throw error
    //                 })
    //             ).subscribe((response: ApiResponse<any>) => {
    //                 console.log(response)



    //                 this.snackbar.success(
    //                     `A recarga foi realizada com sucesso! O valor do troco é ${troco.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`,
    //                     30 * 1000
    //                 );


    //                 this.clearInputs()
    //             })

    //         }
    //     })
    // }



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

    handleNameInput(event: InputEvent) {
        this.noClientFound.set(false)
        const input = event.target as HTMLInputElement;
        if (input.value.length >= 4) {
            this.selectedClient.set(null)
            this.clients.set([])
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

                        if (this.clients().length === 1) {
                            this.selectedClient.set(this.clients()[0])
                        }

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

    handleCpfInput(event: InputEvent) {

        const inputElement = event.target as HTMLInputElement;
        // Remove qualquer caractere que não seja número
        inputElement.value = inputElement.value.replace(/\D/g, '');


        this.noClientFound.set(false)
        const input = event.target as HTMLInputElement;
        if (input.value.length >= 4) {
            this.selectedClient.set(null)
            this.clients.set([])
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


                        const clients = data.result;
                        this.clients.set(clients);

                        if (this.clients().length === 1) {
                            this.selectedClient.set(this.clients()[0]);
                        }

                        if (!this.clients().length) {


                            this.noClientFound.set(true);
                            this.snackbar.error("Nenhum cliente encontrado com esse CPF", 30 * 1000);

                        }
                    }
                    else
                        if (data.totalRecords == 0) {
                            console.log("Nenhum cliente encontrado com esse CPF");
                            this.noClientFound.set(true);
                            this.snackbar.error("Nenhum cliente encontrado com esse CPF", 30 * 1000);
                            return;
                        }
                    this.showClearButton.set(true);
                });

        } else {
            this.showClearButton.set(false)
        }
    }

    clearInputs() {
        this.showClearButton.set(false);
        this.inputDisabled.set(false);
        this.clients.set([]);
        this.selectedClient.set(null);

        if (this.cpfInput) {
            this.cpfInput.nativeElement.value = '';
        }

        if (this.nameInput) {
            this.nameInput.nativeElement.value = '';
        }


        this.clientDataSource.set(new MatTableDataSource([]));
    }


    handleClientSelection(clientId: string) {
        if (clientId) {


            const cliente = this.clients()
                .find(cliente => cliente.id === clientId);

            console.log(cliente);


            this.dialog.open(ReplenishmentModalComponent, {
                data: cliente,
                width: "99%"
            })



        }
    }



}
