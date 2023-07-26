import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { Event } from '../models';

@Component({
  selector: 'app-event',
  templateUrl: './event.component.html',
  styleUrls: ['./event.component.scss'],
  standalone: true,
  imports: [IonicModule, RouterModule]
})
export class EventComponent  implements OnInit {

  @Input() event!: Event;
  @Input() title = 'Events';
  @Input() longTime = false;
  @Output() mapClick = new EventEmitter<any>();

  constructor() { }

  ngOnInit() {}

  map(event: Event) {
    this.mapClick.emit(event);
  }

}
