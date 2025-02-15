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
import { CurrencyPipe, formatDate } from '@angular/common';
import { CustomDatePipe } from 'app/pipes/custom-date.pipe';

@Component({
  selector: 'app-attendant-my-actions',
  templateUrl: './attendant-my-actions.component.html',
  styleUrls: ['./attendant-my-actions.component.css'],
  imports: [
    MatTableModule,
    MatSortModule,
    MatSort,
    MatPaginator,
    CustomCurrencyPipe,
    CustomDatePipe
  ],
  providers : [
    CurrencyPipe,
  ],
})
export class AttendantMyActionsComponent implements OnInit, AfterViewInit {

  private _httpClient: HttpClient = inject(HttpClient);
  private _authService: AuthService = inject(AuthService);
  private _userService: UserService = inject(UserService);

  @ViewChild(MatPaginator, { static: false }) paginator!: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort!: MatSort;

  history = signal([]);
  dataSource = signal(new MatTableDataSource(this.history()));

  displayedColumns = [
    "clienteNome",
    "formaPagamento",
    "tipoOperacao",
    "valor",
    "horario"
  ]

  constructor() { }

  ngOnInit(): void {
    this._httpClient.get(`${environment.API_URL}atendente/getatendentebyid/${this._userService.user.id}`, {
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


        const eventId = response.result.eventoId.trim();

        this._httpClient.get(`${environment.API_URL}atendente/getmyhistorybyeventoId/${eventId}`,{
          headers: {
            Authorization: `Bearer ${this._authService.accessToken}`
          }
        }).pipe(
          catchError((error) => {
            console.log(error);
            throw error
          })
        ).subscribe((response: ApiResponse<any>) => {
          console.log("history response => ", response)
        })


        // this.history.set(response.result.historicoCaixaDto)
        // this.dataSource.set(new MatTableDataSource(this.history()));
        // if (this.dataSource()) {
        //   console.log(this.dataSource())
        //   this.dataSource().paginator = this.paginator;
        //   this.dataSource().sort = this.sort;
        // }
      }

    });
  }


  ngAfterViewInit(): void {
    if (this.dataSource) {
      this.dataSource().paginator = this.paginator;
      this.dataSource().sort = this.sort;
    }
  }


}
