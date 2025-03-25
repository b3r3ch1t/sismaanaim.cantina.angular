import { Component, OnInit } from '@angular/core';
import { SummaryPemissionariesComponent } from '../summary-pemissionaries/summary-pemissionaries.component';
import { MatTabChangeEvent, MatTabsModule } from '@angular/material/tabs';
import { SummarySellGraphicComponent } from "../summary-sell-graphic/summary-sell-graphic.component";

@Component({
    imports: [
    MatTabsModule,
    SummaryPemissionariesComponent,
    SummarySellGraphicComponent
],
    selector: 'app-permissionary-dashboard',
    templateUrl: './permissionary-dashboard.component.html',
    styleUrls: ['./permissionary-dashboard.component.css']
})
export class PermissionaryDashboardComponent implements OnInit {

    constructor() { }


    activeTabIndex = 0;

    onTabChange(event: MatTabChangeEvent): void {
        this.activeTabIndex = event.index;
    }

    ngOnInit() {
    }

}
