/* eslint-disable */
import { FuseNavigationItem } from '@fuse/components/navigation';

export const cashierNavigation: FuseNavigationItem[] = [
    {
        id: 'dashboard',
        title: 'Principal',
        type: 'basic',
        icon: 'heroicons_outline:chart-pie',
        link: '/dashboard'
    },

    {
        id: 'clientRegistration',
        title: 'Cadastro de Cliente',
        type: 'basic',
        icon: 'heroicons_outline:user',
        link: '/cashier-dashboard/clientRegistration'
    },

    {
        id: 'replenishment',
        title: 'Abastecimento',
        type: 'basic',
        icon: 'heroicons_outline:currency-dollar',
        link: '/cashier-dashboard/replenishment'
    }
    ,
    {
        id: 'reimbursement',
        title: 'Ressarcimento',
        type: 'basic',
        icon: 'heroicons_outline:chevron-double-left',
        link: '/cashier-dashboard/reimbursement'
    }
    ,
    {
        id: 'client-history',
        title: 'Histórico do Cliente',
        type: 'basic',
        icon: 'heroicons_outline:users',
        link: '/cashier-dashboard/client-history'
    }
    ,
    {
        id: 'bleeding',
        title: 'Sangria',
        type: 'basic',
        icon: 'heroicons_outline:beaker',
        link: '/cashier-dashboard/bleeding'
    }
    ,
    {
        id: 'my-actions',
        title: 'Minhas Ações',
        type: 'basic',
        icon: 'heroicons_outline:presentation-chart-line',
        link: '/cashier-dashboard/my-actions'
    }
    ,
    // {
    //     id: 'sign-off',
    //     title: 'Sair',
    //     type: 'basic',
    //     icon: 'heroicons_outline:power',
    //     link: '/sign-off'
    // }
]

export const defaultNavigation: FuseNavigationItem[] = [
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
        id: 'Sair',
        title: 'Sair',
        type: 'basic',
        icon: 'heroicons_outline:power',
        link: '/sign-out',
      },
  ];

export const compactNavigation: FuseNavigationItem[] = [
    {
        id: 'example',
        title: 'Example',
        type: 'basic',
        icon: 'heroicons_outline:chart-pie',
        link: '/example'
    }
];


export const futuristicNavigation: FuseNavigationItem[] = [
    {
        id: 'example',
        title: 'Example',
        type: 'basic',
        icon: 'heroicons_outline:chart-pie',
        link: '/example'
    }
];
export const horizontalNavigation: FuseNavigationItem[] = [
    {
        id: 'example',
        title: 'Example',
        type: 'basic',
        icon: 'heroicons_outline:chart-pie',
        link: '/example'
    }
];
