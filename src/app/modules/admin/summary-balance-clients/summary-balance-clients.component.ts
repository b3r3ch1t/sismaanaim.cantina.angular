import { CommonModule, CurrencyPipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { ApiResponse } from 'app/core/api/api-response.types';
import { AuthService } from 'app/core/auth/auth.service';
import { environment } from 'app/environments/environment';
import { CustomCurrencyPipe } from 'app/pipes/custom-currency.pipe';
import { CustomDatePipe } from 'app/pipes/custom-date.pipe';
import { catchError } from 'rxjs';



interface SummaryBalanceClients {

    saldoMaximo: number;
    saldoMinimo: number;
    saldoMedio: number;
    saldoTotal: number;
    totalClients: number;
}


@Component({
    selector: 'app-summary-balance-clients',
    imports: [

        CommonModule,
        CustomDatePipe,
        CustomCurrencyPipe,
    ],
    providers: [
        CurrencyPipe,
    ],
    templateUrl: './summary-balance-clients.component.html',
    styleUrl: './summary-balance-clients.component.scss'
})
export class SummaryBalanceClientsComponent implements OnInit, OnDestroy {
    private readonly _httpClient = inject(HttpClient)
    private readonly _authService = inject(AuthService)

    public summaryBalanceClients = signal<SummaryBalanceClients>(null);
    private _intervalId?: any;





    ngOnInit(): void {
        this.fetchSummaryBalanceClient()


        this._intervalId = setInterval(() => {
            this.fetchSummaryBalanceClient();
        }, 60000);
    }

    ngOnDestroy(): void {
        if (this._intervalId) {
            clearInterval(this._intervalId);
        }
    }

    fetchSummaryBalanceClient() {
        const now = new Date().toLocaleTimeString();


        this._httpClient.get(`${environment.API_URL}dashboard/getresumosaldoclientes`, {
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

                    this.summaryBalanceClients.set(data.result);

                }
            });
    }

}
