import { Component, Input, OnChanges, SimpleChanges, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
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
export class MapViewComponent implements AfterViewInit, OnChanges {
  @ViewChild('mapContainer') mapContainer!: ElementRef;
  @Input() currentLocation: LocationData | null = null;

  private map!: L.Map;
  private marker!: L.Marker;

  ngAfterViewInit(): void {
    this.initMap();
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Dispara sempre que o currentLocation mudar via SSE
    if (changes['currentLocation'] && this.currentLocation && this.map) {
      this.updateMarkerPosition(this.currentLocation.latitude, this.currentLocation.longitude);
    }
  }

 private initMap(): void {
    const lat = this.currentLocation?.latitude ?? -23.264123;
    const lng = this.currentLocation?.longitude ?? -47.299876;

    this.map = L.map(this.mapContainer.nativeElement).setView([lat, lng], 15);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap'
    }).addTo(this.map);

    // Usa o ícone corrigido da CDN
    this.marker = L.marker([lat, lng], { icon: defaultIcon }).addTo(this.map)
      .bindPopup('Entregador PulseTrack')
      .openPopup();
  }

  private updateMarkerPosition(lat: number, lng: number): void {
    const newLatLng = new L.LatLng(lat, lng);
    this.marker.setLatLng(newLatLng);
    this.map.panTo(newLatLng);
    console.log(`--> [Leaflet] Pino movido no mapa para: Lat ${lat} | Lng ${lng}`);
  }
}