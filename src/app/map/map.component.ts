import { AfterViewInit, Component } from '@angular/core';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import * as L from 'leaflet';
import { Campsite, Venue } from 'src/types';
import data from '../../assets/data.json';
import campsites from '../../assets/campsites.json';
import { PopupComponent } from '../popup/popup.component';
import { HK_Center } from '../util/constants';
import { MatDialog } from '@angular/material/dialog';
import { DialogComponent } from '../dialog/dialog.component';

const ListOfDistrict = [
  { name: 'islands', latitude: 22.261106, longitude: 113.946425 },
  { name: 'kwai tsing', latitude: 22.354908, longitude: 114.126099 },
  { name: 'north', latitude: 22.500908, longitude: 114.155826 },
  { name: 'sai kung', latitude: 22.383689, longitude: 114.270787 },
  { name: 'sha tin', latitude: 22.391067, longitude: 114.191981 },
  { name: 'tai po', latitude: 22.450352, longitude: 114.168356 },
  { name: 'tsuen wan', latitude: 22.371661, longitude: 114.11347 },
  { name: 'tuen mun', latitude: 22.390829, longitude: 113.972065 },
  { name: 'yuen long', latitude: 22.444501, longitude: 114.022213 },
  { name: 'kowloon city', latitude: 22.33016, longitude: 114.189985 },
  { name: 'kwun tong', latitude: 22.312937, longitude: 114.22561 },
  { name: 'shamp shui po', latitude: 22.330095, longitude: 114.16094 },
  { name: 'wong tai sin', latitude: 22.342962, longitude: 114.192987 },
  { name: 'yau tsim mong', latitude: 22.30716, longitude: 114.167966 },
  { name: 'central and western', latitude: 22.286394, longitude: 114.149139 },
  { name: 'eastern', latitude: 22.273389, longitude: 114.236078 },
  { name: 'southern', latitude: 22.247692, longitude: 114.158947 },
  { name: 'wan chai', latitude: 22.277101, longitude: 114.175647 },
];

type SelectedOption = { id: number; name: string };
const areasSet = new Set<string>();
data.forEach((venue, idx) => {
  areasSet.add(venue.area);
});
const areas = Array.from(areasSet).map((item, idx) => ({
  id: idx,
  name: item,
}));

const venueIcon = L.icon({
  iconUrl: '../../assets/lcsd_icon.png',
  iconSize: [24, 24],
});

const campsiteIcon = L.icon({
  iconUrl: '../../assets/campsite.png',
  iconSize: [24, 24],
});

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
  private markers: (Venue | Campsite)[];
  selectedArea: SelectedOption | null = null;
  selectedFacility: SelectedOption | null = null;
  areas = areas;
  facilities = extractFacilities(data);
  category = 'centers';
  private markersRef: L.Marker[] = [];
  currentLocation: { lat: number; lng: number } | null = null;
  private defaultZoom = 11;
  lcsdIcon = venueIcon;

  constructor(private _popup: MatBottomSheet, public dialog: MatDialog) {
    this.markers = data;
  }

  ngOnInit() {
    if (window.innerWidth < 400) {
      this.defaultZoom = 10;
    }
  }

  openPopup(item: Venue | Campsite): void {
    this._popup.open(PopupComponent, { data: item });
  }

  ngAfterViewInit(): void {
    this.initMap();
  }

  private initMap(): void {
    this.map = L.map('map', {
      center: HK_Center,
      zoom: this.defaultZoom,
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

  private renderMarkers() {
    this.clearMarkers();
    this.markers.forEach((venue) => {
      const onClick = () => {
        this.map.flyTo(
          {
            lat: venue.coordinates.lat,
            lng: venue.coordinates.lng,
          },
          16,
          { animate: true, duration: 2 }
        );
        this.openPopup(venue);
      };
      const marker = L.marker(venue.coordinates, {
        icon: this.category === 'centers' ? venueIcon : campsiteIcon,
      }).on('click', onClick);
      const addedMarker = marker.addTo(this.map);
      this.markersRef.push(addedMarker);
    });
  }

  resetMap(): void {
    this.map.panTo(HK_Center).setZoom(this.defaultZoom);
    this.selectedArea = null;
    this.markers = data;
    this.selectedFacility = null;
    this.renderMarkers();
  }

  onDistrictChange(event: SelectedOption): void {
    this.selectedArea = event;
    this.selectedFacility = null;
    const selectedDistrict = ListOfDistrict.find((item) =>
      event.name.toLowerCase().includes(item.name)
    );
    if (selectedDistrict) {
      this.map.flyTo(
        {
          lat: selectedDistrict.latitude,
          lng: selectedDistrict.longitude,
        },
        12
      );
    }
    this.filterVenues();
  }

  onFacilityChange(event: SelectedOption): void {
    this.selectedFacility = event;
    this.filterVenues();
  }

  private filterVenues() {
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

    this.markers = venuesToDisplay;
    this.renderMarkers();
  }

  private clearMarkers() {
    this.markersRef.forEach((marker) => marker.remove());
  }

  locateMe() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          this.map.flyTo(
            {
              lat: pos.coords.latitude,
              lng: pos.coords.longitude,
            },
            15,
            {
              animate: true,
            }
          );
        },
        (error) => {
          this.openDialog(error.message);
        }
      );
    }
  }

  openDialog(data: string): void {
    this.dialog.open(DialogComponent, { data: data });
  }

  onCategoryChange(selected: string) {
    this.category = selected;
    if (selected) {
      this.markers = selected === 'centers' ? data : campsites;
    } else {
      this.markers = [];
    }
    this.renderMarkers();
  }
}
