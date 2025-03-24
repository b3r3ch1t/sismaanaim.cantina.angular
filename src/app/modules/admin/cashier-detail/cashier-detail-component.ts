import { CurrencyPipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, inject, Inject, signal, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { ApiResponse } from 'app/core/api/api-response.types';
import { AuthService } from 'app/core/auth/auth.service';
import { environment } from 'app/environments/environment';
import { CustomCurrencyPipe } from 'app/pipes/custom-currency.pipe';
import { CustomDatePipe } from 'app/pipes/custom-date.pipe';
import { catchError } from 'rxjs';

import { MatTabsModule } from '@angular/material/tabs';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';

@Component({
    selector: 'app-cashier-detail-component',
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

    displayedColumns: string[] = ['Descrição', 'Valor'];
    displayedColumnsHistorico: string[] = ['Horario', 'ClienteNome', 'TipoOperacao', 'Valor','AceitaEstorno', 'Actions'];
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


    closeDialog() {
        this.dialogRef.close();
    }

    applyFilter(event: Event) {
        const filterValue = (event.target as HTMLInputElement).value;
        this.historyDatasource.filter = filterValue.trim().toLowerCase();
    }
}



