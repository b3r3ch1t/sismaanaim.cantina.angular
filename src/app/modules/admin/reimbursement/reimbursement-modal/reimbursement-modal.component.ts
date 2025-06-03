import { CommonModule, CurrencyPipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, Inject, inject, OnInit, signal, ViewChild } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
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

@Component({
    selector: 'app-reimbursement-modal',
    imports: [

        CustomCurrencyPipe,
        MatDialogModule,
        MatFormFieldModule,
        MatSelectModule,
        CurrencyMaskModule,
        CommonModule,
        FormsModule,
        MatInputModule,

        CustomCurrencyPipe,
        ReactiveFormsModule,
        MatButtonModule,
        MatCheckboxModule,
        MatTableModule,
        MatTabsModule,
        MatSortModule,
    ],
    providers: [
        CurrencyPipe,
        CustomCurrencyPipe,
    ],
    templateUrl: './reimbursement-modal.component.html',
    styleUrl: './reimbursement-modal.component.scss'
})
export class ReimbursementModalComponent implements OnInit {
    cliente: any;

    private readonly _httpClient = inject(HttpClient)
    private readonly _authService = inject(AuthService)
    private readonly _userService = inject(UserService);
    private readonly _customCurrencyPipe = inject(CustomCurrencyPipe);


    currentEvent = signal(null);

    value: any;

    @ViewChild('returnAmountValueInput', { static: false }) returnAmountValueInput: ElementRef;

    constructor(
        private readonly dialogRef: MatDialogRef<ReimbursementModalComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any,
        private readonly confirmationService: ConfirmationService,
        private readonly snackbar: SnackbarService,

    ) {
        this.cliente = data;
    }

    ngOnInit(): void {
        this.loadCashRegister();
    }


    closeDialog() {
        this.dialogRef.close();
    }

    handleSubmit() {

        const value = parseFloat(this.returnAmountValueInput.nativeElement.value.replace(".", "").replace(",", "."));
        const amount = this._customCurrencyPipe.transform(value);


        const formatter = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
        const confirmationMessage = `
        Nome: ${this.cliente?.nome} <br>
        Troco: ${formatter.format(value)} <br>`;

        this.confirmationService.confirm('Reembolso', confirmationMessage).subscribe((result) => {
            if (result) {


                this._httpClient.post(`${environment.API_URL}caixa/estornarvalorcliente`, {
                    "caixaId": this.currentEvent().id,
                    "valor": value,
                    "clienteId": this.cliente.id
                }).pipe(
                    catchError((error) => {
                        console.log(error);
                        throw error
                    })
                ).subscribe((response: ApiResponse<any>) => {


                    if (response.success) {

                        const value = parseFloat(this.returnAmountValueInput.nativeElement.value.replace(".", "").replace(",", "."))
                        const amount = this._customCurrencyPipe.transform(value)
                        this.snackbar.success(`*O Reembolso para o cliente ‘${this.cliente.nome}’ no valor de ‘${amount}’ foi feito com sucesso`, 30 * 1000)
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

    clearInputs() {
        this.returnAmountValueInput.nativeElement.value = '';
    }

    validar(): boolean {
        const inputValue = this.returnAmountValueInput?.nativeElement.value;
        if (!inputValue) {
            return false;
        }
        // Remove thousands separator and convert to float
        const value = parseFloat(inputValue.replace(/\./g, '').replace(',', '.'));
        return !isNaN(value) && value > 0 && value <= this.cliente?.saldo;
    }


    loadCashRegister() {

        console.log("Carregando caixa ativo do operador");

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

            console.log(response);

        });
    }

}
