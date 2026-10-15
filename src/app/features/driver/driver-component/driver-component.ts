import { Component, OnDestroy, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DriverService } from '../../../core/services/driver-service';
import { DriverOrder } from '../../../core/models/driver-order';

@Component({
  imports: [CommonModule, FormsModule],
  selector: 'app-driver-component',
  styleUrl: './driver-component.css',
  templateUrl: './driver-component.html',
})
export class DriverComponent implements OnInit, OnDestroy {
  pendingOrders: DriverOrder[] = [];
  selectedOrderId: number | null = null;
  isTransmitting = false;
  lastSentCoords: { lat: number; lng: number; time: string } | null = null;

  private watchId: number | null = null;

  constructor(
    private driverService: DriverService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  ngOnDestroy(): void {
    this.stopTransmission();
  }

  loadOrders(): void {
    this.driverService.getPendingOrders().subscribe({
      next: (orders) => {
        this.pendingOrders = orders;
        if (orders.length > 0 && !this.selectedOrderId) {
          this.selectedOrderId = orders[0].id;
        }
        this.cdr.markForCheck();
      },
      error: (err) => console.error('--> [Driver] Erro ao carregar pedidos:', err),
    });
  }

  startTransmission(): void {
    if (!this.selectedOrderId) return;
    if (!('geolocation' in navigator)) {
      alert('Geolocalização não é suportada por este navegador.');
      return;
    }

    this.stopTransmission();
    this.isTransmitting = true;

    this.watchId = navigator.geolocation.watchPosition(
      (pos) => {
        this.sendPulse(pos.coords.latitude, pos.coords.longitude);
      },
      (err) => {
        console.error('--> [Driver] Erro de GPS:', err);
        alert('Erro ao obter localização do dispositivo.');
        this.stopTransmission();
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 },
    );
  }

  private sendPulse(latitude: number, longitude: number): void {
    if (!this.selectedOrderId) return;

    this.driverService
      .sendLocation({
        orderId: this.selectedOrderId,
        latitude,
        longitude,
      })
      .subscribe({
        next: () => {
          this.lastSentCoords = {
            lat: latitude,
            lng: longitude,
            time: new Date().toLocaleTimeString(),
          };
          console.log(
            `--> [Driver] GPS enviado para pedido #${this.selectedOrderId}:`,
            latitude,
            longitude,
          );
          this.cdr.markForCheck();
        },
        error: (err) => console.error('--> [Driver] Erro ao enviar localização:', err),
      });
  }

  stopTransmission(): void {
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }

    this.isTransmitting = false;
    this.cdr.markForCheck();
  }
}
