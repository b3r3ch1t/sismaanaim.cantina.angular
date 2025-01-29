
import { SessionStorageService } from './sessionStorageService.service';
import { Injectable } from '@angular/core';
import Keycloak from 'keycloak-js';
import { UserProfile } from '../Interfaces/models/UserProfile.type';
import { Router } from '@angular/router';  // Import Router para navegação
import { environment } from 'app/environments/environment';
import { CacheService } from './cache.services';
import { from, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class KeycloakService {
  private _keycloak: Keycloak | undefined;

  constructor(
    private router: Router,
    private sessionStorageService : SessionStorageService,
    private cacheService : CacheService
) {
    const token = localStorage.getItem('kc_token');
    const tokenExpiry = parseInt(localStorage.getItem('kc_token_expiry') || '0');
    const now = new Date().getTime();

    if (token && tokenExpiry && tokenExpiry > now) {
      this._keycloak = new Keycloak({
        url: environment.KEYCLOAK_URL,
        realm: environment.KEYCLOAK_REALM,
        clientId: environment.KEYCLOAK_CLIENTID
      });
      this._keycloak.token = token;
      this._keycloak.refreshToken = localStorage.getItem('kc_refresh_token') || undefined;
    }
  }

  get keycloak() {
    if (!this._keycloak) {
      this._keycloak = new Keycloak({
        url: environment.KEYCLOAK_URL,
        realm: environment.KEYCLOAK_REALM,
        clientId: environment.KEYCLOAK_CLIENTID
      });
    }
    return this._keycloak;
  }

  private _profile: UserProfile | undefined;

  get profile(): UserProfile | undefined {
    return this._profile;
  }

  async init() {
    console.log("Initializing Keycloak.");

    console.log("KEYCLOAK_URL", environment.KEYCLOAK_URL);
    console.log("KEYCLOAK_REALM", environment.KEYCLOAK_REALM);
    console.log("KEYCLOAK_CLIENTID", environment.KEYCLOAK_CLIENTID);


    try {
      const authenticated = await this.keycloak.init({
        onLoad: 'login-required'
      });

      if (authenticated) {
        console.log("Authenticated.");
        this._profile = (await this.keycloak.loadUserProfile()) as UserProfile;
        this._profile.token = this.keycloak.token || '';


        localStorage.setItem('profile_email', this._profile.email as string);
        localStorage.setItem('kc_token', this.keycloak.token as string);
        localStorage.setItem('kc_refresh_token', this.keycloak.refreshToken as string);
        const expiresIn = this.keycloak.tokenParsed?.exp ? this.keycloak.tokenParsed.exp * 1000 : 0;
        localStorage.setItem('kc_token_expiry', expiresIn.toString());

        console.log("Authentication success:", authenticated);

      } else {
        throw new Error("Authentication failed");
      }
    } catch (error) {
      console.error("Error during Keycloak initialization:", error);
      this.router.navigate(['/']); // Redirecionar para a página inicial em caso de falha
    }
  }

  login() {
    return this.keycloak.login();
  }

  logout() {
    localStorage.removeItem('kc_token');
    localStorage.removeItem('kc_refresh_token');
    localStorage.removeItem('kc_token_expiry');

    this.sessionStorageService.clearAllSessionData();
    this.cacheService.clear();

    return this.keycloak.logout({ redirectUri: window.location.origin + '/' });
  }

  updateToken(): Observable<void> {
    const currentDate = new Date();

    console.log("token atualizado. ", this.formatDateTime(currentDate));

    return from(this._keycloak.updateToken(30).then(() => { })); // Atualiza o token se estiver próximo de expirar
}

formatDateTime(date: Date): string {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // getMonth() retorna 0-11
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${day}/${month}/${year} ${hours}:${minutes}`;
}

isAuthenticated(): boolean {
    return !!this.keycloak.token;
}

}
