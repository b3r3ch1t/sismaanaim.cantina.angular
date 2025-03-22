import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIcon, MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { FuseCardComponent } from '@fuse/components/card';

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
        FuseCardComponent,
        MatIcon,
    ],
})
export class ReviewerDashboardComponent implements OnInit {

    constructor() { }

    ngOnInit() {
    }

}
