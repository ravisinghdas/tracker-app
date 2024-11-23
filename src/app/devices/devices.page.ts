import { Component, OnInit } from '@angular/core';
import { AppService } from '../services/app.service';
import { Router } from '@angular/router';

@Component({
    selector: 'app-devices',
    templateUrl: 'devices.page.html',
    styleUrls: ['devices.page.scss']
})
export class DevicesPage implements OnInit {

    devices: any = [];
    processing: boolean = false;
    title: string = "Devices";

    constructor(
        private service: AppService,
        private router: Router
    ) { }

    ngOnInit() {
        this.loadData();
    }

    loadData() {
        this.processing = true;
        this.service.get('device', {}).subscribe((response: any) => {
            const { success } = response;
            this.devices = success;
            this.processing = false;
        }, (err) => {
            this.processing = false;
        });
    }

    trackerData(device: any) {
        this.router.navigate(['/map'], { queryParams: { device_id: device.id } });
    }

}
