import { Injectable } from '@angular/core';
import { LocationEnabledStatus, Settings } from './models';

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
      return { datasetId: '', lastDownload: '', mapRotation: 0, mapUri: '', dataset: undefined, eventTitle: '', locationEnabled: LocationEnabledStatus.Unknown, longEvents: false };
    }
  }

  public getLastDownload(): Date {
    try {
      return new Date(this.settings.lastDownload);
    } catch {
      return new Date(0);
    }
  }

  public eventTitle(): string {
    return this.settings.eventTitle;
  }

  public clearSelectedEvent() {
    this.settings.datasetId = '';
    this.settings.dataset = undefined;
    this.settings.eventTitle = '';
    this.save();
  }

  public save() {
    localStorage['settings'] = JSON.stringify(this.settings);
  }
}
