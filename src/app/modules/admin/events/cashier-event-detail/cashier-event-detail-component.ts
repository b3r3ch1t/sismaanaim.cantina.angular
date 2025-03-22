import { HttpClient } from '@angular/common/http';
import { Component, Inject, inject, signal } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { ApiResponse } from 'app/core/api/api-response.types';
import { AuthService } from 'app/core/auth/auth.service';
import { environment } from 'app/environments/environment';
import { SnackbarService } from 'app/services/snackbar.service';
import { catchError } from 'rxjs';
import { CustomCurrencyPipe } from 'app/pipes/custom-currency.pipe';
import { CurrencyPipe, NgLocaleLocalization } from '@angular/common';
import { CustomDatePipe } from 'app/pipes/custom-date.pipe';
import { EventStatus } from '../event-status.enum';
import { CashierDetailComponent } from '../../cashier-detail/cashier-detail-component';
import { AddCashierComponent } from '../add-cashier/add-cashier.component';
@Component({
    selector: 'app-cashier-event-detail-component',
    templateUrl: './cashier-event-detail-component.html',
    styleUrl: './cashier-event-detail-component.scss',
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
export class CashierEventDetailComponent {

    private readonly _httpClient = inject(HttpClient)
    private readonly _authService = inject(AuthService)
    public event: any;
    cashiers = signal([]);

    displayedColumns: string[] = ['operador', 'valorAbertura','valorDinheiro', "saldoTotal", 'Actions'];
    eventStatus = EventStatus;

    constructor(
        private readonly dialog: MatDialog,
        private readonly dialogRef: MatDialogRef<CashierEventDetailComponent>,
        private readonly snackbar: SnackbarService,
        @Inject(MAT_DIALOG_DATA) public data: any
    ) {
        this.event = data;
        this.fetchCashierList();
    }

    ngOnInit(): void {

    }

    closeDialog() {
        this.dialogRef.close();
    }

    addCaixa() {


        this.dialog.open(AddCashierComponent, {
            data:  this.event,
            width: "95%"
        })
    }

    endCashier(cashier: any) {
        // End cashier
    }

    cashierDetails(cashier: any) {
        const dialogRef = this.dialog.open(CashierDetailComponent, {
          data: cashier,
          width: "95%"
        });

        dialogRef.afterClosed().subscribe(result => {
          if (result) {
            // Aqui você pode executar sua lógica após o fechamento
                this.fetchCashierList();
          } else {
            console.log('O diálogo foi fechado sem resultado');
          }
        });
      }


    fetchCashierList() {
        this._httpClient.get(`${environment.API_URL}caixa/listacaixasbyeventoid/${this.event.id}`, {
            headers: {
                Authorization: 'Bearer ' + this._authService.accessToken
            }
        }).pipe(catchError(error => {
            throw error
        })).subscribe((data: ApiResponse<any>) => {

            if (data.success) {
                const cashiersWithTotal = data.result.map(cashier => ({
                  ...cashier,
                  saldoTotal: cashier.totalCaixaFormaPagamentoDto?.reduce(
                    (sum, item) => sum + item.valor,
                    0
                  ) || 0
                }));

                const sortedCashiers = cashiersWithTotal.sort((a, b) =>
                  a.operador.localeCompare(b.operador)
                );

                this.cashiers.set(sortedCashiers);

            }
        })
    }
}
