import { Component, inject } from '@angular/core';
import { StorageService } from './services/storage.service';

@Component({
    selector: 'app-root',
    templateUrl: 'app.component.html',
    styleUrls: ['app.component.scss'],
})
export class AppComponent {

    constructor() { 
        inject(StorageService);
    }

}
