import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertCircle,
  Bus,
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
  LogIn,
  UserPlus,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import type React from "react";
import { useState } from "react";
import { useActor } from "../hooks/useActor";

type StatusState =
  | { type: "idle" }
  | { type: "loading" }
  | { type: "success"; message: string }
  | { type: "error"; message: string };

type Mode = "login" | "register";

interface LoginPageProps {
  onSuccess?: (email: string) => void;
}

// Animated bus that drifts across the background
const FloatingBus = ({
  style,
  emoji,
}: { style: React.CSSProperties; emoji: string }) => (
  <div
    className="absolute pointer-events-none select-none"
    style={{ fontSize: "clamp(28px, 5vw, 48px)", opacity: 0.18, ...style }}
  >
    {emoji}
  </div>
);

const LoginPage: React.FC<LoginPageProps> = ({ onSuccess }) => {
  const { actor } = useActor();
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [confirmPasswordError, setConfirmPasswordError] = useState<
    string | null
  >(null);
  const [status, setStatus] = useState<StatusState>({ type: "idle" });
  // animated buses positions (CSS keyframe via inline style)
  const busList = [
    {
      top: "12%",
      left: "-8%",
      animDuration: "18s",
      animDelay: "0s",
      emoji: "🚌",
    },
    {
      top: "55%",
      left: "-10%",
      animDuration: "22s",
      animDelay: "4s",
      emoji: "🚍",
    },
    {
      top: "30%",
      left: "-6%",
      animDuration: "26s",
      animDelay: "9s",
      emoji: "🚌",
    },
    {
      top: "78%",
      left: "-8%",
      animDuration: "20s",
      animDelay: "2s",
      emoji: "🚍",
    },
    {
      top: "5%",
      left: "-5%",
      animDuration: "30s",
      animDelay: "14s",
      emoji: "🚌",
    },
  ];

  const isLoading = status.type === "loading";

  const switchMode = (newMode: Mode) => {
    setMode(newMode);
    setStatus({ type: "idle" });
    setConfirmPasswordError(null);
    setConfirmPassword("");
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (status.type === "error") {
      setStatus({ type: "idle" });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setConfirmPasswordError(null);

    if (!email || !password) return;

    // Email domain validation
    if (!email.toLowerCase().endsWith("@kiit.ac.in")) {
      setStatus({
        type: "error",
        message: "Only @kiit.ac.in email addresses are allowed.",
      });
      return;
    }

    if (mode === "register" && confirmPassword !== password) {
      setConfirmPasswordError("Passwords do not match.");
      return;
    }

    setStatus({ type: "loading" });

    if (mode === "register" && actor) {
      try {
        await actor.register(email, password);
      } catch {
        // ignore - may already be registered
      }
      setStatus({
        type: "success",
        message: "Account created! You can now log in.",
      });
      setTimeout(() => {
        switchMode("login");
        setStatus({ type: "idle" });
      }, 1500);
    } else {
      // Login: no backend checks, always succeed
      setStatus({ type: "success", message: "Welcome to KIIT Bus!" });
      setTimeout(() => onSuccess?.(email), 800);
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col relative overflow-hidden"
      style={{ fontFamily: "var(--font-body, 'Outfit', sans-serif)" }}
    >
      {/* CSS for bus animation */}
      <style>{`
        @keyframes busDrive {
          0%   { transform: translateX(0); }
          100% { transform: translateX(120vw); }
        }
        @keyframes orbPulse {
          0%, 100% { transform: scale(1); opacity: 0.18; }
          50% { transform: scale(1.18); opacity: 0.28; }
        }
        @keyframes particleDrift {
          0%   { transform: translateY(0) translateX(0); opacity: 0.6; }
          50%  { transform: translateY(-30px) translateX(12px); opacity: 1; }
          100% { transform: translateY(0) translateX(0); opacity: 0.6; }
        }
      `}</style>

      {/* Background image - vivid KIIT campus */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: "url('/assets/uploads/images-2.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      />
      {/* Overlay - subtle dark tint so text is readable */}
      <div
        className="absolute inset-0 z-0"
        style={{
          background:
            "linear-gradient(160deg, oklch(0.10 0.06 255 / 0.45) 0%, oklch(0.14 0.05 240 / 0.38) 60%, oklch(0.08 0.03 255 / 0.50) 100%)",
        }}
      />

      {/* Animated glowing orbs */}
      {[
        {
          top: "8%",
          left: "10%",
          size: 220,
          color: "oklch(0.88 0.2 90 / 0.18)",
          dur: "7s",
          delay: "0s",
        },
        {
          top: "60%",
          left: "70%",
          size: 280,
          color: "oklch(0.55 0.22 255 / 0.16)",
          dur: "9s",
          delay: "2s",
        },
        {
          top: "40%",
          left: "50%",
          size: 180,
          color: "oklch(0.70 0.18 190 / 0.12)",
          dur: "11s",
          delay: "5s",
        },
        {
          top: "80%",
          left: "20%",
          size: 160,
          color: "oklch(0.88 0.2 90 / 0.14)",
          dur: "8s",
          delay: "3s",
        },
      ].map((orb) => (
        <div
          key={`orb-${orb.top}-${orb.left}`}
          className="absolute rounded-full pointer-events-none"
          style={{
            top: orb.top,
            left: orb.left,
            width: orb.size,
            height: orb.size,
            background: `radial-gradient(circle, ${orb.color} 0%, transparent 70%)`,
            animation: `orbPulse ${orb.dur} ease-in-out ${orb.delay} infinite`,
            zIndex: 1,
          }}
        />
      ))}

      {/* Animated floating buses */}
      {busList.map((bus) => (
        <FloatingBus
          key={`bus-${bus.top}-${bus.animDuration}`}
          emoji={bus.emoji}
          style={{
            top: bus.top,
            left: bus.left,
            zIndex: 2,
            animation: `busDrive ${bus.animDuration} linear ${bus.animDelay} infinite`,
          }}
        />
      ))}

      {/* Drifting particles */}
      {(
        [
          {
            key: "pt0",
            w: 4,
            top: "8%",
            left: "5%",
            even: true,
            dur: 4,
            del: 0,
          },
          {
            key: "pt1",
            w: 6,
            top: "15%",
            left: "13%",
            even: false,
            dur: 5,
            del: 0.5,
          },
          {
            key: "pt2",
            w: 8,
            top: "22%",
            left: "21%",
            even: true,
            dur: 6,
            del: 1,
          },
          {
            key: "pt3",
            w: 4,
            top: "29%",
            left: "29%",
            even: false,
            dur: 7,
            del: 1.5,
          },
          {
            key: "pt4",
            w: 6,
            top: "36%",
            left: "37%",
            even: true,
            dur: 4,
            del: 2,
          },
          {
            key: "pt5",
            w: 8,
            top: "43%",
            left: "45%",
            even: false,
            dur: 5,
            del: 2.5,
          },
          {
            key: "pt6",
            w: 4,
            top: "50%",
            left: "53%",
            even: true,
            dur: 6,
            del: 0,
          },
          {
            key: "pt7",
            w: 6,
            top: "57%",
            left: "61%",
            even: false,
            dur: 7,
            del: 0.5,
          },
          {
            key: "pt8",
            w: 8,
            top: "64%",
            left: "69%",
            even: true,
            dur: 4,
            del: 1,
          },
          {
            key: "pt9",
            w: 4,
            top: "71%",
            left: "77%",
            even: false,
            dur: 5,
            del: 1.5,
          },
          {
            key: "pt10",
            w: 6,
            top: "78%",
            left: "85%",
            even: true,
            dur: 6,
            del: 2,
          },
          {
            key: "pt11",
            w: 8,
            top: "85%",
            left: "13%",
            even: false,
            dur: 7,
            del: 2.5,
          },
        ] as {
          key: string;
          w: number;
          top: string;
          left: string;
          even: boolean;
          dur: number;
          del: number;
        }[]
      ).map((p) => (
        <div
          key={p.key}
          className="absolute rounded-full pointer-events-none"
          style={{
            width: p.w,
            height: p.w,
            top: p.top,
            left: p.left,
            background: p.even
              ? "oklch(0.88 0.2 90 / 0.55)"
              : "oklch(0.80 0.10 220 / 0.45)",
            animation: `particleDrift ${p.dur}s ease-in-out ${p.del}s infinite`,
            zIndex: 1,
          }}
        />
      ))}

      {/* Header */}
      <header
        className="w-full py-3 px-6 flex items-center justify-between relative z-10"
        style={{ borderBottom: "1px solid oklch(1 0 0 / 0.15)" }}
      >
        <div className="flex items-center gap-3">
          <div
            className="rounded-full overflow-hidden border-2 flex items-center justify-center"
            style={{
              width: 44,
              height: 44,
              borderColor: "oklch(0.88 0.2 90 / 0.8)",
              background: "oklch(1 0 0 / 0.95)",
              boxShadow: "0 2px 12px oklch(0.88 0.2 90 / 0.5)",
            }}
          >
            <img
              src="/assets/uploads/images-2-1.png"
              alt="KIIT University Logo"
              style={{ width: 36, height: 36, objectFit: "contain" }}
            />
          </div>
          <div>
            <span
              className="font-display font-bold text-base block"
              style={{ color: "oklch(0.98 0 0)", letterSpacing: "-0.01em" }}
            >
              KIIT Bus
            </span>
            <span
              className="text-xs font-body"
              style={{ color: "oklch(0.85 0.05 215)" }}
            >
              Kalinga Institute of Industrial Technology
            </span>
          </div>
        </div>
        <div
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-body"
          style={{
            background: "oklch(1 0 0 / 0.12)",
            color: "oklch(0.88 0.1 90)",
            border: "1px solid oklch(1 0 0 / 0.2)",
          }}
        >
          <Bus className="w-3.5 h-3.5" />
          <span className="hidden sm:block">KIIT University, Bhubaneswar</span>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 flex items-center justify-center px-4 py-8 relative z-10">
        <div className="w-full max-w-md">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="text-center mb-6"
          >
            <div
              className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center border-4"
              style={{
                borderColor: "oklch(0.88 0.2 90)",
                background: "oklch(1 0 0 / 0.95)",
                boxShadow:
                  "0 8px 32px oklch(0.88 0.2 90 / 0.5), 0 2px 8px oklch(0 0 0 / 0.3)",
              }}
            >
              <img
                src="/assets/uploads/images-2-1.png"
                alt="KIIT University"
                style={{ width: 60, height: 60, objectFit: "contain" }}
              />
            </div>
            <h1
              className="font-display font-bold mb-1"
              style={{
                fontSize: "clamp(1.5rem, 4vw, 2rem)",
                color: "oklch(0.98 0 0)",
                textShadow: "0 2px 12px oklch(0 0 0 / 0.4)",
                letterSpacing: "-0.02em",
              }}
            >
              Welcome to{" "}
              <span style={{ color: "oklch(0.88 0.2 90)" }}>KIIT Bus</span>
            </h1>
            <p
              className="text-sm font-body"
              style={{
                color: "oklch(0.95 0.03 220)",
                textShadow: "0 1px 4px oklch(0 0 0 / 0.5)",
              }}
            >
              Your safe &amp; reliable campus transport
            </p>
          </motion.div>

          {/* Auth card */}
          <motion.div
            initial={{ opacity: 0, y: 32, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
            className="rounded-2xl overflow-hidden"
            style={{
              background: "oklch(1 0 0 / 0.94)",
              boxShadow:
                "0 24px 64px oklch(0 0 0 / 0.35), 0 4px 16px oklch(0 0 0 / 0.2)",
              border: "1px solid oklch(1 0 0 / 0.4)",
              backdropFilter: "blur(20px)",
            }}
          >
            <div
              style={{
                height: "4px",
                background:
                  "linear-gradient(90deg, oklch(0.88 0.2 90) 0%, oklch(0.24 0.08 255) 100%)",
              }}
            />

            <div className="p-7">
              {/* Mode toggle */}
              <div
                className="flex rounded-xl p-1 mb-6"
                style={{ background: "oklch(0.94 0.02 240)" }}
              >
                <button
                  type="button"
                  onClick={() => switchMode("login")}
                  data-ocid="auth.login_tab"
                  className="flex-1 flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-body font-semibold transition-all duration-200"
                  style={{
                    background:
                      mode === "login" ? "oklch(1 0 0)" : "transparent",
                    color:
                      mode === "login"
                        ? "oklch(0.22 0.08 255)"
                        : "oklch(0.55 0.04 230)",
                    boxShadow:
                      mode === "login"
                        ? "0 1px 4px oklch(0 0 0 / 0.15)"
                        : "none",
                  }}
                >
                  <LogIn className="w-4 h-4" />
                  Login
                </button>
                <button
                  type="button"
                  onClick={() => switchMode("register")}
                  data-ocid="auth.register_tab"
                  className="flex-1 flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-body font-semibold transition-all duration-200"
                  style={{
                    background:
                      mode === "register" ? "oklch(1 0 0)" : "transparent",
                    color:
                      mode === "register"
                        ? "oklch(0.22 0.08 255)"
                        : "oklch(0.55 0.04 230)",
                    boxShadow:
                      mode === "register"
                        ? "0 1px 4px oklch(0 0 0 / 0.15)"
                        : "none",
                  }}
                >
                  <UserPlus className="w-4 h-4" />
                  Register
                </button>
              </div>

              <div className="mb-5 text-center">
                <h2
                  className="font-display font-bold text-xl mb-1"
                  style={{ color: "oklch(0.22 0.08 255)" }}
                >
                  {mode === "login"
                    ? "Sign In to Continue"
                    : "Create Your Account"}
                </h2>
                <p
                  className="text-xs font-body"
                  style={{ color: "oklch(0.55 0.04 230)" }}
                >
                  {mode === "login"
                    ? "Enter your @kiit.ac.in email and password"
                    : "Register with your @kiit.ac.in email"}
                </p>
              </div>

              <AnimatePresence mode="wait">
                {status.type === "error" && (
                  <motion.div
                    key="error-banner"
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="mb-5 flex items-start gap-2.5 rounded-xl p-3.5"
                    style={{
                      background: "oklch(0.97 0.04 25 / 0.5)",
                      border: "1px solid oklch(0.65 0.2 25 / 0.5)",
                    }}
                    aria-live="assertive"
                    data-ocid="auth.error_state"
                  >
                    <AlertCircle
                      className="w-5 h-5 mt-0.5 shrink-0"
                      style={{ color: "oklch(0.52 0.22 25)" }}
                    />
                    <p
                      className="text-sm font-body font-medium"
                      style={{ color: "oklch(0.40 0.18 25)" }}
                    >
                      {status.message}
                    </p>
                  </motion.div>
                )}

                {status.type === "success" && (
                  <motion.div
                    key="success-banner"
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="mb-5 flex items-start gap-2.5 rounded-xl p-3.5"
                    style={{
                      background: "oklch(0.92 0.08 145 / 0.3)",
                      border: "1px solid oklch(0.68 0.14 145 / 0.4)",
                    }}
                    aria-live="polite"
                    data-ocid="auth.success_state"
                  >
                    <CheckCircle2
                      className="w-5 h-5 mt-0.5 shrink-0"
                      style={{ color: "oklch(0.50 0.16 145)" }}
                    />
                    <p
                      className="text-sm font-body font-medium"
                      style={{ color: "oklch(0.32 0.12 145)" }}
                    >
                      {status.message}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              <form onSubmit={handleSubmit} noValidate className="space-y-5">
                <div className="space-y-1.5">
                  <Label
                    htmlFor="email"
                    className="text-sm font-body font-semibold"
                    style={{ color: "oklch(0.30 0.06 240)" }}
                  >
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="yourname@kiit.ac.in"
                    value={email}
                    onChange={handleEmailChange}
                    disabled={isLoading}
                    data-ocid="auth.email.input"
                    className="font-body h-11"
                    style={{
                      borderColor:
                        status.type === "error"
                          ? "oklch(0.65 0.2 25)"
                          : undefined,
                    }}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label
                    htmlFor="password"
                    className="text-sm font-body font-semibold"
                    style={{ color: "oklch(0.30 0.06 240)" }}
                  >
                    Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete={
                        mode === "register"
                          ? "new-password"
                          : "current-password"
                      }
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={isLoading}
                      data-ocid="auth.password.input"
                      className="font-body h-11 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded"
                      style={{ color: "oklch(0.58 0.04 230)" }}
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                <AnimatePresence>
                  {mode === "register" && (
                    <motion.div
                      key="confirm-password"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.25 }}
                      className="space-y-1.5 overflow-hidden"
                    >
                      <Label
                        htmlFor="confirmPassword"
                        className="text-sm font-body font-semibold"
                        style={{ color: "oklch(0.30 0.06 240)" }}
                      >
                        Confirm Password
                      </Label>
                      <div className="relative">
                        <Input
                          id="confirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          autoComplete="new-password"
                          placeholder="Re-enter your password"
                          value={confirmPassword}
                          onChange={(e) => {
                            setConfirmPassword(e.target.value);
                            if (confirmPasswordError)
                              setConfirmPasswordError(null);
                          }}
                          disabled={isLoading}
                          aria-invalid={!!confirmPasswordError}
                          data-ocid="auth.confirm_password.input"
                          className="font-body h-11 pr-10"
                          style={{
                            borderColor: confirmPasswordError
                              ? "oklch(0.65 0.2 25)"
                              : "oklch(0.84 0.04 220)",
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword((v) => !v)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded"
                          style={{ color: "oklch(0.58 0.04 230)" }}
                          aria-label={
                            showConfirmPassword
                              ? "Hide password"
                              : "Show password"
                          }
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                      {confirmPasswordError && (
                        <motion.p
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-xs font-body flex items-center gap-1"
                          style={{ color: "oklch(0.52 0.22 25)" }}
                          role="alert"
                        >
                          {confirmPasswordError}
                        </motion.p>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>

                <Button
                  type="submit"
                  disabled={isLoading || status.type === "success"}
                  data-ocid="auth.submit_button"
                  className="w-full h-11 font-body font-semibold text-base"
                  style={{
                    background:
                      isLoading || status.type === "success"
                        ? "oklch(0.55 0.04 230)"
                        : mode === "register"
                          ? "oklch(0.38 0.14 145)"
                          : "oklch(0.24 0.08 255)",
                    color: "oklch(0.98 0 0)",
                    boxShadow: isLoading
                      ? "none"
                      : mode === "register"
                        ? "0 4px 14px oklch(0.38 0.14 145 / 0.35)"
                        : "0 4px 14px oklch(0.24 0.08 255 / 0.35)",
                  }}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {mode === "register"
                        ? "Creating Account…"
                        : "Signing in…"}
                    </>
                  ) : status.type === "success" ? (
                    <>
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      {mode === "register" ? "Account Created!" : "Welcome!"}
                    </>
                  ) : mode === "register" ? (
                    <>
                      <UserPlus className="mr-2 h-4 w-4" />
                      Create Account
                    </>
                  ) : (
                    "Sign In"
                  )}
                </Button>
              </form>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="flex flex-wrap items-center justify-center gap-2 mt-5"
          >
            {["Real-time Tracking", "25 Campuses", "KIMS & KISS Covered"].map(
              (label) => (
                <span
                  key={label}
                  className="text-xs font-body px-3 py-1 rounded-full"
                  style={{
                    background: "oklch(1 0 0 / 0.15)",
                    color: "oklch(0.98 0 0)",
                    border: "1px solid oklch(1 0 0 / 0.25)",
                    textShadow: "0 1px 3px oklch(0 0 0 / 0.3)",
                  }}
                >
                  {label}
                </span>
              ),
            )}
          </motion.div>
        </div>
      </main>

      <footer className="py-4 px-6 text-center relative z-10">
        <p
          className="text-xs font-body"
          style={{
            color: "oklch(0.92 0.03 220)",
            textShadow: "0 1px 3px oklch(0 0 0 / 0.4)",
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

export default LoginPage;
