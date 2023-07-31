import { Injectable } from '@angular/core';
import { Settings } from './models';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {

  public settings!: Settings;
  constructor() {
    this.settings = this.getSettings();
  }

  public getSettings(): Settings {
    try {
      return JSON.parse(localStorage['settings']);
    } catch {
      return { dataset: '', lastDownload: '' };
    }
  }

  public getLastDownload(): Date {
    try {
      return new Date(this.settings.lastDownload);
    } catch {
      return new Date(0);
    }
  }

  public save() {
    localStorage['settings'] = JSON.stringify(this.settings);
  }
}