import { Routes } from '@angular/router';
import { TrackingComponent } from './features/tracking/tracking';
import { DriverComponent } from './features/driver/driver-component/driver-component';

export const routes: Routes = [
    { path: '', redirectTo: 'tracking/1', pathMatch: 'full' },
    { path: 'tracking/:id', component: TrackingComponent },
    { path: 'driver', component: DriverComponent },
   
];
