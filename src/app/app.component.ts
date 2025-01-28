import { Component, LOCALE_ID } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import localePt from "@angular/common/locales/pt"

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    imports: [RouterOutlet],
    // providers: [
    //     { provide: LOCALE_ID, useValue: 'pt-BR' }
    // ]
})
export class AppComponent {
    /**
     * Constructor
     */
    constructor() { }
}
