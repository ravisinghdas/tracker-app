
import { Router } from '@angular/router';
import { Injectable } from '@angular/core';
import { map, retry } from 'rxjs/operators';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AlertController, LoadingController, NavController } from '@ionic/angular';
import { environment as ENV } from '../../environments/environment';
import { BehaviorSubject } from 'rxjs';
import { StorageService } from './storage.service';
import * as _ from 'lodash';

@Injectable({
    providedIn: 'root'
})
export class AppService {

    account: any = {};
    loading: any;
    isAuthenticated: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(null);
    accessToken: any = null;
    refreshToken: any = null;

    constructor(
        private nav: NavController,
        private http: HttpClient,
        private router: Router,
        private loadingCtrl: LoadingController,
        public storage: StorageService,
        private alertCtrl: AlertController
    ) {
        this.initialize();
    }

    async initialize() {
        const pajGps = await this.storage.get();

        if (!_.isEmpty(pajGps)) {
            this.account = pajGps;
            this.accessToken = pajGps?.token;
            this.refreshToken = pajGps?.refresh_token;
            this.isAuthenticated.next(true);
        } else {
            this.isAuthenticated.next(false);
        }
    }

    async presentAlert(msg: string, heading = 'Alert') {
        let alert = await this.alertCtrl.create({
            header: heading,
            message: msg,
            buttons: [{
                text: 'OK',
                handler: () => { }
            }]
        });

        await alert.present();
    }

    sleep(ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async dismissLoading() {
        this.loadingCtrl.getTop().then(v => v ? this.loadingCtrl.dismiss() : null);
    }

    async showLoader(msg: string = '') {
        if (msg === '') {
            msg = 'Please wait...';
        }

        this.loading = await this.loadingCtrl.create({
            message: msg
        });
        await this.loading.present();
    }

    public goToRoot(page: string, navigationExtras?: any) {
        this.nav.navigateRoot(page, navigationExtras);
    }

    get(endpoint: any, parameter: any) {
        const headers = new HttpHeaders({
            Authorization: `Bearer ${this.accessToken}`
        });

        return this.http.get(ENV.API_URL + endpoint, { params: parameter, headers: headers }).pipe(
            retry(1),
            map(data => data)
        );
    }

    post(endpoint: any, parameter: any) {
        const headers = new HttpHeaders({
            Authorization: `Bearer ${this.accessToken}`
        });

        return this.http.post(ENV.API_URL + endpoint, parameter, { headers: headers }).pipe(
            map(data => data)
        );
    }

    login(parameter: any) {

        return this.http.post(ENV.API_URL + 'login', parameter).pipe(
            map(data => data)
        );
    }

    async logout() {
        this.accessToken = null;
        this.refreshToken = null;
        this.account = {};
        this.isAuthenticated.next(false);
        await this.storage.clear();

        this.router.navigateByUrl('/login', { replaceUrl: true });
    }

    getNewToken() {
        const data = this.storage.get();

        console.log(data);


        // return refreshToken.pipe(
        //     switchMap(user => {
        //       const parameter = {
        //         email: data.
        //       }
        //       return this.http.post(ENV.API_URL + 'updatetoken', );
        //     })
        // );
    }

}
