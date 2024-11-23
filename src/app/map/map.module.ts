import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MapPage } from './map.page';
import { MapPageRoutingModule } from './map-routing.module';
import { ComponentsModule } from '../components/components.module';

@NgModule({
    imports: [
        IonicModule,
        CommonModule,
        FormsModule,
        MapPageRoutingModule,
        ComponentsModule
    ],
    declarations: [MapPage]
})
export class MapPageModule { }
