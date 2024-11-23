import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AutoLoginGuard } from './guards/auto-login.guard';
import { AuthGuard } from './guards/auth.guard';

const routes: Routes = [
    {
        path: 'login',
        loadChildren: () =>
            import('./login/login.module').then((m) => m.LoginPageModule),
        canMatch: [AutoLoginGuard],
    },
    {
        path: '',
        loadChildren: () =>
            import('./tabs/tabs.module').then((m) => m.TabsPageModule),
        canMatch: [AuthGuard],
    },
    {
        path: '',
        redirectTo: '/login',
        pathMatch: 'full',
    },
    {
        path: '**',
        loadChildren: () =>
            import('./error-404/error-404.module').then((m) => m.Error404PageModule),
        pathMatch: 'full',
    },
];
@NgModule({
    imports: [
        RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules }),
    ],
    exports: [RouterModule],
})
export class AppRoutingModule { }
