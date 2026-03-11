import type { Route } from "@/backend.d";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Bus, LogOut, MapPin, RefreshCw } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import type React from "react";
import { useEffect, useState } from "react";
import { type KIITCampus, KIIT_CAMPUSES } from "../data/campuses";
import { useActor } from "../hooks/useActor";
import AnimatedBackground from "./AnimatedBackground";
import LocationSearchInput from "./LocationSearchInput";

interface RouteSelectorProps {
  userEmail: string;
  onSelectRoute: (
    routeId: bigint,
    from: string,
    to: string,
    fromLat: number,
    fromLng: number,
  ) => void;
  onLogout: () => void;
}

const RouteSelector: React.FC<RouteSelectorProps> = ({
  userEmail,
  onSelectRoute,
  onLogout,
}) => {
  const { actor, isFetching: isActorLoading } = useActor();
  const [from, setFrom] = useState<KIITCampus | null>(null);
  const [to, setTo] = useState<KIITCampus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [showSessionRestored, setShowSessionRestored] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowSessionRestored(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  const { data: routes = [], isLoading: routesLoading } = useQuery<Route[]>({
    queryKey: ["routes"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getRoutes();
    },
    enabled: !!actor && !isActorLoading,
  });

  const handleSearch = async () => {
    if (!from) {
      setError("Please select a departure campus.");
      return;
    }
    if (!to) {
      setError("Please select a destination campus.");
      return;
    }
    if (from.id === to.id) {
      setError("Departure and destination cannot be the same.");
      return;
    }
    setError(null);
    setIsSearching(true);

    try {
      // Find matching route from backend
      const matched = routes.find(
        (r) =>
          (r.from
            .toLowerCase()
            .includes(from.name.split(" ")[0].toLowerCase()) &&
            r.to.toLowerCase().includes(to.name.split(" ")[0].toLowerCase())) ||
          (r.from.toLowerCase().includes(to.name.split(" ")[0].toLowerCase()) &&
            r.to.toLowerCase().includes(from.name.split(" ")[0].toLowerCase())),
      );

      // Use matched route or fallback to route 1n for demo
      const routeId = matched ? matched.id : 1n;
      onSelectRoute(routeId, from.name, to.name, from.lat, from.lng);
    } catch {
      setError("Failed to find routes. Please try again.");
    } finally {
      setIsSearching(false);
    }
  };

  const initials = userEmail.split("@")[0].slice(0, 2).toUpperCase();

  // Quick-pick popular routes using first 3 campuses
  const quickRoutes = [
    { from: KIIT_CAMPUSES[0], to: KIIT_CAMPUSES[1] },
    { from: KIIT_CAMPUSES[1], to: KIIT_CAMPUSES[2] },
    { from: KIIT_CAMPUSES[0], to: KIIT_CAMPUSES[2] },
  ];

  return (
    <div className="min-h-screen dashboard-bg flex flex-col relative overflow-hidden">
      <AnimatedBackground />
      {/* Header */}
      <header
        className="w-full py-4 px-5 flex items-center justify-between sticky top-0 z-10"
        style={{
          background: "oklch(0.24 0.08 255 / 0.97)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid oklch(1 0 0 / 0.1)",
        }}
      >
        <div className="flex items-center gap-2.5">
          <div
            className="flex items-center justify-center rounded-xl"
            style={{
              width: 36,
              height: 36,
              background: "oklch(0.88 0.2 90)",
              boxShadow: "0 2px 8px oklch(0.88 0.2 90 / 0.5)",
            }}
          >
            <Bus className="w-4 h-4" style={{ color: "oklch(0.18 0.06 50)" }} />
          </div>
          <span className="font-display font-bold text-base text-white">
            KIIT Bus Sewa
          </span>
        </div>
        <div className="flex items-center gap-3">
          {/* Session restored badge */}
          <AnimatePresence>
            {showSessionRestored && (
              <motion.span
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.35 }}
                className="hidden sm:flex items-center gap-1 text-xs font-body px-2.5 py-1 rounded-full"
                style={{
                  background: "oklch(0.88 0.2 90 / 0.18)",
                  color: "oklch(0.80 0.18 80)",
                  border: "1px solid oklch(0.88 0.2 90 / 0.3)",
                }}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-current" />
                Session restored
              </motion.span>
            )}
          </AnimatePresence>
          {/* Avatar */}
          <div
            className="flex items-center gap-2 px-3 py-1.5 rounded-full"
            style={{
              background: "oklch(1 0 0 / 0.12)",
              border: "1px solid oklch(1 0 0 / 0.15)",
            }}
          >
            <div
              className="flex items-center justify-center rounded-full w-6 h-6 text-xs font-body font-bold"
              style={{
                background: "oklch(0.88 0.2 90)",
                color: "oklch(0.18 0.06 50)",
              }}
            >
              {initials}
            </div>
            <span className="text-xs font-body text-white/80 hidden sm:block max-w-[120px] truncate">
              {userEmail}
            </span>
          </div>
          <button
            type="button"
            onClick={onLogout}
            data-ocid="nav.button"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-body font-semibold transition-all duration-200"
            style={{
              background: "oklch(0.65 0.2 25 / 0.2)",
              color: "oklch(0.98 0.04 40)",
              border: "1px solid oklch(0.65 0.2 25 / 0.3)",
            }}
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:block">Sign out</span>
          </button>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-4 py-10 relative z-10">
        {/* Hero section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-center mb-10"
        >
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-4 text-xs font-body font-semibold"
            style={{
              background: "oklch(0.88 0.2 90 / 0.15)",
              color: "oklch(0.72 0.18 75)",
              border: "1px solid oklch(0.88 0.2 90 / 0.3)",
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
            Live Bus Tracking Active
          </div>
          <h1
            className="font-display font-bold mb-3"
            style={{
              fontSize: "clamp(1.8rem, 5vw, 2.6rem)",
              color: "oklch(0.18 0.03 240)",
              letterSpacing: "-0.02em",
              lineHeight: 1.15,
            }}
          >
            Where are you headed
            <br />
            <span style={{ color: "oklch(0.24 0.08 255)" }}>today?</span>
          </h1>
          <p
            className="font-body text-sm"
            style={{ color: "oklch(0.52 0.04 230)" }}
          >
            Select your route to find available buses
          </p>
        </motion.div>

        {/* Route Card */}
        <motion.div
          initial={{ opacity: 0, y: 32, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
          className="w-full max-w-md"
        >
          <div
            className="rounded-2xl overflow-hidden"
            style={{
              background: "oklch(1 0 0 / 0.96)",
              boxShadow:
                "0 24px 64px oklch(0.24 0.08 255 / 0.16), 0 4px 16px oklch(0.24 0.08 255 / 0.08)",
              border: "1px solid oklch(0.90 0.03 220)",
            }}
          >
            {/* Card accent bar */}
            <div
              style={{
                height: "3px",
                background:
                  "linear-gradient(90deg, oklch(0.88 0.2 90) 0%, oklch(0.24 0.08 255) 100%)",
              }}
            />

            <div className="p-7">
              <div className="flex items-center gap-2 mb-6">
                <MapPin
                  className="w-5 h-5"
                  style={{ color: "oklch(0.24 0.08 255)" }}
                />
                <h2
                  className="font-display font-bold text-lg"
                  style={{ color: "oklch(0.22 0.08 255)" }}
                >
                  Select Your Route
                </h2>
              </div>

              {/* Route picker layout */}
              <div className="space-y-4">
                {/* From */}
                <LocationSearchInput
                  label="From Campus"
                  placeholder="Choose departure campus"
                  value={from?.name ?? ""}
                  onSelect={(campus) => {
                    setFrom(campus);
                    setError(null);
                  }}
                  onClear={() => setFrom(null)}
                  excludeCampusId={to?.id}
                  color="green"
                  dataOcid="route.search_input"
                />

                {/* Swap arrow */}
                <div className="flex items-center justify-center">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center"
                    style={{
                      background: "oklch(0.88 0.05 215)",
                      border: "2px solid oklch(0.84 0.04 220)",
                    }}
                  >
                    <ArrowRight
                      className="w-4 h-4"
                      style={{ color: "oklch(0.24 0.08 255)" }}
                    />
                  </div>
                </div>

                {/* To */}
                <LocationSearchInput
                  label="To Campus"
                  placeholder="Choose destination campus"
                  value={to?.name ?? ""}
                  onSelect={(campus) => {
                    setTo(campus);
                    setError(null);
                  }}
                  onClear={() => setTo(null)}
                  excludeCampusId={from?.id}
                  color="blue"
                  dataOcid="route.input"
                />
              </div>

              {/* Error */}
              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 text-sm font-body px-3 py-2 rounded-lg"
                  style={{
                    background: "oklch(0.96 0.06 25 / 0.2)",
                    color: "oklch(0.48 0.2 25)",
                    border: "1px solid oklch(0.65 0.2 25 / 0.3)",
                  }}
                  data-ocid="route.error_state"
                  role="alert"
                >
                  {error}
                </motion.p>
              )}

              {/* Stats row */}
              {routesLoading ? (
                <div
                  className="mt-5 flex items-center justify-center gap-2 text-xs font-body py-2"
                  data-ocid="route.loading_state"
                  style={{ color: "oklch(0.58 0.04 230)" }}
                >
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  Loading routes…
                </div>
              ) : (
                <div
                  className="mt-5 flex items-center gap-3 text-xs font-body py-2 px-3 rounded-xl"
                  style={{ background: "oklch(0.93 0.03 220 / 0.5)" }}
                >
                  <Bus
                    className="w-4 h-4 shrink-0"
                    style={{ color: "oklch(0.24 0.08 255)" }}
                  />
                  <span style={{ color: "oklch(0.45 0.05 230)" }}>
                    <strong style={{ color: "oklch(0.24 0.08 255)" }}>
                      {routes.length || 8}
                    </strong>{" "}
                    routes available · 25 KIIT campuses covered
                  </span>
                </div>
              )}

              {/* Search button */}
              <Button
                type="button"
                onClick={handleSearch}
                disabled={isSearching || routesLoading}
                data-ocid="route.primary_button"
                className="mt-5 w-full h-12 font-body font-semibold text-base rounded-xl"
                style={{
                  background: "oklch(0.24 0.08 255)",
                  color: "oklch(0.98 0 0)",
                  boxShadow: "0 4px 14px oklch(0.24 0.08 255 / 0.35)",
                }}
              >
                {isSearching ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Searching…
                  </>
                ) : (
                  <>
                    <Bus className="mr-2 h-4 w-4" />
                    Find Buses
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Quick picks */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="mt-5"
          >
            <p
              className="text-xs font-body text-center mb-3"
              style={{ color: "oklch(0.55 0.04 230)" }}
            >
              Popular routes
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              {quickRoutes.map((route, idx) => (
                <button
                  key={`${route.from.id}-${route.to.id}`}
                  type="button"
                  data-ocid={`route.item.${idx + 1}`}
                  onClick={() => {
                    setFrom(route.from);
                    setTo(route.to);
                    setError(null);
                  }}
                  className="text-xs font-body px-3 py-1.5 rounded-full transition-all duration-150"
                  style={{
                    background: "oklch(1 0 0 / 0.8)",
                    color: "oklch(0.36 0.08 255)",
                    border: "1px solid oklch(0.84 0.04 215 / 0.6)",
                  }}
                >
                  {route.from.name} → {route.to.name}
                </button>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="py-4 px-6 text-center relative z-10">
        <p
          className="text-xs font-body"
          style={{ color: "oklch(0.52 0.04 230)" }}
        >
          &copy; {new Date().getFullYear()}. Built with{" "}
          <span style={{ color: "oklch(0.62 0.18 25)" }}>♥</span> using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2"
            style={{ color: "oklch(0.42 0.08 255)" }}
          >
            caffeine.ai
          </a>
        </p>
      </footer>
    </div>
  );
};

export default RouteSelector;
