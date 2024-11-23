import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import * as _ from 'lodash';

const STORAGE_KEY = 'tracker:paj-gps';
@Injectable({
  providedIn: 'root',
})
export class StorageService {
  
  private _storage: Storage | null = null;

  constructor(private storage: Storage) {
    this.init();
  }

  async init() {
    const storage = await this.storage.create();
    this._storage = storage;
  }

  async set(value: any) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
    await this._storage?.set(STORAGE_KEY, JSON.stringify(value));
  }

  async get() {
    const local = localStorage.getItem(STORAGE_KEY);
    if (!_.isEmpty(local)) {
      return JSON.parse(local);
    }

    const value = await this._storage?.get(STORAGE_KEY);
    
    if(_.isEmpty(value)) { return {}; }
    
    return JSON.parse(value);
  }

  async clear() {
    localStorage.clear();
    await this._storage?.clear();
  }
}
