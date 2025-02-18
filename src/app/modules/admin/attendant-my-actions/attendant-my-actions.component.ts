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
  providers: [
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
    "data",
    "valor",
  ]

  constructor() { }

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
        console.log("Event response => ", response)
        const eventId = response.result.eventoId.trim()
        console.log("EVENT ID:", eventId)

        this._httpClient.get(`${environment.API_URL}atendente/getmyhistorybyeventoid/${eventId}`, {
          headers: {
            Authorization: `Bearer ${this._authService.accessToken}`
          }
        }).pipe(
          catchError((error) => {
            console.log(error);
            throw error
          })
        ).subscribe((response: ApiResponse<any>) => {
          console.log(response.result)
          this.history.set(response.result)
          console.log(this.history())
          const dataSource = new MatTableDataSource(this.history())
          if(dataSource){
            console.log("data source", dataSource)

            console.log("paginator => ", this.paginator)
            console.log("sort => ", this.sort)

            dataSource.paginator = this.paginator;
            dataSource.sort = this.sort;
            this.dataSource.set(dataSource);
          }
        })



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