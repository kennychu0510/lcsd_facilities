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