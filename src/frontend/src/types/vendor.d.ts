declare module "leaflet" {
  const L: any;
  export default L;
  export const Icon: any;
  export const divIcon: any;
  export function icon(options: any): any;
}

declare module "leaflet/dist/leaflet.css" {}
declare module "leaflet/dist/images/marker-icon-2x.png" {
  const src: string;
  export default src;
}
declare module "leaflet/dist/images/marker-icon.png" {
  const src: string;
  export default src;
}
declare module "leaflet/dist/images/marker-shadow.png" {
  const src: string;
  export default src;
}

declare module "react-leaflet" {
  import type React from "react";
  export const MapContainer: React.ComponentType<any>;
  export const TileLayer: React.ComponentType<any>;
  export const Marker: React.ComponentType<any>;
  export const Popup: React.ComponentType<any>;
  export function useMap(): any;
}
