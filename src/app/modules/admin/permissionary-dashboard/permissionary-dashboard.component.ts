import { Component, OnInit } from '@angular/core';
import { SummaryPemissionariesComponent } from '../summary-pemissionaries/summary-pemissionaries.component';

@Component({
imports: [
    SummaryPemissionariesComponent
],
  selector: 'app-permissionary-dashboard',
  templateUrl: './permissionary-dashboard.component.html',
  styleUrls: ['./permissionary-dashboard.component.css']
})
export class PermissionaryDashboardComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
