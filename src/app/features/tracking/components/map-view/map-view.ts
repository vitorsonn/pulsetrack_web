import { AfterViewInit, Component, ElementRef, Input, OnChanges, OnDestroy, SimpleChanges, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LocationData } from '../../../../core/models/location-data';
import * as L from 'leaflet';

const defaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

@Component({
  selector: 'app-map-view',
  standalone: true,
  imports: [CommonModule],
  template: `<div #mapContainer class="w-full h-[450px] rounded-2xl shadow-inner border border-slate-700"></div>`
})
export class MapViewComponent implements AfterViewInit, OnChanges, OnDestroy {
  @ViewChild('mapContainer') mapContainer!: ElementRef;
  @Input() currentLocation: LocationData | null = null;

  private map?: L.Map;
  private marker!: L.Marker;
  private polyline!: L.Polyline;
  private mapInitialized = false;
  private animationFrameId: number | null = null;

  ngAfterViewInit(): void {
    this.initMap();
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Chama o método de animação e rastro quando a localização mudar
    if (changes['currentLocation'] && this.currentLocation && this.mapInitialized) {
      this.animateMarkerAndDrawPath(this.currentLocation.latitude, this.currentLocation.longitude);
    }
  }

  ngOnDestroy(): void {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    this.map?.remove();
  }

  private initMap(): void {
    const lat = this.currentLocation?.latitude ?? -23.264123;
    const lng = this.currentLocation?.longitude ?? -47.299876;

    this.map = L.map(this.mapContainer.nativeElement).setView([lat, lng], 15);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap'
    }).addTo(this.map);

    this.polyline = L.polyline([], {
      color: '#3b82f6',
      weight: 5,
      opacity: 0.7,
      smoothFactor: 1
    }).addTo(this.map);

    this.polyline.addLatLng([lat, lng]);

    this.marker = L.marker([lat, lng], { icon: defaultIcon }).addTo(this.map)
      .bindPopup('Entregador PulseTrack')
      .openPopup();

    this.mapInitialized = true;
  }

  private animateMarkerAndDrawPath(targetLat: number, targetLng: number, durationMs: number = 1200): void {
    if (!this.marker || !this.map) return;

    const startLatLng = this.marker.getLatLng();
    const targetLatLng = new L.LatLng(targetLat, targetLng);

    if (startLatLng.equals(targetLatLng)) return;

    const startTime = performance.now();

    // Adiciona o novo ponto ao rastro
    this.polyline.addLatLng(targetLatLng);

    // Suaviza a movimentação da câmera
    this.map.panTo(targetLatLng, { animate: true, duration: durationMs / 1000 });

    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }

    const animate = (currentTime: number) => {
      const elapsedTime = currentTime - startTime;
      const progress = Math.min(elapsedTime / durationMs, 1);

      const currentLat = startLatLng.lat + (targetLat - startLatLng.lat) * progress;
      const currentLng = startLatLng.lng + (targetLng - startLatLng.lng) * progress;

      this.marker.setLatLng([currentLat, currentLng]);

      if (progress < 1) {
        this.animationFrameId = requestAnimationFrame(animate);
      } else {
        console.log(`--> [Leaflet] Transição concluída para: Lat ${targetLat} | Lng ${targetLng}`);
      }
    };

    this.animationFrameId = requestAnimationFrame(animate);
  }
}