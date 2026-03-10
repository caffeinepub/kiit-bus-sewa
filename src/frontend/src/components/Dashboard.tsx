import { Button } from "@/components/ui/button";
import { Bus, LogOut, MapPin, Navigation, Search } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import type React from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import AnimatedBackground from "./AnimatedBackground";

const CAMPUSES = [
  {
    name: "Campus 1",
    desc: "School of Computer Engineering",
    lat: 20.354,
    lng: 85.8198,
    bus: "KBS-01",
  },
  {
    name: "Campus 2",
    desc: "School of Electronics",
    lat: 20.3545,
    lng: 85.821,
    bus: "KBS-02",
  },
  {
    name: "Campus 3",
    desc: "School of Mechanical Engineering",
    lat: 20.3535,
    lng: 85.8185,
    bus: "KBS-03",
  },
  {
    name: "Campus 4",
    desc: "School of Civil Engineering",
    lat: 20.3528,
    lng: 85.8172,
    bus: "KBS-04",
  },
  {
    name: "Campus 5",
    desc: "School of Electrical Engineering",
    lat: 20.355,
    lng: 85.822,
    bus: "KBS-05",
  },
  {
    name: "Campus 6",
    desc: "School of Chemical Engineering",
    lat: 20.3522,
    lng: 85.816,
    bus: "KBS-06",
  },
  {
    name: "Campus 7",
    desc: "School of Biotechnology",
    lat: 20.356,
    lng: 85.8235,
    bus: "KBS-07",
  },
  {
    name: "Campus 8",
    desc: "School of Law",
    lat: 20.3515,
    lng: 85.8148,
    bus: "KBS-08",
  },
  {
    name: "Campus 9",
    desc: "School of Management",
    lat: 20.357,
    lng: 85.8248,
    bus: "KBS-09",
  },
  {
    name: "Campus 10",
    desc: "School of Mass Communication",
    lat: 20.351,
    lng: 85.8135,
    bus: "KBS-10",
  },
  {
    name: "Campus 11",
    desc: "School of Architecture",
    lat: 20.358,
    lng: 85.826,
    bus: "KBS-11",
  },
  {
    name: "Campus 12",
    desc: "School of Applied Sciences",
    lat: 20.3505,
    lng: 85.8122,
    bus: "KBS-12",
  },
  {
    name: "Campus 13",
    desc: "School of Fashion Technology",
    lat: 20.359,
    lng: 85.8272,
    bus: "KBS-13",
  },
  {
    name: "Campus 14",
    desc: "School of Film & Media",
    lat: 20.3498,
    lng: 85.811,
    bus: "KBS-14",
  },
  {
    name: "Campus 15",
    desc: "School of Design",
    lat: 20.36,
    lng: 85.8285,
    bus: "KBS-15",
  },
  {
    name: "Campus 16",
    desc: "School of Rural Management",
    lat: 20.3492,
    lng: 85.8098,
    bus: "KBS-16",
  },
  {
    name: "Campus 17",
    desc: "School of Public Health",
    lat: 20.361,
    lng: 85.8298,
    bus: "KBS-17",
  },
  {
    name: "Campus 18",
    desc: "School of Dental Sciences",
    lat: 20.3485,
    lng: 85.8085,
    bus: "KBS-18",
  },
  {
    name: "Campus 19",
    desc: "School of Nursing",
    lat: 20.362,
    lng: 85.831,
    bus: "KBS-19",
  },
  {
    name: "Campus 20",
    desc: "School of Allied Health Sciences",
    lat: 20.3478,
    lng: 85.8072,
    bus: "KBS-20",
  },
  {
    name: "Campus 21",
    desc: "School of Hotel Management",
    lat: 20.363,
    lng: 85.8322,
    bus: "KBS-21",
  },
  {
    name: "Campus 22",
    desc: "School of Technology",
    lat: 20.3472,
    lng: 85.806,
    bus: "KBS-22",
  },
  {
    name: "Campus 23",
    desc: "School of Humanities",
    lat: 20.364,
    lng: 85.8335,
    bus: "KBS-23",
  },
  {
    name: "Campus 24",
    desc: "School of Social Sciences",
    lat: 20.3465,
    lng: 85.8048,
    bus: "KBS-24",
  },
  {
    name: "Campus 25",
    desc: "School of Education",
    lat: 20.365,
    lng: 85.8347,
    bus: "KBS-25",
  },
  {
    name: "KIMS",
    desc: "Kalinga Institute of Medical Sciences",
    lat: 20.352,
    lng: 85.819,
    bus: "KBS-26",
  },
  {
    name: "KISS",
    desc: "Kalinga Institute of Social Sciences",
    lat: 20.35,
    lng: 85.817,
    bus: "KBS-27",
  },
];

