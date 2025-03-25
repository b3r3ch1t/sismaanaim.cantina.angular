import { HttpClient } from '@angular/common/http';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { ApiResponse } from 'app/core/api/api-response.types';
import { AuthService } from 'app/core/auth/auth.service';
import { environment } from 'app/environments/environment';
import {
    ApexAxisChartSeries,
    ApexChart,
    ApexFill,
    ApexYAxis,
    ApexTooltip,
    ApexTitleSubtitle,
    ApexXAxis,
    NgApexchartsModule,
    ApexOptions
} from "ng-apexcharts";
import { catchError } from 'rxjs';

export type ChartOptions = {
    series: ApexAxisChartSeries;
    chart: ApexChart;
    xaxis: ApexXAxis;
    yaxis: ApexYAxis | ApexYAxis[];
    title: ApexTitleSubtitle;
    labels: string[];
    stroke: any; // ApexStroke;
    dataLabels: any; // ApexDataLabels;
    fill: ApexFill;
    tooltip: ApexTooltip;
};

@Component({
    selector: 'app-summary-replenishment-graphic',
    imports: [

        NgApexchartsModule,
    ],
    templateUrl: './summary-replenishment-graphic.component.html',
    styleUrl: './summary-replenishment-graphic.component.scss'
})
export class SummaryReplenishmentGraphicComponent implements OnInit, OnDestroy {


    private readonly _httpClient = inject(HttpClient);
    private readonly _authService = inject(AuthService);

    private _intervalId?: any;

    chartGithubIssues: ApexOptions = {};
    chartTaskDistribution: ApexOptions = {};
    chartBudgetDistribution: ApexOptions = {};
    chartWeeklyExpenses: ApexOptions = {};
    chartMonthlyExpenses: ApexOptions = {};
    chartYearlyExpenses: ApexOptions = {};

    public chartOptions: Partial<ChartOptions> = {};

    constructor() {



    }
    ngOnInit(): void {
        this.fetchSummary()


        this._intervalId = setInterval(() => {
            this.fetchSummary();
        }, 60000);
    }


    fetchSummary() {
        this._httpClient.get(`${environment.API_URL}dashboard/getresumoabastecimento`, {
            headers: {
                "Authorization": `Bearer ${this._authService.accessToken}`
            }
        })
        .pipe(catchError((error) => {
            console.error(error);
            throw error;
        }))
        .subscribe((data: ApiResponse<any>) => {
            if (data.success) {
                const result = data.result;

                // Ordenar por data e hora
                const sorted = result.sort((a, b) => new Date(a.periodoInicio).getTime() - new Date(b.periodoInicio).getTime());

                const labels = sorted.map(item => item.periodoInicio); // formato ISO (datetime)
                const abastecidoTotal = sorted.map(item => item.total);
                const abastecidoQtd = sorted.map(item => item.contagem);

                this.chartOptions = {
                    series: [
                        {
                            name: "Abastecido-R$",
                            type: "column",
                            data: abastecidoTotal
                        },
                        {
                            name: "Abastecido-Qtd",
                            type: "line",
                            data: abastecidoQtd
                        }
                    ],
                    chart: {
                        height: 350,
                        type: "line"
                    },
                    stroke: {
                        width: [2, 5],
                    },
                    title: {
                        text: "Resumo"
                    },
                    dataLabels: {
                        enabled: true,
                        enabledOnSeries: [1]
                    },
                    labels: labels, // formato ISO compatível com type: datetime
                    xaxis: {
                        type: "datetime",
                        labels: {
                            datetimeFormatter: {
                                hour: "HH:mm"
                            }
                        }
                    },
                    yaxis: [
                        {
                            opposite: true,
                            title: {
                                text: "Abastecido"
                            }
                        }
                    ]
                };
            }
        });
    }



    ngOnDestroy(): void {
        if (this._intervalId) {
            clearInterval(this._intervalId);
        }
    }
}
