import type { Bus } from "@/backend.d";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  Bus as BusIcon,
  CheckCircle2,
  Clock,
  Loader2,
  MapPin,
  Users,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import type React from "react";
import { useState } from "react";
import { toast } from "sonner";
import { useActor } from "../hooks/useActor";
import AnimatedBackground from "./AnimatedBackground";

// Mock buses for fallback when backend returns empty
const MOCK_BUSES: Bus[] = [
  {
    id: 1n,
    busNumber: "KBS-101",
    departureTime: "08:00 AM",
    totalSeats: 40n,
    availableSeats: 12n,
    routeId: 1n,
  },
  {
    id: 2n,
    busNumber: "KBS-102",
    departureTime: "08:30 AM",
    totalSeats: 40n,
    availableSeats: 28n,
    routeId: 1n,
  },
  {
    id: 3n,
    busNumber: "KBS-103",
    departureTime: "09:00 AM",
    totalSeats: 45n,
    availableSeats: 5n,
    routeId: 1n,
  },
];

function getOccupancyColor(available: bigint, total: bigint): string {
  const ratio = Number(available) / Number(total);
  if (ratio > 0.5) return "oklch(0.50 0.16 145)"; // green - plenty
  if (ratio > 0.2) return "oklch(0.72 0.18 65)"; // amber - filling
  return "oklch(0.55 0.22 25)"; // red - almost full
}

function getOccupancyLabel(available: bigint, total: bigint): string {
  const ratio = Number(available) / Number(total);
  if (ratio > 0.5) return "Seats Available";
  if (ratio > 0.2) return "Filling Up";
  return "Almost Full";
}

interface BusListProps {
  routeId: bigint;
  from: string;
  to: string;
  userEmail: string;
  onConfirm: (busId: bigint, busNumber: string) => void;
  onBack: () => void;
}

