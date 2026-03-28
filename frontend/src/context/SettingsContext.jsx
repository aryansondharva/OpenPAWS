import React, { createContext, useContext, useState, useEffect } from "react";

const SettingsContext = createContext();

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
};

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem("openpaws_settings");
    return saved ? JSON.parse(saved) : {
      operatorName: "Felix",
      operatorId: "OP-772",
      theme: "Light",
      model: "Gemini 1.5 Pro",
      depth: 80,
      notifications: true,
      glassmorphism: true,
      motion: true,
    };
  });

  useEffect(() => {
    localStorage.setItem("openpaws_settings", JSON.stringify(settings));
    
    // Apply theme
    if (settings.theme === "Shadow") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [settings]);

  const updateSettings = (updates) => {
    setSettings((prev) => ({ ...prev, ...updates }));
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};
