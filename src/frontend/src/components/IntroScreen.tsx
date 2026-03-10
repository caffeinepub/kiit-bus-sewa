import { AnimatePresence, motion } from "motion/react";
import type React from "react";
import { useEffect, useState } from "react";
import SchoolBusSVG from "./SchoolBusSVG";

const ROAD_DASHES = [
  "rd1",
  "rd2",
  "rd3",
  "rd4",
  "rd5",
  "rd6",
  "rd7",
  "rd8",
  "rd9",
  "rd10",
  "rd11",
  "rd12",
  "rd13",
  "rd14",
  "rd15",
  "rd16",
  "rd17",
  "rd18",
  "rd19",
  "rd20",
];

interface IntroScreenProps {
  onComplete: () => void;
}

const IntroScreen: React.FC<IntroScreenProps> = ({ onComplete }) => {
  const [showText, setShowText] = useState(false);
  const [phase, setPhase] = useState<"driving" | "arrived" | "exiting">(
    "driving",
  );

  useEffect(() => {
    // Show welcome text when bus reaches near center (~1.6s into animation)
    const textTimer = setTimeout(() => setShowText(true), 1600);

    // Start exit fade
    const exitTimer = setTimeout(() => setPhase("exiting"), 4000);

    // Transition to login
    const completeTimer = setTimeout(() => onComplete(), 4600);

    return () => {
      clearTimeout(textTimer);
      clearTimeout(exitTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  useEffect(() => {
    if (phase === "exiting") {
      // nothing extra needed — AnimatePresence handles it
    }
  }, [phase]);

  return (
    <AnimatePresence>
      {phase !== "exiting" ? (
        <motion.div
          key="intro"
          className="fixed inset-0 z-50 sky-bg overflow-hidden"
          initial={{ opacity: 1 }}
          exit={{
            opacity: 0,
            transition: { duration: 0.6, ease: "easeInOut" },
          }}
        >
          {/* Sun */}
          <div
            className="absolute top-12 right-16 rounded-full"
            style={{
              width: 64,
              height: 64,
              background:
                "radial-gradient(circle, oklch(0.95 0.2 85) 0%, oklch(0.85 0.18 80) 60%, transparent 100%)",
              boxShadow:
                "0 0 40px oklch(0.88 0.2 90 / 0.6), 0 0 80px oklch(0.88 0.2 90 / 0.25)",
            }}
          />

          {/* Clouds */}
          <div className="animate-cloud-1 absolute top-8 left-24 opacity-80">
            <Cloud />
          </div>
          <div className="animate-cloud-2 absolute top-20 left-[45%] opacity-65">
            <Cloud small />
          </div>
          <div className="animate-cloud-1 absolute top-6 right-36 opacity-55">
            <Cloud small />
          </div>

          {/* Road */}
          <div
            className="absolute bottom-0 left-0 right-0"
            style={{ height: "80px" }}
          >
            {/* Road surface */}
            <div
              className="absolute bottom-0 left-0 right-0"
              style={{
                height: "70px",
                background: "oklch(0.40 0.02 240)",
                borderTop: "4px solid oklch(0.35 0.02 240)",
              }}
            />

            {/* Road dashes */}
            <div
              className="absolute overflow-hidden left-0 right-0"
              style={{ bottom: "30px", height: "8px" }}
            >
              <div
                className="animate-road-lines flex gap-0"
                style={{ width: "200%" }}
              >
                {ROAD_DASHES.map((id) => (
                  <div
                    key={id}
                    style={{
                      width: "60px",
                      height: "8px",
                      marginRight: "20px",
                      flexShrink: 0,
                      background: "oklch(0.90 0.08 85)",
                      borderRadius: "2px",
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Kerb */}
            <div
              className="absolute bottom-0 left-0 right-0"
              style={{ height: "10px", background: "oklch(0.80 0.03 90)" }}
            />
            {/* Grass strip */}
            <div
              className="absolute bottom-0 left-0 right-0"
              style={{ height: "6px", background: "oklch(0.68 0.14 145)" }}
            />
          </div>

          {/* Bus + welcome text centred */}
          <div
            className="absolute inset-0 flex flex-col items-center justify-center"
            style={{ paddingBottom: "60px" }}
          >
            {/* Bus driving in */}
            <motion.div
              className="animate-bus-bounce"
              initial={{ x: "-100vw", opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{
                duration: 1.4,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              <SchoolBusSVG
                width={320}
                height={160}
                animate
                className="drop-shadow-[0_8px_24px_oklch(0.24_0.08_255/0.25)]"
              />
            </motion.div>

            {/* Welcome text */}
            <AnimatePresence>
              {showText && (
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, ease: "easeOut" }}
                  className="mt-8 text-center"
                >
                  <p
                    className="text-sm font-body font-semibold tracking-[0.25em] uppercase mb-2"
                    style={{
                      color: "oklch(0.35 0.06 230)",
                      letterSpacing: "0.3em",
                    }}
                  >
                    Kalinga Institute of Industrial Technology
                  </p>
                  <h1
                    className="font-display font-bold leading-tight"
                    style={{
                      fontSize: "clamp(1.8rem, 5vw, 2.8rem)",
                      color: "oklch(0.22 0.08 255)",
                      textShadow: "0 2px 12px oklch(0.24 0.08 255 / 0.15)",
                    }}
                  >
                    Welcome to{" "}
                    <span style={{ color: "oklch(0.62 0.18 75)" }}>KIIT</span>{" "}
                    <span style={{ color: "oklch(0.24 0.08 255)" }}>
                      Bus Sewa
                    </span>
                  </h1>
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4, duration: 0.5 }}
                    className="mt-3 font-body text-base"
                    style={{ color: "oklch(0.45 0.06 225)" }}
                  >
                    Your safe & reliable campus transport
                  </motion.p>

                  {/* Loading dots */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="mt-5 flex items-center justify-center gap-1.5"
                  >
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        animate={{ scale: [1, 1.4, 1], opacity: [0.5, 1, 0.5] }}
                        transition={{
                          duration: 0.8,
                          repeat: Number.POSITIVE_INFINITY,
                          delay: i * 0.2,
                        }}
                        className="rounded-full"
                        style={{
                          width: 8,
                          height: 8,
                          background: "oklch(0.62 0.18 75)",
                        }}
                      />
                    ))}
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Trees on ground */}
          <div className="absolute bottom-[70px] left-8">
            <Tree />
          </div>
          <div className="absolute bottom-[70px] right-12">
            <Tree />
          </div>
          <div className="absolute bottom-[70px] right-36">
            <Tree small />
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
};

/* ── Helper components ───────────────────────────────────── */

const Cloud: React.FC<{ small?: boolean }> = ({ small = false }) => {
  const scale = small ? 0.7 : 1;
  return (
    <svg
      width={120 * scale}
      height={50 * scale}
      viewBox="0 0 120 50"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Cloud"
    >
      <ellipse cx="60" cy="35" rx="55" ry="18" fill="white" fillOpacity="0.9" />
      <ellipse cx="40" cy="28" rx="28" ry="22" fill="white" fillOpacity="0.9" />
      <ellipse cx="75" cy="25" rx="22" ry="18" fill="white" fillOpacity="0.9" />
      <ellipse cx="55" cy="22" rx="20" ry="16" fill="white" fillOpacity="0.9" />
    </svg>
  );
};

const Tree: React.FC<{ small?: boolean }> = ({ small = false }) => {
  const h = small ? 40 : 56;
  const w = small ? 28 : 40;
  return (
    <svg
      width={w}
      height={h}
      viewBox="0 0 40 56"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Tree"
    >
      <rect
        x="17"
        y="38"
        width="6"
        height="18"
        rx="2"
        fill="oklch(0.52 0.1 55)"
      />
      <polygon points="20,4 36,38 4,38" fill="oklch(0.50 0.14 145)" />
      <polygon points="20,12 34,36 6,36" fill="oklch(0.58 0.15 142)" />
    </svg>
  );
};

export default IntroScreen;
