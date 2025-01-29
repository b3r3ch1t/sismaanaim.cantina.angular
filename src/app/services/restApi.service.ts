import { environment } from 'app/environments/environment';

import { KeycloakService } from './keycloak.service';

import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class RestApiService {
  apiURL = environment.API_URL;

  constructor(
    private http: HttpClient,
    private keycloakService: KeycloakService
  ) {}

  private getHeaders(): HttpHeaders {
    const token = this.keycloakService.keycloak.token;
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    });
  }

  private getHeadersUploadFile(): HttpHeaders {
    const token = this.keycloakService.keycloak.token;
    return new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
  }


  formatDateTime(date: Date): string {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // getMonth() retorna 0-11
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${day}/${month}/${year} ${hours}:${minutes}`;
}


  private handle401Error<T>(requestFn: () => Observable<T>): Observable<T> {

    const currentDate = new Date();

    console.log("token atualizado. ", this.formatDateTime(currentDate));


    return this.keycloakService.updateToken().pipe(
      switchMap(() => requestFn()),
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          return throwError(() => new Error('Unauthorized'));
        }
        return throwError(() => error);
      })
    );
  }

  private retryOn401<T>(requestFn: () => Observable<T>): Observable<T> {
    return requestFn().pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          return this.handle401Error(requestFn);
        }
        return throwError(() => error);
      })
    );
  }

  get(url: string): Observable<any> {
    const completeURL = this.apiURL + url;
    const headers = this.getHeaders();
    return this.retryOn401(() => this.http.get(completeURL, { headers }));
  }

  post(url: string, payload: any): Observable<any> {
    const completeURL = this.apiURL + url;
    const headers = this.getHeaders();
    return this.retryOn401(() => this.http.post(completeURL, payload, { headers }));
  }

  delete(url: string): Observable<any> {
    const completeURL = this.apiURL + url;
    const headers = this.getHeaders();
    return this.retryOn401(() => this.http.delete(completeURL, { headers }));
  }

  public getApiUrl() {
    return this.apiURL;
  }
}
