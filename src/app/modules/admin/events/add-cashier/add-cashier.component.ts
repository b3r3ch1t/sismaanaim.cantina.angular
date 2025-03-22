import { Component, Inject, OnInit } from '@angular/core';
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
    ],
    providers: [
        CurrencyPipe,
        CustomCurrencyPipe,
        CustomDatePipe
    ],
})
export class AddCashierComponent implements OnInit {
    cashierForm: FormGroup;
    allOperators: Operator[] = [];
    eventOperators: Operator[] = [];
    availableOperators: Operator[] = [];

    public event: any;


    constructor(
        private readonly fb: FormBuilder,
        private readonly http: HttpClient,
        private readonly authService: AuthService,

        private readonly dialogRef: MatDialogRef<AddCashierComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any
    ) {
        this.cashierForm = this.fb.group({
            selectedOperator: [null, Validators.required]
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

            console.log('Todos os operadores recebidos:', this.allOperators);
            console.log('Operadores do evento recebidos:', this.eventOperators);

            this.filterAvailableOperators();
        });
    }


    filterAvailableOperators(): void {
        const eventOperatorIds = new Set(this.eventOperators.map(op => op.operadorId));
        console.log('IDs dos operadores do evento:', Array.from(eventOperatorIds));

        this.availableOperators = this.allOperators.filter(op => {
            const isInEvent = eventOperatorIds.has(op.userId);
            console.log(`Operador ${op.userId} está no evento? ${isInEvent}`);
            return !isInEvent;
        })
            .sort((a, b) => a.nome.localeCompare(b.nome));

        console.log('Operadores disponíveis para seleção:', this.availableOperators);
    }


    addCashier(): void {
        if (this.cashierForm.invalid) {
            return;
        }

        const selectedOperator = this.cashierForm.value.selectedOperator;
        console.log('Operador selecionado:', selectedOperator);
        // Lógica adicional para adicionar o operador ao evento
    }

    closeDialog(): void {
        this.dialogRef.close();
    }
}
