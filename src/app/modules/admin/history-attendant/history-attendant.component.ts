import { CurrencyPipe } from '@angular/common';
import { AfterViewInit, Component, Inject, ViewChild } from '@angular/core';
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
import { MatTabsModule } from '@angular/material/tabs';
import { CustomCurrencyPipe } from 'app/pipes/custom-currency.pipe';
import { CustomDatePipe } from 'app/pipes/custom-date.pipe';
import { HttpClient } from '@angular/common/http';
import { ApiResponse } from 'app/core/api/api-response.types';
import { AuthService } from 'app/core/auth/auth.service';
import { environment } from 'app/environments/environment';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

@Component({
    selector: 'app-history-attendant',
    standalone: true,
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
        MatPaginatorModule,
        MatSortModule,
    ],
    providers: [
        CurrencyPipe,
        CustomCurrencyPipe,
        CustomDatePipe
    ],
    templateUrl: './history-attendant.component.html',
    styleUrls: ['./history-attendant.component.scss']
})
export class HistoryAttendantComponent implements AfterViewInit {
    attendant: any;
    historyDatasource = new MatTableDataSource<any>([]);
    displayedColumnsHistorico: string[] = ['Horario', 'clienteNome', 'permissionarioNome', 'valor'];

    private readonly _httpClient: HttpClient;
    private readonly _authService: AuthService;

    @ViewChild(MatPaginator) paginator!: MatPaginator;
    @ViewChild(MatSort) sort!: MatSort;

    constructor(
        @Inject(MAT_DIALOG_DATA) public data: any,
        private readonly dialogRef: MatDialogRef<HistoryAttendantComponent>,
        httpClient: HttpClient,
        authService: AuthService
    ) {
        this._httpClient = httpClient;
        this._authService = authService;
        this.attendant = data;
        this.fetchHistoryAttendant();
    }

    ngAfterViewInit() {
        this.historyDatasource.paginator = this.paginator;
        this.historyDatasource.sort = this.sort;
    }

    closeDialog() {
        this.dialogRef.close();
    }

    applyFilter(event: Event) {
        const filterValue = (event.target as HTMLInputElement).value;
        this.historyDatasource.filter = filterValue.trim().toLowerCase();
        if (this.historyDatasource.paginator) {
            this.historyDatasource.paginator.firstPage();
        }
    }

    fetchHistoryAttendant() {
        this._httpClient.get<ApiResponse<any>>(`${environment.API_URL}atendente/gethistoricoatendenteeventoatualbyid/${this.attendant.id}`, {
            headers: {
                Authorization: 'Bearer ' + this._authService.accessToken
            }
        }).pipe(
            catchError(error => {
                console.error('Erro ao buscar histórico do atendente:', error);
                return throwError(error);
            })
        ).subscribe((data: ApiResponse<any>) => {
            if (data.success) {

                const sortedHistory = data.result.sort((a, b) =>
                    a.data.localeCompare(b.data)
                );
                this.historyDatasource.data = sortedHistory;


                const dataSource = new MatTableDataSource(sortedHistory);
                if (dataSource) {
                    dataSource.sortingDataAccessor = (item: any, property) => {
                        switch (property) {
                            case 'Horario':
                                return item.data;
                            case 'clienteNome	':
                                return item.clienteNome;
                            case 'permissionarioNome':
                                return Number(item.permissionarioNome);
                            case 'valor':
                                return Number(item.valor);
                            default:
                                return item[property];
                        }
                    };

                    dataSource.paginator = this.paginator;
                    dataSource.sort = this.sort;
                }
            }
        });
    }
}
