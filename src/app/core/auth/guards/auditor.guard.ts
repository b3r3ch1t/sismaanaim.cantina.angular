import { Injectable } from "@angular/core";
import { CanActivate, CanActivateChild, Router } from "@angular/router";
import { AuthService } from "../auth.service";
import { Profile } from 'app/shared/profiles.enum';

@Injectable({
    providedIn: 'root',
})
export class AuditorGuard implements CanActivate, CanActivateChild {
    constructor(private readonly authService: AuthService, private readonly router: Router) { }

    canActivate(): boolean {
        return this.checkAccess();
    }

    canActivateChild(): boolean {
        return this.checkAccess();
    }

    private checkAccess(): boolean {


        const profile = this.authService.getTokenField('Profile');

        const hasAuditor = profile.includes(Profile.Auditoria.toString());

        // Redirecionar para uma página de erro ou login, se necessário
        if (!hasAuditor) {
            this.router.navigate(['/dashboard']);
        }
        return hasAuditor;
    }
}
