import { Component } from '@angular/core';
import 'zone.js';
import 'zone.js/dist/long-stack-trace-zone.js';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  title: string = '';
}
