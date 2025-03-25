import { CommonModule, CurrencyPipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { ApiResponse } from 'app/core/api/api-response.types';
import { AuthService } from 'app/core/auth/auth.service';
import { environment } from 'app/environments/environment';
import { CustomCurrencyPipe } from 'app/pipes/custom-currency.pipe';
import { CustomDatePipe } from 'app/pipes/custom-date.pipe';
import { catchError } from 'rxjs';


@Component({
    selector: 'app-summary-balance-cashiers',

    imports: [

        CommonModule,
        CustomDatePipe,
        CustomCurrencyPipe,
    ],
    providers: [
        CurrencyPipe,
    ],
    templateUrl: './summary-balance-cashiers.component.html',
    styleUrl: './summary-balance-cashiers.component.scss'
})




export class SummaryBalanceCashiersComponent {

    private readonly _httpClient = inject(HttpClient)
    private readonly _authService = inject(AuthService)

    public summaryBalanceCashies: any[] = [];
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


        this._httpClient.get(`${environment.API_URL}dashboard/getresumocaixas`, {
            headers: {
                "Authorization": `Bearer ${this._authService.accessToken}`
            }
        })
            .pipe(catchError((error) => {
                console.log(error);
                throw error;
            }))
            .subscribe((data: ApiResponse<any>) => {

                console.log(data);

                if (data.success) {

                    this.summaryBalanceCashies = data.result as any[];
                };
            });
    }

    get totalDinheiro(): number {
        return this.summaryBalanceCashies.reduce((sum, item) => sum + item.saldoDinheiro, 0);
    }

    get totalPix(): number {
        return this.summaryBalanceCashies.reduce((sum, item) => sum + item.saldoPix, 0);
    }

    get totalGeral(): number {
        return this.summaryBalanceCashies.reduce((sum, item) => sum + item.saldoTotal, 0);
    }

}
