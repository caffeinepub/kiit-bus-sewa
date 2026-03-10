import type { Location } from "@/backend.d";
import { Button } from "@/components/ui/button";
import {
  AlertTriangle,
  ArrowLeft,
  Bus as BusIcon,
  MapPin,
  Navigation,
  RefreshCw,
  Wifi,
  WifiOff,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useActor } from "../hooks/useActor";
import AnimatedBackground from "./AnimatedBackground";

function haversineKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

const KIIT_LAT = 20.3543;
const KIIT_LNG = 85.8194;

interface BusTrackingProps {
  busId: bigint;
  busNumber: string;
  from: string;
  to: string;
  fromLat?: number;
  fromLng?: number;
  userEmail: string;
  onBack: () => void;
}

const BusTracking: React.FC<BusTrackingProps> = ({
  busId,
  busNumber,
  from,
  to,
  fromLat,
  fromLng,
  onBack,
}) => {
  const { actor, isFetching: isActorLoading } = useActor();

  const initialLat = fromLat ?? KIIT_LAT + 0.02;
  const initialLng = fromLng ?? KIIT_LNG - 0.015;

  const [busLocation, setBusLocation] = useState<Location>({
    lat: initialLat,
    lng: initialLng,
    updatedAt: BigInt(Date.now()),
  });
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [isNearby, setIsNearby] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [pollError, setPollError] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [iframeSrc, setIframeSrc] = useState("");

  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    // Use Maps embed with a pin marker and higher zoom
    setIframeSrc(
      `https://maps.google.com/maps?q=${busLocation.lat},${busLocation.lng}&z=16&output=embed&t=m&iwloc=near`,
    );
  }, [busLocation.lat, busLocation.lng]);

  useEffect(() => {
    if (!navigator.geolocation) {
      setGeoError("Geolocation is not supported by your browser.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
        setGeoError(null);
      },
      () => {
        setUserLocation({ lat: KIIT_LAT, lng: KIIT_LNG });
        setGeoError("Using default location (KIIT University).");
      },
      { timeout: 8000, enableHighAccuracy: true },
    );
  }, []);

  const fetchBusLocation = useCallback(async () => {
    if (!actor || isActorLoading) return;
    try {
      const loc = await actor.getBusLocation(busId);
      if (loc?.lat && loc.lng) {
        setBusLocation(loc);
        setPollError(false);
      }
      setLastUpdated(new Date());
    } catch {
      setPollError(true);
    }
  }, [actor, busId, isActorLoading]);

  useEffect(() => {
    fetchBusLocation();
    pollRef.current = setInterval(fetchBusLocation, 5000);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [fetchBusLocation]);

  useEffect(() => {
    if (!userLocation) return;
    const dist = haversineKm(
      userLocation.lat,
      userLocation.lng,
      busLocation.lat,
      busLocation.lng,
    );
    setIsNearby(dist < 1);
  }, [busLocation, userLocation]);

  const handleSimulate = async () => {
    if (!actor) return;
    setIsSimulating(true);
    const newLat = busLocation.lat - 0.005;
    const newLng = busLocation.lng + 0.002;
    try {
      await actor.updateBusLocation(busId, newLat, newLng);
    } catch {
      // Optimistic update
    }
    setBusLocation((prev) => ({
      ...prev,
      lat: newLat,
      lng: newLng,
      updatedAt: BigInt(Date.now()),
    }));
    setLastUpdated(new Date());
    setIsSimulating(false);
  };

  const distanceKm = userLocation
    ? haversineKm(
        userLocation.lat,
        userLocation.lng,
        busLocation.lat,
        busLocation.lng,
      )
    : null;

  const formatDist = (km: number) =>
    km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(2)} km`;

  return (
    <div className="min-h-screen dashboard-bg flex flex-col relative overflow-hidden">
      <AnimatedBackground />
      {/* Header */}
      <header
        className="w-full py-4 px-5 flex items-center gap-3 sticky top-0 z-10"
        style={{
          background: "oklch(0.24 0.08 255 / 0.97)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid oklch(1 0 0 / 0.1)",
        }}
      >
        <button
          type="button"
          onClick={onBack}
          data-ocid="tracking.button"
          className="flex items-center justify-center w-9 h-9 rounded-xl transition-colors"
          style={{
            background: "oklch(1 0 0 / 0.1)",
            color: "white",
            border: "1px solid oklch(1 0 0 / 0.15)",
          }}
          aria-label="Go back"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 text-white/60 text-xs font-body mb-0.5">
            <MapPin className="w-3 h-3" />
            <span className="truncate">
              {from} → {to}
            </span>
          </div>
          <h1 className="font-display font-bold text-white text-base">
            Tracking: {busNumber}
          </h1>
        </div>
        <div
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-body font-semibold"
          style={{
            background: pollError
              ? "oklch(0.65 0.2 25 / 0.2)"
              : "oklch(0.50 0.16 145 / 0.2)",
            color: pollError ? "oklch(0.88 0.08 40)" : "oklch(0.80 0.14 145)",
          }}
        >
          {pollError ? (
            <WifiOff className="w-3 h-3" />
          ) : (
            <Wifi className="w-3 h-3" />
          )}
          {pollError ? "Offline" : "Live"}
        </div>
      </header>

      <main className="flex-1 flex flex-col max-w-lg mx-auto w-full px-4 py-5 gap-4 relative z-10">
        {/* Nearby alert banner */}
        <AnimatePresence>
          {isNearby && (
            <motion.div
              initial={{ opacity: 0, y: -16, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -16, scale: 0.96 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              data-ocid="tracking.success_state"
              role="alert"
              aria-live="polite"
              className="rounded-2xl p-4 flex items-start gap-3"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.88 0.2 90 / 0.25) 0%, oklch(0.82 0.18 80 / 0.15) 100%)",
                border: "2px solid oklch(0.88 0.2 90 / 0.6)",
                boxShadow: "0 4px 24px oklch(0.88 0.2 90 / 0.25)",
              }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: "oklch(0.88 0.2 90)" }}
              >
                <BusIcon
                  className="w-5 h-5"
                  style={{ color: "oklch(0.18 0.06 50)" }}
                />
              </div>
              <div>
                <p
                  className="font-display font-bold text-base"
                  style={{ color: "oklch(0.22 0.08 60)" }}
                >
                  Your bus is nearby!
                </p>
                <p
                  className="font-body text-sm mt-0.5"
                  style={{ color: "oklch(0.38 0.08 60)" }}
                >
                  Bus {busNumber} is less than 1 km away. Get ready to board!
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Distance info cards */}
        <div className="grid grid-cols-2 gap-3">
          <div
            className="rounded-xl p-4"
            style={{
              background: "oklch(1 0 0 / 0.96)",
              border: "1px solid oklch(0.90 0.03 220)",
            }}
          >
            <div className="flex items-center gap-2 mb-1.5">
              <Navigation
                className="w-4 h-4"
                style={{ color: "oklch(0.24 0.08 255)" }}
              />
              <span
                className="text-xs font-body font-semibold uppercase tracking-wide"
                style={{ color: "oklch(0.55 0.04 230)" }}
              >
                Bus Distance
              </span>
            </div>
            <p
              className="font-display font-bold text-xl"
              style={{
                color: isNearby
                  ? "oklch(0.55 0.18 75)"
                  : "oklch(0.22 0.08 255)",
              }}
            >
              {distanceKm !== null ? formatDist(distanceKm) : "—"}
            </p>
            <p
              className="text-xs font-body mt-0.5"
              style={{ color: "oklch(0.58 0.04 230)" }}
            >
              from your location
            </p>
          </div>
          <div
            className="rounded-xl p-4"
            style={{
              background: "oklch(1 0 0 / 0.96)",
              border: "1px solid oklch(0.90 0.03 220)",
            }}
          >
            <div className="flex items-center gap-2 mb-1.5">
              <MapPin
                className="w-4 h-4"
                style={{ color: "oklch(0.50 0.16 145)" }}
              />
              <span
                className="text-xs font-body font-semibold uppercase tracking-wide"
                style={{ color: "oklch(0.55 0.04 230)" }}
              >
                GPS Coords
              </span>
            </div>
            <p
              className="font-body text-sm font-semibold"
              style={{ color: "oklch(0.22 0.08 255)" }}
            >
              {busLocation.lat.toFixed(4)},
              <br />
              {busLocation.lng.toFixed(4)}
            </p>
          </div>
        </div>

        {/* Geolocation notice */}
        {geoError && (
          <div
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-body"
            style={{
              background: "oklch(0.96 0.06 80 / 0.2)",
              color: "oklch(0.55 0.12 75)",
              border: "1px solid oklch(0.80 0.1 80 / 0.3)",
            }}
            data-ocid="tracking.error_state"
          >
            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
            {geoError}
          </div>
        )}

        {/* Map — improved styling */}
        <div
          className="rounded-2xl overflow-hidden"
          style={{
            border: "2px solid oklch(0.80 0.06 220)",
            boxShadow:
              "0 8px 32px oklch(0.24 0.08 255 / 0.18), 0 2px 8px oklch(0.24 0.08 255 / 0.08)",
          }}
          data-ocid="tracking.map_marker"
        >
          {/* Map header */}
          <div
            className="px-4 py-3 flex items-center justify-between"
            style={{
              background:
                "linear-gradient(90deg, oklch(0.24 0.08 255) 0%, oklch(0.30 0.10 265) 100%)",
            }}
          >
            <div className="flex items-center gap-2">
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center"
                style={{ background: "oklch(1 0 0 / 0.15)" }}
              >
                <MapPin className="w-3.5 h-3.5 text-white" />
              </div>
              <div>
                <span className="text-xs font-body font-bold text-white block">
                  Live Bus Location
                </span>
                <span
                  className="text-xs font-body"
                  style={{ color: "oklch(0.78 0.06 220)" }}
                >
                  KIIT Campus, Bhubaneswar
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <span
                className="w-2 h-2 rounded-full animate-pulse"
                style={{ background: "oklch(0.75 0.18 145)" }}
              />
              <span
                className="text-xs font-body"
                style={{ color: "oklch(0.80 0.04 215)" }}
              >
                {lastUpdated.toLocaleTimeString()}
              </span>
            </div>
          </div>

          {/* Map iframe — taller, better zoom */}
          <div
            style={{
              height: "360px",
              position: "relative",
              background: "oklch(0.90 0.03 220)",
            }}
          >
            {iframeSrc ? (
              <iframe
                title="Bus Location Map"
                src={iframeSrc}
                width="100%"
                height="100%"
                style={{ border: "none", display: "block" }}
                referrerPolicy="no-referrer-when-downgrade"
                loading="lazy"
              />
            ) : (
              <div
                className="absolute inset-0 flex flex-col items-center justify-center gap-3"
                style={{ background: "oklch(0.93 0.03 220)" }}
              >
                <RefreshCw
                  className="w-8 h-8 animate-spin"
                  style={{ color: "oklch(0.55 0.04 230)" }}
                />
                <p
                  className="text-xs font-body"
                  style={{ color: "oklch(0.55 0.04 230)" }}
                >
                  Loading map…
                </p>
              </div>
            )}
          </div>

          {/* Map footer hint */}
          <div
            className="px-4 py-2 flex items-center gap-2"
            style={{
              background: "oklch(0.96 0.02 220)",
              borderTop: "1px solid oklch(0.88 0.03 220)",
            }}
          >
            <Navigation
              className="w-3 h-3"
              style={{ color: "oklch(0.50 0.08 255)" }}
            />
            <span
              className="text-xs font-body"
              style={{ color: "oklch(0.55 0.04 230)" }}
            >
              Tap the map to open in Google Maps for turn-by-turn directions
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            type="button"
            onClick={handleSimulate}
            disabled={isSimulating}
            data-ocid="tracking.primary_button"
            className="flex-1 h-11 font-body font-semibold rounded-xl"
            style={{
              background: isSimulating
                ? "oklch(0.55 0.04 230)"
                : "oklch(0.24 0.08 255)",
              color: "oklch(0.98 0 0)",
              boxShadow: isSimulating
                ? "none"
                : "0 4px 14px oklch(0.24 0.08 255 / 0.3)",
            }}
          >
            {isSimulating ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Updating…
              </>
            ) : (
              <>
                <Navigation className="mr-2 h-4 w-4" />
                Simulate Bus Moving
              </>
            )}
          </Button>
          <Button
            type="button"
            onClick={onBack}
            data-ocid="tracking.secondary_button"
            variant="outline"
            className="h-11 px-4 font-body font-semibold rounded-xl"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </div>

        {/* Bus info card */}
        <div
          className="rounded-xl p-4 flex items-center gap-3"
          style={{
            background: "oklch(1 0 0 / 0.96)",
            border: "1px solid oklch(0.90 0.03 220)",
          }}
        >
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: "oklch(0.88 0.2 90 / 0.15)" }}
          >
            <BusIcon
              className="w-5 h-5"
              style={{ color: "oklch(0.62 0.18 75)" }}
            />
          </div>
          <div className="flex-1 min-w-0">
            <p
              className="font-display font-bold text-sm"
              style={{ color: "oklch(0.22 0.08 255)" }}
            >
              {busNumber}
            </p>
            <p
              className="font-body text-xs truncate"
              style={{ color: "oklch(0.55 0.04 230)" }}
            >
              {from} → {to}
            </p>
          </div>
          <div
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-body font-semibold shrink-0"
            style={{
              background: "oklch(0.50 0.16 145 / 0.12)",
              color: "oklch(0.40 0.14 145)",
              border: "1px solid oklch(0.50 0.16 145 / 0.25)",
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
            En Route
          </div>
        </div>

        <p
          className="text-xs font-body text-center"
          style={{ color: "oklch(0.60 0.03 230)" }}
        >
          Location refreshes every 5 seconds
          {distanceKm !== null &&
            distanceKm >= 1 &&
            " · Alert when bus is <1 km away"}
        </p>
      </main>
    </div>
  );
};

export default BusTracking;
