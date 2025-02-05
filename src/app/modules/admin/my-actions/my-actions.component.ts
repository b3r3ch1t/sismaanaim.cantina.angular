import { HttpClient } from '@angular/common/http';
import { Component, inject, OnInit, signal } from '@angular/core';
import { ApiResponse } from 'app/core/api/api-response.types';
import { AuthService } from 'app/core/auth/auth.service';
import { UserService } from 'app/core/user/user.service';
import { catchError } from 'rxjs';
import { MatTableModule } from '@angular/material/table';
import { environment } from 'app/environments/environment';

@Component({
  selector: 'app-my-actions',
  imports: [
    MatTableModule
  ],
  templateUrl: './my-actions.component.html',
  styleUrl: './my-actions.component.scss'
})
export class MyActionsComponent implements OnInit {

  private _httpClient : HttpClient = inject(HttpClient);
  private _authService : AuthService = inject(AuthService);
  private _userService : UserService = inject(UserService);

  clientHistory = signal([]);

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
      }

    });
  }

}
