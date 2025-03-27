import { Component, OnInit } from '@angular/core';
import { MatTabChangeEvent, MatTabsModule } from '@angular/material/tabs';
import { SummarySellGraphicComponent } from "../summary-sell-graphic/summary-sell-graphic.component";
import { SummaryComponent } from '../summary/summary.component';

@Component({
    imports: [
    MatTabsModule,
    SummaryComponent,
    SummarySellGraphicComponent
],
    selector: 'app-permissionary-dashboard',
    templateUrl: './permissionary-dashboard.component.html',
    styleUrls: ['./permissionary-dashboard.component.css']
})
export class PermissionaryDashboardComponent implements OnInit {

    constructor() { }

    lastUpdate: Date = new Date();

    activeTabIndex = 0;

    onTabChange(event: MatTabChangeEvent): void {
        this.activeTabIndex = event.index;
    }

    ngOnInit() {
        this.lastUpdate = new Date();
    }

}
