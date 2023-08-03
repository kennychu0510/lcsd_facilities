export type Venue = {
  name: string;
  facilities: string[];
  area: string;
  address: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  type: string;
};

export type Campsite = {
  name: string;
  link: string;
  address: string;
  facilities: string;
  hygienicFacilities: string;
  waterSource: string;
  remarks: string;
  coordinates: {
    lat: number;
    lng: number;
  };
}