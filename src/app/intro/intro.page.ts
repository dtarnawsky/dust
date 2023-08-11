import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Router, RouterModule } from '@angular/router';
import { DbService } from '../db.service';
import { SplashScreen } from '@capacitor/splash-screen';
import { SettingsService } from '../settings.service';
import { FavoritesService } from '../favorites.service';
import { MessageComponent } from '../message/message.component';
import { addDays, daysBetween, delay, isWhiteSpace, now } from '../utils';
import { Dataset } from '../models';
import { datasetFilename } from '../api';
import { ApiService } from '../api.service';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Capacitor } from '@capacitor/core';
import { ThemePrimaryColor, UiService } from '../ui.service';

interface IntroState {
  ready: boolean,
  showMessage: boolean
  downloading: boolean
  yearSelectedAlready: boolean
  cards: Dataset[];
  selected: Dataset | undefined;
  message: string;
}

function initialState(): IntroState {
  return {
    ready: true,
    showMessage: false,
    downloading: false,
    yearSelectedAlready: true,
    cards: [],
    selected: undefined,
    message: ''
  }
}

@Component({
  selector: 'app-intro',
  templateUrl: './intro.page.html',
  styleUrls: ['./intro.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, RouterModule, MessageComponent]
})
export class IntroPage {
  vm: IntroState = initialState();

  constructor(private db: DbService, private api: ApiService,
    private settingsService: SettingsService, private ui: UiService,
    private fav: FavoritesService, private router: Router) { }

  async ionViewWillEnter() {
    this.vm = initialState();
    // Whether the user has selected a year previously
    this.vm.yearSelectedAlready = !isWhiteSpace(this.settingsService.settings.dataset);

    this.vm.cards = await this.loadDatasets();
    // need to load
    this.load();
  }

  async ionViewDidEnter() {
    this.ui.setNavigationBar(ThemePrimaryColor);
    await delay(500);
    if (Capacitor.isNativePlatform()) {
      await StatusBar.setStyle({ style: Style.Dark });
      await this.ui.setStatusBarBackgroundColor();
      await SplashScreen.hide();
      await delay(200);
      await this.ui.setStatusBarBackgroundColor();
    }

    try {
      this.vm.downloading = true;
      await this.api.download();
    } finally {
      this.vm.downloading = false;
    }
    if (this.vm.yearSelectedAlready) {
      this.go();
    }
  }

  private load() {
    const idx = this.vm.cards.findIndex((c) => datasetFilename(c) == this.settingsService.settings.dataset);
    if (idx >= 0) {
      this.vm.selected = this.vm.cards[idx];
      console.log('intro.load', this.vm.selected);
    } else {
      // First time in: select this year
      this.vm.selected = this.vm.cards[0];
      this.save();
    }
  }

  async go() {
    if (!this.vm.selected) return;
    const thisYear = this.vm.selected.year == this.vm.cards[0].year;
    const start = new Date(this.vm.cards[0].start);
    const manBurns = addDays(start, 6);
    const x = daysBetween(now(), manBurns);
    const until = daysBetween(now(), start);

    const hideLocations = (thisYear && until > 1);
    this.db.setHideLocations(hideLocations);
    if (hideLocations && !this.vm.yearSelectedAlready) {
      this.vm.message = `Locations for camps and art will be released in the app on Sunday 27th. There are ${x} days until the man burns.`;
      this.vm.showMessage = true;
    } else {
      this.vm.showMessage = false;
      this.launch();
    }
  }

  async launch() {
    try {
      if (!this.vm.selected) return;
      this.vm.ready = false;
      this.vm.showMessage = false;

      await this.db.init(this.settingsService.settings.dataset);
      await this.api.sendDataToWorker();
      this.fav.init(this.settingsService.settings.dataset);
      const title = (this.vm.selected.year == this.vm.cards[0].year) ? '' : this.vm.selected.year;
      this.db.selectedYear.set(title);
      if (Capacitor.isNativePlatform()) {
        setTimeout(async () => {
          this.ui.setNavigationBar();
          StatusBar.setStyle({ style: this.ui.darkMode() ? Style.Dark : Style.Light });
          this.ui.setStatusBarBackgroundColor(this.ui.darkMode() ? '#000000' : '#FFFFFF');
        }, 100);
      }
      await this.router.navigateByUrl('/tabs/events');
    } finally {
      setTimeout(() => {
        this.vm.ready = true;
      }, 2000);
    }
  }

  open(card: Dataset) {
    this.vm.selected = card;
    this.save();
  }

  save() {
    this.settingsService.settings.dataset = datasetFilename(this.vm.selected!);
    this.settingsService.settings.eventTitle = this.vm.selected!.title;
    this.settingsService.save();
  }

  private async loadDatasets(): Promise<Dataset[]> {
    const res = await fetch('assets/datasets/datasets.json');
    return await res.json();
  }

}
