import { Route } from '@angular/router';
import { initialDataResolver } from 'app/app.resolvers';
import { AuthGuard } from 'app/core/auth/guards/auth.guard';
import { NoAuthGuard } from 'app/core/auth/guards/noAuth.guard';
import { LayoutComponent } from 'app/layout/layout.component';
import { PageNotFoundComponent } from './modules/admin/page-not-found/page-not-found.component';
import { AttendantGuard } from './core/auth/guards/attendant.guard';
import { OperatorGuard } from './core/auth/guards/operator.guard';
import { PermissionaryGuard } from './core/auth/guards/permissionary.guard';
import { ReviewerGuard } from './core/auth/guards/reviewer.guard';
import { AuditorGuard } from './core/auth/guards/auditor.guard';

// @formatter:off
/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
export const appRoutes: Route[] = [


    {
        path: 'detail-pix/:id',
        loadChildren: () => import('app/modules/qr-code/qr-code.routes').then(m => m.default),
    },

    // {
    //     path: 'qr-code',
    //     loadChildren: () => import('app/modules/qr-code/qr-code.routes').then(m => m.QR_CODE_ROUTES),
    // },

    {
        path: 'detail-pix/:id',
        loadChildren: () => import('app/modules/admin/detalhe-pix/detalhe-pix.routes').then(m => m.default)
    },

    // Redirect empty path to '/example'
    { path: '', pathMatch: 'full', redirectTo: 'dashboard' },

    // Redirect signed-in user to the '/example'
    //
    // After the user signs in, the sign-in page will redirect the user to the 'signed-in-redirect'
    // path. Below is another redirection for that path to redirect the user to the desired
    // location. This is a small convenience to keep all main routes together here on this file.
    { path: 'signed-in-redirect', pathMatch: 'full', redirectTo: 'dashboard' },



    // Auth routes for guests
    {
        path: '',
        canActivate: [NoAuthGuard],
        canActivateChild: [NoAuthGuard],
        component: LayoutComponent,
        data: {
            layout: 'empty'
        },
        children: [
            { path: 'confirmation-required', loadChildren: () => import('app/modules/auth/confirmation-required/confirmation-required.routes') },
            { path: 'forgot-password', loadChildren: () => import('app/modules/auth/forgot-password/forgot-password.routes') },

            { path: 'sign-in', loadChildren: () => import('app/modules/auth/sign-in/sign-in.routes') },
            { path: 'sign-up', loadChildren: () => import('app/modules/auth/sign-up/sign-up.routes') }
        ]
    },

    // Auth routes for authenticated users
    {
        path: '',
        canActivate: [AuthGuard],
        canActivateChild: [AuthGuard],
        component: LayoutComponent,
        data: {
            layout: 'empty'
        },
        children: [

            { path: 'sign-out', loadChildren: () => import('app/modules/auth/sign-out/sign-out.routes') },
            { path: 'unlock-session', loadChildren: () => import('app/modules/auth/unlock-session/unlock-session.routes') }
        ]
    },


    {
        path: '',
        canActivate: [AuthGuard],
        canActivateChild: [AuthGuard],
        component: LayoutComponent,
        resolve: {
            initialData: initialDataResolver
        },
        children: [
            { path: 'change-password', loadChildren: () => import('app/modules/auth/change-password/change-password.routes') },

        ]
    },
    // Admin routes
    {
        path: '',
        canActivate: [AuthGuard],
        canActivateChild: [AuthGuard],
        component: LayoutComponent,
        resolve: {
            initialData: initialDataResolver
        },
        children: [
            { path: 'dashboard', loadChildren: () => import('app/modules/admin/dashboard/dashboard.routes') },
        ]
    },
    {
        path: '',
        canActivate: [OperatorGuard],
        canActivateChild: [OperatorGuard],
        component: LayoutComponent,
        resolve: {
            initialData: initialDataResolver
        },
        children: [
            { path: 'cashier-dashboard/replenishment', loadChildren: () => import('app/modules/admin/replenishment/replenishment.routes') },
        ]
    },
    {
        path: '',
        canActivate: [OperatorGuard],
        canActivateChild: [OperatorGuard],
        component: LayoutComponent,
        resolve: {
            initialData: initialDataResolver
        },
        children: [
            { path: 'cashier-dashboard', loadChildren: () => import('app/modules/admin/cashier-dashboard/cashier-dashboard.routes') },
        ]
    },
    {
        path: '',
        canActivate: [OperatorGuard],
        canActivateChild: [OperatorGuard],
        component: LayoutComponent,
        resolve: {
            initialData: initialDataResolver
        },
        children: [
            { path: 'cashier-dashboard/my-actions', loadChildren: () => import('app/modules/admin/my-actions/my-actions.routes') },
        ]
    },
    {
        path: '',
        canActivate: [OperatorGuard],
        canActivateChild: [OperatorGuard],
        component: LayoutComponent,
        resolve: {
            initialData: initialDataResolver
        },
        children: [
            { path: 'cashier-dashboard/reimbursement', loadChildren: () => import('app/modules/admin/reimbursement/reimbursement.routes') },
        ]
    },
    {
        path: '',
        canActivate: [OperatorGuard],
        canActivateChild: [OperatorGuard],
        component: LayoutComponent,
        resolve: {
            initialData: initialDataResolver
        },
        children: [
            { path: 'cashier-dashboard/client-balance', loadChildren: () => import('app/modules/admin/client-balance/client-balance.routes') },
        ]
    },


    {
        path: '',
        canActivate: [OperatorGuard],
        canActivateChild: [OperatorGuard],
        component: LayoutComponent,
        resolve: {
            initialData: initialDataResolver
        },
        children: [
            { path: 'cashier-dashboard/client-history', loadChildren: () => import('app/modules/admin/client-history/client-history.routes') },
        ]
    },

    {
        path: '',
        canActivate: [OperatorGuard],
        canActivateChild: [OperatorGuard],
        component: LayoutComponent,
        resolve: {
            initialData: initialDataResolver
        },
        children: [
            { path: 'cashier-dashboard/clientRegistration', loadChildren: () => import('app/modules/admin/client-registration/client-registration.routes') },
        ]
    },


    {
        path: '',
        canActivate: [AttendantGuard],
        canActivateChild: [AttendantGuard],
        component: LayoutComponent,
        resolve: {
            initialData: initialDataResolver
        },
        children: [
            { path: 'attendant/sell', loadChildren: () => import('app/modules/admin/sell/sellcomponent.routes') },
        ]
    },


    {
        path: '',
        canActivate: [AttendantGuard],
        canActivateChild: [AttendantGuard],
        component: LayoutComponent,
        resolve: {
            initialData: initialDataResolver
        },
        children: [
            { path: 'attendant/client-balance', loadChildren: () => import('app/modules/admin/client-balance/client-balance.routes') },
        ]
    },


    {
        path: '',
        canActivate: [AttendantGuard],
        canActivateChild: [AttendantGuard],
        component: LayoutComponent,
        resolve: {
            initialData: initialDataResolver
        },
        children: [
            { path: 'attendant/client-history', loadChildren: () => import('app/modules/admin/client-history/client-history.routes') },
        ]
    },

    {
        path: '',
        canActivate: [AttendantGuard],
        canActivateChild: [AttendantGuard],
        component: LayoutComponent,
        resolve: {
            initialData: initialDataResolver
        },
        children: [
            { path: 'attendant/my-actions', loadChildren: () => import('app/modules/admin/attendant-my-actions/attendant-my-actions.routes') },
        ]
    },



    {
        path: '',
        canActivate: [PermissionaryGuard],
        canActivateChild: [PermissionaryGuard],
        component: LayoutComponent,
        resolve: {
            initialData: initialDataResolver
        },
        children: [
            { path: 'permissionary-dashboard', loadChildren: () => import('app/modules/admin/permissionary-dashboard/permissionary-dashboard.routes') },
        ]
    },

    {
        path: '',
        canActivate: [PermissionaryGuard],
        canActivateChild: [PermissionaryGuard],
        component: LayoutComponent,
        resolve: {
            initialData: initialDataResolver
        },
        children: [
            { path: 'permissionary/sell', loadChildren: () => import('app/modules/admin/sell/sellcomponent.routes') },
        ]
    },


    {
        path: '',
        canActivate: [PermissionaryGuard],
        canActivateChild: [PermissionaryGuard],
        component: LayoutComponent,
        resolve: {
            initialData: initialDataResolver
        },
        children: [
            { path: 'permissionary/client-balance', loadChildren: () => import('app/modules/admin/client-balance/client-balance.routes') },
        ]
    },


    {
        path: '',
        canActivate: [PermissionaryGuard],
        canActivateChild: [PermissionaryGuard],
        component: LayoutComponent,
        resolve: {
            initialData: initialDataResolver
        },
        children: [
            { path: 'permissionary/client-history', loadChildren: () => import('app/modules/admin/client-history/client-history.routes') },
        ]
    },


    {
        path: '',
        canActivate: [PermissionaryGuard],
        canActivateChild: [PermissionaryGuard],
        component: LayoutComponent,
        resolve: {
            initialData: initialDataResolver
        },
        children: [
            { path: 'permissionary/refund', loadChildren: () => import('app/modules/admin/refund/refundcomponent.routes') },
        ]
    },


    {
        path: '',
        canActivate: [PermissionaryGuard],
        canActivateChild: [PermissionaryGuard],
        component: LayoutComponent,
        resolve: {
            initialData: initialDataResolver
        },
        children: [
            { path: 'permissionary/attendant', loadChildren: () => import('app/modules/admin/permissionary-attendant/attendants.routes') },
        ]
    },

    {
        path: '',
        canActivate: [ReviewerGuard],
        canActivateChild: [ReviewerGuard],
        component: LayoutComponent,
        resolve: {
            initialData: initialDataResolver
        },
        children: [
            { path: 'reviewer-dashboard', loadChildren: () => import('app/modules/admin/reviewer-dashboard/reviewer-dashboard.routes') },
        ]
    },


    {
        path: '',
        canActivate: [ReviewerGuard],
        canActivateChild: [ReviewerGuard],
        component: LayoutComponent,
        resolve: {
            initialData: initialDataResolver
        },
        children: [
            { path: 'reviewer-events', loadChildren: () => import('app/modules/admin/events/events.routes') },
        ]
    },



    {
        path: '',
        canActivate: [ReviewerGuard],
        canActivateChild: [ReviewerGuard],
        component: LayoutComponent,
        resolve: {
            initialData: initialDataResolver
        },
        children: [
            { path: 'reviewer/clients-all', loadChildren: () => import('app/modules/admin/clients-all/clients-all.routes') },
        ]
    },




    {
        path: '',
        canActivate: [ReviewerGuard],
        canActivateChild: [ReviewerGuard],
        component: LayoutComponent,
        resolve: {
            initialData: initialDataResolver
        },
        children: [
            { path: 'reviewer-money', loadChildren: () => import('app/modules/admin/money/money.routes') },
        ]
    },
    {
        path: '',
        canActivate: [ReviewerGuard],
        canActivateChild: [ReviewerGuard],
        component: LayoutComponent,
        resolve: {
            initialData: initialDataResolver
        },
        children: [
            { path: 'reviewer/clientRegistration', loadChildren: () => import('app/modules/admin/client-registration/client-registration.routes') },
        ]
    },

    {
        path: '',
        canActivate: [ReviewerGuard],
        canActivateChild: [ReviewerGuard],
        component: LayoutComponent,
        resolve: {
            initialData: initialDataResolver
        },
        children: [
            { path: 'reviewer/client-balance', loadChildren: () => import('app/modules/admin/client-balance/client-balance.routes') },
        ]
    },


    {
        path: '',
        canActivate: [ReviewerGuard],
        canActivateChild: [ReviewerGuard],
        component: LayoutComponent,
        resolve: {
            initialData: initialDataResolver
        },
        children: [
            { path: 'reviewer/client-history', loadChildren: () => import('app/modules/admin/client-history/client-history.routes') },
        ]
    },



    {
        path: '',
        canActivate: [ReviewerGuard],
        canActivateChild: [ReviewerGuard],
        component: LayoutComponent,
        resolve: {
            initialData: initialDataResolver
        },
        children: [
            { path: 'reviewer/client-loading', loadChildren: () => import('app/modules/admin/client-loading/client-loading.routes') },
        ]
    },

    {
        path: '',
        canActivate: [ReviewerGuard],
        canActivateChild: [ReviewerGuard],
        component: LayoutComponent,
        resolve: {
            initialData: initialDataResolver
        },
        children: [
            { path: 'reviewer-dashboard/users', loadChildren: () => import('app/modules/admin/users/users.routes') },
        ]
    },


    {
        path: '',
        canActivate: [ReviewerGuard],
        canActivateChild: [ReviewerGuard],
        component: LayoutComponent,
        resolve: {
            initialData: initialDataResolver
        },
        children: [
            { path: 'reviewer/operators', loadChildren: () => import('app/modules/admin/operators/operators.routes') },
        ]
    },


    {
        path: '',
        canActivate: [ReviewerGuard],
        canActivateChild: [ReviewerGuard],
        component: LayoutComponent,
        resolve: {
            initialData: initialDataResolver
        },
        children: [
            { path: 'reviewer/attendant', loadChildren: () => import('app/modules/admin/attendants/attendants.routes') },
        ]
    },

    {
        path: '',
        canActivate: [ReviewerGuard],
        canActivateChild: [ReviewerGuard],
        component: LayoutComponent,
        resolve: {
            initialData: initialDataResolver
        },
        children: [
            { path: 'reviewer/reviewers', loadChildren: () => import('app/modules/admin/reviewers/reviewers.routes') },
        ]
    },


    {
        path: '',
        canActivate: [ReviewerGuard],
        canActivateChild: [ReviewerGuard],
        component: LayoutComponent,
        resolve: {
            initialData: initialDataResolver
        },
        children: [
            { path: 'reviewer/permissionario', loadChildren: () => import('app/modules/admin/permissionaries/permissionaries.routes') },
        ]
    },

    {
        path: '',
        canActivate: [AuthGuard],
        canActivateChild: [AuthGuard],
        component: LayoutComponent,
        resolve: {
            initialData: initialDataResolver
        },
        children: [
            { path: 'membro/dashboard', loadChildren: () => import('app/modules/admin/members/member-client-balance/member-client-balance.routes') },
        ]
    },


    {
        path: '',
        canActivate: [AuthGuard],
        canActivateChild: [AuthGuard],
        component: LayoutComponent,
        resolve: {
            initialData: initialDataResolver
        },
        children: [
            { path: 'membro/saldo', loadChildren: () => import('app/modules/admin/members/member-client-balance/member-client-balance.routes') },
        ]
    },

    {
        path: '',
        canActivate: [AuthGuard],
        canActivateChild: [AuthGuard],
        component: LayoutComponent,
        resolve: {
            initialData: initialDataResolver
        },
        children: [
            { path: 'membro/atualizartelefone', loadChildren: () => import('app/modules/admin/client-update-telephone/client-update-telephone.routes') },
        ]
    },

    {
        path: '',
        canActivate: [AuthGuard],
        canActivateChild: [AuthGuard],
        component: LayoutComponent,
        resolve: {
            initialData: initialDataResolver
        },
        children: [
            { path: 'membro/historico', loadChildren: () => import('app/modules/admin/member-history-client/member-history.routes') },
        ]
    },


    {
        path: '',
        canActivate: [AuthGuard],
        canActivateChild: [AuthGuard],
        component: LayoutComponent,
        resolve: {
            initialData: initialDataResolver
        },
        children: [
            { path: 'membro/historicorecarga', loadChildren: () => import('app/modules/admin/member-history-recarga-client/member-history-recarga.routes') },
        ]
    },

    {
        path: '',
        canActivate: [AuthGuard],
        canActivateChild: [AuthGuard],
        component: LayoutComponent,
        resolve: {
            initialData: initialDataResolver
        },
        children: [
            { path: 'membro/recarga', loadChildren: () => import('app/modules/admin/members/member-recarga/member-recarga.routes') },
        ]
    },


    {
        path: '',
        canActivate: [AuditorGuard],
        canActivateChild: [AuditorGuard],
        component: LayoutComponent,
        resolve: {
            initialData: initialDataResolver
        },
        children: [
            { path: 'auditor/dashboard', loadChildren: () => import('app/modules/admin/auditor-dashboard/auditor-dashboard.routes') },
        ]
    },




    {
        path: '',
        canActivate: [AuditorGuard],
        canActivateChild: [AuditorGuard],
        component: LayoutComponent,
        resolve: {
            initialData: initialDataResolver
        },
        children: [
            { path: 'auditor/dashboard', loadChildren: () => import('app/modules/admin/auditor-dashboard/auditor-dashboard.routes') },
        ]
    },

    {
        path: '',
        canActivate: [AuditorGuard],
        canActivateChild: [AuditorGuard],
        component: LayoutComponent,
        resolve: {
            initialData: initialDataResolver
        },
        children: [
            { path: 'auditor/events', loadChildren: () => import('app/modules/admin/events/events.routes') },
        ]
    },

    {
        path: '',
        canActivate: [AuditorGuard],
        canActivateChild: [AuditorGuard],
        component: LayoutComponent,
        resolve: {
            initialData: initialDataResolver
        },
        children: [
            { path: 'auditor/client-balance', loadChildren: () => import('app/modules/admin/client-balance/client-balance.routes') },
        ]
    },

    {
        path: '',
        canActivate: [AuditorGuard],
        canActivateChild: [AuditorGuard],
        component: LayoutComponent,
        resolve: {
            initialData: initialDataResolver
        },
        children: [
            { path: 'auditor/client-history', loadChildren: () => import('app/modules/admin/client-history/client-history.routes') },
        ]
    },

    {
        path: '',
        canActivate: [AuditorGuard],
        canActivateChild: [AuditorGuard],
        component: LayoutComponent,
        resolve: {
            initialData: initialDataResolver
        },
        children: [
            { path: 'auditor/clients-all', loadChildren: () => import('app/modules/admin/clients-all/clients-all.routes') },
        ]
    },


    {
        canActivate: [AuthGuard],
        canActivateChild: [AuthGuard],
        component: LayoutComponent,
        resolve: {
            initialData: initialDataResolver
        },
        path: '**',
        children: [
            {
                path: "",
                component: PageNotFoundComponent
            }
        ]
    },

];
