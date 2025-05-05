import { CommonModule, CurrencyPipe } from '@angular/common';
import { Component, Inject, OnInit, ViewChild, AfterViewInit, signal, inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { CustomCurrencyPipe } from 'app/pipes/custom-currency.pipe';
import { CustomDatePipe } from 'app/pipes/custom-date.pipe';

import { MatTabsModule } from '@angular/material/tabs';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { AmmountCollectedCashierComponent } from '../ammount-collected-cashier/ammount-collected-cashier';
import { environment } from 'app/environments/environment';
import { HttpClient } from '@angular/common/http';
import { AuthService } from 'app/core/auth/auth.service';
import { catchError } from 'rxjs';
import { ApiResponse } from 'app/core/api/api-response.types';

@Component({
    selector: 'app-cashier-detail-component',
    standalone: true,
    templateUrl: './cashier-detail-component.html',
    styleUrl: './cashier-detail-component.scss',
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
        CustomDatePipe,
        MatTabsModule,
        MatPaginator,
        MatSortModule,
        CommonModule
    ],
    providers: [
        CurrencyPipe,
        CustomCurrencyPipe,
        CustomDatePipe
    ],
})
export class CashierDetailComponent implements OnInit, AfterViewInit {

    public cashier: any;
    @ViewChild(MatPaginator) paginator!: MatPaginator;
    @ViewChild('historySort') historySort!: MatSort;
    @ViewChild('moedaSort') moedaSort!: MatSort;

    @ViewChild(MatSort, { static: false }) sort!: MatSort;

    private readonly _httpClient = inject(HttpClient);
    private readonly _authService = inject(AuthService);

    cashierDataSource = signal(new MatTableDataSource([]));
    abastecimentoDataSource = signal(new MatTableDataSource([]));


    displayedColumns: string[] = ['Descrição', 'Valor'];
    displayedColumnsHistorico: string[] = ['Horario', 'ClienteNome', 'TipoOperacao', 'Valor', 'AceitaEstorno', 'Actions'];
    displayedColumnsAmmountCollected = [
        "formaPagamentoNome",
        "totalFormaPagamento",
        "valorApurado",
        "diferenca",
        "informado",
    ]

    historyDatasource = new MatTableDataSource([]);
    totalPorMoedasDataSource = new MatTableDataSource<any>([]);
    historicoCaixaDto = [];
    constructor(

        private readonly dialogRef: MatDialogRef<CashierDetailComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any

    ) {
        this.cashier = data;
        this.totalPorMoedasDataSource = new MatTableDataSource(data.totalCaixaFormaPagamentoDto);


        this.historicoCaixaDto = data.historicoCaixaDto;

    }

    ngOnInit() {
        this.historyDatasource = new MatTableDataSource(this.historicoCaixaDto);

        this.fetchCashierList();
    }


    ngAfterViewInit() {
        this.historyDatasource.paginator = this.paginator;
        this.historyDatasource.sort = this.historySort;

        // Opcional, se você quiser personalizar o comportamento da ordenação:
        this.historyDatasource.sortingDataAccessor = (item: any, property: string) => {
            switch (property) {
                case 'Horario':
                    return new Date(item.horario); // para garantir que datas ordenem corretamente
                case 'ClienteNome':
                    return item.clienteNome?.toLowerCase();
                case 'TipoOperacao':
                    return item.tipoOperacao?.toLowerCase();
                case 'Valor':
                    return item.valor;
                case 'Estorno':
                    return item.aceitaEstorno;
                default:
                    return item[property];
            }
        };


        this.totalPorMoedasDataSource.sort = this.moedaSort;
        this.totalPorMoedasDataSource.sortingDataAccessor = (item: any, property: string) => {
            switch (property) {
                case 'Descrição':
                    return item.descricao?.toLowerCase();
                case 'Valor':
                    return item.valor;
                default:
                    return item[property];
            }
        };
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

                console.log(data.result);

                const dataSource = new MatTableDataSource(data.result.formasPagamento);
                let dataSourceAbastecimento = new MatTableDataSource(data.result.abastecimentos);
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

                    dataSourceAbastecimento = new MatTableDataSource(data.result.abastecimentos);
                    dataSourceAbastecimento.sortingDataAccessor = (item: any, property) => {
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
                    }
                        this.abastecimentoDataSource.set(dataSourceAbastecimento);


                }
            }

        });
    }


    closeDialog() {
        this.dialogRef.close();
    }

    applyFilter(event: Event) {
        const filterValue = (event.target as HTMLInputElement).value;
        this.historyDatasource.filter = filterValue.trim().toLowerCase();
    }
}



