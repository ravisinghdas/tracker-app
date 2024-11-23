import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { IonicModule } from "@ionic/angular";
import { HeaderComponent } from "./header/header.component";

@NgModule({
    imports: [
        CommonModule,
        IonicModule.forRoot()
    ],
    declarations: [
        HeaderComponent
    ],
    exports: [
        HeaderComponent
    ],
    providers: []
})
export class ComponentsModule { }
