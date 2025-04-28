import React, { createContext, useContext, useEffect, useState } from "react";

type Theme =
  | "theme-shadow"
  | "theme-fire"
  | "theme-nature"
  | "theme-arcane"
  | "theme-warrior"
  | "theme-bard"
  | "theme-paladin"
  | "theme-rogue";

interface ThemeContextType {
  theme: Theme;
  switchTheme: (newTheme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>("theme-shadow");

  useEffect(() => {
    const storedTheme = localStorage.getItem("theme") as Theme;
    if (storedTheme) {
      setTheme(storedTheme);
      applyTheme(storedTheme);
    } else {
      applyTheme(theme);
    }
  }, []);

  const applyTheme = (themeName: Theme) => {
    const body = document.body;
    body.classList.remove(
      "theme-shadow",
      "theme-fire",
      "theme-nature",
      "theme-arcane",
      "theme-warrior",
      "theme-bard",
      "theme-paladin",
      "theme-rogue"
    );
    body.classList.add(themeName);
  };

  const switchTheme = (newTheme: Theme) => {
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    applyTheme(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, switchTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used within a ThemeProvider");
  return context;
};
