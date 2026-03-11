import type React from "react";
import { useState } from "react";
import BusTracking from "./BusTracking";
import RouteSelector from "./RouteSelector";

type DashboardScreen = "route-select" | "tracking";

interface RouteSelection {
  routeId: bigint;
  from: string;
  to: string;
  fromLat: number;
  fromLng: number;
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

  const handleSelectRoute = (
    routeId: bigint,
    from: string,
    to: string,
    fromLat: number,
    fromLng: number,
    busNumber: string,
  ) => {
    setRouteSelection({ routeId, from, to, fromLat, fromLng, busNumber });
    setScreen("tracking");
  };

  const handleBackToRoutes = () => {
    setRouteSelection(null);
    setScreen("route-select");
  };

  if (screen === "tracking" && routeSelection) {
    return (
      <BusTracking
        busId={routeSelection.routeId}
        busNumber={routeSelection.busNumber}
        from={routeSelection.from}
        to={routeSelection.to}
        fromLat={routeSelection.fromLat}
        fromLng={routeSelection.fromLng}
        userEmail={userEmail}
        onBack={handleBackToRoutes}
      />
    );
  }

  return (
    <RouteSelector
      userEmail={userEmail}
      onSelectRoute={handleSelectRoute}
      onLogout={onLogout}
    />
  );
};

export default Dashboard;
