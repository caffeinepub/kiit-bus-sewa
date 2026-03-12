import { Button } from "@/components/ui/button";
import {
  AlertTriangle,
  ArrowLeft,
  Bus as BusIcon,
  ExternalLink,
  MapPin,
  RefreshCw,
  Wifi,
  WifiOff,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import AnimatedBackground from "./AnimatedBackground";

const THINGSPEAK_CHANNEL_ID = "3295601";
const THINGSPEAK_API_KEY = "Y7EDQNCA85UFKP7M";
const THINGSPEAK_URL = `https://api.thingspeak.com/channels/${THINGSPEAK_CHANNEL_ID}/feeds/last.json?api_key=${THINGSPEAK_API_KEY}`;

const DEFAULT_LAT = 20.3543;
const DEFAULT_LNG = 85.8194;
const REFRESH_INTERVAL_MS = 10000;

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

let leafletLoaded = false;
let leafletLoadPromise: Promise<void> | null = null;

function loadLeaflet(): Promise<void> {
  if (leafletLoaded) return Promise.resolve();
  if (leafletLoadPromise) return leafletLoadPromise;
  leafletLoadPromise = new Promise((resolve, reject) => {
    if (!document.querySelector('link[href*="leaflet"]')) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }
    if (!document.querySelector('script[src*="leaflet"]')) {
      const script = document.createElement("script");
      script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
      script.onload = () => {
        leafletLoaded = true;
        resolve();
      };
      script.onerror = reject;
      document.head.appendChild(script);
    } else {
      leafletLoaded = true;
      resolve();
    }
  });
  return leafletLoadPromise;
}

// Helper to call Leaflet methods without triggering noExplicitAny
function leafletCall(obj: unknown, method: string, ...args: unknown[]): void {
  if (!obj) return;
  (obj as Record<string, (...a: unknown[]) => void>)[method](...args);
}

