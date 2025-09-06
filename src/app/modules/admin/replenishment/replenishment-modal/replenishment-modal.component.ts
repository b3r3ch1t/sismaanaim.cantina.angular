import { CommonModule, CurrencyPipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, inject, Inject, OnInit, signal, ViewChild } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelect, MatSelectModule } from '@angular/material/select';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { ApiResponse } from 'app/core/api/api-response.types';
import { AuthService } from 'app/core/auth/auth.service';
import { UserService } from 'app/core/user/user.service';
import { environment } from 'app/environments/environment';
import { CustomCurrencyPipe } from 'app/pipes/custom-currency.pipe';
import { ConfirmationService } from 'app/services/confirmation.service';
import { SnackbarService } from 'app/services/snackbar.service';
import { CurrencyMaskModule } from 'ng2-currency-mask';
import { catchError } from 'rxjs';
import { MatRadioButton, MatRadioModule } from "@angular/material/radio";

@Component({
    selector: 'app-replenishment-modal',
    imports: [
        CustomCurrencyPipe,
        MatDialogModule,
        MatFormFieldModule,
        MatSelectModule,
        CurrencyMaskModule,
        CommonModule,
        FormsModule,
        MatInputModule,
        ReactiveFormsModule,
        MatButtonModule,
        MatCheckboxModule,
        MatTableModule,
        MatTabsModule,
        MatSortModule,
        MatRadioButton,
        MatRadioButton,
        MatRadioModule
    ],
    providers: [
        CurrencyPipe,
        CustomCurrencyPipe,
    ],
    templateUrl: './replenishment-modal.component.html',
    styleUrl: './replenishment-modal.component.scss'
})
export class ReplenishmentModalComponent implements OnInit {

    cliente: any;

    private readonly _httpClient = inject(HttpClient)
    private readonly _authService = inject(AuthService)
    private readonly _userService = inject(UserService);

    selectedPaymentMethodId: string | number | null = null;

    paymentMethods = signal([]);
    validPaymentMethod = signal(null);
    validPaidInput = signal(null);
    validRechargeInput = signal(null);
    selectedPaymentMethod = signal(null);

    disablePaymentMethodDropdown = signal(false);
    currentCaixaId = signal(null);

    @ViewChild('paidValueInput', { static: false }) paidValueInput: ElementRef;
    @ViewChild('rechargeValueInput', { static: false }) rechargeValueInput: ElementRef;
    @ViewChild('paymentMethodDropdown', { static: false }) paymentMethodDropdown: MatSelect;


    constructor(
        private readonly dialogRef: MatDialogRef<ReplenishmentModalComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any,
        private readonly confirmationService: ConfirmationService,
        private readonly snackbar: SnackbarService,

    ) {
        this.cliente = data;
    }

    ngOnInit(): void {
        this.fetchPaymentMethods();
        this.loadCashRegister();
    }

    closeDialog() {
        this.dialogRef.close();
    }

    fetchPaymentMethods() {
        this._httpClient.get(`${environment.API_URL}formapagamento/listarformapagamento`, {
            headers: {
                "Authorization": `Bearer ${this._authService.accessToken}`
            }
        })
            .pipe(catchError((error) => {
                console.log(error);
                throw error;
            }))
            .subscribe((data: ApiResponse<Array<{ id: string, descricao: string }>>) => {
                if (data.success) {
                    this.paymentMethods.set(data.result)
                }
            });
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
                this.currentCaixaId.set(response.result)
            }

        });
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

    handleSubmit() {

        const paidValue = parseFloat(this.paidValueInput.nativeElement.value.replace(".", "").replace(",", "."))
        const rechargeValue = parseFloat(this.rechargeValueInput.nativeElement.value.replace(".", "").replace(",", "."))
        const troco = paidValue - rechargeValue;


        if (troco < 0) {
            this.snackbar.error("O valor pago deve ser maior ou igual ao valor da recarga", 30 * 1000);
            this.validRechargeInput.set(false)
            return

        }

        const formaPagamento = this.paymentMethods().find((item: any) => item.id === this.selectedPaymentMethod());

        if (!formaPagamento) {
            this.snackbar.error("Forma de pagamento inválida", 30 * 1000);
            return;
        }

        const formatter = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
        const confirmationMessage = `
        Nome: ${this.cliente?.nome} <br>
        Forma de pagamento: ${formaPagamento.descricao} <br>
        Valor da Recarga: ${formatter.format(rechargeValue)} <br>
        Valor Pago: ${formatter.format(paidValue)} <br>
        Troco: ${formatter.format(troco)} <br>`;

        this.confirmationService.confirm("Confirmar", confirmationMessage).subscribe(result => {
            if (result) {


                if (this.selectedPaymentMethod() == null) {
                    this.validPaymentMethod.set(false)
                    return
                }

                if (this.rechargeValueInput.nativeElement.value == "") {
                    this.validRechargeInput.set(false)
                    return
                }

                if (this.paidValueInput.nativeElement.value == "") {
                    this.validPaidInput.set(false)
                    return
                }


                if (rechargeValue > paidValue) {
                    this.snackbar.error("O valor da recarga deve ser igual ou menor que o valor pago", 30 * 1000);
                    this.validRechargeInput.set(false)
                    return
                }


                this._httpClient.post(`${environment.API_URL}caixa/adicionarcredito`, {
                    "caixaId": this.currentCaixaId().id,
                    "valor": rechargeValue,
                    "formaPagamentoId": this.selectedPaymentMethod(),
                    "clienteId": this.cliente.id
                }).pipe(
                    catchError((error) => {
                        console.log(error);
                        throw error
                    })
                ).subscribe((response: ApiResponse<any>) => {
                    console.log(response)



                    this.snackbar.success(
                        `A recarga foi realizada com sucesso! O valor do troco é ${troco.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`,
                        30 * 1000
                    );


                    this.clearInputs();
                    this.dialogRef.close(true);
                })

            }
        })
    }

    clearInputs() {
        this.validPaymentMethod.set(null)
        this.validRechargeInput.set(null)
        this.validPaidInput.set(null)
        this.selectedPaymentMethod.set(null)
        this.paidValueInput.nativeElement.value = ''
        this.rechargeValueInput.nativeElement.value = ''
    }

    handlePaymentMethodSelection() {

        const paymentMethodId = this.selectedPaymentMethodId;
        this.disablePaymentMethodDropdown.set(true)
        this.selectedPaymentMethod.set(paymentMethodId);

        console.log('Selecionado:', paymentMethodId);
        this.disablePaymentMethodDropdown.set(false)

    }

    validar(): boolean {
        const selectedPaymentMethod = this.selectedPaymentMethod();
        const rechargeValue = parseFloat(this.rechargeValueInput?.nativeElement.value.replace('.', '').replace(',', '.')) || 0;
        const paidValue = parseFloat(this.paidValueInput?.nativeElement.value.replace('.', '').replace(',', '.')) || 0;


        return (
            selectedPaymentMethod !== null &&
            rechargeValue > 0 &&
            paidValue > 0 &&
            paidValue >= rechargeValue
        );
    }


}
