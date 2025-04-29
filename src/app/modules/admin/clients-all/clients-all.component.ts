import { CommonModule, CurrencyPipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { AfterViewInit, Component, ElementRef, inject, OnInit, signal, ViewChild } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { ApiResponse } from 'app/core/api/api-response.types';
import { AuthService } from 'app/core/auth/auth.service';
import { environment } from 'app/environments/environment';
import { CustomCurrencyPipe } from 'app/pipes/custom-currency.pipe';
import { CustomDatePipe } from 'app/pipes/custom-date.pipe';
import { catchError } from 'rxjs';

@Component({
    selector: 'app-clients-all',
    imports: [
        MatFormFieldModule,
        CommonModule,
        MatTableModule,
        MatPaginator,
        MatInputModule,
        CustomCurrencyPipe
    ],

    providers: [
        CurrencyPipe,
        CustomCurrencyPipe,
        CustomDatePipe
    ],
    templateUrl: './clients-all.component.html',
    styleUrl: './clients-all.component.scss'
})
export class ClientsAllComponent implements AfterViewInit {

    private readonly _httpClient = inject(HttpClient)
    private readonly _authService = inject(AuthService)

    @ViewChild(MatPaginator) paginator!: MatPaginator;

    @ViewChild('filterInput', { static: false }) filterInput: ElementRef;

    clients = signal([]);
    clientsDataSource = signal(new MatTableDataSource([]));


    displayedColumns = [
        "Nome",
        "CPF",
        "Saldo"
    ]

    fetchPagedRecords() {

        const pageNumber = this.paginator.pageIndex + 1;
        const pageSize = this.paginator.pageSize;

        this._httpClient.get(`${environment.API_URL}clientes/getallclientes/${pageSize}/${pageNumber}`, {
            headers: {
                "Authorization": `Bearer ${this._authService.accessToken}`
            }
        })
            .pipe(catchError((error) => {
                console.log(error);
                throw error;
            }))
            .subscribe((data: ApiResponse<any>) => {
                if (data.success) {



                    this.clientsDataSource().data = data.result;

                }
            });
    }

    ngAfterViewInit() {

        this.fetchTotalRecords(); // Primeiro, busca o total de registros

        // Configure os eventos de paginação e ordenação
        this.paginator.page.subscribe(() => this.fetchPagedRecords());

        // Monitore mudanças no campo de filtro
        this.filterInput.nativeElement.addEventListener('input', () => {
            const filterValue = this.filterInput.nativeElement.value.trim();
        });
        // Agora que o paginator está inicializado, chame fetchSells
        this.fetchPagedRecords();
    }


    handleFilterinput($event: any) {
        const input = $event.target as HTMLInputElement;

        if (input.value === '') {
            return;
        }

        if (input.value.length >= 4) {

            this._httpClient.get(`${environment.API_URL}clientes/GetClientesFiltered/${input.value}`, {
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
                    this.clientsDataSource().data = data.result;
                    this.paginator.length = data.totalRecords;
                    this.clientsDataSource().paginator = this.paginator;
                });


        }

    }

    fetchTotalRecords() {
        this._httpClient.get(`${environment.API_URL}clientes/totalclientes`, {
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

    applyFilter(event: Event) {
        const filterValue = (event.target as HTMLInputElement).value;


        const dataSource = new MatTableDataSource(this.clients())
        if (dataSource) {



            dataSource.sortingDataAccessor = (item: any, property) => {
                switch (property) {
                    case 'Nome':
                        return item.nome;
                    case 'Email':
                        return item.email;
                    case 'Ativo':
                        return item.ativo;
                    case 'CPF':
                        return item.cpf;
                    default:
                        return item[property];
                }
            };

        }
        dataSource.filter = filterValue.trim().toLowerCase();


        dataSource.paginator = this.paginator;
        this.clientsDataSource.set(dataSource);



    }

}
