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

type AuthMode = "login" | "register";
type StatusState =
  | { type: "idle" }
  | { type: "loading" }
  | { type: "success"; message: string }
  | { type: "error"; message: string };

const KIIT_DOMAIN = "@kiit.ac.in";

function validateEmail(email: string): string | null {
  if (!email) return "Email is required.";
  if (!email.endsWith(KIIT_DOMAIN)) {
    return `Only ${KIIT_DOMAIN} email addresses are allowed.`;
  }
  const parts = email.split("@");
  if (parts[0].length === 0) return "Please enter a valid email address.";
  return null;
}

function validatePassword(password: string): string | null {
  if (!password) return "Password is required.";
  if (password.length < 6) return "Password must be at least 6 characters.";
  return null;
}

interface LoginPageProps {
  onSuccess?: (email: string) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onSuccess }) => {
  const { actor, isFetching: isActorLoading } = useActor();
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [status, setStatus] = useState<StatusState>({ type: "idle" });

  const isLoading = status.type === "loading";

  const resetErrors = () => {
    setEmailError(null);
    setPasswordError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    resetErrors();

    const emailErr = validateEmail(email);
    const passErr = validatePassword(password);

    if (emailErr || passErr) {
      if (emailErr) setEmailError(emailErr);
      if (passErr) setPasswordError(passErr);
      return;
    }

    if (!actor) {
      setStatus({
        type: "error",
        message: "Connection not ready. Please wait a moment and try again.",
      });
      return;
    }

    setStatus({ type: "loading" });

    try {
      if (mode === "login") {
        await actor.login(email, password);
        setStatus({
          type: "success",
          message: "Login successful! Welcome to KIIT Bus Sewa.",
        });
        setTimeout(() => {
          onSuccess?.(email);
        }, 800);
      } else {
        await actor.register(email, password);
        setStatus({
          type: "success",
          message: "Account created! Redirecting to dashboard…",
        });
        setTimeout(() => {
          onSuccess?.(email);
        }, 1200);
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again.";
      setStatus({ type: "error", message });
    }
  };

  const switchMode = (newMode: AuthMode) => {
    setMode(newMode);
    resetErrors();
    setStatus({ type: "idle" });
    setPassword("");
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (emailError) setEmailError(null);
    if (status.type === "error") setStatus({ type: "idle" });
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    if (passwordError) setPasswordError(null);
    if (status.type === "error") setStatus({ type: "idle" });
  };

  return (
    <div
      className="min-h-screen flex flex-col relative overflow-hidden"
      style={{ fontFamily: "var(--font-body, 'Outfit', sans-serif)" }}
    >
      {/* Background image */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage:
            "url('/assets/generated/kiit-campus-bg.dim_1920x1080.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      />
      {/* Dark overlay for readability */}
      <div
        className="absolute inset-0 z-0"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.12 0.08 255 / 0.72) 0%, oklch(0.18 0.06 240 / 0.65) 50%, oklch(0.10 0.04 255 / 0.75) 100%)",
          backdropFilter: "blur(1px)",
        }}
      />

      {/* Header bar */}
      <header
        className="w-full py-3 px-6 flex items-center justify-between relative z-10"
        style={{ borderBottom: "1px solid oklch(1 0 0 / 0.15)" }}
      >
        <div className="flex items-center gap-3">
          {/* KIIT Logo */}
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
              src="/assets/uploads/images-1.png"
              alt="KIIT University Logo"
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

      {/* Main content */}
      <main className="flex-1 flex items-center justify-center px-4 py-8 relative z-10">
        <div className="w-full max-w-md">
          {/* Top branding block */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="text-center mb-6"
          >
            {/* Large centered logo */}
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
                src="/assets/uploads/images-1.png"
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
              backdropFilter: "blur(20px)",
            }}
          >
            {/* Card top accent */}
            <div
              style={{
                height: "4px",
                background:
                  "linear-gradient(90deg, oklch(0.88 0.2 90) 0%, oklch(0.24 0.08 255) 100%)",
              }}
            />

            <div className="p-7">
              {/* Tab switcher */}
              <div
                className="flex rounded-xl mb-6 p-1"
                style={{ background: "oklch(0.93 0.03 220)" }}
              >
                {(["login", "register"] as AuthMode[]).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => switchMode(m)}
                    data-ocid={`auth.${m === "login" ? "login" : "register"}.tab`}
                    className="flex-1 py-2 rounded-lg text-sm font-body font-semibold transition-all duration-200 capitalize"
                    style={
                      mode === m
                        ? {
                            background: "oklch(0.24 0.08 255)",
                            color: "oklch(0.98 0 0)",
                            boxShadow: "0 2px 8px oklch(0.24 0.08 255 / 0.3)",
                          }
                        : { color: "oklch(0.52 0.04 230)" }
                    }
                  >
                    {m === "login" ? "Sign In" : "Register"}
                  </button>
                ))}
              </div>

              {/* Status messages */}
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
                  data-ocid="auth.success_state"
                >
                  <CheckCircle2
                    className="w-5 h-5 mt-0.5 flex-shrink-0"
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
                  data-ocid="auth.error_state"
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

              {/* Form */}
              <form onSubmit={handleSubmit} noValidate className="space-y-5">
                {/* Email field */}
                <div className="space-y-1.5">
                  <Label
                    htmlFor="email"
                    className="text-sm font-body font-semibold"
                    style={{ color: "oklch(0.30 0.06 240)" }}
                  >
                    KIIT Email Address
                  </Label>
                  <div className="relative">
                    <Input
                      id="email"
                      type="email"
                      name="email"
                      autoComplete="email"
                      placeholder="yourname@kiit.ac.in"
                      value={email}
                      onChange={handleEmailChange}
                      disabled={isLoading}
                      aria-invalid={!!emailError}
                      aria-describedby={emailError ? "email-error" : undefined}
                      data-ocid="auth.email.input"
                      className="font-body h-11 pr-4"
                      style={{
                        borderColor: emailError
                          ? "oklch(0.65 0.2 25)"
                          : "oklch(0.84 0.04 220)",
                        outline: "none",
                      }}
                    />
                  </div>
                  {emailError && (
                    <motion.p
                      id="email-error"
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

                {/* Password field */}
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
                      name="current-password"
                      autoComplete={
                        mode === "login" ? "current-password" : "new-password"
                      }
                      placeholder={
                        mode === "login"
                          ? "Enter your password"
                          : "Create a password (min 6 chars)"
                      }
                      value={password}
                      onChange={handlePasswordChange}
                      disabled={isLoading}
                      aria-invalid={!!passwordError}
                      aria-describedby={
                        passwordError ? "password-error" : undefined
                      }
                      data-ocid="auth.password.input"
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
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded transition-colors"
                      style={{ color: "oklch(0.58 0.04 230)" }}
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                      tabIndex={0}
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
                      id="password-error"
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

                {/* Submit button */}
                <Button
                  type="submit"
                  disabled={
                    isLoading || isActorLoading || status.type === "success"
                  }
                  data-ocid="auth.submit_button"
                  className="w-full h-11 font-body font-semibold text-base transition-all duration-200"
                  style={{
                    background:
                      isLoading || isActorLoading || status.type === "success"
                        ? "oklch(0.55 0.04 230)"
                        : "oklch(0.24 0.08 255)",
                    color: "oklch(0.98 0 0)",
                    boxShadow: isLoading
                      ? "none"
                      : "0 4px 14px oklch(0.24 0.08 255 / 0.35)",
                  }}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {mode === "login"
                        ? "Signing in..."
                        : "Creating account..."}
                    </>
                  ) : status.type === "success" ? (
                    <>
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      {mode === "login" ? "Signed in!" : "Account created!"}
                    </>
                  ) : mode === "login" ? (
                    "Sign In"
                  ) : (
                    "Create Account"
                  )}
                </Button>
              </form>

              {/* Divider */}
              <div className="flex items-center gap-3 my-5">
                <div
                  className="flex-1 h-px"
                  style={{ background: "oklch(0.88 0.03 220)" }}
                />
                <span
                  className="text-xs font-body"
                  style={{ color: "oklch(0.62 0.03 225)" }}
                >
                  {mode === "login"
                    ? "New to KIIT Bus Sewa?"
                    : "Already have an account?"}
                </span>
                <div
                  className="flex-1 h-px"
                  style={{ background: "oklch(0.88 0.03 220)" }}
                />
              </div>

              {/* Secondary action */}
              <button
                type="button"
                onClick={() =>
                  switchMode(mode === "login" ? "register" : "login")
                }
                data-ocid="auth.secondary_button"
                className="w-full text-sm font-body font-semibold py-2.5 rounded-xl transition-all duration-200"
                style={{
                  color: "oklch(0.24 0.08 255)",
                  background: "oklch(0.92 0.05 215 / 0.6)",
                  border: "1px solid oklch(0.80 0.06 220)",
                }}
              >
                {mode === "login" ? "Create a new account" : "Back to Sign In"}
              </button>
            </div>
          </motion.div>

          {/* Info pills */}
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

      {/* Footer */}
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
