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
        id: 'replenishment',
        title: 'Abastecimento',
        type: 'basic',
        icon: 'heroicons_outline:currency-dollar',
        link: '/replenishment'
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
