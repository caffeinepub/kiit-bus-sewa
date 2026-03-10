import { Toaster } from "@/components/ui/sonner";
import type React from "react";
import { useCallback, useState } from "react";
import Dashboard, { type Campus } from "./components/Dashboard";
import IntroScreen from "./components/IntroScreen";
import LiveTracker from "./components/LiveTracker";
import LoginPage from "./components/LoginPage";

type AppScreen = "intro" | "login" | "dashboard" | "tracker";

const SESSION_KEY = "kiit_bus_user";

const App: React.FC = () => {
  const [screen, setScreen] = useState<AppScreen>(() => {
    const saved = localStorage.getItem(SESSION_KEY);
    return saved ? "dashboard" : "intro";
  });
  const [userEmail, setUserEmail] = useState<string>(
    () => localStorage.getItem(SESSION_KEY) ?? "",
  );
  const [trackedCampus, setTrackedCampus] = useState<Campus | null>(null);

  const handleIntroComplete = useCallback(() => setScreen("login"), []);

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

  const handleTrack = useCallback((campus: Campus) => {
    setTrackedCampus(campus);
    setScreen("tracker");
  }, []);

  const handleBackFromTracker = useCallback(() => {
    setScreen("dashboard");
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
          onTrack={handleTrack}
        />
      )}
      {screen === "tracker" && trackedCampus && (
        <LiveTracker campus={trackedCampus} onBack={handleBackFromTracker} />
      )}
    </>
  );
};

export default App;
