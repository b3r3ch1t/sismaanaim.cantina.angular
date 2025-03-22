import { Component, ElementRef, inject, Inject, OnInit, signal, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from 'app/core/auth/auth.service';
import { environment } from 'app/environments/environment';
import { catchError, forkJoin, of } from 'rxjs';
import { ApiResponse } from 'app/core/api/api-response.types';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { CurrencyPipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { CustomCurrencyPipe } from 'app/pipes/custom-currency.pipe';
import { CustomDatePipe } from 'app/pipes/custom-date.pipe';
import { CurrencyMaskModule } from 'ng2-currency-mask';
import { UserService } from 'app/core/user/user.service';
import { SnackbarService } from 'app/services/snackbar.service';



interface Operator {
    userId: string;
    nome: string;
    operadorId: string;
    // Outras propriedades relevantes
}

@Component({
    selector: 'app-add-cashier',
    templateUrl: './add-cashier.component.html',
    styleUrls: ['./add-cashier.component.scss'],
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
        CurrencyMaskModule
    ],
    providers: [
        CurrencyPipe,
        CustomCurrencyPipe,
        CustomDatePipe
    ],
})
export class AddCashierComponent implements OnInit {

    private readonly _httpClient = inject(HttpClient)
    private readonly _authService = inject(AuthService)
    private readonly _userService = inject(UserService);

    cashierForm: FormGroup;
    allOperators: Operator[] = [];
    eventOperators: Operator[] = [];
    availableOperators: Operator[] = [];

    public event: any;
    value: any;

    @ViewChild('valueInput', { static: false }) valueInput: ElementRef;

    constructor(
        private readonly fb: FormBuilder,
        private readonly http: HttpClient,
        private readonly authService: AuthService,

        private readonly dialogRef: MatDialogRef<AddCashierComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any,
        private readonly snackbar: SnackbarService
    ) {
        this.cashierForm = this.fb.group({
            selectedOperator: [null, Validators.required],
            valor: [null, [Validators.required, Validators.min(0.01)]]
        });

        this.event = data;
    }

    ngOnInit(): void {
        this.loadOperators();
    }

    loadOperators(): void {
        const headers = new HttpHeaders({
            Authorization: `Bearer ${this.authService.accessToken}`
        });

        const allOperatorsRequest = this.http.get<ApiResponse<Operator[]>>(`${environment.API_URL}account/gettodosoperadores`, { headers })
            .pipe(
                catchError(error => {
                    console.error('Erro ao buscar todos os operadores:', error);
                    return of({ result: [] } as ApiResponse<Operator[]>);
                })
            );

        const eventOperatorsRequest = this.http.get<ApiResponse<Operator[]>>(`${environment.API_URL}caixa/listacaixasbyeventoid/${this.event.id}`, { headers })
            .pipe(
                catchError(error => {
                    console.error('Erro ao buscar operadores do evento:', error);
                    return of({ result: [] } as ApiResponse<Operator[]>);
                })
            );

        forkJoin([allOperatorsRequest, eventOperatorsRequest]).subscribe(([allOperatorsResponse, eventOperatorsResponse]) => {
            this.allOperators = allOperatorsResponse.result;
            this.eventOperators = eventOperatorsResponse.result;

            this.filterAvailableOperators();
        });
    }


    filterAvailableOperators(): void {
        const eventOperatorIds = new Set(this.eventOperators.map(op => op.operadorId));
        this.availableOperators = this.allOperators.filter(op => {
            const isInEvent = eventOperatorIds.has(op.userId);
            return !isInEvent;
        })
            .sort((a, b) => a.nome.localeCompare(b.nome));

    }


    addCashier(): void {
        if (this.cashierForm.invalid) {
            return;
        }

        const selectedOperator = this.cashierForm.value.selectedOperator;
        // Lógica adicional para adicionar o operador ao evento
    }

    closeDialog(): void {
        this.dialogRef.close();
    }

    handleRechargeValueInput(event: KeyboardEvent) {
        this.onKeyPress(event)
    }

    onKeyPress(event: KeyboardEvent) {

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


        if (!this.cashierForm.valid) {
            return;
        }


        this._httpClient.post(
            `${environment.API_URL}caixa/AbrirCaixa`,
            {
                "operadorCaixaId": this.cashierForm.value.selectedOperator.userId,
                "valorAbertura": this.cashierForm.value.valor,
                "eventoId": this.event.id,
            },
            {
                headers: new HttpHeaders({
                    Authorization: `Bearer ${this._authService.accessToken}`
                })
            }
        ).pipe(
            catchError((error) => {
                console.log(error);
                throw error;
            })
        ).subscribe((response: ApiResponse<any>) => {
            console.log(response);

            if (response.success) {

                this.snackbar.success(
                    `O caixa foi aberto com sucesso !`,
                    30 * 1000
                );

                this.closeDialog();
            };

        }

        );
    }

}
