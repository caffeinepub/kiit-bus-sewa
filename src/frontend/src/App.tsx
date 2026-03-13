import { Toaster } from "@/components/ui/sonner";
import type React from "react";
import { useCallback, useEffect, useState } from "react";
import Dashboard from "./components/Dashboard";
import IntroScreen from "./components/IntroScreen";
import LoginPage from "./components/LoginPage";

type AppScreen = "intro" | "login" | "dashboard";

const SESSION_KEY = "kiit_bus_user";

interface UserLocation {
  lat: number;
  lng: number;
}

const App: React.FC = () => {
  const [screen, setScreen] = useState<AppScreen>(() => {
    const saved = localStorage.getItem(SESSION_KEY);
    return saved ? "dashboard" : "intro";
  });
  const [userEmail, setUserEmail] = useState<string>(() => {
    return localStorage.getItem(SESSION_KEY) ?? "";
  });
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);

  // Request geolocation immediately on app mount
  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
      },
      () => {
        // Silently ignore – user denied or error
        setUserLocation(null);
      },
      { timeout: 10000, enableHighAccuracy: true },
    );
  }, []);

  const handleIntroComplete = useCallback(() => {
    setScreen("login");
  }, []);

  const handleLoginSuccess = useCallback((email: string) => {
    localStorage.setItem(SESSION_KEY, email);
    setUserEmail(email);
    setScreen("dashboard");
  }, []);

  const handleLogout = useCallback(() => {
    localStorage.removeItem(SESSION_KEY);
    setUserEmail("");
    setScreen("login");
  }, []);

  return (
    <>
      <Toaster position="top-center" richColors />
      {screen === "intro" && <IntroScreen onComplete={handleIntroComplete} />}
      {screen === "login" && <LoginPage onSuccess={handleLoginSuccess} />}
      {screen === "dashboard" && (
        <Dashboard
          userEmail={userEmail}
          onLogout={handleLogout}
          userLat={userLocation?.lat}
          userLng={userLocation?.lng}
        />
      )}
    </>
  );
};

export default App;
