import { user } from './../../../mock-api/common/user/data';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { ApiResponse } from 'app/core/api/api-response.types';
import { AuthService } from 'app/core/auth/auth.service';
import { UserService } from 'app/core/user/user.service';
import { environment } from 'app/environments/environment';
import { CustomCurrencyPipe } from 'app/pipes/custom-currency.pipe';
import { CustomDatePipe } from 'app/pipes/custom-date.pipe';
import { catchError } from 'rxjs';

@Component({
    selector: 'app-summary',
    imports: [

        CommonModule,
        CustomDatePipe,
        CustomCurrencyPipe,
    ],
    providers: [
        CurrencyPipe,
    ],
    templateUrl: './summary.component.html',
    styleUrl: './summary.component.scss'
})
export class SummaryComponent implements OnInit, OnDestroy {

    private readonly _httpClient = inject(HttpClient)
    private readonly _authService = inject(AuthService)
    lastUpdate: Date = new Date();
    permissionaries = signal([]);


    private readonly _userService = inject(UserService);

    summaryBalanceClients: any;

    private _intervalId?: any;


    ngOnInit(): void {

        this.lastUpdate = new Date();
        this.fetchSummaryPermissionaries()

        if(this.isAdmin()){
            this.fetchSummaryBalanceClient();
        }

        this._intervalId = setInterval(() => {
            this.fetchSummaryPermissionaries();
        }, 60000);



    }


    isAdmin(): boolean { // Check if user is admin

        return this._userService.user.profiles.some(p => p.id === 4 || p.id === 5);
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


    fetchSummaryBalanceClient() {


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

                    this.summaryBalanceClients = data.result;

                }
            });
    }

}
