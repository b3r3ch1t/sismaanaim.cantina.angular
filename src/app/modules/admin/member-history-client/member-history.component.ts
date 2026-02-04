import { Component, inject, OnInit, signal, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from 'app/core/auth/auth.service';
import { environment } from 'app/environments/environment';
import { SnackbarService } from 'app/services/snackbar.service';
import { ApiResponse } from 'app/core/api/api-response.types';
import { catchError } from 'rxjs/operators';
import { CustomCurrencyPipe } from 'app/pipes/custom-currency.pipe';
import { CustomDatePipe } from 'app/pipes/custom-date.pipe';

@Component({
  selector: 'app-member-history',
  templateUrl: './member-history.component.html',
  styleUrls: ['./member-history.component.scss'],
  standalone: true,
  providers: [
    CurrencyPipe,
    CustomCurrencyPipe,
    CustomDatePipe
  ],
  imports: [
    CommonModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    CustomCurrencyPipe,
    CustomDatePipe
  ]
})
export class MemberHistoryClientComponent implements OnInit, AfterViewInit {
  private readonly _httpClient = inject(HttpClient);
  private readonly _authService = inject(AuthService);
  private readonly _snackbarService = inject(SnackbarService);

  dataSource = signal(new MatTableDataSource<any>([]));
  displayedColumns: string[] = ['data', 'descricao', 'valor', 'tipo', 'transactionId'];

  @ViewChild(MatPaginator, { static: false }) paginator!: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort!: MatSort;

  constructor() { }

  ngOnInit(): void {
    this.loadClientHistory();
  }

  ngAfterViewInit(): void {
    // Conectar sort e paginator após a view ser inicializada
    if (this.dataSource()) {
      this.dataSource().paginator = this.paginator;
      this.dataSource().sort = this.sort;
    }
  }

  loadClientHistory(): void {
    // TODO: Implementar busca do histórico do cliente
    this._httpClient.get<ApiResponse<any[]>>(`${environment.API_URL}clientes/gethistoricoclientelogado`, {
      headers: {
        'Authorization': `Bearer ${this._authService.accessToken}`
      }
    }).pipe(
      catchError((error) => {
        console.error('Error loading client history:', error);
        this._snackbarService.error('Erro ao carregar histórico do cliente');
        throw error;
      })
    ).subscribe((response) => {
      if (response.success && response.result) {
        const dataSource = new MatTableDataSource(response.result);

        console.log("dados", response.result);
        dataSource.paginator = this.paginator;
        dataSource.sort = this.sort;
        this.dataSource.set(dataSource);
      }
    });
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource().filter = filterValue.trim().toLowerCase();
  }
}
