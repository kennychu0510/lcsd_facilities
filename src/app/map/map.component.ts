import { AfterViewInit, Component } from '@angular/core';
import * as L from 'leaflet';
import { HK_Center } from '../util/constants';
import data from '../../assets/data.json';
import { Venue } from 'src/types';


@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css'],
})
export class MapComponent implements AfterViewInit {
  private map: L.Map;
  private venues: Venue[];
  areas: { id: number; name: string }[];
  selectedArea: { id: number; name: string } | null;

  constructor() {
    this.venues = data;
    const uniqueAreas = new Set<string>();
    this.venues.forEach((venue, idx) => uniqueAreas.add(venue.area));
    this.areas = Array.from(uniqueAreas).map((item, idx) => ({
      id: idx,
      name: item,
    }));
  }

  private initMap(): void {
    this.map = L.map('map', {
      center: HK_Center,
      zoom: 11,
    });

    const tiles = L.tileLayer(
      'http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',
      {
        maxZoom: 20,
        minZoom: 10,
        attribution: 'Google',
        subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
      }
    );

    tiles.addTo(this.map);

    this.venues.forEach((venue) => {
      const onClick = () => {
        this.map.flyTo(venue.coordinates, 18, { animate: true, duration: 2 });
      };
      const marker = L.marker(venue.coordinates).on('click', onClick);
      marker.addTo(this.map);
    });
  }

  resetZoom(): void {
    this.map.panTo(HK_Center).setZoom(11);
    this.selectedArea = null;
    this.venues = data;
  }

  setFilter(): void {
    // if (this.selectedArea) {
    //   this.venues = data.filter(item => item.area === this.selectedArea!.name)
    // }
    console.log(this.selectedArea)
  }

  ngAfterViewInit(): void {
    this.initMap();
  }

  private refreshMap() {
  }
}
