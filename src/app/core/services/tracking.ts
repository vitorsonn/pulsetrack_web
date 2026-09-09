import { Injectable, NgZone } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { LocationData } from '../models/location-data';
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class TrackingService {

    private readonly API_URL = 'http://localhost:8080/tracking'

    constructor(private http: HttpClient, private ngZone: NgZone) { }

    getCurrentLocation(orderId: number): Observable<LocationData> {
    return this.http.get<LocationData>(`${this.API_URL}/${orderId}/current`);
  }

  getRealtimeStream(orderId: number): Observable<LocationData> {
  return new Observable<LocationData>((observer) => {
    const streamUrl = `${this.API_URL}/stream/${orderId}`;
    console.log('--> Tentando abrir conexão SSE na URL:', streamUrl);

    const eventSource = new EventSource(streamUrl);

    eventSource.onopen = () => {
      console.log('--> Conexão SSE estabelecida com SUCESSO!');
    };

    eventSource.addEventListener('location-update', (event: MessageEvent) => {
      this.ngZone.run(() => {
        console.log('--> Evento location-update recebido:', event.data);
        const data: LocationData = JSON.parse(event.data);
        observer.next(data);
      });
    });

    eventSource.onerror = (error) => {
      this.ngZone.run(() => {
        console.error('--> Erro ou fechamento na conexão SSE:', error);
        observer.error(error);
      });
    };

    return () => {
      console.log('--> Fechando conexão SSE (unsubscribe)');
      eventSource.close();
    };
  });
}



}
