import { CanActivateChildFn, CanActivateFn } from '@angular/router';
import { of } from 'rxjs';

export const PublicGuard: CanActivateFn | CanActivateChildFn = () => {
    // Always allow access - this is a public route
    return of(true);
};
