import type React from "react";

interface Particle {
  id: number;
  size: number;
  left: string;
  delay: string;
  duration: string;
  opacity: number;
}

const PARTICLES: Particle[] = [
  { id: 1, size: 4, left: "8%", delay: "0s", duration: "9s", opacity: 0.35 },
  {
    id: 2,
    size: 6,
    left: "18%",
    delay: "1.2s",
    duration: "11s",
    opacity: 0.25,
  },
  { id: 3, size: 3, left: "29%", delay: "2.5s", duration: "8s", opacity: 0.4 },
  { id: 4, size: 5, left: "42%", delay: "0.7s", duration: "13s", opacity: 0.2 },
  { id: 5, size: 4, left: "55%", delay: "3.1s", duration: "10s", opacity: 0.3 },
  {
    id: 6,
    size: 7,
    left: "63%",
    delay: "1.8s",
    duration: "12s",
    opacity: 0.22,
  },
  { id: 7, size: 3, left: "74%", delay: "4.0s", duration: "9s", opacity: 0.38 },
  {
    id: 8,
    size: 5,
    left: "82%",
    delay: "0.4s",
    duration: "14s",
    opacity: 0.18,
  },
  {
    id: 9,
    size: 4,
    left: "91%",
    delay: "2.2s",
    duration: "11s",
    opacity: 0.28,
  },
  {
    id: 10,
    size: 6,
    left: "48%",
    delay: "5.5s",
    duration: "10s",
    opacity: 0.24,
  },
];

interface AnimBus {
  id: number;
  top: string;
  scale: number;
  duration: string;
  delay: string;
  opacity: number;
  flip: boolean;
}

const ANIMATED_BUSES: AnimBus[] = [
  {
    id: 1,
    top: "12%",
    scale: 0.45,
    duration: "22s",
    delay: "0s",
    opacity: 0.08,
    flip: false,
  },
  {
    id: 2,
    top: "35%",
    scale: 0.32,
    duration: "30s",
    delay: "8s",
    opacity: 0.06,
    flip: true,
  },
  {
    id: 3,
    top: "58%",
    scale: 0.55,
    duration: "18s",
    delay: "4s",
    opacity: 0.07,
    flip: false,
  },
  {
    id: 4,
    top: "78%",
    scale: 0.28,
    duration: "35s",
    delay: "14s",
    opacity: 0.05,
    flip: true,
  },
];

/** Inline bus SVG for background animation */
const BgBusSVG: React.FC<{ flip?: boolean }> = ({ flip = false }) => (
  <svg
    viewBox="0 0 200 80"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
    style={{
      transform: flip ? "scaleX(-1)" : undefined,
      width: "100%",
      height: "100%",
    }}
  >
    {/* Body */}
    <rect x="10" y="18" width="170" height="42" rx="6" fill="currentColor" />
    {/* Roof bump */}
    <rect x="20" y="8" width="148" height="14" rx="4" fill="currentColor" />
    {/* Front */}
    <rect
      x="155"
      y="22"
      width="20"
      height="32"
      rx="3"
      fill="currentColor"
      opacity="0.6"
    />
    {/* Windows */}
    <rect
      x="24"
      y="24"
      width="22"
      height="14"
      rx="2"
      fill="white"
      opacity="0.4"
    />
    <rect
      x="54"
      y="24"
      width="22"
      height="14"
      rx="2"
      fill="white"
      opacity="0.4"
    />
    <rect
      x="84"
      y="24"
      width="22"
      height="14"
      rx="2"
      fill="white"
      opacity="0.4"
    />
    <rect
      x="114"
      y="24"
      width="22"
      height="14"
      rx="2"
      fill="white"
      opacity="0.4"
    />
    <rect
      x="144"
      y="24"
      width="14"
      height="14"
      rx="2"
      fill="white"
      opacity="0.3"
    />
    {/* Door */}
    <rect
      x="24"
      y="40"
      width="16"
      height="18"
      rx="2"
      fill="white"
      opacity="0.25"
    />
    {/* Wheels */}
    <circle cx="48" cy="62" r="12" fill="currentColor" opacity="0.7" />
    <circle cx="48" cy="62" r="6" fill="white" opacity="0.2" />
    <circle cx="148" cy="62" r="12" fill="currentColor" opacity="0.7" />
    <circle cx="148" cy="62" r="6" fill="white" opacity="0.2" />
    {/* Headlights */}
    <rect
      x="168"
      y="28"
      width="10"
      height="6"
      rx="1"
      fill="white"
      opacity="0.5"
    />
    <rect
      x="168"
      y="38"
      width="10"
      height="6"
      rx="1"
      fill="white"
      opacity="0.35"
    />
  </svg>
);

const AnimatedBackground: React.FC = () => {
  return (
    <div
      className="animated-bg-layer"
      aria-hidden="true"
      style={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        pointerEvents: "none",
        zIndex: 0,
      }}
    >
      {/* ── Floating gradient orbs ── */}
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />
      <div className="orb orb-4" />
      <div className="orb orb-5" />

      {/* ── Subtle floating particles ── */}
      {PARTICLES.map((p) => (
        <div
          key={p.id}
          className="float-particle"
          style={{
            width: p.size,
            height: p.size,
            left: p.left,
            bottom: "-12px",
            animationDelay: p.delay,
            animationDuration: p.duration,
            opacity: p.opacity,
          }}
        />
      ))}

      {/* ── Animated drifting buses ── */}
      {ANIMATED_BUSES.map((b) => (
        <div
          key={b.id}
          style={{
            position: "absolute",
            top: b.top,
            left: b.flip ? "100%" : "-220px",
            width: `${200 * b.scale}px`,
            height: `${80 * b.scale}px`,
            opacity: b.opacity,
            color: "oklch(0.24 0.08 255)",
            animation: `drift-bus-${b.flip ? "rtl" : "ltr"} ${b.duration} ${b.delay} infinite linear`,
          }}
        >
          <BgBusSVG flip={b.flip} />
        </div>
      ))}
    </div>
  );
};

export default AnimatedBackground;
