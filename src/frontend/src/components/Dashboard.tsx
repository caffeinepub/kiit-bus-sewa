import type React from "react";
import { useState } from "react";
import BusList from "./BusList";
import BusTracking from "./BusTracking";
import RouteSelector from "./RouteSelector";

type DashboardScreen = "route-select" | "bus-list" | "tracking";

interface RouteSelection {
  routeId: bigint;
  from: string;
  to: string;
  fromLat: number;
  fromLng: number;
}

interface BusSelection {
  busId: bigint;
  busNumber: string;
}

interface DashboardProps {
  userEmail: string;
  onLogout: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ userEmail, onLogout }) => {
  const [screen, setScreen] = useState<DashboardScreen>("route-select");
  const [routeSelection, setRouteSelection] = useState<RouteSelection | null>(
    null,
  );
  const [busSelection, setBusSelection] = useState<BusSelection | null>(null);

  const handleSelectRoute = (
    routeId: bigint,
    from: string,
    to: string,
    fromLat: number,
    fromLng: number,
  ) => {
    setRouteSelection({ routeId, from, to, fromLat, fromLng });
    setScreen("bus-list");
  };

  const handleConfirmBus = (busId: bigint, busNumber: string) => {
    setBusSelection({ busId, busNumber });
    setScreen("tracking");
  };

  const handleBackToRoutes = () => {
    setBusSelection(null);
    setRouteSelection(null);
    setScreen("route-select");
  };

  const handleBackToBusList = () => {
    setBusSelection(null);
    setScreen("bus-list");
  };

  if (screen === "route-select") {
    return (
      <RouteSelector
        userEmail={userEmail}
        onSelectRoute={handleSelectRoute}
        onLogout={onLogout}
      />
    );
  }

  if (screen === "bus-list" && routeSelection) {
    return (
      <BusList
        routeId={routeSelection.routeId}
        from={routeSelection.from}
        to={routeSelection.to}
        userEmail={userEmail}
        onConfirm={handleConfirmBus}
        onBack={handleBackToRoutes}
      />
    );
  }

  if (screen === "tracking" && busSelection && routeSelection) {
    return (
      <BusTracking
        busId={busSelection.busId}
        busNumber={busSelection.busNumber}
        from={routeSelection.from}
        to={routeSelection.to}
        fromLat={routeSelection.fromLat}
        fromLng={routeSelection.fromLng}
        userEmail={userEmail}
        onBack={handleBackToBusList}
      />
    );
  }

  // Fallback
  return (
    <RouteSelector
      userEmail={userEmail}
      onSelectRoute={handleSelectRoute}
      onLogout={onLogout}
    />
  );
};

export default Dashboard;
