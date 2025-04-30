import { CommonModule, CurrencyPipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, inject, Inject, OnInit, signal, ViewChild } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { ApiResponse } from 'app/core/api/api-response.types';
import { AuthService } from 'app/core/auth/auth.service';
import { environment } from 'app/environments/environment';
import { CustomCurrencyPipe } from 'app/pipes/custom-currency.pipe';
import { CustomDatePipe } from 'app/pipes/custom-date.pipe';
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
        MatPaginatorModule
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
        "Actions"
    ]

    constructor(

        @Inject(MAT_DIALOG_DATA) public data: { event: any, cashier: any },

        private readonly dialogRef: MatDialogRef<EndCashierComponent>,

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

}
