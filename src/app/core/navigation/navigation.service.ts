import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { Navigation } from 'app/core/navigation/navigation.types';
import { filter, Observable, ReplaySubject, tap } from 'rxjs';
import { NavigationEnd, Router } from "@angular/router";
import { cashierNavigation } from 'app/mock-api/common/navigation/data';

@Injectable({ providedIn: 'root' })
export class NavigationService {
    private _httpClient = inject(HttpClient);
    private _navigation: ReplaySubject<Navigation> =
        new ReplaySubject<Navigation>(1);
    private _router = inject(Router);


    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Getter for navigation
     */
    get navigation$(): Observable<Navigation> {
        return this._navigation.asObservable();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Get all navigation data
     */
    get(): Observable<Navigation> {
        return this._httpClient.get<Navigation>('api/common/navigation').pipe(
            tap((navigation) => {
                this._router.events
                    .pipe(filter(event => event instanceof NavigationEnd))
                    .subscribe((event: any) => {
                        if (event.urlAfterRedirects.includes("cashier-dashboard")) {
                            navigation.default = cashierNavigation
                        }
                        this._navigation.next(navigation);
                    });
            })
        );
    }
}
