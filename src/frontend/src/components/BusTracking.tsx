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

const THINGSPEAK_CHANNEL_ID = "3294061";
const THINGSPEAK_API_KEY = "WZDH0ALTCW8BM21M";
const THINGSPEAK_URL = `https://api.thingspeak.com/channels/${THINGSPEAK_CHANNEL_ID}/feeds/last.json?api_key=${THINGSPEAK_API_KEY}`;

const DEFAULT_LAT = 20.3543;
const DEFAULT_LNG = 85.8194;
const REFRESH_INTERVAL_MS = 10000;

// Extend window for Leaflet globals injected from CDN
declare global {
  interface Window {
    L: any;
  }
}

/** Load Leaflet CSS + JS from CDN once, return a promise that resolves when ready */
function loadLeaflet(): Promise<void> {
  return new Promise((resolve) => {
    if (window.L) {
      resolve();
      return;
    }
    // CSS
    if (!document.querySelector('link[href*="leaflet"]')) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }
    // JS
    if (!document.querySelector('script[src*="leaflet"]')) {
      const script = document.createElement("script");
      script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
      script.onload = () => resolve();
      document.head.appendChild(script);
    } else {
      // script tag already present, wait for it
      const interval = setInterval(() => {
        if (window.L) {
          clearInterval(interval);
          resolve();
        }
      }, 50);
    }
  });
}

interface BusTrackingProps {
  busId: bigint;
  busNumber: string;
  from: string;
  to: string;
  fromLat?: number;
  fromLng?: number;
  userEmail: string;
  onBack: () => void;
  userLat?: number;
  userLng?: number;
}

const BusTracking: React.FC<BusTrackingProps> = ({
  busNumber,
  from,
  to,
  onBack,
  userLat,
  userLng,
}) => {
  const [busLat, setBusLat] = useState<number>(DEFAULT_LAT);
  const [busLng, setBusLng] = useState<number>(DEFAULT_LNG);
  const [isNearby, setIsNearby] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [pollError, setPollError] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const userMarkerRef = useRef<any>(null);

  // Initialise map once on mount (after Leaflet CDN loads)
  // biome-ignore lint/correctness/useExhaustiveDependencies: map init runs once; userLat/userLng handled by separate effect
  useEffect(() => {
    let destroyed = false;
    const timeouts: ReturnType<typeof setTimeout>[] = [];
    let resizeObserver: ResizeObserver | null = null;

    loadLeaflet().then(() => {
      if (destroyed || !mapContainerRef.current || mapRef.current) return;

      const L = window.L;

      // Fix default marker icon paths broken by bundlers
      L.Icon.Default.prototype._getIconUrl = undefined;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      const map = L.map(mapContainerRef.current, {
        center: [DEFAULT_LAT, DEFAULT_LNG],
        zoom: 14,
        zoomControl: true,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);

      const busIcon = L.divIcon({
        className: "",
        html: `<div style="font-size:32px;line-height:1;filter:drop-shadow(0 2px 4px rgba(0,0,0,0.4))">🚌</div>`,
        iconSize: [36, 36],
        iconAnchor: [18, 18],
      });

      const marker = L.marker([DEFAULT_LAT, DEFAULT_LNG], {
        icon: busIcon,
      }).addTo(map);
      marker.bindPopup(`<b>${busNumber}</b><br/>→ ${to}`);

      mapRef.current = map;
      markerRef.current = marker;

      // Add user location marker immediately if coordinates are available
      if (userLat !== undefined && userLng !== undefined) {
        const userIcon = L.divIcon({
          className: "",
          html: `<div style="width:14px;height:14px;border-radius:50%;background:#3b82f6;border:3px solid white;box-shadow:0 0 0 2px #3b82f6;"></div>`,
          iconSize: [14, 14],
          iconAnchor: [7, 7],
        });
        const userMarker = L.marker([userLat, userLng], {
          icon: userIcon,
        }).addTo(map);
        userMarker.bindPopup("<b>Your Location</b>");
        userMarkerRef.current = userMarker;
      }

      // Multiple invalidateSize calls to handle CSS animations / framer-motion entry
      const scheduleInvalidate = (delay: number) => {
        const t = setTimeout(() => {
          if (!destroyed) map.invalidateSize(true);
        }, delay);
        timeouts.push(t);
      };

      scheduleInvalidate(100);
      scheduleInvalidate(300);
      scheduleInvalidate(600);
      scheduleInvalidate(1000);

      const t200 = setTimeout(() => {
        if (!destroyed) {
          map.invalidateSize(true);
          window.dispatchEvent(new Event("resize"));
        }
      }, 200);
      timeouts.push(t200);

      // ResizeObserver: re-invalidate whenever the container changes size
      if (typeof ResizeObserver !== "undefined" && mapContainerRef.current) {
        resizeObserver = new ResizeObserver(() => {
          if (!destroyed && mapRef.current) map.invalidateSize(true);
        });
        resizeObserver.observe(mapContainerRef.current);
      }
    });

    return () => {
      destroyed = true;
      for (const t of timeouts) clearTimeout(t);
      resizeObserver?.disconnect();
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        markerRef.current = null;
        userMarkerRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [busNumber, to]);

  // Update user marker when userLat/userLng props change (e.g., after map is created)
  useEffect(() => {
    if (!mapRef.current || userLat === undefined || userLng === undefined)
      return;
    const L = window.L;
    if (!L) return;

    if (userMarkerRef.current) {
      userMarkerRef.current.setLatLng([userLat, userLng]);
    } else {
      const userIcon = L.divIcon({
        className: "",
        html: `<div style="width:14px;height:14px;border-radius:50%;background:#3b82f6;border:3px solid white;box-shadow:0 0 0 2px #3b82f6;"></div>`,
        iconSize: [14, 14],
        iconAnchor: [7, 7],
      });
      const userMarker = L.marker([userLat, userLng], { icon: userIcon }).addTo(
        mapRef.current,
      );
      userMarker.bindPopup("<b>Your Location</b>");
      userMarkerRef.current = userMarker;
    }
  }, [userLat, userLng]);

  // Show geo error if no location was provided by parent
  useEffect(() => {
    if (userLat === undefined || userLng === undefined) {
      if (!navigator.geolocation) {
        setGeoError("Geolocation not supported.");
      } else {
        setGeoError("Location permission not granted.");
      }
    } else {
      setGeoError(null);
    }
  }, [userLat, userLng]);

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
        setPollError(false);
        if (markerRef.current && mapRef.current) {
          markerRef.current.setLatLng([lat, lng]);
          mapRef.current.panTo([lat, lng]);
        }
      }
      setLastUpdated(new Date());
    } catch {
      setPollError(true);
    }
  }, []);

  useEffect(() => {
    fetchGPS();
    pollRef.current = setInterval(fetchGPS, REFRESH_INTERVAL_MS);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [fetchGPS]);

  useEffect(() => {
    if (userLat === undefined || userLng === undefined) return;
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

        {/* Plain div wrapper — NOT a motion div — so Leaflet measures real size */}
        <div
          style={{
            borderRadius: "1rem",
            overflow: "hidden",
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
                  Live Bus Location — Bhubaneswar
                </span>
                <span
                  className="text-xs font-body"
                  style={{ color: "oklch(0.78 0.06 220)" }}
                >
                  OpenStreetMap · auto-refreshing
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

          {/* Map container: explicit inline styles for reliable Leaflet rendering */}
          <div
            ref={mapContainerRef}
            style={{
              height: "500px",
              width: "100%",
              display: "block",
              position: "relative",
              zIndex: 0,
            }}
          />

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
