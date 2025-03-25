import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIcon, MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTableModule } from '@angular/material/table';
import { MatTabChangeEvent, MatTabsModule } from '@angular/material/tabs';
import { FuseCardComponent } from '@fuse/components/card';



import { SummaryPemissionariesComponent } from '../summary-pemissionaries/summary-pemissionaries.component';
import { SummaryBalanceClientsComponent } from '../summary-balance-clients/summary-balance-clients.component';
import { SummaryBalanceCashiersComponent } from '../summary-balance-cashiers/summary-balance-cashiers.component';
import { SummarySellGraphicComponent } from '../summary-sell-graphic/summary-sell-graphic.component';
import { SummaryReplenishmentGraphicComponent } from '../summary-replenishment-graphic/summary-replenishment-graphic.component';

@Component({
    selector: 'app-reviewer-dashboard',
    templateUrl: './reviewer-dashboard.component.html',
    styleUrls: ['./reviewer-dashboard.component.css'],
    imports: [
        CommonModule,
        MatTableModule,
        MatIconModule,
        MatButtonModule,
        MatDividerModule,
        MatTabsModule,
        MatMenuModule,
        FuseCardComponent,
        MatButtonModule,
        MatIcon,
        SummaryPemissionariesComponent,
        SummaryBalanceClientsComponent,
        SummaryBalanceCashiersComponent,
        SummarySellGraphicComponent,
        SummaryReplenishmentGraphicComponent
    ],
})
export class ReviewerDashboardComponent implements OnInit {

    activeTabIndex = 0;

    onTabChange(event: MatTabChangeEvent): void {
        this.activeTabIndex = event.index;
    }


    constructor(
    ) {



    }


    ngOnInit() {
    }

}
