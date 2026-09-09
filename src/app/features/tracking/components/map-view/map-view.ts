import { Component,ElementRef, Input, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import * as L from 'leaflet';
import { LocationData } from '../../../../core/models/location-data';



@Component({
  imports: [],
  selector: 'app-map-view',
  styleUrl: './map-view.css',
  templateUrl: './map-view.html',
})
export class MapView implements OnInit, OnChanges {
@ViewChild('mapContainer', { static: true }) mapContainer!: ElementRef;
  @Input() currentLocation: LocationData | null = null;

  private map!: L.Map;
  private marker!: L.Marker;

  private customIcon = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34]
  });

  ngOnInit(): void {
    this.initMap();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['currentLocation'] && this.currentLocation) {
      this.updateMarkerPosition(this.currentLocation.latitude, this.currentLocation.longitude);
    }
  }

  private initMap(): void{
    const initialLat = this.currentLocation?.latitude || -23.264123
    const initialLng = this.currentLocation?.longitude || -47.299876;

    this.map = L.map(this.mapContainer.nativeElement).setView([initialLat, initialLng], 15);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap'
    }).addTo(this.map);

    // Cria o marcador inicial do entregador
    this.marker = L.marker([initialLat, initialLng], { icon: this.customIcon })
      .addTo(this.map)
      .bindPopup('Entregador PulseTrack')
      .openPopup();

  }

  private updateMarkerPosition(lat: number, lng: number): void {
    if (this.map && this.marker) {
      const newLatLng = new L.LatLng(lat, lng);
      this.marker.setLatLng(newLatLng);
      this.map.panTo(newLatLng); // Centraliza suavemente o mapa na nova coordenada
    }
  }

}
