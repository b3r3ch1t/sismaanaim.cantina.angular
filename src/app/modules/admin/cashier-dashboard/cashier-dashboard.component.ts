import { CurrencyPipe } from '@angular/common';
import { Component, inject, OnInit, signal, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from 'app/core/auth/auth.service';
import { UserService } from 'app/core/user/user.service';
import { catchError } from 'rxjs';
import { ApiResponse } from 'app/core/api/api-response.types';
import { MatTableModule } from '@angular/material/table';
import { FuseCardComponent } from '@fuse/components/card';
import { CustomCurrencyPipe } from 'app/pipes/custom-currency.pipe';
import { environment } from 'app/environments/environment';
import { CustomDatePipe } from 'app/pipes/custom-date.pipe';
import { SnackbarService } from 'app/services/snackbar.service';
import { Router } from '@angular/router';

@Component({
    selector: 'app-cashier-dashboard',
    imports: [
        MatTableModule,
        FuseCardComponent,
        CustomCurrencyPipe,
        CustomDatePipe
    ],
    providers: [CurrencyPipe],
    templateUrl: './cashier-dashboard.component.html',
    styleUrl: './cashier-dashboard.component.scss'
})

export class CashierDashboardComponent implements OnInit, OnDestroy {

    private readonly _httpClient: HttpClient = inject(HttpClient);
    private readonly _authService: AuthService = inject(AuthService);
    private readonly _userService: UserService = inject(UserService);
    private _requestInterval = null

    currentEvent = signal(null)
    clientHistory = signal([])
    totalCash = signal(0)
    statusClassName = signal("text-yellow-500")

    displayedColumns = [
        "clienteNome",
        "formaPagamento",
        "tipoOperacao",
        "valor",
        "horario"
    ]

    constructor(
        private readonly snackbarService: SnackbarService,
        private readonly router: Router
    ) {}

    ngOnInit(): void {
        this.loadCashRegister()

        this._requestInterval = setInterval(() => {
            this.loadCashRegister()
        }, 1000 * 30);
    }

    ngOnDestroy(): void {
        clearInterval(this._requestInterval);
    }

    loadCashRegister() {
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

            if (response.error && response.code ==2) {

                this.snackbarService.success("Não existe caixa aberto, entrar em contato do o admin !")
                this.router.navigate(['/dashboard']);
            }


            if (response.success) {
                this.currentEvent.set(response.result)
                this.clientHistory.set(response.result.historicoCaixaDto)

                let total = 0
                this.currentEvent().totalCaixaFormaPagamentoDto.forEach((item) => {
                    total += item.valor
                })

                this.totalCash.set(total)


                switch (this.currentEvent().estadoCaixa) {
                    case "Aberto":
                        this.statusClassName.set("text-green-500")
                        break;
                    case "Fechado":
                        this.statusClassName.set("text-red-500")
                    default:
                        this.statusClassName.set("text-yellow-500")
                        break;
                }
            }

        });
    }

}