const BusTracking: React.FC<BusTrackingProps> = ({
  busNumber,
  from,
  to,
  onBack,
}) => {
  const [busLat, setBusLat] = useState<number>(DEFAULT_LAT);
  const [busLng, setBusLng] = useState<number>(DEFAULT_LNG);
  const [isNearby, setIsNearby] = useState(false);
  const [userLat, setUserLat] = useState<number | null>(null);
  const [userLng, setUserLng] = useState<number | null>(null);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [pollError, setPollError] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [isLoading, setIsLoading] = useState(true);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<unknown>(null);
  const markerRef = useRef<unknown>(null);
  // Store initial coords for map init (refs avoid stale closure)
  const initLatRef = useRef(DEFAULT_LAT);
  const initLngRef = useRef(DEFAULT_LNG);
  const busNumberRef = useRef(busNumber);
  const toRef = useRef(to);

  const fetchGPS = useCallback(async () => {
    try {
      const res = await fetch(THINGSPEAK_URL);
      if (!res.ok) throw new Error("ThingSpeak fetch failed");
      const data = await res.json();
      const lng = Number.parseFloat(data.field1);
      const lat = Number.parseFloat(data.field2);
      if (!Number.isNaN(lat) && !Number.isNaN(lng)) {
        setBusLat(lat);
        setBusLng(lng);
        initLatRef.current = lat;
        initLngRef.current = lng;
        setPollError(false);
        if (markerRef.current && mapInstanceRef.current) {
          leafletCall(markerRef.current, "setLatLng", [lat, lng]);
          leafletCall(mapInstanceRef.current, "setView", [lat, lng], 16);
        }
      }
      setLastUpdated(new Date());
    } catch {
      setPollError(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGPS();
    pollRef.current = setInterval(fetchGPS, REFRESH_INTERVAL_MS);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [fetchGPS]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: map is initialised once when loading ends
  useEffect(() => {
    if (isLoading || !mapContainerRef.current) return;
    let destroyed = false;
    loadLeaflet()
      .then(() => {
        if (destroyed || !mapContainerRef.current) return;
        const win = window as unknown as Record<string, unknown>;
        const L = win.L as
          | Record<string, (...a: unknown[]) => unknown>
          | undefined;
        if (!L || mapInstanceRef.current) return;

        const lat = initLatRef.current;
        const lng = initLngRef.current;
        const map = L.map(mapContainerRef.current, {
          center: [lat, lng],
          zoom: 16,
          zoomControl: true,
        });

        const tileLayerFn = L.tileLayer as (
          url: string,
          opts: object,
        ) => unknown;
        const tiles = tileLayerFn(
          "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
          {
            attribution:
              '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
            maxZoom: 19,
          },
        );
        leafletCall(tiles, "addTo", map);

        const divIcon = L.divIcon as (opts: object) => unknown;
        const busIcon = divIcon({
          html: '<div style="font-size:32px;line-height:1;filter:drop-shadow(0 2px 4px rgba(0,0,0,0.4))">\uD83D\uDE8C</div>',
          className: "",
          iconSize: [36, 36],
          iconAnchor: [18, 18],
        });

        const markerFn = L.marker as (latlng: unknown, opts: object) => unknown;
        const marker = markerFn([lat, lng], { icon: busIcon });
        leafletCall(marker, "addTo", map);
        leafletCall(
          (marker as Record<string, (...a: unknown[]) => unknown>).bindPopup(
            `<b>${busNumberRef.current}</b><br/>is going to ${toRef.current}`,
          ),
          "openPopup",
        );

        mapInstanceRef.current = map;
        markerRef.current = marker;
      })
      .catch(() => {
        /* CDN load failed */
      });

    return () => {
      destroyed = true;
      if (mapInstanceRef.current) {
        leafletCall(mapInstanceRef.current, "remove");
        mapInstanceRef.current = null;
        markerRef.current = null;
      }
    };
  }, [isLoading]);

  useEffect(() => {
    if (!markerRef.current || !mapInstanceRef.current) return;
    leafletCall(markerRef.current, "setLatLng", [busLat, busLng]);
    leafletCall(mapInstanceRef.current, "setView", [busLat, busLng], 16);
  }, [busLat, busLng]);

  useEffect(() => {
    if (!navigator.geolocation) {
      setGeoError("Geolocation not supported.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLat(pos.coords.latitude);
        setUserLng(pos.coords.longitude);
        setGeoError(null);
      },
      () => setGeoError("Could not get your location."),
      { timeout: 8000, enableHighAccuracy: true },
    );
  }, []);

  useEffect(() => {
    if (userLat === null || userLng === null) return;
    const R = 6371;
    const dLat = ((busLat - userLat) * Math.PI) / 180;
    const dLng = ((busLng - userLng) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((userLat * Math.PI) / 180) *
        Math.cos((busLat * Math.PI) / 180) *
        Math.sin(dLng / 2) ** 2;
    setIsNearby(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)) < 1);
  }, [busLat, busLng, userLat, userLng]);

  const googleMapsDirectUrl = `https://www.google.com/maps?q=${busLat},${busLng}&z=16`;

  return (
    <div className="min-h-screen dashboard-bg flex flex-col relative overflow-hidden">
      <AnimatedBackground />

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
            Live Tracking: {busNumber}
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
          data-ocid={
            pollError ? "tracking.error_state" : "tracking.success_state"
          }
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
        <motion.div
          initial={{ opacity: 0, y: -10, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="rounded-2xl px-5 py-4 flex items-center gap-4"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.95 0.18 85) 0%, oklch(0.98 0.12 75) 100%)",
            border: "2px solid oklch(0.88 0.22 85)",
            boxShadow: "0 6px 24px oklch(0.88 0.22 85 / 0.35)",
          }}
          data-ocid="tracking.card"
        >
          <div
            className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0 text-3xl"
            style={{ background: "oklch(0.88 0.22 85)" }}
          >
            🚌
          </div>
          <div>
            <p
              className="font-display font-black text-2xl leading-tight"
              style={{ color: "oklch(0.22 0.1 55)" }}
            >
              {busNumber}
            </p>
            <p
              className="font-body text-base font-medium mt-0.5"
              style={{ color: "oklch(0.38 0.1 60)" }}
            >
              is going to <span className="font-bold">{to}</span>
            </p>
          </div>
        </motion.div>

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
                  {busNumber} is less than 1 km away. Get ready to board!
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div
          className="rounded-xl px-4 py-3 flex items-center gap-3"
          style={{
            background: "oklch(1 0 0 / 0.96)",
            border: "1px solid oklch(0.90 0.03 220)",
          }}
        >
          <MapPin
            className="w-4 h-4 shrink-0"
            style={{ color: "oklch(0.50 0.16 145)" }}
          />
          <div>
            <span
              className="text-xs font-body font-semibold uppercase tracking-wide block"
              style={{ color: "oklch(0.55 0.04 230)" }}
            >
              Live GPS Coordinates
            </span>
            <span
              className="font-body text-sm font-semibold"
              style={{ color: "oklch(0.22 0.08 255)" }}
            >
              {busLat.toFixed(5)}, {busLng.toFixed(5)}
            </span>
          </div>
          <div className="ml-auto flex items-center gap-1.5">
            <span
              className="w-2 h-2 rounded-full animate-pulse"
              style={{ background: "oklch(0.50 0.16 145)" }}
            />
            <span
              className="text-xs font-body"
              style={{ color: "oklch(0.55 0.04 230)" }}
            >
              {lastUpdated.toLocaleTimeString()}
            </span>
          </div>
        </div>

        {geoError && (
          <div
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-body"
            style={{
              background: "oklch(0.96 0.06 80 / 0.2)",
              color: "oklch(0.55 0.12 75)",
              border: "1px solid oklch(0.80 0.1 80 / 0.3)",
            }}
          >
            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
            {geoError}
          </div>
        )}

        <div
          className="rounded-2xl overflow-hidden"
          style={{
            border: "2px solid oklch(0.80 0.06 220)",
            boxShadow: "0 8px 32px oklch(0.24 0.08 255 / 0.18)",
          }}
          data-ocid="tracking.map_marker"
        >
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
                  Channel {THINGSPEAK_CHANNEL_ID} · auto-refreshing
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <RefreshCw
                className="w-3 h-3"
                style={{ color: "oklch(0.75 0.18 145)" }}
              />
              <span
                className="text-xs font-body"
                style={{ color: "oklch(0.80 0.04 215)" }}
              >
                every 10s
              </span>
            </div>
          </div>

          {isLoading ? (
            <div
              className="flex flex-col items-center justify-center gap-3"
              style={{
                height: 500,
                width: "100%",
                background: "oklch(0.93 0.03 220)",
              }}
              data-ocid="tracking.loading_state"
            >
              <RefreshCw
                className="w-8 h-8 animate-spin"
                style={{ color: "oklch(0.55 0.04 230)" }}
              />
              <p
                className="text-xs font-body"
                style={{ color: "oklch(0.55 0.04 230)" }}
              >
                Fetching GPS from ThingSpeak…
              </p>
            </div>
          ) : (
            <div
              ref={mapContainerRef}
              style={{
                height: 500,
                width: "100%",
                display: "block",
                position: "relative",
                zIndex: 0,
              }}
            />
          )}

          <div
            className="px-4 py-2 flex items-center justify-between"
            style={{
              background: "oklch(0.96 0.02 220)",
              borderTop: "1px solid oklch(0.88 0.03 220)",
            }}
          >
            <div className="flex items-center gap-2">
              <span
                className="w-2 h-2 rounded-full animate-pulse"
                style={{ background: "oklch(0.50 0.16 145)" }}
              />
              <span
                className="text-xs font-body"
                style={{ color: "oklch(0.55 0.04 230)" }}
              >
                Updates every 10s
              </span>
            </div>
            <a
              href={googleMapsDirectUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs font-body font-semibold transition-opacity hover:opacity-70"
              style={{ color: "oklch(0.40 0.14 255)" }}
              data-ocid="tracking.link"
            >
              <ExternalLink className="w-3 h-3" />
              Open in Google Maps
            </a>
          </div>
        </div>

        <Button
          type="button"
          onClick={onBack}
          data-ocid="tracking.secondary_button"
          variant="outline"
          className="h-11 w-full font-body font-semibold rounded-xl"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Route Selection
        </Button>
      </main>
    </div>
  );
};

export default BusTracking;