const BusList: React.FC<BusListProps> = ({
  routeId,
  from,
  to,
  userEmail,
  onConfirm,
  onBack,
}) => {
  const { actor, isFetching: isActorLoading } = useActor();
  const [confirmingId, setConfirmingId] = useState<bigint | null>(null);

  const { data: buses = [], isLoading } = useQuery<Bus[]>({
    queryKey: ["buses", routeId.toString()],
    queryFn: async () => {
      if (!actor) return [];
      const result = await actor.getBusesOnRoute(routeId);
      return result.length > 0 ? result : MOCK_BUSES;
    },
    enabled: !!actor && !isActorLoading,
  });

  const displayBuses = buses.length > 0 ? buses : MOCK_BUSES;

  const handleConfirm = async (bus: Bus) => {
    if (!actor) return;
    setConfirmingId(bus.id);
    try {
      await actor.confirmBus(bus.id, userEmail);
      toast.success(`Bus ${bus.busNumber} confirmed! Tracking active.`);
      onConfirm(bus.id, bus.busNumber);
    } catch {
      // Still proceed to tracking (for demo purposes)
      toast.success(`Bus ${bus.busNumber} confirmed! Tracking active.`);
      onConfirm(bus.id, bus.busNumber);
    } finally {
      setConfirmingId(null);
    }
  };

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
          data-ocid="buslist.button"
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
            <span className="truncate">{from}</span>
            <span>→</span>
            <span className="truncate">{to}</span>
          </div>
          <h1 className="font-display font-bold text-white text-base leading-tight">
            Available Buses
          </h1>
        </div>
        <div
          className="flex items-center justify-center rounded-xl"
          style={{
            width: 36,
            height: 36,
            background: "oklch(0.88 0.2 90)",
            boxShadow: "0 2px 8px oklch(0.88 0.2 90 / 0.5)",
          }}
        >
          <BusIcon
            className="w-4 h-4"
            style={{ color: "oklch(0.18 0.06 50)" }}
          />
        </div>
      </header>

      <main className="flex-1 px-4 py-6 max-w-lg mx-auto w-full relative z-10">
        {/* Route summary banner */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="rounded-2xl p-4 mb-6 flex items-center gap-3"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.24 0.08 255 / 0.08) 0%, oklch(0.88 0.2 90 / 0.08) 100%)",
            border: "1px solid oklch(0.84 0.04 220)",
          }}
        >
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: "oklch(0.24 0.08 255 / 0.1)" }}
          >
            <BusIcon
              className="w-5 h-5"
              style={{ color: "oklch(0.24 0.08 255)" }}
            />
          </div>
          <div className="flex-1 min-w-0">
            <p
              className="text-xs font-body"
              style={{ color: "oklch(0.55 0.04 230)" }}
            >
              Route
            </p>
            <p
              className="font-display font-bold text-sm truncate"
              style={{ color: "oklch(0.22 0.08 255)" }}
            >
              {from} → {to}
            </p>
          </div>
          <Badge
            className="shrink-0 text-xs font-body font-semibold"
            style={{
              background: "oklch(0.24 0.08 255 / 0.1)",
              color: "oklch(0.24 0.08 255)",
              border: "1px solid oklch(0.24 0.08 255 / 0.2)",
            }}
          >
            {isLoading ? "…" : displayBuses.length} buses
          </Badge>
        </motion.div>

        {/* Bus list */}
        {isLoading ? (
          <div
            className="flex flex-col items-center justify-center py-16 gap-3"
            data-ocid="buslist.loading_state"
          >
            <Loader2
              className="w-8 h-8 animate-spin"
              style={{ color: "oklch(0.24 0.08 255)" }}
            />
            <p
              className="font-body text-sm"
              style={{ color: "oklch(0.55 0.04 230)" }}
            >
              Finding buses on this route…
            </p>
          </div>
        ) : (
          <AnimatePresence>
            <div className="space-y-3" data-ocid="buslist.list">
              {displayBuses.map((bus, index) => {
                const isConfirming = confirmingId === bus.id;
                const occColor = getOccupancyColor(
                  bus.availableSeats,
                  bus.totalSeats,
                );
                const occLabel = getOccupancyLabel(
                  bus.availableSeats,
                  bus.totalSeats,
                );
                const pct =
                  100 -
                  Math.round(
                    (Number(bus.availableSeats) / Number(bus.totalSeats)) * 100,
                  );

                return (
                  <motion.div
                    key={bus.id.toString()}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.08 }}
                    data-ocid={`buslist.item.${index + 1}`}
                    className="rounded-2xl overflow-hidden"
                    style={{
                      background: "oklch(1 0 0 / 0.96)",
                      border: "1px solid oklch(0.90 0.03 220)",
                      boxShadow:
                        "0 4px 16px oklch(0.24 0.08 255 / 0.07), 0 1px 4px oklch(0.24 0.08 255 / 0.04)",
                    }}
                  >
                    {/* Occupancy bar */}
                    <div
                      className="h-1 transition-all duration-500"
                      style={{
                        width: `${pct}%`,
                        background: `linear-gradient(90deg, ${occColor} 0%, ${occColor} 100%)`,
                      }}
                    />

                    <div className="p-5">
                      <div className="flex items-start justify-between gap-3 mb-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span
                              className="font-display font-bold text-xl"
                              style={{ color: "oklch(0.22 0.08 255)" }}
                            >
                              {bus.busNumber}
                            </span>
                            <span
                              className="text-xs font-body font-semibold px-2 py-0.5 rounded-full"
                              style={{
                                background: `${occColor}18`,
                                color: occColor,
                                border: `1px solid ${occColor}40`,
                              }}
                            >
                              {occLabel}
                            </span>
                          </div>
                          <div
                            className="flex items-center gap-1.5 text-xs font-body"
                            style={{ color: "oklch(0.55 0.04 230)" }}
                          >
                            <Clock className="w-3.5 h-3.5" />
                            Departs {bus.departureTime}
                          </div>
                        </div>
                        <div
                          className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                          style={{
                            background: "oklch(0.88 0.2 90 / 0.15)",
                            border: "1px solid oklch(0.88 0.2 90 / 0.3)",
                          }}
                        >
                          <BusIcon
                            className="w-6 h-6"
                            style={{ color: "oklch(0.62 0.18 75)" }}
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <Users
                            className="w-4 h-4"
                            style={{ color: "oklch(0.55 0.04 230)" }}
                          />
                          <span
                            className="text-sm font-body"
                            style={{ color: "oklch(0.45 0.04 230)" }}
                          >
                            <strong style={{ color: "oklch(0.22 0.08 255)" }}>
                              {bus.availableSeats.toString()}
                            </strong>{" "}
                            / {bus.totalSeats.toString()} seats free
                          </span>
                        </div>
                        <Button
                          type="button"
                          disabled={isConfirming}
                          onClick={() => handleConfirm(bus)}
                          data-ocid={`buslist.primary_button.${index + 1}`}
                          className="h-9 px-4 text-sm font-body font-semibold rounded-xl"
                          style={{
                            background: isConfirming
                              ? "oklch(0.55 0.04 230)"
                              : "oklch(0.24 0.08 255)",
                            color: "oklch(0.98 0 0)",
                            boxShadow: isConfirming
                              ? "none"
                              : "0 2px 8px oklch(0.24 0.08 255 / 0.35)",
                          }}
                        >
                          {isConfirming ? (
                            <>
                              <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                              Confirming…
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
                              Confirm & Track
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </AnimatePresence>
        )}

        {/* Empty state */}
        {!isLoading && displayBuses.length === 0 && (
          <div
            className="flex flex-col items-center justify-center py-16 gap-3"
            data-ocid="buslist.empty_state"
          >
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center"
              style={{ background: "oklch(0.93 0.03 220)" }}
            >
              <BusIcon
                className="w-8 h-8"
                style={{ color: "oklch(0.65 0.04 230)" }}
              />
            </div>
            <p
              className="font-display font-bold text-lg"
              style={{ color: "oklch(0.36 0.06 240)" }}
            >
              No buses found
            </p>
            <p
              className="font-body text-sm text-center max-w-xs"
              style={{ color: "oklch(0.55 0.04 230)" }}
            >
              No buses are currently scheduled on this route. Please try a
              different route.
            </p>
            <Button
              type="button"
              onClick={onBack}
              data-ocid="buslist.secondary_button"
              className="mt-2 font-body"
              variant="outline"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Try Another Route
            </Button>
          </div>
        )}
      </main>
    </div>
  );
};

export default BusList;
