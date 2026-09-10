import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { TrackingService } from '../../core/services/tracking';
import { LocationData } from '../../core/models/location-data';
import { MapViewComponent } from './components/map-view/map-view';
import { CommonModule } from '@angular/common';
import { Order } from '../../core/models/order';
import { OrderService } from '../../core/services/order';

@Component({
  imports: [MapViewComponent, CommonModule],
  selector: 'app-tracking',
  styleUrl: './tracking.css',
  templateUrl: './tracking.html',
})
export class TrackingComponent implements OnInit, OnDestroy {
 orderId = 1;
  currentLocation: LocationData | null = null;
  isConnected = false;

  private streamSub?: Subscription;

  constructor(
    private route: ActivatedRoute,
    private trackingService: TrackingService
  ) {}

  ngOnInit(): void {
    console.log('1. [Component] OnInit iniciado diretamente');

    // Tenta pegar o ID da rota (ex: /tracking/1) ou assume 1 por padrão
    const idFromRoute = this.route.snapshot.paramMap.get('id');
    if (idFromRoute) {
      this.orderId = Number(idFromRoute);
    }

    console.log('2. [Component] Invocando conexão SSE para o pedido:', this.orderId);
    
    // Inscrição direta e imediata
    this.connectToRealtimeStream();
  }

  ngOnDestroy(): void {
    if (this.streamSub) {
      console.log('--> [Component] Limpando inscrição ao destruir componente');
      this.streamSub.unsubscribe();
    }
  }

  private connectToRealtimeStream(): void {
    console.log('3. [Component] Chamando getRealtimeStream() no serviço...');

    this.streamSub = this.trackingService.getRealtimeStream(this.orderId).subscribe({
      next: (location) => {
        console.log('--> [Component] DADO RECEBIDO VIA SSE:', location);
        this.currentLocation = { ...location };
        this.isConnected = true;
      },
      error: (err) => {
        console.error('--> [Component] Erro na stream do SSE:', err);
        this.isConnected = false;
      }
    });
  }
}
