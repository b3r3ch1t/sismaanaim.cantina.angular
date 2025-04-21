import { HttpClient } from '@angular/common/http';
import { AfterViewInit, Component, inject, OnInit, signal, ViewChild } from '@angular/core';
import { ApiResponse } from 'app/core/api/api-response.types';
import { AuthService } from 'app/core/auth/auth.service';
import { UserService } from 'app/core/user/user.service';
import { catchError } from 'rxjs';
import { environment } from 'app/environments/environment';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { CustomCurrencyPipe } from 'app/pipes/custom-currency.pipe';
import { CurrencyPipe } from '@angular/common';
import { CustomDatePipe } from 'app/pipes/custom-date.pipe';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
@Component({
    selector: 'app-my-actions',
    imports: [
        MatTableModule,
        MatSortModule,
        MatSort,
        MatPaginator,
        CustomCurrencyPipe,
        CustomDatePipe,
        MatFormFieldModule,
        MatInputModule,
    ],
    providers: [
        CurrencyPipe,
    ],
    templateUrl: './my-actions.component.html',
    styleUrl: './my-actions.component.scss'
})

export class MyActionsComponent implements OnInit, AfterViewInit {

    private readonly _httpClient: HttpClient = inject(HttpClient);
    private readonly _authService: AuthService = inject(AuthService);
    private readonly _userService: UserService = inject(UserService);

    @ViewChild(MatPaginator, { static: false }) paginator!: MatPaginator;
    @ViewChild(MatSort, { static: false }) sort!: MatSort;

    clientHistory = signal([]);
    dataSource = signal(new MatTableDataSource(this.clientHistory()));

    displayedColumns = [
        "clienteNome",
        "formaPagamento",
        "tipoOperacao",
        "valor",
        "horario"
    ]

    ngOnInit(): void {
        this._httpClient.get(`${environment.API_URL}caixa/getcaixaativosbyoperadorid/${this._userService.user.id}`, {
            headers: {
                Authorization: `Bearer ${this._authService.accessToken}`
            }
        }).pipe(
            catchError((error) => {
                console.log(error);
                throw error
            })
        ).subscribe((response: ApiResponse<any>) => {
            if (response.success) {
                console.log(response)
                this.clientHistory.set(response.result.historicoCaixaDto)
                this.dataSource.set(new MatTableDataSource(this.clientHistory()));
                if (this.dataSource()) {
                    console.log(this.dataSource())
                    this.dataSource().paginator = this.paginator;
                    this.dataSource().sort = this.sort;
                }
            }

        });
    }

    applyFilter(event: Event) {

        const filterValue = (event.target as HTMLInputElement).value;
        this.dataSource().filter = filterValue.trim().toLowerCase();


    }

    ngAfterViewInit(): void {
        if (this.dataSource) {
            this.dataSource().paginator = this.paginator;
            this.dataSource().sort = this.sort;
        }
    }

}
