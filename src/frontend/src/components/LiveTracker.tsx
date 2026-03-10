import {
  AlertTriangle,
  ArrowLeft,
  Bus as BusIcon,
  MapPin,
  RefreshCw,
  Wifi,
  WifiOff,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import AnimatedBackground from "./AnimatedBackground";
import type { Campus } from "./Dashboard";

const THINGSPEAK_CHANNEL = "3294061";
const THINGSPEAK_API_KEY = "WZDH0ALTCW8BM21M";
const KIIT_CENTER: [number, number] = [20.354, 85.82];

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

interface LiveTrackerProps {
  campus: Campus;
  onBack: () => void;
}

const LiveTracker: React.FC<LiveTrackerProps> = ({ campus, onBack }) => {
  const [busPos, setBusPos] = useState<[number, number]>(KIIT_CENTER);
  const [userPos, setUserPos] = useState<[number, number] | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [isLoading, setIsLoading] = useState(true);
  const [pollError, setPollError] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchBusLocation = useCallback(async () => {
    try {
      const res = await fetch(
        `https://api.thingspeak.com/channels/${THINGSPEAK_CHANNEL}/feeds/last.json?api_key=${THINGSPEAK_API_KEY}`,
      );
      if (!res.ok) throw new Error("HTTP error");
      const data = await res.json();
      const lng = Number.parseFloat(data.field1);
      const lat = Number.parseFloat(data.field2);
      if (!Number.isNaN(lat) && !Number.isNaN(lng)) {
        setBusPos([lat, lng]);
        setPollError(false);
      }
      setLastUpdated(new Date());
      setIsLoading(false);
    } catch {
      setPollError(true);
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBusLocation();
    intervalRef.current = setInterval(fetchBusLocation, 20000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [fetchBusLocation]);

  useEffect(() => {
    if (!navigator.geolocation) {
      setGeoError("Geolocation not supported.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserPos([pos.coords.latitude, pos.coords.longitude]);
        setGeoError(null);
      },
      () => {
        setUserPos(KIIT_CENTER);
        setGeoError("Using default location (KIIT University).");
      },
      { timeout: 8000, enableHighAccuracy: true },
    );
  }, []);

  const distanceKm = userPos
    ? haversineKm(userPos[0], userPos[1], busPos[0], busPos[1])
    : null;
  const isNearby = distanceKm !== null && distanceKm < 1;

  // OpenStreetMap iframe URL centered on bus position with a marker
  const mapSrc = `https://www.openstreetmap.org/export/embed.html?bbox=${busPos[1] - 0.01},${busPos[0] - 0.01},${busPos[1] + 0.01},${busPos[0] + 0.01}&layer=mapnik&marker=${busPos[0]},${busPos[1]}`;

  return (
    <div className="min-h-screen dashboard-bg flex flex-col relative overflow-hidden">
      <AnimatedBackground />

      {/* Header */}
      <header
        className="w-full py-4 px-5 flex items-center gap-3 sticky top-0 z-20"
        style={{
          background: "oklch(0.24 0.08 255 / 0.97)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid oklch(1 0 0 / 0.1)",
        }}
      >
        <button
          type="button"
          onClick={onBack}
          data-ocid="tracker.back_button"
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
            <span className="truncate">→ {campus.name}</span>
          </div>
          <h1 className="font-display font-bold text-white text-base">
            Tracking:{" "}
            <span style={{ color: "oklch(0.88 0.2 90)" }}>{campus.bus}</span>
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
        {/* Proximity alert */}
        <AnimatePresence>
          {isNearby && (
            <motion.div
              initial={{ opacity: 0, y: -16, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -16, scale: 0.96 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
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
                  Bus is approaching!
                </p>
                <p
                  className="font-body text-sm mt-0.5"
                  style={{ color: "oklch(0.38 0.08 60)" }}
                >
                  Less than 1 km away. Get ready to board!
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Info cards */}
        <div className="grid grid-cols-2 gap-3">
          <div
            className="rounded-xl p-4"
            style={{
              background: "oklch(1 0 0 / 0.96)",
              border: "1px solid oklch(0.90 0.03 220)",
            }}
          >
            <div className="flex items-center gap-2 mb-1.5">
              <BusIcon
                className="w-4 h-4"
                style={{ color: "oklch(0.55 0.18 75)" }}
              />
              <span
                className="text-xs font-body font-semibold uppercase tracking-wide"
                style={{ color: "oklch(0.55 0.04 230)" }}
              >
                Bus Number
              </span>
            </div>
            <p
              className="font-display font-bold text-xl"
              style={{ color: "oklch(0.22 0.08 255)" }}
            >
              {campus.bus}
            </p>
            <p
              className="text-xs font-body mt-0.5 truncate"
              style={{ color: "oklch(0.58 0.04 230)" }}
            >
              → {campus.name}
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
              {busPos[0].toFixed(4)},<br />
              {busPos[1].toFixed(4)}
            </p>
          </div>
        </div>

        {/* Geo error */}
        {geoError && (
          <div
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-body"
            style={{
              background: "oklch(0.96 0.06 80 / 0.2)",
              color: "oklch(0.55 0.12 75)",
              border: "1px solid oklch(0.80 0.1 80 / 0.3)",
            }}
            data-ocid="tracker.error_state"
          >
            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
            {geoError}
          </div>
        )}

        {/* Map */}
        <div
          className="rounded-2xl overflow-hidden"
          style={{
            border: "2px solid oklch(0.80 0.06 220)",
            boxShadow: "0 8px 32px oklch(0.24 0.08 255 / 0.18)",
          }}
          data-ocid="tracker.map_marker"
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
                style={{
                  background: pollError
                    ? "oklch(0.65 0.2 25)"
                    : "oklch(0.75 0.18 145)",
                }}
              />
              <span
                className="text-xs font-body"
                style={{ color: "oklch(0.80 0.04 215)" }}
              >
                {lastUpdated.toLocaleTimeString()}
              </span>
            </div>
          </div>

          {/* Map container */}
          {isLoading ? (
            <div
              className="flex flex-col items-center justify-center gap-3"
              style={{ height: 360, background: "oklch(0.93 0.03 220)" }}
              data-ocid="tracker.loading_state"
            >
              <RefreshCw
                className="w-8 h-8 animate-spin"
                style={{ color: "oklch(0.55 0.04 230)" }}
              />
              <p
                className="text-xs font-body"
                style={{ color: "oklch(0.55 0.04 230)" }}
              >
                Fetching GPS data…
              </p>
            </div>
          ) : (
            <iframe
              key={`${busPos[0]},${busPos[1]}`}
              src={mapSrc}
              title="Live Bus Map"
              style={{ height: 360, width: "100%", border: "none" }}
              loading="lazy"
            />
          )}

          {/* Map footer */}
          <div
            className="px-4 py-2 flex items-center justify-between"
            style={{
              background: "oklch(0.96 0.02 220)",
              borderTop: "1px solid oklch(0.88 0.03 220)",
            }}
          >
            <span
              className="text-xs font-body"
              style={{ color: "oklch(0.55 0.04 230)" }}
            >
              Lat: {busPos[0].toFixed(4)}, Lng: {busPos[1].toFixed(4)}
            </span>
            <span
              className="text-xs font-body"
              style={{ color: "oklch(0.55 0.04 230)" }}
            >
              Last updated: {lastUpdated.toLocaleTimeString()}
            </span>
          </div>
        </div>

        {/* Distance info */}
        {distanceKm !== null && (
          <div
            className="rounded-xl px-4 py-3 flex items-center justify-between"
            style={{
              background: "oklch(1 0 0 / 0.96)",
              border: "1px solid oklch(0.90 0.03 220)",
            }}
          >
            <span
              className="text-sm font-body"
              style={{ color: "oklch(0.45 0.04 230)" }}
            >
              Distance from you:
            </span>
            <span
              className="font-display font-bold text-base"
              style={{
                color: isNearby
                  ? "oklch(0.55 0.18 75)"
                  : "oklch(0.22 0.08 255)",
              }}
            >
              {distanceKm < 1
                ? `${Math.round(distanceKm * 1000)} m`
                : `${distanceKm.toFixed(2)} km`}
            </span>
          </div>
        )}

        <p
          className="text-xs font-body text-center"
          style={{ color: "oklch(0.65 0.03 230)" }}
        >
          Location refreshes every 20 seconds · Proximity alert when bus is
          &lt;1 km away
        </p>
      </main>
    </div>
  );
};

export default LiveTracker;
