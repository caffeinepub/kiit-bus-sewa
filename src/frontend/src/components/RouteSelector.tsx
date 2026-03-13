import { Button } from "@/components/ui/button";
import { Bus, LogOut, MapPin } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import type React from "react";
import { useEffect, useState } from "react";
import { type KIITCampus, KIIT_CAMPUSES } from "../data/campuses";
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
    busNumber: string,
  ) => void;
  onLogout: () => void;
}

const RouteSelector: React.FC<RouteSelectorProps> = ({
  userEmail,
  onSelectRoute,
  onLogout,
}) => {
  const [to, setTo] = useState<KIITCampus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showSessionRestored, setShowSessionRestored] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowSessionRestored(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  const handleSearch = () => {
    if (!to) {
      setError("Please select a destination campus.");
      return;
    }
    setError(null);
    onSelectRoute(1n, "KIIT Campus", to.name, to.lat, to.lng, to.busNumber);
  };

  const initials = userEmail.split("@")[0].slice(0, 2).toUpperCase();

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
          {/* KIIT Logo circle in header */}
          <div
            className="flex items-center justify-center rounded-full overflow-hidden border-2"
            style={{
              width: 38,
              height: 38,
              background: "oklch(1 0 0 / 0.95)",
              borderColor: "oklch(0.55 0.18 145)",
              boxShadow: "0 2px 8px oklch(0.55 0.18 145 / 0.4)",
            }}
          >
            <img
              src="/assets/uploads/images-2-1.png"
              alt="KIIT Logo"
              style={{ width: 30, height: 30, objectFit: "contain" }}
            />
          </div>
          <span className="font-display font-bold text-base text-white">
            KIIT Bus
          </span>
        </div>
        <div className="flex items-center gap-3">
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
        {/* Hero */}
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
            Select your destination to find your bus
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
            className="rounded-2xl overflow-visible"
            style={{
              background: "oklch(1 0 0 / 0.96)",
              boxShadow:
                "0 24px 64px oklch(0.24 0.08 255 / 0.16), 0 4px 16px oklch(0.24 0.08 255 / 0.08)",
              border: "1px solid oklch(0.90 0.03 220)",
            }}
          >
            <div
              style={{
                height: "3px",
                borderRadius: "12px 12px 0 0",
                background:
                  "linear-gradient(90deg, oklch(0.88 0.2 90) 0%, oklch(0.24 0.08 255) 100%)",
              }}
            />

            <div className="p-7">
              <div className="flex items-center gap-3 mb-6">
                {/* KIIT logo circle next to heading */}
                <div
                  className="flex items-center justify-center rounded-full overflow-hidden border-2 shrink-0"
                  style={{
                    width: 36,
                    height: 36,
                    background: "oklch(1 0 0)",
                    borderColor: "oklch(0.55 0.18 145)",
                    boxShadow: "0 2px 6px oklch(0.55 0.18 145 / 0.3)",
                  }}
                >
                  <img
                    src="/assets/uploads/images-2-1.png"
                    alt="KIIT"
                    style={{ width: 28, height: 28, objectFit: "contain" }}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <MapPin
                    className="w-5 h-5"
                    style={{ color: "oklch(0.24 0.08 255)" }}
                  />
                  <h2
                    className="font-display font-bold text-lg"
                    style={{ color: "oklch(0.22 0.08 255)" }}
                  >
                    Select Destination
                  </h2>
                </div>
              </div>

              {/* Destination picker */}
              <LocationSearchInput
                label="Destination Campus"
                placeholder="Search all 27 campuses…"
                value={to?.name ?? ""}
                onSelect={(campus) => {
                  setTo(campus);
                  setError(null);
                }}
                onClear={() => setTo(null)}
                color="blue"
                dataOcid="route.search_input"
              />

              {/* Bus assignment banner */}
              <AnimatePresence>
                {to && (
                  <motion.div
                    key={to.id}
                    initial={{ opacity: 0, y: 10, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.97 }}
                    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    className="mt-5 rounded-2xl px-5 py-4 flex items-center gap-4"
                    style={{
                      background:
                        "linear-gradient(135deg, oklch(0.95 0.18 85) 0%, oklch(0.98 0.12 75) 100%)",
                      border: "2px solid oklch(0.88 0.22 85)",
                      boxShadow: "0 6px 24px oklch(0.88 0.22 85 / 0.35)",
                    }}
                    data-ocid="route.success_state"
                  >
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 text-2xl"
                      style={{
                        background: "oklch(0.88 0.22 85)",
                        boxShadow: "0 2px 8px oklch(0.70 0.2 75 / 0.4)",
                      }}
                    >
                      🚌
                    </div>
                    <div>
                      <p
                        className="font-display font-black text-xl leading-tight"
                        style={{ color: "oklch(0.22 0.1 55)" }}
                      >
                        {to.busNumber}
                      </p>
                      <p
                        className="font-body text-sm font-medium mt-0.5"
                        style={{ color: "oklch(0.38 0.1 60)" }}
                      >
                        is going to <span className="font-bold">{to.name}</span>
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

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

              {/* Campus count */}
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
                    {KIIT_CAMPUSES.length}
                  </strong>{" "}
                  campuses covered · Each with a dedicated bus
                </span>
              </div>

              {/* Track button */}
              <Button
                type="button"
                onClick={handleSearch}
                disabled={!to}
                data-ocid="route.primary_button"
                className="mt-5 w-full h-12 font-body font-semibold text-base rounded-xl"
                style={{
                  background: to
                    ? "oklch(0.24 0.08 255)"
                    : "oklch(0.75 0.03 230)",
                  color: "oklch(0.98 0 0)",
                  boxShadow: to
                    ? "0 4px 14px oklch(0.24 0.08 255 / 0.35)"
                    : "none",
                }}
              >
                <Bus className="mr-2 h-4 w-4" />
                Track Live Location
              </Button>
            </div>
          </div>
        </motion.div>
      </main>

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
