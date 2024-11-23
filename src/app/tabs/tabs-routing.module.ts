import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TabsPage } from './tabs.page';

const routes: Routes = [
    {
        path: '',
        component: TabsPage,
        children: [
            {
                path: 'map',
                loadChildren: () => import('../map/map.module').then(m => m.MapPageModule)
            },
            {
                path: 'devices',
                loadChildren: () => import('../devices/devices.module').then(m => m.DevicesPageModule)
            },
            {
                path: '',
                redirectTo: 'map',
                pathMatch: 'full'
            }
        ]
    },
    {
        path: '',
        redirectTo: '/map',
        pathMatch: 'full'
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
})
export class TabsPageRoutingModule { }
