import { Component, inject, ViewEncapsulation } from '@angular/core';
import { FuseCardComponent } from '@fuse/components/card';
import { MatIcon } from '@angular/material/icon';
import { UserService } from 'app/core/user/user.service';
import { User } from 'app/core/user/user.types';
import { Subject } from 'rxjs';
import { RouterLink } from "@angular/router"
import { UserProfile } from "app/core/user/user-profile.enum"

@Component({
    selector: 'dashboard',
    standalone: true,
    templateUrl: './dashboard.component.html',
    encapsulation: ViewEncapsulation.None,
    imports: [
        FuseCardComponent,
        MatIcon,
        RouterLink
    ]
})
export class DashboardComponent {
    user: User;
    private _userService: UserService = inject(UserService);
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    profileRoutes = {
        [UserProfile.Cashier]: '/cashier-dashboard',
        [UserProfile.Admin]: '/admin-dashboard',
        [UserProfile.Attendant]: '/attendant-dashboard',
        [UserProfile.Auditor]: '/auditor-dashboard',
        [UserProfile.Reviewer]: '/reviewer-dashboard',
        [UserProfile.Permissionary]: '/permissionary-dashboard',
        [UserProfile.Indefinite]: '/indefinite-dashboard',
        [UserProfile.SecretariatArea]: '/secretariat-area-dashboard',
        [UserProfile.SecretariatRegion]: '/secretariat-region-dashboard',
        [UserProfile.SecretaryChurch]: '/secretary-church-dashboard',
        [UserProfile.SecretaryPolo]: '/secretary-polo-dashboard',
    }


    /**
     * Constructor
     */
    constructor() {
    }

    ngOnInit(): void {
        // Subscribe to the user service
        this.user = this._userService.user
    }

    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }
}
