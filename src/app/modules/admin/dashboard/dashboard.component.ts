import { Component, inject, ViewEncapsulation } from '@angular/core';
import { FuseCardComponent } from '@fuse/components/card';
import { MatIcon } from '@angular/material/icon';
import { UserService } from 'app/core/user/user.service';
import { User } from 'app/core/user/user.types';
import { Subject, takeUntil } from 'rxjs';
import { Router } from '@angular/router';

@Component({
    selector: 'dashboard',
    standalone: true,
    templateUrl: './dashboard.component.html',
    encapsulation: ViewEncapsulation.None,
    imports: [
        FuseCardComponent,
        MatIcon
    ]
})
export class DashboardComponent {
    user: User;
    private _userService: UserService = inject(UserService);
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    /**
     * Constructor
     */
    constructor(private readonly router: Router) {
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

    goToOperadorDashboard(){

        this.router.navigate(['/operador_dashboard'])

    }

    goToPermissionarioDashboard(){

        this.router.navigate(['/permissionario_dashboard'])

    }

    goToAtendenteDashboard(){

        this.router.navigate(['/atendente_dashboard'])

    }

    goToRevisorDashboard(){

        this.router.navigate(['/revisor_dashboard'])

    }

    goToAuditoriaDashboard(){

        this.router.navigate(['/auditoria_dashboard'])

    }


}
