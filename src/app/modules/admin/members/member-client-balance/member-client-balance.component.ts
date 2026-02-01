import { HttpClient } from '@angular/common/http';
import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { catchError } from 'rxjs';
import { AuthService } from 'app/core/auth/auth.service';
import { environment } from 'app/environments/environment';
import { ApiResponse } from 'app/core/api/api-response.types';
import { CustomCurrencyPipe } from 'app/pipes/custom-currency.pipe';
import { CustomDatePipe } from 'app/pipes/custom-date.pipe';

@Component({
  selector: 'app-member-client-balance',
  imports: [
    CommonModule,
    CustomCurrencyPipe,
    CustomDatePipe
  ],
  templateUrl: './member-client-balance.component.html',
  styleUrl: './member-client-balance.component.scss',


  providers: [
    CurrencyPipe,
    CustomCurrencyPipe,
    CustomDatePipe
  ],
})
export class MemberClientBalanceComponent implements OnInit {

  private readonly _httpClient = inject(HttpClient);
  private readonly _authService = inject(AuthService);

  client = signal<any>(null);
  isLoading = signal<boolean>(false);


  ngOnInit(): void {
    this.fetchClient();
  }


  fetchClient(): void {
    this.isLoading.set(true);
    console.log('Iniciando busca dos dados do cliente...');
    console.log('URL:', `${environment.API_URL}clientes/getsaldoclientelogado`);
    console.log('Token:', this._authService.accessToken);

    this._httpClient.get(`${environment.API_URL}clientes/getsaldoclientelogado`, {
      headers: {
        "Authorization": `Bearer ${this._authService.accessToken}`
      }
    })
      .pipe(catchError((error) => {
        console.error('Erro ao buscar dados do cliente:', error);
        this.isLoading.set(false);
        throw error;
      }))
      .subscribe((data: ApiResponse<any>) => {

        this.isLoading.set(false);
        if (data.success) {
          this.client.set(data.result);

        } else {
          console.warn('API retornou success=false');
        }
      });
  }

}
