import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { TrackingService } from '../../core/services/tracking';
import { LocationData } from '../../core/models/location-data';
import { MapViewComponent } from './components/map-view/map-view';
import { CommonModule } from '@angular/common';


@Component({
  imports: [MapViewComponent, CommonModule],
  selector: 'app-tracking',
  styleUrl: './tracking.css',
  templateUrl: './tracking.html',
})
export class TrackingComponent implements OnInit, OnDestroy {
  currentLocation: LocationData | null = null;
  isConnected = false;
  orderId!: number;

  private streamSub?: Subscription;
  private initialLocationSub?: Subscription;
  private latestLocationTimestamp?: number;

  constructor(
    private route: ActivatedRoute,
    private trackingService: TrackingService,
    private changeDetectorRef: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const idParam = params.get('id');
      this.orderId = idParam ? Number(idParam) : 1;

      console.log('--> [Component] Carregando rastreamento do pedido:', this.orderId);

      this.streamSub?.unsubscribe();
      this.initialLocationSub?.unsubscribe();


      this.currentLocation = null;
      this.isConnected = false;
      this.latestLocationTimestamp = undefined;
      this.changeDetectorRef.markForCheck();

      this.loadInitialLocation(this.orderId);
      this.connectToRealtimeStream(this.orderId);
    });
  }

  ngOnDestroy(): void {
    console.log('--> [Component] Limpando inscrições ao destruir componente');
    this.streamSub?.unsubscribe();
    this.initialLocationSub?.unsubscribe();
  }

  private connectToRealtimeStream(orderId: number): void {
    console.log('3. [Component] Chamando getRealtimeStream() no serviço...');

    this.streamSub = this.trackingService.getRealtimeStream(orderId).subscribe({
      next: (location) => {
        console.log('--> [Component] DADO RECEBIDO VIA SSE:', location);
        this.applyLocation(location);
        this.isConnected = true;
      },
      error: (err) => {
        console.error('--> [Component] Erro na stream do SSE:', err);
        this.isConnected = false;
      }
    });
  }

  private loadInitialLocation(orderId: number): void {
    this.initialLocationSub = this.trackingService.getCurrentLocation(orderId).subscribe({
      next: (location) => {
        if (location) {
          console.log('--> [Component] Foto inicial do Redis:', location);
          this.applyLocation(location);
        }
      },
      error: (err) => console.error('--> [Component] Erro ao buscar posição inicial:', err)
    });
  }

  private applyLocation(location: LocationData): void {
    if (location.orderId !== this.orderId) {
      return;
    }


    if (
      this.latestLocationTimestamp !== undefined &&
      location.timestamp < this.latestLocationTimestamp
    ) {
      return;
    }
    this.latestLocationTimestamp = location.timestamp;
    this.currentLocation = { ...location };
    this.changeDetectorRef.markForCheck();
  }
}
