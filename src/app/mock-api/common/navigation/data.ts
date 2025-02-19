/* eslint-disable */
import { FuseNavigationItem } from '@fuse/components/navigation';

export const cashierNavigation: FuseNavigationItem[] = [
    {
        id: 'dashboards',
        title: 'Menu Operador de Caixa',
        type: 'group',
        icon: 'heroicons_outline:home',
        children: [
            {
                id: 'principal',
                title: 'Principal',
                type: 'basic',
                icon: 'heroicons_outline:chart-pie',
                link: '/cashier-dashboard'
            },


            {
                id: 'replenishment',
                title: 'Abastecimento',
                type: 'basic',
                icon: 'heroicons_outline:currency-dollar',
                link: '/cashier-dashboard/replenishment'
            },

            {
                id: 'clientRegistration',
                title: 'Cadastro de Cliente',
                type: 'basic',
                icon: 'heroicons_outline:user',
                link: '/cashier-dashboard/clientRegistration'
            },

            {
                id: 'client-balance',
                title: 'Saldo do Cliente',
                type: 'basic',
                icon: 'heroicons_outline:wallet',
                link: '/cashier-dashboard/client-balance'
            },


            {
                id: 'reimbursement',
                title: 'Ressarcimento',
                type: 'basic',
                icon: 'heroicons_outline:chevron-double-left',
                link: '/cashier-dashboard/reimbursement'
            },

            {
                id: 'client-history',
                title: 'Histórico do Cliente',
                type: 'basic',
                icon: 'heroicons_outline:banknotes',
                link: '/cashier-dashboard/client-history'
            }
            // ,
            // {
            //     id: 'bleeding',
            //     title: 'Sangria',
            //     type: 'basic',
            //     icon: 'heroicons_outline:beaker',
            //     link: '/cashier-dashboard/bleeding'
            // }
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
    }];

export const permissionaryNavigation: FuseNavigationItem[] = [
    {
        id: 'dashboards',
        title: 'Menu Permissionário',
        type: 'group',
        icon: 'heroicons_outline:home',
        children: [
            {
                id: 'principal',
                title: 'Principal',
                type: 'basic',
                icon: 'heroicons_outline:chart-pie',
                link: '/permissionary-dashboard'
            },

            {
                id: 'sell',
                title: 'Vendas',
                type: 'basic',
                icon: 'heroicons_outline:currency-dollar',
                link: '/permissionary/sell'
            },

            {
                id: 'client-balance',
                title: 'Saldo do Cliente',
                type: 'basic',
                icon: 'heroicons_outline:wallet',
                link: '/permissionary/client-balance'
            },


            {
                id: 'client-history',
                title: 'Histórico do Cliente',
                type: 'basic',
                icon: 'heroicons_outline:banknotes',
                link: '/permissionary/client-history'
            },


            {
                id: 'refund',
                title: 'Estorno',
                type: 'basic',
                icon: 'heroicons_outline:chevron-double-left',
                link: '/permissionary/refund'
            },
        ]

    }



]


export const reviewerNavigation: FuseNavigationItem[] = [

    {
        id: 'dashboards',
        title: 'Menu revisor',
        type: 'group',
        icon: 'heroicons_outline:home',
        children: [
            {
                id: 'principal',
                title: 'Principal',
                type: 'basic',
                icon: 'heroicons_outline:chart-pie',
                link: '/reviewer-dashboard'
            },

            {
                id: 'events',
                title: 'Eventos',
                type: 'basic',
                icon: 'heroicons_outline:chart-pie',
                link: '/reviewer-dashboard'
            },

            {
                id: 'clients',
                title: 'Clientes',
                type: 'collapsable',
                icon: 'heroicons_outline:chart-pie',
                children: [



                    {
                        id: 'clientRegistration',
                        title: 'Cadastro de Cliente',
                        type: 'basic',
                        icon: 'heroicons_outline:user',
                        link: '/reviewer/clientRegistration'
                    },

                    {
                        id: 'client-balance',
                        title: 'Saldo do Cliente',
                        type: 'basic',
                        icon: 'heroicons_outline:wallet',
                        link: '/reviewer/client-balance'
                    },

                    {
                        id: 'client-history',
                        title: 'Histórico do Cliente',
                        type: 'basic',
                        icon: 'heroicons_outline:banknotes',
                        link: '/reviewer/client-history'
                    },

                    {
                        id: 'load-client',
                        title: 'Carregar Cliente',
                        type: 'basic',
                        icon: 'heroicons_outline:banknotes',
                        link: '/reviewer/client-loading'
                    }


                ]
            },

            {
                id: 'reviewer-users',
                title: 'Usuários',
                type: 'collapsable',
                icon: 'heroicons_outline:users',
                children: [

                    {
                        id: 'reviewer-users',
                        title: 'Cadastro Geral',
                        type: 'basic',
                        icon: 'heroicons_outline:user',
                        link: '/reviewer-dashboard/reviewer-users'
                    },

                    {
                        id: 'reviewer-operators',
                        title: 'Operadores de Caixa',
                        type: 'basic',
                        icon: 'heroicons_outline:currency-dollar',
                        link: '/reviewer-dashboard/reviewer-operators'
                    },



                    {
                        id: 'reviewer-attendant',
                        title: 'Atendentes',
                        type: 'basic',
                        icon: 'heroicons_outline:user',
                        link: '/reviewer-dashboard/reviewer-operators'
                    },


                    {
                        id: 'reviewer',
                        title: 'Revisores',
                        type: 'basic',
                        icon: 'heroicons_outline:user',
                        link: '/reviewer-dashboard/reviewers'
                    },

                    {
                        id: 'reviewer-permissionary',
                        title: 'Permissionários',
                        type: 'basic',
                        icon: 'heroicons_outline:user',
                        link: '/reviewer-dashboard/permissionaries'
                    },

                ]





            },

        ]

    }

]


export const attendantNavigation: FuseNavigationItem[] = [
    {
        id: 'dashboards',
        title: 'Menu Atendente',
        type: 'group',
        icon: 'heroicons_outline:home',
        children: [
            {
                id: 'sell',
                title: 'Vendas',
                type: 'basic',
                icon: 'heroicons_outline:currency-dollar',
                link: '/attendant/sell'
            },

            {
                id: 'client-balance',
                title: 'Saldo do Cliente',
                type: 'basic',
                icon: 'heroicons_outline:wallet',
                link: '/attendant/client-balance'
            },


            {
                id: 'client-history',
                title: 'Histórico do Cliente',
                type: 'basic',
                icon: 'heroicons_outline:banknotes',
                link: '/attendant/client-history'
            },



            {
                id: 'my-actions',
                title: 'Minhas Ações',
                type: 'basic',
                icon: 'heroicons_outline:presentation-chart-line',
                link: '/attendant/my-actions'
            }


        ]

    }
];


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
