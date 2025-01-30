import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import cloneDeep from 'lodash/cloneDeep';
import { FuseNavigationItem } from '@fuse/components/navigation';
import { Navigation } from 'app/core/navigation/navigation.types';

@Injectable({
  providedIn: 'root',
})
export class MenuNavigationService {
  private _navigationSubject = new BehaviorSubject<Navigation>(null);
  getDashboard$ = this._navigationSubject.asObservable(); // Expor como Observable

  private readonly _defaultNavigation: FuseNavigationItem[] = [
    {
      id: 'Perfil',
      title: 'Perfil',
      type: 'basic',
      icon: 'heroicons_outline:user',
      link: '/dashboard',
    },
    {
      id: 'ChangePassword',
      title: 'Alterar Senha',
      type: 'basic',
      icon: 'heroicons_outline:lock-closed',
      link: '/change-password',
    },

    {
        id: 'Logout',
        title: 'Logout',
        type: 'basic',
        icon: 'heroicons_outline:power',
        link: '/change-password',
      },
  ];

  private readonly _compactNavigation: FuseNavigationItem[] = [
    {
      id: 'example',
      title: 'Example',
      type: 'basic',
      icon: 'heroicons_outline:chart-pie',
      link: '/example',
    },
  ];

  private readonly _futuristicNavigation: FuseNavigationItem[] = [
    {
      id: 'example',
      title: 'Example',
      type: 'basic',
      icon: 'heroicons_outline:chart-pie',
      link: '/example',
    },
  ];

  private readonly _horizontalNavigation: FuseNavigationItem[] = [
    {
      id: 'example',
      title: 'Example',
      type: 'basic',
      icon: 'heroicons_outline:chart-pie',
      link: '/example',
    },
  ];

  constructor() {
    this.loadNavigation(); // Carrega os dados ao iniciar o serviço
  }

  /**
   * Carrega os dados de navegação e emite para os assinantes.
   */
  private loadNavigation(): void {
    const compactNavigation = cloneDeep(this._compactNavigation);
    const defaultNavigation = cloneDeep(this._defaultNavigation);
    const futuristicNavigation = cloneDeep(this._futuristicNavigation);
    const horizontalNavigation = cloneDeep(this._horizontalNavigation);

    // Atualiza o BehaviorSubject com os novos dados de navegação
    this._navigationSubject.next({
      compact: compactNavigation,
      default: defaultNavigation,
      futuristic: futuristicNavigation,
      horizontal: horizontalNavigation,
    });
  }
}
