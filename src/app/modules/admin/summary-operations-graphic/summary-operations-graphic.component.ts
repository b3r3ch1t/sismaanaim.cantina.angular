import { Component } from '@angular/core';
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
    selector: 'app-summary-operations-graphic',
    imports: [

        NgApexchartsModule,
    ],
    templateUrl: './summary-operations-graphic.component.html',
    styleUrl: './summary-operations-graphic.component.scss'
})
export class SummaryOperationsGraphicComponent {
    chartGithubIssues: ApexOptions = {};
    chartTaskDistribution: ApexOptions = {};
    chartBudgetDistribution: ApexOptions = {};
    chartWeeklyExpenses: ApexOptions = {};
    chartMonthlyExpenses: ApexOptions = {};
    chartYearlyExpenses: ApexOptions = {};

    public chartOptions: Partial<ChartOptions>;

    constructor() {

        this.chartOptions = {
            series: [
                {
                    name: "Vendido-R$",
                    type: "column",
                    data: [35.04, 45.86, 41.56, 37
                        , 45.86, 41.56, 37, 45.86, 41.56, 37, 45.86, 41.56]
                }, {
                    name: "Vendido-Qtd",
                    type: "column",
                    data: [15, 34, 3, 57, 45, 12, 37, 45, 56, 5, 8, 10]
                },
                {
                    name: "Abastecido-R$",
                    type: "line",
                    data: [23.45, 42.37, 35.89, 27, 43.56, 22, 17.37, 31, 22.56, 22.21, 12, 16.15]
                },

                {
                    name: "Abastecido-Qtd",
                    type: "line",
                    data: [15, 5, 3, 57, 45, 12, 37, 45, 56, 5, 8, 10]
                }
            ],
            chart: {
                height: 350,
                type: "line"
            },
            stroke: {
                width: [0, 2, 5, 3],
            },
            title: {
                text: "Resumo"
            },
            dataLabels: {
                enabled: true,
                enabledOnSeries: [1]
            },
            labels: [
                "2025-03-24T13:00:00.000Z",
                "2025-03-24T13:05:00.000Z",
                "2025-03-24T13:10:00.000Z",
                "2025-03-24T13:15:00.000Z",
                "2025-03-24T13:20:00.000Z",
                "2025-03-24T13:25:00.000Z",
                "2025-03-24T13:30:00.000Z",
                "2025-03-24T13:35:00.000Z",
                "2025-03-24T13:40:00.000Z",
                "2025-03-24T13:45:00.000Z",
                "2025-03-24T13:50:00.000Z",
                "2025-03-24T13:55:00.000Z"
            ],
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
                {
                    opposite: true,
                    title: {
                        text: "Abastecido"
                    }
                }
            ]
        };

    }
}
