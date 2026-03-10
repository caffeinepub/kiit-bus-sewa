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
} from "lucide-react";
import { motion } from "motion/react";
import type React from "react";
import { useState } from "react";
import { useActor } from "../hooks/useActor";

const KIIT_DOMAIN = "@kiit.ac.in";

function validateEmail(email: string): string | null {
  if (!email) return "Email is required.";
  if (!email.endsWith(KIIT_DOMAIN))
    return `Only ${KIIT_DOMAIN} emails are allowed.`;
  if (email.split("@")[0].length === 0) return "Enter a valid email address.";
  return null;
}

function validatePassword(password: string): string | null {
  if (!password) return "Password is required.";
  if (password.length < 6) return "Password must be at least 6 characters.";
  return null;
}

type Status =
  | { type: "idle" }
  | { type: "loading" }
  | { type: "success" }
  | { type: "error"; message: string };

interface LoginPageProps {
  onSuccess?: (email: string) => void;
}

// Extract a clean message from IC canister trap errors
function extractErrorMessage(err: unknown): string {
  const raw = err instanceof Error ? err.message : String(err);
  // Try to find the reject_message field in the error
  const rejectMatch = raw.match(/"reject_message"\s*:\s*"([^"]+)"/);
  if (rejectMatch) return rejectMatch[1];
  // Try Reject text pattern
  const rejectTextMatch = raw.match(/Reject text:\s*(.+?)(?:\n|$)/);
  if (rejectTextMatch) return rejectTextMatch[1].trim();
  // Try canister trapped pattern
  const trappedMatch = raw.match(/trapped explicitly:\s*(.+?)(?:\n|$|")/i);
  if (trappedMatch) return trappedMatch[1].trim();
  // Fallback to raw message if short, otherwise generic
  if (raw.length < 200) return raw;
  return "Something went wrong. Please try again.";
}

const LoginPage: React.FC<LoginPageProps> = ({ onSuccess }) => {
  const { actor, isFetching: isActorLoading } = useActor();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>({ type: "idle" });

  const isLoading = status.type === "loading";

  const handleContinue = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError(null);
    setPasswordError(null);

    const emailErr = validateEmail(email);
    const passErr = validatePassword(password);
    if (emailErr) {
      setEmailError(emailErr);
      return;
    }
    if (passErr) {
      setPasswordError(passErr);
      return;
    }

    if (!actor) {
      setStatus({
        type: "error",
        message: "Connection not ready. Please wait and try again.",
      });
      return;
    }

    setStatus({ type: "loading" });

    try {
      // Try to register first; if the user already exists, fall back to login.
      // This implements a seamless "register or login" flow with a single button.
      try {
        await actor.register(email, password);
      } catch {
        // User likely already registered — attempt login instead
        await actor.login(email, password);
      }
      setStatus({ type: "success" });
      setTimeout(() => onSuccess?.(email), 700);
    } catch (err: unknown) {
      const message = extractErrorMessage(err);
      setStatus({ type: "error", message });
    }
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Background */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: "url('/assets/uploads/images-2.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      />
      {/* Overlay */}
      <div
        className="absolute inset-0 z-0"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.10 0.08 255 / 0.70) 0%, oklch(0.15 0.06 240 / 0.60) 50%, oklch(0.08 0.04 255 / 0.72) 100%)",
        }}
      />

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
              src="/assets/uploads/images-1-1.png"
              alt="KIIT Logo"
              style={{ width: 36, height: 36, objectFit: "contain" }}
            />
          </div>
          <div>
            <span
              className="font-display font-bold text-base block"
              style={{ color: "oklch(0.98 0 0)", letterSpacing: "-0.01em" }}
            >
              KIIT Bus Sewa
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

      {/* Main */}
      <main className="flex-1 flex items-center justify-center px-4 py-8 relative z-10">
        <div className="w-full max-w-md">
          {/* Branding */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
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
                src="/assets/uploads/images-1-1.png"
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
              <span style={{ color: "oklch(0.88 0.2 90)" }}>KIIT Bus Sewa</span>
            </h1>
            <p
              className="text-sm font-body"
              style={{
                color: "oklch(0.85 0.04 220)",
                textShadow: "0 1px 4px oklch(0 0 0 / 0.3)",
              }}
            >
              Your safe & reliable campus transport
            </p>
          </motion.div>

          {/* Card */}
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
              <h2
                className="font-display font-bold text-lg mb-1"
                style={{ color: "oklch(0.22 0.08 255)" }}
              >
                Sign In to Your Account
              </h2>
              <p
                className="text-sm font-body mb-6"
                style={{ color: "oklch(0.55 0.04 230)" }}
              >
                New users are registered automatically on first sign-in.
              </p>

              {/* Error */}
              {status.type === "error" && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-5 flex items-start gap-2.5 rounded-xl p-3.5"
                  style={{
                    background: "oklch(0.96 0.06 25 / 0.3)",
                    border: "1px solid oklch(0.65 0.2 25 / 0.4)",
                  }}
                  role="alert"
                  aria-live="assertive"
                  data-ocid="login.error_state"
                >
                  <AlertCircle
                    className="w-5 h-5 mt-0.5 flex-shrink-0"
                    style={{ color: "oklch(0.52 0.22 25)" }}
                  />
                  <p
                    className="text-sm font-body font-medium"
                    style={{ color: "oklch(0.38 0.18 25)" }}
                  >
                    {status.message}
                  </p>
                </motion.div>
              )}

              {/* Success */}
              {status.type === "success" && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-5 flex items-start gap-2.5 rounded-xl p-3.5"
                  style={{
                    background: "oklch(0.92 0.08 145 / 0.3)",
                    border: "1px solid oklch(0.68 0.14 145 / 0.4)",
                  }}
                  aria-live="polite"
                >
                  <CheckCircle2
                    className="w-5 h-5 mt-0.5 flex-shrink-0"
                    style={{ color: "oklch(0.50 0.16 145)" }}
                  />
                  <p
                    className="text-sm font-body font-medium"
                    style={{ color: "oklch(0.32 0.12 145)" }}
                  >
                    Signed in! Redirecting to dashboard…
                  </p>
                </motion.div>
              )}

              <form onSubmit={handleContinue} noValidate className="space-y-5">
                {/* Email */}
                <div className="space-y-1.5">
                  <Label
                    htmlFor="email"
                    className="text-sm font-body font-semibold"
                    style={{ color: "oklch(0.30 0.06 240)" }}
                  >
                    KIIT Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="yourname@kiit.ac.in"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setEmailError(null);
                      if (status.type === "error") setStatus({ type: "idle" });
                    }}
                    disabled={isLoading}
                    aria-invalid={!!emailError}
                    data-ocid="login.input"
                    className="font-body h-11"
                    style={{
                      borderColor: emailError
                        ? "oklch(0.65 0.2 25)"
                        : "oklch(0.84 0.04 220)",
                    }}
                  />
                  {emailError && (
                    <motion.p
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-xs font-body flex items-center gap-1"
                      style={{ color: "oklch(0.52 0.22 25)" }}
                      role="alert"
                    >
                      <AlertCircle className="w-3.5 h-3.5" />
                      {emailError}
                    </motion.p>
                  )}
                  {!emailError && (
                    <p
                      className="text-xs font-body"
                      style={{ color: "oklch(0.60 0.04 225)" }}
                    >
                      Must end with <strong>@kiit.ac.in</strong>
                    </p>
                  )}
                </div>

                {/* Password */}
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
                      autoComplete="current-password"
                      placeholder="Enter your password (min 6 chars)"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        setPasswordError(null);
                        if (status.type === "error")
                          setStatus({ type: "idle" });
                      }}
                      disabled={isLoading}
                      aria-invalid={!!passwordError}
                      data-ocid="login.password_input"
                      className="font-body h-11 pr-10"
                      style={{
                        borderColor: passwordError
                          ? "oklch(0.65 0.2 25)"
                          : "oklch(0.84 0.04 220)",
                      }}
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
                  {passwordError && (
                    <motion.p
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-xs font-body flex items-center gap-1"
                      style={{ color: "oklch(0.52 0.22 25)" }}
                      role="alert"
                    >
                      <AlertCircle className="w-3.5 h-3.5" />
                      {passwordError}
                    </motion.p>
                  )}
                </div>

                {/* Continue button */}
                <Button
                  type="submit"
                  disabled={
                    isLoading || isActorLoading || status.type === "success"
                  }
                  data-ocid="login.submit_button"
                  className="w-full h-12 font-body font-bold text-base transition-all duration-200"
                  style={{
                    background:
                      isLoading || isActorLoading
                        ? "oklch(0.55 0.04 230)"
                        : status.type === "success"
                          ? "oklch(0.50 0.16 145)"
                          : "oklch(0.24 0.08 255)",
                    color: "oklch(0.98 0 0)",
                    boxShadow: isLoading
                      ? "none"
                      : "0 4px 14px oklch(0.24 0.08 255 / 0.35)",
                    borderRadius: "0.75rem",
                  }}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Please wait…
                    </>
                  ) : status.type === "success" ? (
                    <>
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Signed in!
                    </>
                  ) : (
                    "Continue"
                  )}
                </Button>
              </form>
            </div>
          </motion.div>

          {/* Badges */}
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
                    color: "oklch(0.96 0 0)",
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
            color: "oklch(0.78 0.03 220)",
            textShadow: "0 1px 3px oklch(0 0 0 / 0.3)",
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
