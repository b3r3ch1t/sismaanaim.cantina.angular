import { CommonModule, CurrencyPipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, inject, Inject, OnInit, signal, ViewChild } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { ApiResponse } from 'app/core/api/api-response.types';
import { AuthService } from 'app/core/auth/auth.service';
import { environment } from 'app/environments/environment';
import { CustomCurrencyPipe } from 'app/pipes/custom-currency.pipe';
import { CustomDatePipe } from 'app/pipes/custom-date.pipe';
import { ConfirmationService } from 'app/services/confirmation.service';
import { SnackbarService } from 'app/services/snackbar.service';
import { CurrencyMaskModule } from 'ng2-currency-mask';
import { catchError } from 'rxjs';

@Component({
    selector: 'app-end-cashier',
    imports: [
        MatDialogModule,
        FormsModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatButtonModule,
        MatInputModule,
        MatCheckboxModule,
        MatTableModule,
        MatSelectModule,
        CustomCurrencyPipe,
        CommonModule,
        MatPaginatorModule,

        CurrencyMaskModule,
    ],
    providers: [
        CurrencyPipe,
        CustomCurrencyPipe,
        CustomDatePipe
    ],
    templateUrl: './end-cashier.component.html',
    styleUrl: './end-cashier.component.scss'
})
export class EndCashierComponent implements OnInit {

    validInformedInput = signal(null);
    private readonly _httpClient = inject(HttpClient);
    private readonly _authService = inject(AuthService);

    @ViewChild(MatPaginator, { static: false }) paginator!: MatPaginator;
    @ViewChild(MatSort, { static: false }) sort!: MatSort;

    cashierDataSource = signal(new MatTableDataSource([]))

    event: any;
    cashier: any;

    displayedColumns = [
        "formaPagamentoNome",
        "totalFormaPagamento",
        "valorApurado",
        "diferenca",
        "informado",
        "Actions"
    ]

    formaPagamento = signal(null);
    atualizarFormaPagamento = signal(null);
    informarFormaPagamento = signal(null);

    @ViewChild('apuradoValueInput', { static: false }) apuradoValueInput: ElementRef;

    constructor(

        @Inject(MAT_DIALOG_DATA) public data: { event: any, cashier: any },
        private readonly confirmationService: ConfirmationService,
        private readonly dialogRef: MatDialogRef<EndCashierComponent>,
        private readonly snackbar: SnackbarService,
    ) {
        this.event = data.event;
        this.cashier = data.cashier;
    }

    ngOnInit(): void {
        this.fetchCashierList();
    }

    closeDialog() {
        this.dialogRef.close();
    }

    cashierPaymentChange(formaPagamento: any) {

        this.formaPagamento.set(formaPagamento);
        this.atualizarFormaPagamento.set(true);
        this.informarFormaPagamento.set(false);

    }


    cashierPaymentAdd(formaPagamento: any) {

        this.formaPagamento.set(formaPagamento);
        this.atualizarFormaPagamento.set(false);
        this.informarFormaPagamento.set(true);

    }
    clearFormaPagamento() {
        this.formaPagamento.set(null);
        this.atualizarFormaPagamento.set(false);
        this.informarFormaPagamento.set(false);
    }

    fetchCashierList() {
        this._httpClient.get(`${environment.API_URL}caixa/GetFechamentoByCaixaId/${this.cashier.id}`, {
            headers: {
                Authorization: 'Bearer ' + this._authService.accessToken
            }
        }).pipe(catchError(error => {
            throw error
        })).subscribe((data: ApiResponse<any>) => {

            if (data.success) {

                console.log(data.result.formasPagamento);

                const dataSource = new MatTableDataSource(data.result.formasPagamento);
                if (dataSource) {
                    dataSource.sortingDataAccessor = (item: any, property) => {
                        switch (property) {
                            // case 'Descricao':
                            //   return item.descricao;
                            // case 'Aceita Estorno':
                            //   return item.aceitaEstorno;
                            // case 'Ordem débito':
                            //   return Number(item.ordemDebito);
                            default:
                                return item[property];
                        }
                    };

                    dataSource.paginator = this.paginator;
                    dataSource.sort = this.sort;
                    this.cashierDataSource.set(dataSource);

                }
            }

        });
    }


    handleUpdateSubmit() {

        const confirmationMessage = `Você tem certeza que deseja atualizar o fechamento do caixa?`;

        this.confirmationService.confirm("Confirmar", confirmationMessage).subscribe(result => {
            if (result) {

            }
        }
        );

    }

    handleInsertSubmit() {

        const apuradoValueInput = parseFloat(this.apuradoValueInput?.nativeElement.value.replace('.', '').replace(',', '.')) || 0;

        const formatter = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

        if (apuradoValueInput <= 0) {
            this.snackbar.error("O valor apurado deve ser maior que 0", 30 * 1000);

            this.validInformedInput.set(false)
            return
        }


        console.log(this.formaPagamento());
        if (this.formaPagamento() == null) {
            this.validInformedInput.set(false)
            return
        }

        const confirmationMessage = `Você tem certeza que deseja informar os valores abaixo para o caixa? <br>
        Caixa: ${this.cashier.operador} <br>
        Forma de Pagamento: ${this.formaPagamento().formaPagamentoNome} <br>
        Valor : ${formatter.format(apuradoValueInput)} <br> `;


        this.confirmationService.confirm("Confirmação de informação", confirmationMessage).subscribe(result => {
            if (result) {

                this._httpClient.post(`${environment.API_URL}caixa/insertValorFechamentoByFormaPagamento`, {
                    "caixaId": this.cashier.id,
                    "valorInformado": apuradoValueInput,
                    "formaPagamentoId": this.formaPagamento().formaPagamentoId,
                }).pipe(
                    catchError((error) => {
                        console.log(error);
                        throw error
                    })
                ).subscribe((response: ApiResponse<any>) => {
                    console.log(response)


                    const confirmationMessage = `Foi informado os valores abaixo:${this.cashier.operador}
                    Forma de Pagamento: ${this.formaPagamento().formaPagamentoNome}
                    Valor : ${formatter.format(apuradoValueInput)} `;

                    this.snackbar.success(
                        confirmationMessage,
                        30 * 1000
                    );

                    this.fetchCashierList();
                    this.validar();
                    this.validarFecharCaixa();
                    this.clearFormaPagamento();
                })
            }
        }
        );

    }

    validar(): boolean {

        const apuradoValueInput = parseFloat(this.apuradoValueInput?.nativeElement.value.replace('.', '').replace(',', '.')) || 0;

        return (
            this.formaPagamento() !== null &&
            apuradoValueInput > 0
        );
    }

    validarFecharCaixa(): boolean {
        const formasPagamento = this.cashierDataSource().data;
        const result = Array.isArray(formasPagamento)
            ? !formasPagamento.some(fp => fp.informado === false)
            : true;

        console.log(result);

        return result;
    }

}
