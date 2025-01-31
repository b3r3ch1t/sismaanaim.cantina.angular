import { Component, inject, OnInit, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from 'app/core/auth/auth.service';
import { UserService } from 'app/core/user/user.service';
import { catchError } from 'rxjs';
import { ApiResponse } from 'app/core/api/api-response.types';
import {MatTableModule} from '@angular/material/table';


@Component({
  selector: 'app-cashier-dashboard',
  imports: [
    MatTableModule
  ],
  templateUrl: './cashier-dashboard.component.html',
  styleUrl: './cashier-dashboard.component.scss'
})

export class CashierDashboardComponent implements OnInit {
  private _httpClient: HttpClient = inject(HttpClient);
  private _authService: AuthService = inject(AuthService);
  private _userService: UserService = inject(UserService);

  currentEvent = signal(null)
  clientHistory = signal([])

  displayedColumns = [
    "clienteNome",
    "formaPagamento",
    "tipoOperacao",
    "valor",
    "horario"
  ]

  ngOnInit(): void {
    this._httpClient.get(`https://apicantina.berechit.com.br/v1/sismaanaim/caixa/getcaixaativosbyoperadorid/${this._userService.user.id}`, {
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
        this.currentEvent.set(response.result)
        this.clientHistory.set(response.result.historicoCaixaDto)
        console.log(this.clientHistory())
      }

    });
  }

}
