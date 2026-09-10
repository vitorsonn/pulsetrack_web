import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MapViewComponent } from "./features/tracking/components/map-view/map-view";

@Component({
  imports: [RouterOutlet],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {
  protected readonly title = signal('pulsetrack-front');
}
