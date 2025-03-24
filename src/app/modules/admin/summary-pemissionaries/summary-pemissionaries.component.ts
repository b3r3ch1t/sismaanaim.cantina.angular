import { CommonModule, CurrencyPipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { ApiResponse } from 'app/core/api/api-response.types';
import { AuthService } from 'app/core/auth/auth.service';
import { environment } from 'app/environments/environment';
import { CustomCurrencyPipe } from 'app/pipes/custom-currency.pipe';
import { CustomDatePipe } from 'app/pipes/custom-date.pipe';
import { catchError } from 'rxjs';

@Component({
    selector: 'app-summary-pemissionaries',
    imports: [

        CommonModule,
        CustomDatePipe,
        CustomCurrencyPipe,
    ],
    providers: [
        CurrencyPipe,
    ],
    templateUrl: './summary-pemissionaries.component.html',
    styleUrl: './summary-pemissionaries.component.scss'
})
export class SummaryPemissionariesComponent implements OnInit, OnDestroy {

    private readonly _httpClient = inject(HttpClient)
    private readonly _authService = inject(AuthService)

    permissionaries = signal([]);
    private _intervalId?: any;


    ngOnInit(): void {
        this.fetchSummaryPermissionaries()


        this._intervalId = setInterval(() => {
            this.fetchSummaryPermissionaries();
        }, 60000);
    }

    ngOnDestroy(): void {
        if (this._intervalId) {
            clearInterval(this._intervalId);
        }
    }

    fetchSummaryPermissionaries() {
        const now = new Date().toLocaleTimeString();


        this._httpClient.get(`${environment.API_URL}dashboard/getresumopemissionarios`, {
            headers: {
                "Authorization": `Bearer ${this._authService.accessToken}`
            }
        })
            .pipe(catchError((error) => {
                console.log(error);
                throw error;
            }))
            .subscribe((data: ApiResponse<any>) => {
                this.permissionaries.set(data.result);
            });
    }

}
