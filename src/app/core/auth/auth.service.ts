import { environment } from 'app/environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { AuthUtils } from 'app/core/auth/auth.utils';
import { UserService } from 'app/core/user/user.service';
import { catchError, Observable, of, switchMap, throwError } from 'rxjs';
import { jwtDecode } from 'jwt-decode';


export interface JwtPayload {
    // Defina os campos conforme sua necessidade ou use [key: string]: any;
    sub?: string;
    email?: string;
    exp?: number;
    iat?: number;
    roles?: string[];
    [key: string]: any;
}



@Injectable({ providedIn: 'root' })
export class AuthService {
    private _authenticated: boolean = false;
    private readonly _httpClient = inject(HttpClient);
    private readonly _userService = inject(UserService);

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Setter & getter for access token
     */
    set accessToken(token: string) {
        sessionStorage.setItem('accessToken', token);
    }

    get accessToken(): string {
        return sessionStorage.getItem('accessToken') ?? '';
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Forgot password
     *
     * @param email
     */
    forgotPassword(email: string): Observable<any> {
        return this._httpClient.post('api/auth/forgot-password', email);
    }


    decodeToken(): JwtPayload | null {
        try {

            const token = sessionStorage.getItem('accessToken');

            if (!token) {
                console.log('Token não encontrado.');
                return null;
            }
            if (!token) return null;

            const decoded = jwtDecode<JwtPayload>(token);
            return decoded;
        } catch (error) {
            console.error('Erro ao decodificar token JWT:', error);
            return null;
        }
    }

    isTokenExpired(token: string): boolean {
        const decoded = this.decodeToken();
        if (!decoded || !decoded.exp) return true;

        const now = Date.now().valueOf() / 1000;
        return decoded.exp < now;
    }

    getTokenField<T = any>(field: string): T | null {
        const decoded = this.decodeToken();


        return decoded && field in decoded ? decoded[field] as T : null;
    }

    isRevisor(): boolean {
        const decoded = this.decodeToken();
        if (!decoded || !decoded.Profile) {
            return false;
        }

        // Profile pode ser string ou array de strings
        if (Array.isArray(decoded.Profile)) {

            return decoded.Profile.includes('4');
        }
        return decoded.Profile === '4';
    }


    /**
     * Reset password
     *
     * @param password
     */
    resetPassword(password: string): Observable<any> {


        const params = new HttpParams()
            .set('newPassword', password)
            .set('confirmPassword', password);


        return this._httpClient.post(`${environment.API_URL}account/changepassword`, params);
    }

    /**
     * Sign in
     *
     * @param credentials
     */
    signIn(credentials: { email: string; password: string }): Observable<any> {
        // Throw error, if the user is already logged in
        if (this._authenticated) {
            return throwError('User is already logged in.');
        }



        return this._httpClient.post(environment.API_URL + 'account/generatetoken', {
            cpf: credentials.email,
            password: credentials.password
        }).pipe(
            switchMap((response: any) => {

                if (response.success) {
                    const user = {
                        id: response.result.userId,
                        name: response.result.userName,
                        email: response.result.userEmail,
                        profiles: response.result.profiles
                    }

                    // // Store the access token in the local storage
                    this.accessToken = response.result.accessToken;

                    // // Set the authenticated flag to true
                    this._authenticated = response.result.authenticated;

                    // // Store the user on the user service
                    this._userService.user = user;
                }

                // Return a new observable with the response
                return of(response);
            })
        );
    }

    /**
     * Sign in using the access token
     */
    signInUsingToken(): Observable<any> {
        // Sign in using the token
        return this._httpClient
            .post('api/auth/sign-in-with-token', {
                accessToken: this.accessToken
            })
            .pipe(
                catchError(() =>
                    // Return false
                    of(false)
                ),
                switchMap((response: any) => {

                    // Replace the access token with the new one if it's available on
                    // the response object.
                    //
                    // This is an added optional step for better security. Once you sign
                    // in using the token, you should generate a new one on the server
                    // side and attach it to the response object. Then the following
                    // piece of code can replace the token with the refreshed one.
                    if (response.accessToken) {
                        this.accessToken = response.accessToken;
                    }

                    // Set the authenticated flag to true
                    this._authenticated = true;

                    // Store the user on the user service
                    this._userService.user = response.user;

                    // Return true
                    return of(true);
                })
            );
    }

    /**
     * Sign out
     */
    signOut(): Observable<any> {
        // Remove the access token from the local storage
        sessionStorage.removeItem('accessToken');
        sessionStorage.removeItem('user');

        // Set the authenticated flag to false
        this._authenticated = false;

        // Return the observable
        return of(true);
    }

    /**
     * Sign up
     *
     * @param user
     */
    signUp(user: {
        name: string;
        email: string;
        password: string;
        company: string;
    }): Observable<any> {
        return this._httpClient.post('api/auth/sign-up', user);
    }

    /**
     * Unlock session
     *
     * @param credentials
     */
    unlockSession(credentials: {
        email: string;
        password: string;
    }): Observable<any> {
        return this._httpClient.post('api/auth/unlock-session', credentials);
    }

    /**
     * Check the authentication status
     */
    check(): Observable<boolean> {
        // Check if the user is logged in
        if (this._authenticated) {
            return of(true);
        }

        // Check the access token availability
        if (!this.accessToken) {
            return of(false);
        }

        // Check the access token expire date
        if (AuthUtils.isTokenExpired(this.accessToken)) {
            return of(false);
        }

        // If the access token exists, and it didn't expire, sign in using it
        return this.signInUsingToken();
    }
}


