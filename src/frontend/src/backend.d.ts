import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Location {
    lat: number;
    lng: number;
    updatedAt: bigint;
}
export interface Route {
    id: bigint;
    to: string;
    from: string;
}
export interface Bus {
    id: bigint;
    departureTime: string;
    busNumber: string;
    totalSeats: bigint;
    routeId: bigint;
    availableSeats: bigint;
}
export interface backendInterface {
    confirmBus(busId: bigint, userEmail: string): Promise<void>;
    getBusLocation(busId: bigint): Promise<Location | null>;
    getBusesOnRoute(routeId: bigint): Promise<Array<Bus>>;
    getRoutes(): Promise<Array<Route>>;
    getUserConfirmedBus(userEmail: string): Promise<bigint | null>;
    login(email: string, password: string): Promise<void>;
    register(email: string, password: string): Promise<void>;
    updateBusLocation(busId: bigint, lat: number, lng: number): Promise<void>;
}
