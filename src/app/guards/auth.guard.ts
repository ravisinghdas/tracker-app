import { Observable } from 'rxjs';
import { CanMatch } from '@angular/router';
import { Injectable } from '@angular/core';
import { filter, map, take } from 'rxjs/operators';
import { AppService } from '../services/app.service';

@Injectable({
    providedIn: 'root'
})

export class AuthGuard implements CanMatch {

    constructor(
        private service: AppService
    ) { }

    canMatch(): Observable<boolean> {
        return this.service.isAuthenticated.pipe(
            filter((val) => val !== null),
            take(1),
            map((isAuthenticated) => {
                if (isAuthenticated) {
                    return true;
                } else {
                    this.service.goToRoot('/login');
                    return false;
                }
            })
        );
    }

}
