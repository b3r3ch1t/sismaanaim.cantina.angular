import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIcon, MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTableModule } from '@angular/material/table';
import { MatTabChangeEvent, MatTabsModule } from '@angular/material/tabs';
import { FuseCardComponent } from '@fuse/components/card';




import { SummaryBalanceCashiersComponent } from '../summary-balance-cashiers/summary-balance-cashiers.component';
import { SummarySellGraphicComponent } from '../summary-sell-graphic/summary-sell-graphic.component';
import { SummaryReplenishmentGraphicComponent } from '../summary-replenishment-graphic/summary-replenishment-graphic.component';
import { SummaryComponent } from '../summary/summary.component';

@Component({
    selector: 'app-auditor-dashboard',
    templateUrl: './auditor-dashboard.component.html',
    styleUrls: ['./auditor-dashboard.component.css'],
    imports: [
    CommonModule,
    MatTableModule,
    MatIconModule,
    MatButtonModule,
    MatDividerModule,
    MatTabsModule,
    MatMenuModule,
    MatButtonModule,
    SummaryComponent,
    SummaryBalanceCashiersComponent,
    SummarySellGraphicComponent,
    SummaryReplenishmentGraphicComponent
],
})
export class AuditorDashboardComponent implements OnInit {

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
