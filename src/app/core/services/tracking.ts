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
      const eventSource = new EventSource(`${this.API_URL}/stream/${orderId}`); //eventSource é o responsavel por abrir a conexão com o servidor e receber os eventos em tempo real

      eventSource.addEventListener('location-update', (event: MessageEvent) => { //location-update é o nome do evento que está registrado no backend, e o event é o objeto que contém os dados do evento
        this.ngZone.run(() => { //o ngZone é usado para garantir que o Angular detecte as mudanças de estado e atualize a view corretamente, mesmo quando os eventos são recebidos fora do contexto do Angular
          try {
            const data: LocationData = JSON.parse(event.data); //parseando para a interface LocationData
            observer.next(data);  //mudança em tempo real, o observer.next é chamado para enviar os dados para os assinantes do Observable
          } catch (error) {
            observer.error(error);  
          }
        });
      });

      eventSource.onerror = (error) => {
        this.ngZone.run(() => {
          observer.error(error);
        });
      };

      return () => {
        eventSource.close(); //fechando a conexão com o servidor quando o Observable é cancelado (usuario muda de pagina por exemplo)
      };
    });
  }



}
