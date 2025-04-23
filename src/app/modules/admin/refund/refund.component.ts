import { CurrencyPipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { AfterViewInit, Component, inject, OnInit, signal, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { ApiResponse } from 'app/core/api/api-response.types';
import { AuthService } from 'app/core/auth/auth.service';
import { environment } from 'app/environments/environment';
import { CustomCurrencyPipe } from 'app/pipes/custom-currency.pipe';
import { CustomDatePipe } from 'app/pipes/custom-date.pipe';
import { SnackbarService } from 'app/services/snackbar.service';
import { catchError } from 'rxjs';

@Component({
    selector: 'app-refund',
    templateUrl: './refund.component.html',
    styleUrls: ['./refund.component.css'],
    imports: [
        MatTableModule,
        MatPaginator,
        MatSortModule,
        MatButtonModule,
        MatIconModule,
        MatCheckboxModule,
        CustomDatePipe,
        CustomCurrencyPipe]

    ,
    providers: [
        CurrencyPipe,
        CustomCurrencyPipe,
        CustomDatePipe
    ],
})
export class RefundComponent implements OnInit, AfterViewInit {

    sellsDataSource = signal(new MatTableDataSource([]));

    private readonly _httpClient = inject(HttpClient);
    private readonly _authService = inject(AuthService);

    displayedColumns = [
        "Nome",
        "Data",
        "Valor",
        "TransactionId",
        "Ações",
    ]

    @ViewChild(MatPaginator) paginator!: MatPaginator;
    @ViewChild(MatSort) sort!: MatSort;


    constructor(

        private readonly snackbarService: SnackbarService,
    ) { }

    ngOnInit() {
        // Não chame fetchSells aqui, pois o paginator ainda não está inicializado
    }

    ngAfterViewInit() {
        this.fetchTotalRecords(); // Primeiro, busca o total de registros

        // Configure os eventos de paginação e ordenação
        this.paginator.page.subscribe(() => this.fetchPagedRecords());
        this.sort.sortChange.subscribe(() => {
            this.paginator.pageIndex = 0;
            this.fetchPagedRecords();
        });

        // Agora que o paginator está inicializado, chame fetchSells
        this.fetchPagedRecords();
    }

    fetchTotalRecords() {
        this._httpClient.get(`${environment.API_URL}permissionario/totalvendasbyeventoatual`, {
            headers: {
                "Authorization": `Bearer ${this._authService.accessToken}`
            }
        })
            .pipe(catchError((error) => {
                console.log(error);
                throw error;
            }))
            .subscribe((totalResponse: ApiResponse<number>) => {
                // Atualize o total de registros no paginator
                this.paginator.length = totalResponse.result; // Supondo que `result` contém o total de registros
            });
    }

    fetchPagedRecords() {
        const pageNumber = this.paginator.pageIndex + 1;
        const pageSize = this.paginator.pageSize;

        this._httpClient.get(`${environment.API_URL}permissionario/GetVendasByPermissionarioId/${pageSize}/${pageNumber}`, {
            headers: {
                "Authorization": `Bearer ${this._authService.accessToken}`
            }
        })
            .pipe(catchError((error) => {
                console.log(error);
                throw error;
            }))
            .subscribe((data: ApiResponse<any[]>) => {
                // Atualize os dados diretamente no MatTableDataSource existente

                this.sellsDataSource().data = data.result;

                // Configure a ordenação padrão
                if (this.sort) {
                    this.sort.active = 'data';
                    this.sort.direction = 'desc';
                }

                this.sellsDataSource().sortingDataAccessor = (item: any, property) => {
                    switch (property) {
                        case 'Nome':
                            return item.clienteNome?.toLowerCase() || ''; // Ordena por nome do cliente
                        case 'Data':
                            return new Date(item.data).getTime(); // Ordena por data
                        case 'Valor':
                            return item.valor || 0; // Ordena por valor
                        case 'TransactionId':
                            return item.transactionId || ''; // Ordena por TransactionId
                        default:
                            return item[property] || ''; // Ordena por qualquer outra propriedade
                    }
                };

                // Vincule o paginator e o sort ao MatTableDataSource
                //this.sellsDataSource().paginator = this.paginator;
                this.sellsDataSource().sort = this.sort;
            });
    }

}
