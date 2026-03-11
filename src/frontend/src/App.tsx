import { Toaster } from "@/components/ui/sonner";
import type React from "react";
import { useCallback, useState } from "react";
import Dashboard from "./components/Dashboard";
import IntroScreen from "./components/IntroScreen";
import LoginPage from "./components/LoginPage";

type AppScreen = "intro" | "login" | "dashboard";

const SESSION_KEY = "kiit_bus_user";

const App: React.FC = () => {
  const [screen, setScreen] = useState<AppScreen>(() => {
    const saved = localStorage.getItem(SESSION_KEY);
    return saved ? "dashboard" : "intro";
  });
  const [userEmail, setUserEmail] = useState<string>(() => {
    return localStorage.getItem(SESSION_KEY) ?? "";
  });

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
        <Dashboard userEmail={userEmail} onLogout={handleLogout} />
      )}
    </>
  );
};

export default App;
