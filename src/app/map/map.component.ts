import { AfterViewInit, Component } from '@angular/core';
import * as L from 'leaflet';
import { HK_Center } from '../util/constants';
import data from '../../assets/data.json';
import { Venue } from 'src/types';

type SelectedOption = { id: number; name: string };
const areasSet = new Set<string>();
data.forEach((venue, idx) => {
  areasSet.add(venue.area);
});
const areas = Array.from(areasSet).map((item, idx) => ({
  id: idx,
  name: item,
}));

function extractFacilities(input: typeof data, area?: string | null) {
  const facilitySet = new Set<string>();
  const filteredVenues = area
    ? input.filter((item) => item.area === area)
    : input;
  filteredVenues.forEach((venue, idx) => {
    venue.facilities.forEach((facility) =>
      facilitySet.add(facility.replace(/\([^)]*\)/g, '').trim())
    );
  });
  return Array.from(facilitySet).map((item, idx) => ({
    id: idx,
    name: item,
  }));
}

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css'],
})
export class MapComponent implements AfterViewInit {
  private map: L.Map;
  private venues: Venue[];
  selectedArea: SelectedOption | null = null;
  selectedFacility: SelectedOption | null = null;
  areas = areas;
  facilities = extractFacilities(data);
  private markersOnMap: L.Marker[] = [];
  currentLocation: {lat: number, lng: number } | null = null

  constructor() {
    this.venues = data
  }

  ngAfterViewInit(): void {
    this.initMap();
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
    this.renderMarkers();
  }

  renderMarkers() {
    this.clearMarkers();
    this.venues.forEach((venue) => {
      const onClick = () => {
        this.map.flyTo({
          lat: venue.coordinates.lat + 0.0005,
          lng: venue.coordinates.lng
        }, 18, { animate: true, duration: 2 });
      };
      const marker = L.marker(venue.coordinates).on('click', onClick).bindPopup(/* HTML */`
        <h1>${venue.name}</h1>
        <h2>${venue.address}</h2>
        <div style="margin: 13px;">
          <ol>
            ${venue.facilities.map(item => `<li>${item}</li>`).join('')}
          </ol>
        </div>

      `);
      const addedMarker = marker.addTo(this.map);
      this.markersOnMap.push(addedMarker);
    });
  }

  resetMap(): void {
    this.map.panTo(HK_Center).setZoom(11);
    this.selectedArea = null;
    this.venues = data;
    this.renderMarkers();
  }

  onDistrictChange(event: SelectedOption): void {
    this.selectedArea = event;
    this.filterVenues();
  }

  onFacilityChange(event: SelectedOption): void {
    this.selectedFacility = event;
    this.filterVenues();
  }

  filterVenues() {
    let venuesToDisplay = [...data];
    if (this.selectedArea) {
      venuesToDisplay = venuesToDisplay.filter(
        (item) => item.area === this.selectedArea?.name
      );
    }
    if (this.selectedFacility) {
      venuesToDisplay = venuesToDisplay.filter((item) => {
        for (let facility of item.facilities) {
          if (facility.includes(this.selectedFacility!.name)) return true;
        }
        return false;
      });
    }

    this.venues = venuesToDisplay;
    this.renderMarkers();
  }

  clearMarkers() {
    this.markersOnMap.forEach((marker) => marker.remove());
  }

  locateMe() {
    this.map.locate({setView: true, maxZoom: 15})
  }

  test() {
    // const popup = L.popup()
    // .setLatLng(HK_Center)
    // .setContent('<p>Hello world!<br />This is a nice popup.</p>')
    // .openOn(this.map);
  }


}
