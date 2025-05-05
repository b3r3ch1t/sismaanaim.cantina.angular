import { CurrencyPipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, inject, Inject, OnInit, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule, MatLabel } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
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
    selector: 'app-sell-modal',
    imports: [

        CustomCurrencyPipe,
        MatDialogModule,
        MatFormFieldModule,
        CurrencyMaskModule,
        MatLabel,
        MatInputModule,
    ],
    providers: [

        CurrencyPipe,
        CustomCurrencyPipe,
    ],
    templateUrl: './sell-modal.component.html',
    styleUrl: './sell-modal.component.scss'
})
export class SellModalComponent implements OnInit {

    cliente: any;

    private readonly _httpClient = inject(HttpClient)
    private readonly _authService = inject(AuthService)
    private readonly _userService = inject(UserService);

    @ViewChild('sellingInput', { static: false }) sellingInput: ElementRef;
    evento: any;
    subiting: boolean;


    constructor(
        private readonly dialogRef: MatDialogRef<SellModalComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any,
        private readonly snackbar: SnackbarService,
        private readonly confirmationService: ConfirmationService,
    ) {
        this.cliente = data;
    }

    ngOnInit(): void {


        this.fetchCurrentEvent();
    }


    fetchCurrentEvent() {
        this._httpClient.get(`${environment.API_URL}evento/getcurrentevent`, {
            headers: {
                Authorization: `Bearer ${this._authService.accessToken}`
            },
        }).pipe(catchError(error => {
            console.log(error)
            throw error
        })).subscribe((response: ApiResponse<any>) => {

            if (response.success) {
                this.evento = response.result;
                return;
            }

            this.dialogRef.close();

            this.snackbar.error(response.message, 1000 * 10);

        })
    }

    handleSubmit() {

        if(this.subiting ) return;


        this.subiting = true;



        const unformatedValue = this.sellingInput.nativeElement.value
        if (unformatedValue == "") {
            this.snackbar.error("O valor de venda é obrigatório")
            return
        }

        let sellingAmount = parseFloat(unformatedValue.replace('R$', '').replace('.', '').replace(',', '.'));

        if (sellingAmount > this.cliente.saldo) {
            this.snackbar.error("O valor de venda deve ser menor que o saldo")
            return
        }

        const formattedValue = this.sellingInput.nativeElement.value.replace(".", "").replace(",", ".");
        const formatter = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
        const confirmationMessage = ` Deseja confirmar a venda? <br>
        Nome: ${this.cliente?.nome} <br>
        Valor: ${formatter.format(formattedValue)} <br>`;


        this.confirmationService.confirm("Confirmar", confirmationMessage).subscribe(result => {
            if (result) {

                this._httpClient.post(`${environment.API_URL}atendente/realizarvenda`,
                    {
                        eventoId: this.evento.id,
                        valor: sellingAmount,
                        clienteId: this.cliente.id,
                    },
                    {
                        headers: {
                            Authorization: `Bearer ${this._authService.accessToken}`
                        },
                    }).pipe(catchError(error => {
                        console.log(error);
                        this.subiting = false;

                        throw error
                    })).subscribe((response: ApiResponse<any>) => {

                        if (response.success) {

                            this.snackbar.success("Venda Realizada com sucesso!", 1000 * 10);

                            this.dialogRef.close();

                            return;

                        }

                        this.snackbar.error(response.message, 1000 * 10);
                        this.subiting = false;

                    })

            }
        }

        )
    }



    closeDialog() {
        this.dialogRef.close();
    }

}
