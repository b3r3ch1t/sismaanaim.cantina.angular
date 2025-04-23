import { CommonModule, CurrencyPipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { AfterViewInit, Component, ElementRef, inject, OnInit, signal, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { ApiResponse } from 'app/core/api/api-response.types';
import { AuthService } from 'app/core/auth/auth.service';
import { environment } from 'app/environments/environment';
import { CustomCurrencyPipe } from 'app/pipes/custom-currency.pipe';
import { CustomDatePipe } from 'app/pipes/custom-date.pipe';
import { ConfirmationService } from 'app/services/confirmation.service';
import { SnackbarService } from 'app/services/snackbar.service';
import { catchError } from 'rxjs';

@Component({
    selector: 'app-refund',
    templateUrl: './refund.component.html',
    styleUrls: ['./refund.component.css'],
    imports: [
        MatTableModule,
        MatPaginator,
        MatButtonModule,
        MatIconModule,
        MatCheckboxModule,
        CustomDatePipe,
        CustomCurrencyPipe,
        CommonModule,
        MatInputModule,
    ]

    ,
    providers: [
        CurrencyPipe,
        CustomCurrencyPipe,
        CustomDatePipe
    ],
})
export class RefundComponent implements OnInit, AfterViewInit {



    showClearButton = signal(false);
    sellsDataSource = signal(new MatTableDataSource([]));

    private readonly _httpClient = inject(HttpClient);
    private readonly _authService = inject(AuthService);

    displayedColumns = [
        "Nome",
        "Data",
        "Valor",
        "TransactionId",
        "Estado",
        "Ações",
    ]

    @ViewChild(MatPaginator) paginator!: MatPaginator;
    @ViewChild('filterInput', { static: false }) filterInput: ElementRef;

    constructor(
        private readonly confirmationService: ConfirmationService,
        private readonly snackbarService: SnackbarService,
        private readonly customDatePipe: CustomDatePipe,
    ) { }

    ngOnInit() {
        // Não chame fetchSells aqui, pois o paginator ainda não está inicializado
    }

    applyFilter(event: Event) {

        const filterValue = (event.target as HTMLInputElement).value;


        this.sellsDataSource().filter = filterValue.trim().toLowerCase();


    }


    ngAfterViewInit() {
        this.fetchTotalRecords(); // Primeiro, busca o total de registros

        // Configure os eventos de paginação e ordenação
        this.paginator.page.subscribe(() => this.fetchPagedRecords());

        // Monitore mudanças no campo de filtro
        this.filterInput.nativeElement.addEventListener('input', () => {
            const filterValue = this.filterInput.nativeElement.value.trim();
            this.showClearButton.set(filterValue.length > 0);
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

    clearInputs() {
        this.showClearButton.set(false);
        this.sellsDataSource().filter = '';

        this.filterInput.nativeElement.value = '';
        this.sellsDataSource.set(new MatTableDataSource([]));


        this.fetchTotalRecords();
        this.fetchPagedRecords();

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
                // Ordena os dados por 'data.result.data' em ordem decrescente antes de atribuir
                data.result.sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());

                // Atualize os dados diretamente no MatTableDataSource existente
                this.sellsDataSource().data = data.result;
            });
    }

    handleFilterinput($event: any) {
        const input = $event.target as HTMLInputElement;

        if (input.value === '') {
            this.showClearButton.set(false);
            this.clearInputs();
            return;
        }

        if (input.value.length >= 4) {

            this._httpClient.get(`${environment.API_URL}permissionario/GetVendasFiltered/${input.value}`, {
                headers: {
                    "Authorization": `Bearer ${this._authService.accessToken}`
                }
            })
                .pipe(catchError((error) => {
                    console.log(error);
                    throw error;
                }))
                .subscribe((data: ApiResponse<any[]>) => {

                    // Ordena os dados por 'data.result.data' em ordem decrescente antes de atribuir
                    data.result.sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());

                    // Atualize os dados diretamente no MatTableDataSource existente
                    this.sellsDataSource().data = data.result;
                    this.paginator.length = data.totalRecords;
                    this.sellsDataSource().paginator = this.paginator;
                });


        }
    }

    formatDate(date: string): string {
        return this.customDatePipe.transform(date);
    }

    refundSell(sell) {


        const formatter = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

        const confirmationMessage = [
            `Nome: ${sell.clienteNome}`,
            `Data: ${this.formatDate(sell.data)}`,
            `Transação: ${sell.transactionId}`,
            `Valor: ${formatter.format(sell.valor)}`
        ].join('<br>');

        this.confirmationService.confirm("Tem certeza que deseja cancelar a venda abaixo?", confirmationMessage).subscribe(result => {
            if (result) {


                this._httpClient.post(`${environment.API_URL}permissionario/estornarvendabytransactionid/${sell.transactionId}`, null).pipe(
                    catchError((error) => {
                        console.log(error);
                        throw error
                    })
                ).subscribe((response: ApiResponse<any>) => {
                    console.log(response)

                    if (response.success) {

                        this.snackbarService.success(
                            `Venda cancelada com sucesso!`,
                            30 * 1000
                        );

                    } else {
                        this.snackbarService.error(
                            `Erro ao cancelar a venda: ${response.message}`,
                            30 * 1000
                        );
                    }
                    this.clearInputs();
                    this.ngAfterViewInit();
                })
            }
        });



    }
}
