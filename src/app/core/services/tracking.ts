import { Injectable, NgZone } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { LocationData } from '../models/location-data';
import { Observable } from 'rxjs';
import { Order } from '../models/order';
import { API_BASE_URL } from '../config/api-url';


@Injectable({
  providedIn: 'root'
})
export class TrackingService {

    private readonly API_URL = `${API_BASE_URL}/tracking`;

    constructor(private http: HttpClient, private ngZone: NgZone) { }

    getCurrentLocation(orderId: number): Observable<LocationData> {
    return this.http.get<LocationData>(`${this.API_URL}/${orderId}/current`);
  }

 getRealtimeStream(orderId: number): Observable<LocationData> {
  return new Observable<LocationData>((observer) => {
    const streamUrl = `${this.API_URL}/stream/${orderId}`;
    console.log('--> [Angular] Conectando no SSE:', streamUrl);

    const eventSource = new EventSource(streamUrl);

    eventSource.addEventListener('INIT', (event: MessageEvent) => {
      console.log('--> [Angular] Handshake SSE confirmado:', event.data);
    });

    eventSource.addEventListener('location-update', (event: MessageEvent) => {
      this.ngZone.run(() => {
        console.log('--> [Angular] Coordenada recebida:', event.data);
        const data: LocationData = JSON.parse(event.data);
        observer.next(data);
      });
    });

    eventSource.onerror = (error) => {
      this.ngZone.run(() => {
        console.error('--> [Angular] Erro/Queda na conexão SSE:', error);
        // O navegador tenta reconectar sozinho em alguns segundos se o EventSource continuar aberto
      });
    };

    return () => {
      console.log('--> [Angular] Fechando SSE');
      eventSource.close();
    };
  });
}

getOrderDetails(orderId: number): Observable<Order> {
return this.http.get<Order>(`${API_BASE_URL}/orders/${orderId}`);

}

completeOrder(orderId: number): Observable<Order> {
  return this.http.patch<Order>(`${API_BASE_URL}/orders/${orderId}/complete`, {});
}



}
