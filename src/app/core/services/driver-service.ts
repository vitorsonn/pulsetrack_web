import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DriverOrder } from '../models/driver-order';
import { LocationData } from '../models/location-data';
import { API_BASE_URL } from '../config/api-url';

@Injectable ({
  providedIn: 'root'
})
export class DriverService {
  private readonly API_URL = API_BASE_URL;

  constructor(private http: HttpClient) {}

  getPendingOrders(): Observable<DriverOrder[]> {
    return this.http.get<DriverOrder[]>(`${this.API_URL}/orders?status=CREATED`);
  }

  // Envia o pulso de GPS (202 Accepted)
  sendLocation(location: Partial<LocationData>): Observable<void> {
    return this.http.post<void>(`${this.API_URL}/deliveries/location`, location);
  }
}