type Campus = (typeof CAMPUSES)[number];

interface DashboardProps {
  userEmail: string;
  onLogout: () => void;
  onTrack: (campus: Campus) => void;
}

const Dashboard: React.FC<DashboardProps> = ({
  userEmail,
  onLogout,
  onTrack,
}) => {
  const [search, setSearch] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [selected, setSelected] = useState<Campus | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(() => {
    if (!search.trim()) return CAMPUSES;
    const q = search.toLowerCase();
    return CAMPUSES.filter(
      (c) =>
        c.name.toLowerCase().includes(q) || c.desc.toLowerCase().includes(q),
    );
  }, [search]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSelect = (campus: Campus) => {
    setSelected(campus);
    setSearch(campus.name);
    setShowDropdown(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setSelected(null);
    setShowDropdown(true);
  };

  return (
    <div className="min-h-screen dashboard-bg flex flex-col relative overflow-hidden">
      <AnimatedBackground />

      {/* Top bar */}
      <header
        className="w-full py-3 px-5 flex items-center gap-3 sticky top-0 z-20"
        style={{
          background: "oklch(0.24 0.08 255 / 0.97)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid oklch(1 0 0 / 0.1)",
        }}
      >
        <div
          className="rounded-full overflow-hidden border-2 flex items-center justify-center shrink-0"
          style={{
            width: 38,
            height: 38,
            borderColor: "oklch(0.88 0.2 90 / 0.8)",
            background: "oklch(1 0 0 / 0.95)",
          }}
        >
          <img
            src="/assets/uploads/images-1-1.png"
            alt="KIIT Logo"
            style={{ width: 30, height: 30, objectFit: "contain" }}
          />
        </div>
        <div className="flex-1">
          <span
            className="font-display font-bold text-white text-base block"
            style={{ letterSpacing: "-0.01em" }}
          >
            KIIT Bus Sewa
          </span>
          <span
            className="text-xs font-body"
            style={{ color: "oklch(0.78 0.06 215)" }}
          >
            Welcome, {userEmail.split("@")[0]}
          </span>
        </div>
        <Button
          type="button"
          onClick={onLogout}
          data-ocid="dashboard.logout_button"
          variant="ghost"
          size="sm"
          className="text-white/70 hover:text-white hover:bg-white/10 rounded-xl"
        >
          <LogOut className="w-4 h-4 mr-1.5" />
          <span className="hidden sm:inline">Logout</span>
        </Button>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-4 py-10 relative z-10 gap-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <div className="flex items-center justify-center gap-2 mb-3">
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center"
              style={{
                background: "oklch(0.88 0.2 90)",
                boxShadow: "0 4px 16px oklch(0.88 0.2 90 / 0.5)",
              }}
            >
              <Bus
                className="w-5 h-5"
                style={{ color: "oklch(0.18 0.06 50)" }}
              />
            </div>
          </div>
          <h1
            className="font-display font-bold text-white"
            style={{
              fontSize: "clamp(1.6rem, 4vw, 2.4rem)",
              textShadow: "0 2px 16px oklch(0 0 0 / 0.4)",
              letterSpacing: "-0.02em",
            }}
          >
            Where are you going?
          </h1>
          <p
            className="mt-2 text-sm font-body"
            style={{ color: "oklch(0.80 0.05 215)" }}
          >
            Choose your destination campus to find your bus
          </p>
        </motion.div>

        {/* Search card */}
        <motion.div
          initial={{ opacity: 0, y: 32, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
          className="w-full max-w-lg"
        >
          <div
            className="rounded-2xl overflow-hidden"
            style={{
              background: "oklch(1 0 0 / 0.97)",
              boxShadow:
                "0 24px 64px oklch(0 0 0 / 0.3), 0 4px 16px oklch(0 0 0 / 0.15)",
              border: "1px solid oklch(1 0 0 / 0.4)",
            }}
          >
            <div
              style={{
                height: "4px",
                background:
                  "linear-gradient(90deg, oklch(0.88 0.2 90) 0%, oklch(0.24 0.08 255) 100%)",
              }}
            />
            <div className="p-6">
              {/* Uber-style search */}
              <div className="relative">
                <div className="relative">
                  <Search
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
                    style={{ color: "oklch(0.55 0.04 230)" }}
                  />
                  <input
                    ref={inputRef}
                    type="text"
                    placeholder="Search destination (e.g. Campus 1, KIMS, Law...)"
                    value={search}
                    onChange={handleInputChange}
                    onFocus={() => setShowDropdown(true)}
                    data-ocid="dashboard.search_input"
                    className="w-full h-12 pl-10 pr-4 rounded-xl font-body text-sm outline-none transition-all"
                    style={{
                      border: "2px solid oklch(0.84 0.04 220)",
                      background: "oklch(0.97 0.01 220)",
                      color: "oklch(0.22 0.06 240)",
                    }}
                    autoComplete="off"
                    aria-label="Search destination campus"
                    aria-expanded={showDropdown}
                    aria-haspopup="listbox"
                  />
                </div>

                {/* Dropdown */}
                <AnimatePresence>
                  {showDropdown && (
                    <motion.div
                      ref={dropdownRef}
                      initial={{ opacity: 0, y: -8, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.98 }}
                      transition={{ duration: 0.18 }}
                      className="absolute left-0 right-0 top-14 z-30 rounded-xl overflow-hidden"
                      style={{
                        background: "oklch(1 0 0)",
                        border: "1.5px solid oklch(0.88 0.03 220)",
                        boxShadow:
                          "0 16px 48px oklch(0 0 0 / 0.18), 0 4px 12px oklch(0 0 0 / 0.08)",
                        maxHeight: 300,
                        overflowY: "auto",
                      }}
                      aria-label="Campus options"
                    >
                      {filtered.length === 0 ? (
                        <div
                          className="px-4 py-8 text-center"
                          data-ocid="dashboard.destination_select"
                        >
                          <MapPin
                            className="w-8 h-8 mx-auto mb-2"
                            style={{ color: "oklch(0.72 0.04 225)" }}
                          />
                          <p
                            className="text-sm font-body"
                            style={{ color: "oklch(0.55 0.04 230)" }}
                          >
                            No campuses found
                          </p>
                        </div>
                      ) : (
                        filtered.map((campus, i) => (
                          <button
                            key={campus.name}
                            type="button"
                            aria-selected={selected?.name === campus.name}
                            onClick={() => handleSelect(campus)}
                            data-ocid="dashboard.destination_select"
                            className="w-full px-4 py-3 flex items-center gap-3 text-left transition-colors hover:bg-blue-50 focus:outline-none"
                            style={{
                              background:
                                selected?.name === campus.name
                                  ? "oklch(0.92 0.05 215)"
                                  : i % 2 === 0
                                    ? "oklch(1 0 0)"
                                    : "oklch(0.98 0.01 218)",
                              borderBottom:
                                i < filtered.length - 1
                                  ? "1px solid oklch(0.94 0.02 220)"
                                  : "none",
                            }}
                          >
                            <div
                              className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                              style={{
                                background: "oklch(0.24 0.08 255 / 0.08)",
                              }}
                            >
                              <MapPin
                                className="w-4 h-4"
                                style={{ color: "oklch(0.24 0.08 255)" }}
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p
                                className="font-body font-semibold text-sm truncate"
                                style={{ color: "oklch(0.22 0.08 255)" }}
                              >
                                {campus.name}
                              </p>
                              <p
                                className="font-body text-xs truncate"
                                style={{ color: "oklch(0.55 0.04 230)" }}
                              >
                                {campus.desc}
                              </p>
                            </div>
                            <span
                              className="text-xs font-body font-bold px-2 py-0.5 rounded-full shrink-0"
                              style={{
                                background: "oklch(0.88 0.2 90 / 0.15)",
                                color: "oklch(0.55 0.18 75)",
                              }}
                            >
                              {campus.bus}
                            </span>
                          </button>
                        ))
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Selected banner */}
              <AnimatePresence>
                {selected && (
                  <motion.div
                    initial={{ opacity: 0, y: 12, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 12, scale: 0.97 }}
                    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    className="mt-5"
                  >
                    {/* Bus assignment banner */}
                    <div
                      className="rounded-xl p-4 flex items-center gap-3 mb-4"
                      style={{
                        background:
                          "linear-gradient(135deg, oklch(0.88 0.2 90 / 0.15) 0%, oklch(0.82 0.14 85 / 0.10) 100%)",
                        border: "1.5px solid oklch(0.88 0.2 90 / 0.5)",
                      }}
                    >
                      <div
                        className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                        style={{
                          background: "oklch(0.88 0.2 90)",
                          boxShadow: "0 4px 12px oklch(0.88 0.2 90 / 0.5)",
                        }}
                      >
                        <Bus
                          className="w-6 h-6"
                          style={{ color: "oklch(0.18 0.06 50)" }}
                        />
                      </div>
                      <div className="flex-1">
                        <p
                          className="font-display font-bold text-base"
                          style={{ color: "oklch(0.22 0.08 60)" }}
                        >
                          Bus{" "}
                          <span style={{ color: "oklch(0.55 0.18 75)" }}>
                            {selected.bus}
                          </span>{" "}
                          is going to {selected.name}
                        </p>
                        <p
                          className="text-xs font-body mt-0.5"
                          style={{ color: "oklch(0.45 0.06 55)" }}
                        >
                          {selected.desc}
                        </p>
                      </div>
                    </div>

                    {/* Track button */}
                    <Button
                      type="button"
                      onClick={() => onTrack(selected)}
                      data-ocid="dashboard.track_button"
                      className="w-full h-12 font-body font-bold text-base rounded-xl"
                      style={{
                        background: "oklch(0.50 0.16 145)",
                        color: "oklch(0.98 0 0)",
                        boxShadow: "0 4px 16px oklch(0.50 0.16 145 / 0.4)",
                      }}
                    >
                      <Navigation className="w-4 h-4 mr-2" />
                      Track Live Location
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>

              {!selected && (
                <p
                  className="mt-4 text-xs font-body text-center"
                  style={{ color: "oklch(0.62 0.04 225)" }}
                >
                  <MapPin className="w-3 h-3 inline mr-1" />
                  27 locations · Live GPS tracking every 20 seconds
                </p>
              )}
            </div>
          </div>
        </motion.div>
      </main>

      <footer className="py-4 px-6 text-center relative z-10">
        <p
          className="text-xs font-body"
          style={{
            color: "oklch(0.70 0.03 220)",
            textShadow: "0 1px 3px oklch(0 0 0 / 0.2)",
          }}
        >
          &copy; {new Date().getFullYear()}. Built with{" "}
          <span style={{ color: "oklch(0.88 0.2 90)" }}>♥</span> using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2"
            style={{ color: "oklch(0.78 0.12 255)" }}
          >
            caffeine.ai
          </a>
        </p>
      </footer>
    </div>
  );
};

export { CAMPUSES };
export type { Campus };
export default Dashboard;
