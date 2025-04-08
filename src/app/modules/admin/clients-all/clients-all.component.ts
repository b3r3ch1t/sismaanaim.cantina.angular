import { CommonModule, CurrencyPipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, inject, OnInit, signal, ViewChild } from '@angular/core';
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
        MatSortModule,
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
export class ClientsAllComponent implements OnInit {

    private readonly _httpClient = inject(HttpClient)
    private readonly _authService = inject(AuthService)

    @ViewChild(MatPaginator, { static: false }) paginator!: MatPaginator;
    @ViewChild(MatSort, { static: false }) sort!: MatSort;


    clients = signal([]);
    clientsDataSource = signal(new MatTableDataSource([]));


    displayedColumns = [
        "Nome",
        "CPF",
        "Saldo"
    ]



    ngOnInit(): void {
        this.fetchClients()
    }


    fetchClients() {
        this._httpClient.get(`${environment.API_URL}clientes/getallclientes`, {
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


                    data.result.sort((a, b) => a.nome.localeCompare(b.nome));
                    this.clients.set(data.result);

                    const dataSource = new MatTableDataSource(this.clients())
                    if (dataSource) {



                        dataSource.sortingDataAccessor = (item: any, property) => {
                            switch (property) {
                                case 'Nome':
                                    return item.nome;
                                case 'CPF':
                                    return item.cpf;
                                default:
                                    return item[property];
                            }
                        };

                        dataSource.paginator = this.paginator;
                        dataSource.sort = this.sort;
                        this.clientsDataSource.set(dataSource);
                    }
                }
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
        dataSource.sort = this.sort;
        this.clientsDataSource.set(dataSource);



    }

}
