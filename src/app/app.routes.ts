import { Routes } from '@angular/router';
import { TrackingComponent } from './features/tracking/tracking';

export const routes: Routes = [
    { path: '', redirectTo: 'tracking/1', pathMatch: 'full' },
    { path: 'tracking/:id', component: TrackingComponent },
];
