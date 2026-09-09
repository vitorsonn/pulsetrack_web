import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { TrackingService } from '../../core/services/tracking';
import { LocationData } from '../../core/models/location-data';
import { MapView } from './components/map-view/map-view';
import { CommonModule } from '@angular/common';
import { Order } from '../../core/models/order';
import { OrderService } from '../../core/services/order';


@Component({
  imports: [MapView, CommonModule],
  selector: 'app-tracking',
  styleUrl: './tracking.css',
  templateUrl: './tracking.html',
})
export class TrackingComponent implements OnInit, OnDestroy {

orderId!: number;
order: Order | null = null;
currentLocation: LocationData | null = null
isConnected: boolean = false;

private streamSub?: Subscription | null = null;

constructor(private route: ActivatedRoute, private trackingService: TrackingService, private orderService: OrderService) {}

ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    this.orderId = idParam ? Number(idParam) : 1;

    this.loadOrderData();
    this.loadInitialLocation();
    this.connectToRealtimeStream();
  }

  ngOnDestroy(): void {
    // Fecha a conexão SSE limpando a inscrição do Observable
    if (this.streamSub) {
      this.streamSub.unsubscribe();
    }
  }

  private loadOrderData(): void {
    this.orderService.getOrderById(this.orderId).subscribe({
      next: (order) => (this.order = order),
      error: (err) => console.error('Erro ao buscar pedido:', err)
    });
  }

  private loadInitialLocation(): void {
    this.trackingService.getCurrentLocation(this.orderId).subscribe({
      next: (location) => {
        if (location) {
          this.currentLocation = location;
        }
      },
      error: (err) => console.error('Erro ao buscar posição inicial:', err)
    });
  }

  private connectToRealtimeStream(): void {
    this.streamSub = this.trackingService.getRealtimeStream(this.orderId).subscribe({
      next: (location) => {
        this.currentLocation = location;
        this.isConnected = true;
      },
      error: (err) => {
        console.error('Falha na stream SSE:', err);
        this.isConnected = false;
      }
    });
  }

}
