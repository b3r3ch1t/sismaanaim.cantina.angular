import { environment } from 'app/environments/environment';

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
  ) {}

  private getHeaders(): HttpHeaders {


    return new HttpHeaders({
      'Content-Type': 'application/json',
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




  private retryOn401<T>(requestFn: () => Observable<T>): Observable<T> {
    return requestFn().pipe(
      catchError((error: HttpErrorResponse) => {

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
