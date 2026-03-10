import type React from "react";

interface SchoolBusSVGProps {
  className?: string;
  width?: number;
  height?: number;
  /** If true, wheels animate spinning */
  animate?: boolean;
}

const SchoolBusSVG: React.FC<SchoolBusSVGProps> = ({
  className = "",
  width = 280,
  height = 140,
  animate = false,
}) => {
  const wheelClass = animate ? "animate-wheel" : "";

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 280 140"
      width={width}
      height={height}
      className={className}
      role="img"
      aria-label="KIIT School Bus"
    >
      {/* Drop shadow */}
      <ellipse
        cx="140"
        cy="136"
        rx="110"
        ry="6"
        fill="oklch(0.18 0.03 240 / 0.2)"
      />

      {/* Bus body main */}
      <rect
        x="18"
        y="42"
        width="240"
        height="78"
        rx="10"
        ry="10"
        fill="oklch(0.88 0.2 90)"
      />

      {/* Bus body top (slightly darker for depth) */}
      <rect
        x="28"
        y="30"
        width="190"
        height="52"
        rx="8"
        ry="8"
        fill="oklch(0.88 0.2 90)"
      />

      {/* Roof highlight */}
      <rect
        x="34"
        y="30"
        width="175"
        height="10"
        rx="5"
        fill="oklch(0.94 0.15 88)"
      />

      {/* Black bumper front */}
      <rect
        x="252"
        y="68"
        width="14"
        height="30"
        rx="4"
        fill="oklch(0.22 0 0)"
      />

      {/* Black bumper rear */}
      <rect
        x="14"
        y="68"
        width="10"
        height="30"
        rx="4"
        fill="oklch(0.22 0 0)"
      />

      {/* Hood / front section */}
      <rect
        x="224"
        y="46"
        width="34"
        height="58"
        rx="6"
        fill="oklch(0.82 0.18 85)"
      />

      {/* Front windshield */}
      <rect
        x="226"
        y="38"
        width="28"
        height="32"
        rx="5"
        fill="oklch(0.72 0.08 215 / 0.85)"
      />
      <rect
        x="228"
        y="40"
        width="24"
        height="28"
        rx="3"
        fill="oklch(0.82 0.06 210 / 0.7)"
      />

      {/* Windshield glare */}
      <rect
        x="230"
        y="42"
        width="8"
        height="12"
        rx="2"
        fill="oklch(1 0 0 / 0.45)"
      />

      {/* Headlight */}
      <circle cx="254" cy="80" r="6" fill="oklch(0.98 0.05 75)" />
      <circle cx="254" cy="80" r="4" fill="oklch(1 0.02 70)" />

      {/* Door */}
      <rect
        x="180"
        y="60"
        width="26"
        height="44"
        rx="3"
        fill="oklch(0.80 0.17 82)"
      />
      <rect
        x="188"
        y="62"
        width="3"
        height="38"
        rx="1"
        fill="oklch(0.70 0.15 78)"
      />
      <circle cx="182" cy="82" r="3" fill="oklch(0.55 0.03 240)" />

      {/* Windows */}
      {/* Window 1 */}
      <rect
        x="36"
        y="36"
        width="32"
        height="24"
        rx="4"
        fill="oklch(0.72 0.08 215 / 0.8)"
      />
      <rect
        x="38"
        y="38"
        width="28"
        height="20"
        rx="3"
        fill="oklch(0.82 0.06 210 / 0.65)"
      />
      <rect
        x="40"
        y="40"
        width="10"
        height="8"
        rx="2"
        fill="oklch(1 0 0 / 0.4)"
      />

      {/* Window 2 */}
      <rect
        x="78"
        y="36"
        width="32"
        height="24"
        rx="4"
        fill="oklch(0.72 0.08 215 / 0.8)"
      />
      <rect
        x="80"
        y="38"
        width="28"
        height="20"
        rx="3"
        fill="oklch(0.82 0.06 210 / 0.65)"
      />
      <rect
        x="82"
        y="40"
        width="10"
        height="8"
        rx="2"
        fill="oklch(1 0 0 / 0.4)"
      />

      {/* Window 3 */}
      <rect
        x="120"
        y="36"
        width="32"
        height="24"
        rx="4"
        fill="oklch(0.72 0.08 215 / 0.8)"
      />
      <rect
        x="122"
        y="38"
        width="28"
        height="20"
        rx="3"
        fill="oklch(0.82 0.06 210 / 0.65)"
      />
      <rect
        x="124"
        y="40"
        width="10"
        height="8"
        rx="2"
        fill="oklch(1 0 0 / 0.4)"
      />

      {/* Window 4 */}
      <rect
        x="162"
        y="36"
        width="32"
        height="24"
        rx="4"
        fill="oklch(0.72 0.08 215 / 0.8)"
      />
      <rect
        x="164"
        y="38"
        width="28"
        height="20"
        rx="3"
        fill="oklch(0.82 0.06 210 / 0.65)"
      />
      <rect
        x="166"
        y="40"
        width="10"
        height="8"
        rx="2"
        fill="oklch(1 0 0 / 0.4)"
      />

      {/* Black stripe */}
      <rect x="14" y="96" width="253" height="8" rx="0" fill="oklch(0.2 0 0)" />

      {/* "SCHOOL BUS" text stripe (black on yellow) */}
      <rect
        x="18"
        y="56"
        width="195"
        height="10"
        rx="2"
        fill="oklch(0.22 0 0)"
      />
      <text
        x="115"
        y="65"
        textAnchor="middle"
        fontFamily="Arial, sans-serif"
        fontWeight="bold"
        fontSize="7.5"
        fill="oklch(0.88 0.2 90)"
        letterSpacing="2"
      >
        KIIT BUS SEWA
      </text>

      {/* Undercarriage */}
      <rect
        x="28"
        y="112"
        width="218"
        height="8"
        rx="2"
        fill="oklch(0.45 0.02 240)"
      />

      {/* Wheel wells */}
      <ellipse cx="72" cy="122" rx="28" ry="16" fill="oklch(0.22 0 0)" />
      <ellipse cx="210" cy="122" rx="28" ry="16" fill="oklch(0.22 0 0)" />

      {/* Rear wheel */}
      <g className={wheelClass} style={{ transformOrigin: "72px 122px" }}>
        <circle cx="72" cy="122" r="20" fill="oklch(0.28 0.01 240)" />
        <circle cx="72" cy="122" r="14" fill="oklch(0.55 0.02 240)" />
        <circle cx="72" cy="122" r="7" fill="oklch(0.78 0.12 88)" />
        {/* Spokes */}
        <line
          x1="72"
          y1="108"
          x2="72"
          y2="136"
          stroke="oklch(0.32 0.01 240)"
          strokeWidth="3"
        />
        <line
          x1="58"
          y1="122"
          x2="86"
          y2="122"
          stroke="oklch(0.32 0.01 240)"
          strokeWidth="3"
        />
        <line
          x1="62.1"
          y1="112.1"
          x2="81.9"
          y2="131.9"
          stroke="oklch(0.32 0.01 240)"
          strokeWidth="2.5"
        />
        <line
          x1="81.9"
          y1="112.1"
          x2="62.1"
          y2="131.9"
          stroke="oklch(0.32 0.01 240)"
          strokeWidth="2.5"
        />
      </g>

      {/* Front wheel */}
      <g className={wheelClass} style={{ transformOrigin: "210px 122px" }}>
        <circle cx="210" cy="122" r="20" fill="oklch(0.28 0.01 240)" />
        <circle cx="210" cy="122" r="14" fill="oklch(0.55 0.02 240)" />
        <circle cx="210" cy="122" r="7" fill="oklch(0.78 0.12 88)" />
        {/* Spokes */}
        <line
          x1="210"
          y1="108"
          x2="210"
          y2="136"
          stroke="oklch(0.32 0.01 240)"
          strokeWidth="3"
        />
        <line
          x1="196"
          y1="122"
          x2="224"
          y2="122"
          stroke="oklch(0.32 0.01 240)"
          strokeWidth="3"
        />
        <line
          x1="200.1"
          y1="112.1"
          x2="219.9"
          y2="131.9"
          stroke="oklch(0.32 0.01 240)"
          strokeWidth="2.5"
        />
        <line
          x1="219.9"
          y1="112.1"
          x2="200.1"
          y2="131.9"
          stroke="oklch(0.32 0.01 240)"
          strokeWidth="2.5"
        />
      </g>

      {/* Exhaust pipe */}
      <rect
        x="18"
        y="86"
        width="8"
        height="4"
        rx="2"
        fill="oklch(0.35 0.01 240)"
      />
      <ellipse
        cx="13"
        cy="88"
        rx="5"
        ry="3"
        fill="oklch(0.55 0.01 240 / 0.5)"
      />

      {/* Tail light */}
      <rect
        x="18"
        y="70"
        width="6"
        height="12"
        rx="2"
        fill="oklch(0.65 0.24 25)"
      />
    </svg>
  );
};

export default SchoolBusSVG;
