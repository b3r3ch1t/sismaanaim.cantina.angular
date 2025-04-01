import { Component, ElementRef, inject, OnInit, signal, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInput, MatInputModule } from '@angular/material/input';
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
import { environment } from 'app/environments/environment';
import { SnackbarService } from 'app/services/snackbar.service';
import { ConfirmationService } from 'app/services/confirmation.service';
import { CurrencyMaskDirective } from 'app/directives/currency-mask.directive';
import { CurrencyMaskModule } from 'ng2-currency-mask';

@Component({
    selector: 'app-reimbursement',
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
        CurrencyMaskDirective,
        CurrencyMaskModule
    ],
    providers: [CurrencyPipe, CustomCurrencyPipe],
    templateUrl: './reimbursement.component.html',
    styleUrl: './reimbursement.component.scss'
})

export class ReimbursementComponent implements OnInit {

    private _httpClient = inject(HttpClient)
    private _authService = inject(AuthService)
    private _userService = inject(UserService);
    private _customCurrencyPipe = inject(CustomCurrencyPipe)

    noClientFound = signal(false);
    clients = signal([]);
    paymentMethods = signal([]);
    showClearButton = signal(false);
    inputDisabled = signal(false);
    selectedClient = signal(null);
    disableClientDropdown = signal(false);
    disablePaymentMethodDropdown = signal(false);
    validPaidInput = signal(null);
    validRechargeInput = signal(null);
    validPaymentMethod = signal(null);
    currentEvent = signal(null);
    selectedClientBalance = signal([])
    balanceAgainstPaymentMethod = signal(null)


    @ViewChild('nameInput', { static: true }) nameInput: ElementRef;
    @ViewChild('cpfInput', { static: true }) cpfInput: ElementRef;
    @ViewChild('clientDropdown', { static: false }) clientDropdown: MatRadioGroup;
    @ViewChild('paymentMethodDropdown', { static: false }) paymentMethodDropdown: MatSelect;
    @ViewChild('returnAmountValueInput', { static: false }) returnAmountValueInput: ElementRef;

    constructor(
        private snackbar: SnackbarService,
        private confirmationService: ConfirmationService
    ) { }

    ngOnInit(): void {
        this.loadCashRegister();
    }

    handleSubmit() {


        if (this.returnAmountValueInput.nativeElement.value == null) {
            this.validRechargeInput.set(false);
            return
        }


        if (this.currentEvent() === null) {
            console.log('current event (cash register) is null')
            return
        }

        console.log(this.selectedClient())

        if (this.selectedClient() === null) {
            console.log('selected client is null');
        }

        const value = parseFloat(this.returnAmountValueInput.nativeElement.value.replace(".", "").replace(",", "."));
        const amount = this._customCurrencyPipe.transform(value);


        console.log("valor", value);
        console.log("valor formatado", amount);


        this.confirmationService.confirm('Reembolso', 'Deseja realmente estornar o reembolso para o cliente?').subscribe((result) => {
            if (result) {


                this._httpClient.post(`${environment.API_URL}caixa/estornarvalorcliente`, {
                    "caixaId": this.currentEvent().id,
                    "valor": value,
                    "clienteId": this.selectedClient().id
                }).pipe(
                    catchError((error) => {
                        console.log(error);
                        throw error
                    })
                ).subscribe((response: ApiResponse<any>) => {


                    if(response.success) {

                    const value = parseFloat(this.returnAmountValueInput.nativeElement.value.replace(".", "").replace(",", "."))
                    const amount = this._customCurrencyPipe.transform(value)
                    this.snackbar.success(`*O Reembolso para o cliente ‘${this.selectedClient().nome}’ no valor de ‘${amount}’ foi feito com sucesso`, 30 * 1000)
                    this.clearInputs();

                    }

                    if (response.error) {
                        this.snackbar.error(response.message, 30 * 1000)
                    }
                })

            }
        }


        );

    }

    loadCashRegister() {
        this._httpClient.get(`${environment.API_URL}caixa/getcaixaativosbyoperadorid/${this._userService.user.id}`, {
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
                this.currentEvent.set(response.result);
            }

        });
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

    clearInputs() {

        this.showClearButton.set(false)
        this.inputDisabled.set(false)
        this.clients.set([])
        this.selectedClient.set(null)
    }


    handleClientSelection(clientId: string) {
        if (clientId) {
            this.disableClientDropdown.set(true)

            this._httpClient.get(`${environment.API_URL}clientes/getsaldoclientebyclientid/${clientId}`, {
                headers: {
                    "Authorization": `Bearer ${this._authService.accessToken}`
                }
            }).pipe(
                catchError((error) => {
                    console.log(error);
                    throw error
                })
            ).subscribe((response: ApiResponse<any>) => {
                if (response.success) {
                    this.selectedClientBalance.set(response.result)
                    console.log(this.selectedClientBalance())
                }
            })

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
                    this.disableClientDropdown.set(false)
                    if (data.success) {
                        this.selectedClient.set(data.result)
                        console.log(this.selectedClient())
                    }
                });

        }
    }




}
