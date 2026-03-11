import { MapPin, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import type React from "react";
import { useEffect, useId, useRef, useState } from "react";
import { type KIITCampus, KIIT_CAMPUSES } from "../data/campuses";

interface LocationSearchInputProps {
  placeholder: string;
  value: string;
  onSelect: (campus: KIITCampus) => void;
  onClear: () => void;
  excludeCampusId?: string;
  color: "green" | "blue";
  label: string;
  dataOcid: string;
}

const LocationSearchInput: React.FC<LocationSearchInputProps> = ({
  placeholder,
  value,
  onSelect,
  onClear,
  excludeCampusId,
  color,
  label,
  dataOcid,
}) => {
  const inputId = useId();
  const [query, setQuery] = useState(value);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync query with controlled value
  useEffect(() => {
    setQuery(value);
  }, [value]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
        if (value === "" && query !== "") {
          setQuery("");
        }
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [value, query]);

  const filtered = KIIT_CAMPUSES.filter((c) => {
    if (excludeCampusId && c.id === excludeCampusId) return false;
    if (!query) return true;
    const q = query.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      c.description.toLowerCase().includes(q)
    );
  });

  const dotColor =
    color === "green" ? "oklch(0.55 0.18 145)" : "oklch(0.50 0.2 245)";

  const selectedBg =
    color === "green" ? "oklch(0.96 0.04 145)" : "oklch(0.95 0.04 245)";
  const hoverBg =
    color === "green" ? "oklch(0.97 0.03 145)" : "oklch(0.97 0.03 245)";
  const dotBg =
    color === "green" ? "oklch(0.92 0.08 145)" : "oklch(0.92 0.07 245)";

  const handleSelect = (campus: KIITCampus) => {
    setQuery(campus.name);
    setIsOpen(false);
    onSelect(campus);
  };

  const handleClear = () => {
    setQuery("");
    onClear();
    setIsOpen(false);
    inputRef.current?.focus();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    setIsOpen(true);
    if (e.target.value === "") {
      onClear();
    }
  };

  const handleFocus = () => {
    setIsOpen(true);
  };

  const borderStyle = isOpen
    ? "2px solid oklch(0.24 0.08 255 / 0.6)"
    : "1px solid oklch(0.84 0.04 220)";

  const boxShadowStyle = isOpen
    ? "0 0 0 3px oklch(0.24 0.08 255 / 0.08)"
    : "none";

  return (
    <div className="space-y-1.5" ref={containerRef}>
      <label
        htmlFor={inputId}
        className="text-xs font-body font-semibold uppercase tracking-wide"
        style={{ color: "oklch(0.52 0.04 230)" }}
      >
        {label}
      </label>
      <div className="relative">
        {/* Left colored dot */}
        <div
          className="absolute left-3 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full shrink-0 z-10"
          style={{ background: dotColor }}
        />

        {/* Search input */}
        <input
          id={inputId}
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={handleFocus}
          placeholder={placeholder}
          data-ocid={dataOcid}
          autoComplete="off"
          className="w-full h-12 pl-8 pr-10 rounded-xl font-body text-sm outline-none transition-all duration-200"
          style={{
            border: borderStyle,
            background: "oklch(0.97 0.01 220)",
            color: "oklch(0.18 0.04 240)",
            boxShadow: boxShadowStyle,
          }}
        />

        {/* Right: clear button or map pin */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          {query ? (
            <button
              type="button"
              onClick={handleClear}
              className="flex items-center justify-center w-5 h-5 rounded-full transition-colors hover:opacity-80"
              style={{
                background: "oklch(0.75 0.04 220)",
                color: "oklch(0.40 0.04 230)",
              }}
              aria-label="Clear selection"
            >
              <X className="w-3 h-3" />
            </button>
          ) : (
            <MapPin
              className="w-4 h-4"
              style={{ color: "oklch(0.65 0.04 230)" }}
            />
          )}
        </div>

        {/* Dropdown suggestions */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              aria-label={`${label} suggestions`}
              initial={{ opacity: 0, y: -6, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.98 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className="absolute left-0 right-0 top-[calc(100%+6px)] z-50 rounded-2xl"
              style={{
                background: "oklch(1 0 0)",
                border: "1px solid oklch(0.88 0.03 220)",
                boxShadow:
                  "0 16px 48px oklch(0.24 0.08 255 / 0.14), 0 4px 12px oklch(0.24 0.08 255 / 0.07)",
                maxHeight: "320px",
                overflowY: "auto",
              }}
            >
              {/* Sticky header with KIIT logo */}
              <div
                className="sticky top-0 flex items-center gap-2 px-4 py-2.5 z-10"
                style={{
                  background: "oklch(0.97 0.02 220)",
                  borderBottom: "1px solid oklch(0.90 0.03 220)",
                }}
              >
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center overflow-hidden shrink-0"
                  style={{
                    background: "oklch(1 0 0)",
                    border: "1px solid oklch(0.85 0.08 145)",
                  }}
                >
                  <img
                    src="/assets/uploads/images-2-1.png"
                    alt="KIIT"
                    style={{ width: 20, height: 20, objectFit: "contain" }}
                  />
                </div>
                <span
                  className="text-xs font-body font-semibold"
                  style={{ color: "oklch(0.35 0.06 240)" }}
                >
                  KIIT Campuses
                </span>
                <span
                  className="ml-auto text-xs font-body"
                  style={{ color: "oklch(0.58 0.04 230)" }}
                >
                  {filtered.length} found
                </span>
              </div>

              {filtered.length === 0 ? (
                <div
                  className="px-4 py-5 text-sm font-body text-center"
                  style={{ color: "oklch(0.60 0.04 230)" }}
                >
                  No campus found
                </div>
              ) : (
                <div>
                  {filtered.map((campus) => (
                    <button
                      key={campus.id}
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => handleSelect(campus)}
                      className="w-full px-4 py-3 flex items-center gap-3 transition-colors duration-100"
                      style={{
                        background:
                          value === campus.name ? selectedBg : "transparent",
                      }}
                      onMouseEnter={(e) => {
                        (
                          e.currentTarget as HTMLButtonElement
                        ).style.background = hoverBg;
                      }}
                      onMouseLeave={(e) => {
                        (
                          e.currentTarget as HTMLButtonElement
                        ).style.background =
                          value === campus.name ? selectedBg : "transparent";
                      }}
                    >
                      {/* Colored dot circle */}
                      <div
                        className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
                        style={{ background: dotBg }}
                      >
                        <div
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ background: dotColor }}
                        />
                      </div>

                      {/* Campus info */}
                      <div className="flex-1 min-w-0 text-left">
                        <p
                          className="font-body font-semibold text-sm truncate"
                          style={{ color: "oklch(0.18 0.04 240)" }}
                        >
                          {campus.name}
                        </p>
                        <p
                          className="font-body text-xs truncate mt-0.5"
                          style={{ color: "oklch(0.58 0.04 230)" }}
                        >
                          {campus.description}
                        </p>
                      </div>

                      {/* Right map pin */}
                      <MapPin
                        className="w-3.5 h-3.5 shrink-0"
                        style={{ color: "oklch(0.75 0.03 230)" }}
                      />
                    </button>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default LocationSearchInput;
