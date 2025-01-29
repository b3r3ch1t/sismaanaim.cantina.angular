import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SessionStorageService {

  constructor() { }

  // Salvar dados temporários
  saveSessionData(key: string, data: any): void {
    sessionStorage.setItem(key, JSON.stringify(data));
  }

  // Recuperar dados temporários
  getSessionData(key: string): any {
    const data = sessionStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  }

  // Limpar dados específicos
  clearSessionData(key: string): void {
    sessionStorage.removeItem(key);
  }

  // Limpar todos os dados da sessão
  clearAllSessionData(): void {
    sessionStorage.clear();
  }
}
