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
    selector: 'app-summary-sell-graphic',
    imports: [

        NgApexchartsModule,
    ],
    templateUrl: './summary-sell-graphic.component.html',
    styleUrl: './summary-sell-graphic.component.scss'
})
export class SummarySellGraphicComponent implements OnInit, OnDestroy {


    private readonly _httpClient = inject(HttpClient);
    private readonly _authService = inject(AuthService);

    private _intervalId?: any;

    chartGithubIssues: ApexOptions = {};
    chartTaskDistribution: ApexOptions = {};
    chartBudgetDistribution: ApexOptions = {};
    chartWeeklyExpenses: ApexOptions = {};
    chartMonthlyExpenses: ApexOptions = {};
    chartYearlyExpenses: ApexOptions = {};

    public chartOptions: Partial<ChartOptions>;

    constructor() {


    }
    ngOnInit(): void {
        this.fetchSummary()


        this._intervalId = setInterval(() => {
            this.fetchSummary();
        }, 60000);
    }


    fetchSummary() {
         const now = new Date().toLocaleTimeString();


                this._httpClient.get(`${environment.API_URL}dashboard/getresumovendaseabastecimento`, {
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
                            const result = data.result;

                            const labelsSet = new Set<string>();

                            // Combinar todos os períodos únicos
                            [...result.vendas, ...result.abastecimentos].forEach(item =>
                                labelsSet.add(item.periodoInicio)
                            );

                            const labels = Array.from(labelsSet).sort();

                            const mapByPeriod = (collection: any[]) =>
                                labels.map(label => {
                                    const item = collection.find((x: any) => x.periodoInicio === label);
                                    return item ? item.total : 0;
                                });

                            const mapByCount = (collection: any[]) =>
                                labels.map(label => {
                                    const item = collection.find((x: any) => x.periodoInicio === label);
                                    return item ? item.contagem : 0;
                                });

                            const vendidoTotal = mapByPeriod(result.vendas);
                            const vendidoQtd = mapByCount(result.vendas);

                            this.chartOptions = {
                                series: [
                                    {
                                        name: "Vendido-R$",
                                        type: "column",
                                        data: vendidoTotal
                                    },
                                    {
                                        name: "Vendido-Qtd",
                                        type: "line",
                                        data: vendidoQtd
                                    },
                                ],
                                chart: {
                                    height: 350,
                                    type: "line"
                                },
                                stroke: {
                                    width: [2, 2, 5, 5],
                                },
                                title: {
                                    text: "Resumo"
                                },
                                dataLabels: {
                                    enabled: true,
                                    enabledOnSeries: [1]
                                },
                                labels: labels,
                                xaxis: {
                                    type: "datetime",
                                    labels: {
                                        format: "HH:mm"
                                    }
                                },
                                yaxis: [
                                    {
                                        title: {
                                            text: "Vendido"
                                        }
                                    },
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
