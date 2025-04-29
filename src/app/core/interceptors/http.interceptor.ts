// src/app/interceptors/logging.interceptor.ts
import { Injectable } from '@angular/core';
import {
    HttpInterceptor,
    HttpRequest,
    HttpHandler,
    HttpEvent,
    HttpResponse,
    HttpErrorResponse
} from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from '../auth/auth.service';
import { Router } from '@angular/router'; // importe o Router

@Injectable()
export class LoggingInterceptor implements HttpInterceptor {
    constructor(
        private authService: AuthService,
        private router: Router // injete o Router
    ) {}

    intercept(
        req: HttpRequest<any>,
        next: HttpHandler
    ): Observable<HttpEvent<any>> {
        if (req.url.startsWith(environment.API_URL)) {
            const authHeader = req.headers.get('Authorization');
            let token = null;
            if (authHeader && authHeader.startsWith('Bearer ')) {
                token = authHeader.substring(7);
            } else {
                token = authHeader;
            }

            const isTokenExpired = this.authService.isTokenExpired(token);

            if (isTokenExpired) {
                this.router.navigate(['/sign-out']);
                return next.handle(req); // ou: return EMPTY; para cancelar a requisição
            }


        }

        return next.handle(req).pipe(
            tap({
                next: event => {
                    if (
                        event instanceof HttpResponse &&
                        req.url.startsWith(environment.API_URL)
                    ) {

                    }
                },
                error: (error: HttpErrorResponse) => {
                    if (req.url.startsWith(environment.API_URL)) {
                        // ...
                    }
                }
            })
        );
    }
}
