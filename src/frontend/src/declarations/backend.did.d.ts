/* eslint-disable */

// @ts-nocheck

import type { ActorMethod } from '@icp-sdk/core/agent';
import type { IDL } from '@icp-sdk/core/candid';
import type { Principal } from '@icp-sdk/core/principal';

export interface Bus {
  'id' : bigint,
  'departureTime' : string,
  'busNumber' : string,
  'totalSeats' : bigint,
  'routeId' : bigint,
  'availableSeats' : bigint,
}
export interface Location {
  'lat' : number,
  'lng' : number,
  'updatedAt' : bigint,
}
export interface Route { 'id' : bigint, 'to' : string, 'from' : string }
export interface _SERVICE {
  'confirmBus' : ActorMethod<[bigint, string], undefined>,
  'getBusLocation' : ActorMethod<[bigint], [] | [Location]>,
  'getBusesOnRoute' : ActorMethod<[bigint], Array<Bus>>,
  'getRoutes' : ActorMethod<[], Array<Route>>,
  'getUserConfirmedBus' : ActorMethod<[string], [] | [bigint]>,
  'login' : ActorMethod<[string, string], undefined>,
  'loginOrRegister' : ActorMethod<[string, string], undefined>,
  'register' : ActorMethod<[string, string], undefined>,
  'updateBusLocation' : ActorMethod<[bigint, number, number], undefined>,
}
export declare const idlService: IDL.ServiceClass;
export declare const idlInitArgs: IDL.Type[];
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
