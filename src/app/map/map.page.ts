import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import * as _ from 'lodash';
import * as maplibregl from 'maplibre-gl';
import { Marker } from 'maplibre-gl';
import { Subscription } from 'rxjs/internal/Subscription';
import { AppService } from '../services/app.service';

@Component({
    selector: 'app-map',
    templateUrl: 'map.page.html',
    styleUrls: ['map.page.scss']
})
export class MapPage {

    map: maplibregl.Map | undefined;
    title: string = "Map";
    processing: boolean = false;
    device_id: number | null = null;
    data: any = [];
    routes: any = [];
    clients: any = [];
    places: any = [];
    directionIcons: any = [];

    private routeSub: Subscription | undefined;

    constructor(
        private activatedRoute: ActivatedRoute,
        private service: AppService
    ) { }

    ngOnInit() {
        this.routeSub = this.activatedRoute.queryParams.subscribe((params) => {
            const device_id = params['device_id'];
            if (!_.isEmpty(device_id) && this.device_id != device_id && this.map) {
                this.device_id = device_id;
                this.getTrackingData();
            }else {
                this.device_id = device_id;
            }
        });
    }

    ngAfterViewInit() {
        this.map = new maplibregl.Map({
            container: 'map',
            style: 'https://api.maptiler.com/maps/streets/style.json?key=a6C8CuAHJ4R45ysD8FwY',
            center: [0, 0],
            zoom: 4,
        });

        this.map.addControl(new maplibregl.NavigationControl(), 'top-left');

        this.getAllClients();
    }

    ngOnDestroy() {
        if (this.map) {
            this.map.remove();
        }

        if (this.routeSub) {
            this.routeSub.unsubscribe();
        }
    }

    getAllClients() {
        this.service.get('device', {}).subscribe((response: any) => {
            const { success } = response;

            const deviceIDs = success.map((device: any) => device.id);
            this.getLastPosition(deviceIDs, success);
        });
    }

    getLastPosition(deviceIDs: any, data: any) {
        this.service.post(`trackerdata/getalllastpositions`, { deviceIDs: deviceIDs }).subscribe((response: any) => {
            const { success } = response;
            if(success.length > 0) { this.renderClients(success, data); }
        }, (err) => {
            const error = err.error.error;
            this.service.presentAlert(JSON.stringify(error));
        });
    }

    async renderClients(data: any, devices: any) {
        this.clients.forEach((obj: any) => { obj.marker.remove(); });
        this.clients = [];

        data.forEach((coord: any) => {
            const popup = new maplibregl.Popup().setHTML(`Device ID : <b>${coord.iddevice}</b>`);

            const device = devices.find((_item: any) => _item.id == coord.iddevice);

            this.places.push({
                'type': 'Feature',
                'properties': {
                    'description': device.name,
                    'icon': 'device'
                },
                'geometry': {
                    'type': 'Point',
                    'coordinates': [coord.lng, coord.lat]
                }
            });

            this.clients.push({ marker: new Marker({color: 'red'})
                .setLngLat([coord.lng, coord.lat])
                .setPopup(popup)
                .addTo(this.map), device_id: coord.iddevice, lng: coord.lng, lat: coord.lat });
        });

        const bounds = new maplibregl.LngLatBounds();

        data.forEach((coord: any) => {
            bounds.extend([coord.lng, coord.lat]);
        });
          
        this.map.fitBounds(bounds, { padding: 20, maxZoom: 12 });

        this.map.addSource('places', {
            'type': 'geojson',
            'data': {
                'type': 'FeatureCollection',
                'features': this.places
            }
        });

        this.map.addLayer({
            'id': 'poi-labels',
            'type': 'symbol',
            'source': 'places',
            'layout': {
                'text-field': ['get', 'description'],
                'text-justify': 'auto'
            }
        });

        const device = this.clients.find((device: any) => device.device_id == this.device_id);
        if(device) {
            this.getTrackingData();
        }
    }

    getTrackingData() {
        this.service.get(`trackerdata/${this.device_id}/last_points`, { lastPoints: 50 }).subscribe((response: any) => {
            const { success } = response;
            this.routes = success;
            if(this.routes.length == 0) {
                this.service.presentAlert('No Data Found.');
            }else {
                this.initializeMap();
            }
        }, (err) => {
            const error = err.error.error;
            this.routes = [];
            this.service.presentAlert(JSON.stringify(error));
        });
    }

    initializeMap() {
        const coordinates = this.routes.map((route: any) => [route.lng, route.lat]);

        if (this.map.getSource('route')) {
            if (this.map.getLayer('route')) {
                this.map.removeLayer('route');
            }

            this.map.removeSource('route');
        }

        this.map.addSource('route', {
            'type': 'geojson',
            'data': {
                'type': 'Feature',
                'properties': {},
                'geometry': {
                    'type': 'LineString',
                    'coordinates': coordinates
                }
            }
        });

        this.map.addLayer({
            'id': 'route',
            'type': 'line',
            'source': 'route',
            'layout': {
                'line-join': 'round',
                'line-cap': 'round'
            },
            'paint': {
                'line-color': 'blue',
                'line-width': 3
            }
        });

        const bounds = new maplibregl.LngLatBounds();

        coordinates.forEach((coordinate: any) => {
            bounds.extend(coordinate);
        });
          
        this.map.fitBounds(bounds, { padding: 20, maxZoom: 14 });

        const lastPoint = this.clients.find((device: any) => device.device_id == this.device_id);

        if(lastPoint.lng == this.routes[0]['lng'] && lastPoint.lat == this.routes[0]['lat']) {
            this.routes = this.routes.reverse();
        }

        const routes: any = [];

        for(let i = 0; i < this.routes.length; i++) {
            routes.push({lng: this.routes[i]['lng'], lat: this.routes[i]['lat']});
        }

        this.directionIcons.forEach((direction: any) => {
            direction.remove();
        });

        routes.forEach((route: any, index: any) => {
            if((routes.length - 1) != index) {
                const { lat: lat1, lng: lng1 } = routes[index];
                const { lat: lat2, lng: lng2 } = routes[index + 1];
                const degree = this.calculateAngle(lat1, lng1, lat2, lng2);

                const el = document.createElement('img');
                el.className = 'forward-direction';
                el.src = `assets/forward-icon.png`;
        
                this.directionIcons.push(new maplibregl.Marker({element: el, rotation: degree, rotationAlignment: 'auto' })
                .setLngLat([route.lng, route.lat])
                .addTo(this.map));
            }
        });
    }

    calculateAngle(lat1: any, lng1: any, lat2: any, lng2: any) {
        const toRadians = (deg: any) => deg * (Math.PI / 180);
        const toDegrees = (rad: any) => rad * (180 / Math.PI);
        
        lat1 = toRadians(lat1);
        lng1 = toRadians(lng1);
        lat2 = toRadians(lat2);
        lng2 = toRadians(lng2);
        
        const deltaLng = lng2 - lng1;
    
        const x = Math.sin(deltaLng) * Math.cos(lat2);
        const y = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(deltaLng);
    
        const initialBearing = toDegrees(Math.atan2(x, y));
        
        return (initialBearing + 360) % 360;
    }

}
