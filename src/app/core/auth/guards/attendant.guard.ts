import { Injectable } from "@angular/core";
import { CanActivate, CanActivateChild, Router } from "@angular/router";
import { AuthService } from "../auth.service";
import { Profile } from 'app/shared/profiles.enum';

@Injectable({
    providedIn: 'root',
})
export class AttendantGuard implements CanActivate, CanActivateChild {
    constructor(private readonly authService: AuthService, private readonly router: Router) { }

    canActivate(): boolean {
        return this.checkAccess();
    }

    canActivateChild(): boolean {
        return this.checkAccess();
    }

    private checkAccess(): boolean {


        const profile = this.authService.getTokenField('Profile');

        const hasAttendant = profile.includes(Profile.Atendente.toString());

        // Redirecionar para uma página de erro ou login, se necessário
        if (!hasAttendant) {
            this.router.navigate(['/dashboard']);
        }
        return hasAttendant;
    }
}
