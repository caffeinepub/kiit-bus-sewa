/* eslint-disable */

// @ts-nocheck

import { IDL } from '@icp-sdk/core/candid';

export const Location = IDL.Record({
  'lat' : IDL.Float64,
  'lng' : IDL.Float64,
  'updatedAt' : IDL.Int,
});
export const Bus = IDL.Record({
  'id' : IDL.Nat,
  'departureTime' : IDL.Text,
  'busNumber' : IDL.Text,
  'totalSeats' : IDL.Nat,
  'routeId' : IDL.Nat,
  'availableSeats' : IDL.Nat,
});
export const Route = IDL.Record({
  'id' : IDL.Nat,
  'to' : IDL.Text,
  'from' : IDL.Text,
});

export const idlService = IDL.Service({
  'confirmBus' : IDL.Func([IDL.Nat, IDL.Text], [], []),
  'getBusLocation' : IDL.Func([IDL.Nat], [IDL.Opt(Location)], ['query']),
  'getBusesOnRoute' : IDL.Func([IDL.Nat], [IDL.Vec(Bus)], ['query']),
  'getRoutes' : IDL.Func([], [IDL.Vec(Route)], ['query']),
  'getUserConfirmedBus' : IDL.Func([IDL.Text], [IDL.Opt(IDL.Nat)], ['query']),
  'login' : IDL.Func([IDL.Text, IDL.Text], [], []),
  'loginOrRegister' : IDL.Func([IDL.Text, IDL.Text], [], []),
  'register' : IDL.Func([IDL.Text, IDL.Text], [], []),
  'updateBusLocation' : IDL.Func([IDL.Nat, IDL.Float64, IDL.Float64], [], []),
});

export const idlInitArgs = [];

export const idlFactory = ({ IDL }) => {
  const Location = IDL.Record({
    'lat' : IDL.Float64,
    'lng' : IDL.Float64,
    'updatedAt' : IDL.Int,
  });
  const Bus = IDL.Record({
    'id' : IDL.Nat,
    'departureTime' : IDL.Text,
    'busNumber' : IDL.Text,
    'totalSeats' : IDL.Nat,
    'routeId' : IDL.Nat,
    'availableSeats' : IDL.Nat,
  });
  const Route = IDL.Record({
    'id' : IDL.Nat,
    'to' : IDL.Text,
    'from' : IDL.Text,
  });
  
  return IDL.Service({
    'confirmBus' : IDL.Func([IDL.Nat, IDL.Text], [], []),
    'getBusLocation' : IDL.Func([IDL.Nat], [IDL.Opt(Location)], ['query']),
    'getBusesOnRoute' : IDL.Func([IDL.Nat], [IDL.Vec(Bus)], ['query']),
    'getRoutes' : IDL.Func([], [IDL.Vec(Route)], ['query']),
    'getUserConfirmedBus' : IDL.Func([IDL.Text], [IDL.Opt(IDL.Nat)], ['query']),
    'login' : IDL.Func([IDL.Text, IDL.Text], [], []),
    'loginOrRegister' : IDL.Func([IDL.Text, IDL.Text], [], []),
    'register' : IDL.Func([IDL.Text, IDL.Text], [], []),
    'updateBusLocation' : IDL.Func([IDL.Nat, IDL.Float64, IDL.Float64], [], []),
  });
};

export const init = ({ IDL }) => { return []; };
