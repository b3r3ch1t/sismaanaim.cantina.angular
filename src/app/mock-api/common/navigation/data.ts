/* eslint-disable */
import { FuseNavigationItem } from '@fuse/components/navigation';

export const defaultNavigation: FuseNavigationItem[] = [
    {
        id: 'dashboard',
        title: 'Principal',
        type: 'basic',
        icon: 'heroicons_outline:chart-pie',
        link: '/dashboard'
    },
    {
        id: 'sell-card',
        title: 'Vender Cartão',
        type: 'basic',
        icon: 'heroicons_outline:credit-card',
        link: '/sell-card'
    }
    ,
    {
        id: 'lock-card',
        title: 'Bloquear Cartão',
        type: 'basic',
        icon: 'heroicons_outline:no-symbol',
        link: '/lock-card'
    }
    ,
    {
        id: 'unlock-card',
        title: 'Desbloquear Cartão',
        type: 'basic',
        icon: 'heroicons_outline:check',
        link: '/unlock-card'
    }
    ,
    {
        id: 'reimbursement',
        title: 'Ressarcimento',
        type: 'basic',
        icon: 'heroicons_outline:chevron-double-left',
        link: '/reimbursement'
    }
    ,
    {
        id: 'client-history',
        title: 'Histórico do Cliente',
        type: 'basic',
        icon: 'heroicons_outline:users',
        link: '/client-history'
    }
    ,
    {
        id: 'bleeding',
        title: 'Sangria',
        type: 'basic',
        icon: 'heroicons_outline:beaker',
        link: '/bleeding'
    }
    ,
    {
        id: 'my-actions',
        title: 'Minhas Ações',
        type: 'basic',
        icon: 'heroicons_outline:presentation-chart-line',
        link: '/my-actions'
    }
    ,
    {
        id: 'sign-off',
        title: 'Sair',
        type: 'basic',
        icon: 'heroicons_outline:power',
        link: '/sign-off'
    }
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
