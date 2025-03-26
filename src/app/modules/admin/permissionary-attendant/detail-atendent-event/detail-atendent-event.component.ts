import { CurrencyPipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, inject, OnInit, ViewChild, AfterViewInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldControl, MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { ApiResponse } from 'app/core/api/api-response.types';
import { AuthService } from 'app/core/auth/auth.service';
import { UserService } from 'app/core/user/user.service';
import { environment } from 'app/environments/environment';
import { CustomCurrencyPipe } from 'app/pipes/custom-currency.pipe';
import { CustomDatePipe } from 'app/pipes/custom-date.pipe';
import { ConfirmationService } from 'app/services/confirmation.service';
import { SnackbarService } from 'app/services/snackbar.service';
import { catchError } from 'rxjs';

@Component({
    selector: 'app-detail-atendent-event',
    imports: [
        MatDialogModule,
        MatTableModule,
        MatPaginator,
        MatSortModule,
        CustomCurrencyPipe,
        CustomDatePipe,
        MatFormFieldModule,
        MatInputModule
    ],
    providers: [CurrencyPipe],
    templateUrl: './detail-atendent-event.component.html',
    styleUrl: './detail-atendent-event.component.scss'
})
export class DetailAtendentEventComponent implements OnInit {

    dataSource = new MatTableDataSource<any>([]);
    displayedColumns = ['nome', 'data', 'valor'];

    @ViewChild(MatPaginator, { static: false }) paginator!: MatPaginator;
    @ViewChild(MatSort, { static: false }) sort!: MatSort;

    private readonly _httpClient = inject(HttpClient);
    private readonly _authService = inject(AuthService);
    private readonly _userService = inject(UserService);

    constructor(
        private readonly dialogRef: MatDialogRef<DetailAtendentEventComponent>,
        private readonly snackbarService: SnackbarService,
        private readonly confirmationService: ConfirmationService,
        @Inject(MAT_DIALOG_DATA) public user: any // Receive user data
    ) { }

    ngOnInit(): void {
        this.dataSource.sortingDataAccessor = (item, property) => {
            switch (property) {
                case 'nome':
                    return item.clienteNome?.toLowerCase(); // safe for sorting
                case 'data':
                    return item.data;
                case 'valor':
                    return item.valor;
                default:
                    return item[property];
            }
        };
        this.fetchHistorico();
    }

    applyFilter(event: Event) {
        const filterValue = (event.target as HTMLInputElement).value;
        this.dataSource.filter = filterValue.trim().toLowerCase();
    }

    fetchHistorico(): void {
        console.log(this.user);


        this._httpClient.get(`${environment.API_URL}atendente/gethistoricoatendenteEventoAtualbyid/${this.user.id}`, {
            headers: {
                Authorization: `Bearer ${this._authService.accessToken}`
            }
        }).pipe(
            catchError(error => {
                console.error(error);
                throw error;
            })
        ).subscribe((response: ApiResponse<any>) => {
            if (response.success) {
                if (response.success) {
                    this.dataSource.data = response.result;



                    this.dataSource.paginator = this.paginator;
                    this.dataSource.sort = this.sort;
                }
            }
        });
    }

    closeDialog(): void {
        this.dialogRef.close();
    }
}
