import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type ThemeName = "binance" | "terminal" | "glassmorphism" | "monochrome" | "claro";

interface ThemeContextType {
  theme: ThemeName;
  setTheme: (theme: ThemeName) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeName>(() => {
    const stored = localStorage.getItem("app-theme");
    return (stored as ThemeName) || "binance";
  });

  useEffect(() => {
    localStorage.setItem("app-theme", theme);
    applyTheme(theme);
  }, [theme]);

  const setTheme = (newTheme: ThemeName) => {
    setThemeState(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
}

function applyTheme(theme: ThemeName) {
  const root = document.documentElement;
  const themes = getThemeVariables();
  const variables = themes[theme];

  Object.entries(variables).forEach(([key, value]) => {
    root.style.setProperty(key, value);
  });
}

function getThemeVariables() {
  return {
    binance: {
      "--background": "220 14% 8%",
      "--foreground": "220 9% 93%",
      "--card": "220 14% 12%",
      "--card-foreground": "220 9% 93%",
      "--popover": "220 14% 12%",
      "--popover-foreground": "220 9% 93%",
      "--primary": "44 92% 50%",
      "--primary-foreground": "0 0% 0%",
      "--secondary": "220 14% 16%",
      "--secondary-foreground": "220 9% 93%",
      "--muted": "220 17% 10%",
      "--muted-foreground": "219 9% 58%",
      "--accent": "44 92% 50%",
      "--accent-foreground": "0 0% 0%",
      "--destructive": "349 84% 63%",
      "--destructive-foreground": "0 0% 100%",
      "--border": "220 15% 20%",
      "--input": "220 17% 10%",
      "--ring": "44 92% 50%",
      "--radius": "0.375rem",
      "--success": "158 64% 52%",
      "--success-foreground": "0 0% 0%",
      "--warning": "44 92% 50%",
      "--warning-foreground": "0 0% 0%",
      "--sidebar-background": "220 14% 8%",
      "--sidebar-foreground": "220 9% 93%",
      "--sidebar-muted": "220 17% 10%",
      "--sidebar-muted-foreground": "219 9% 58%",
      "--glow-primary": "44 92% 50%",
      "--glow-secondary": "158 64% 52%",
      "--glow-accent": "349 84% 63%",
    },
    terminal: {
      "--background": "156 16% 6%",
      "--foreground": "137 18% 92%",
      "--card": "150 16% 7%",
      "--card-foreground": "137 18% 92%",
      "--popover": "150 16% 7%",
      "--popover-foreground": "137 18% 92%",
      "--primary": "142 71% 45%",
      "--primary-foreground": "0 0% 100%",
      "--secondary": "140 15% 12%",
      "--secondary-foreground": "137 18% 92%",
      "--muted": "146 14% 10%",
      "--muted-foreground": "150 10% 59%",
      "--accent": "44 92% 50%",
      "--accent-foreground": "0 0% 0%",
      "--destructive": "349 84% 63%",
      "--destructive-foreground": "0 0% 100%",
      "--border": "150 14% 16%",
      "--input": "146 14% 10%",
      "--ring": "142 71% 45%",
      "--radius": "0.125rem",
      "--success": "142 71% 45%",
      "--success-foreground": "0 0% 100%",
      "--warning": "44 92% 50%",
      "--warning-foreground": "0 0% 0%",
      "--sidebar-background": "156 16% 6%",
      "--sidebar-foreground": "137 18% 92%",
      "--sidebar-muted": "146 14% 10%",
      "--sidebar-muted-foreground": "150 10% 59%",
      "--glow-primary": "142 71% 45%",
      "--glow-secondary": "349 84% 63%",
      "--glow-accent": "44 92% 50%",
    },
    glassmorphism: {
      "--background": "227 23% 8%",
      "--foreground": "231 24% 94%",
      "--card": "229 23% 9%",
      "--card-foreground": "231 24% 94%",
      "--popover": "229 23% 9%",
      "--popover-foreground": "231 24% 94%",
      "--primary": "222 89% 63%",
      "--primary-foreground": "0 0% 100%",
      "--secondary": "258 90% 66%",
      "--secondary-foreground": "0 0% 100%",
      "--muted": "226 22% 12%",
      "--muted-foreground": "224 13% 60%",
      "--accent": "255 92% 76%",
      "--accent-foreground": "0 0% 100%",
      "--destructive": "349 84% 63%",
      "--destructive-foreground": "0 0% 100%",
      "--border": "225 21% 19%",
      "--input": "226 22% 12%",
      "--ring": "222 89% 63%",
      "--radius": "0.75rem",
      "--success": "158 64% 52%",
      "--success-foreground": "0 0% 100%",
      "--warning": "38 92% 50%",
      "--warning-foreground": "0 0% 0%",
      "--sidebar-background": "225 23% 14%",
      "--sidebar-foreground": "231 24% 94%",
      "--sidebar-muted": "226 22% 12%",
      "--sidebar-muted-foreground": "224 13% 60%",
      "--glow-primary": "222 89% 63%",
      "--glow-secondary": "258 90% 66%",
      "--glow-accent": "255 92% 76%",
    },
    monochrome: {
      "--background": "0 0% 4%",
      "--foreground": "0 0% 95%",
      "--card": "0 0% 5%",
      "--card-foreground": "0 0% 95%",
      "--popover": "0 0% 5%",
      "--popover-foreground": "0 0% 95%",
      "--primary": "0 0% 95%",
      "--primary-foreground": "0 0% 10%",
      "--secondary": "0 0% 10%",
      "--secondary-foreground": "0 0% 95%",
      "--muted": "0 0% 7%",
      "--muted-foreground": "0 0% 56%",
      "--accent": "15 100% 57%",
      "--accent-foreground": "0 0% 100%",
      "--destructive": "0 0% 24%",
      "--destructive-foreground": "0 0% 95%",
      "--border": "0 0% 14%",
      "--input": "0 0% 7%",
      "--ring": "15 100% 57%",
      "--radius": "0rem",
      "--success": "0 0% 95%",
      "--success-foreground": "0 0% 10%",
      "--warning": "15 100% 57%",
      "--warning-foreground": "0 0% 100%",
      "--sidebar-background": "0 0% 4%",
      "--sidebar-foreground": "0 0% 95%",
      "--sidebar-muted": "0 0% 7%",
      "--sidebar-muted-foreground": "0 0% 56%",
      "--glow-primary": "0 0% 95%",
      "--glow-secondary": "0 0% 56%",
      "--glow-accent": "15 100% 57%",
    },
    claro: {
      "--background": "45 27% 94%",
      "--foreground": "42 20% 10%",
      "--card": "0 0% 100%",
      "--card-foreground": "42 20% 10%",
      "--popover": "0 0% 100%",
      "--popover-foreground": "42 20% 10%",
      "--primary": "44 100% 33%",
      "--primary-foreground": "0 0% 100%",
      "--secondary": "45 27% 91%",
      "--secondary-foreground": "42 20% 10%",
      "--muted": "45 27% 91%",
      "--muted-foreground": "40 8% 50%",
      "--accent": "43 90% 41%",
      "--accent-foreground": "0 0% 100%",
      "--destructive": "349 51% 46%",
      "--destructive-foreground": "0 0% 100%",
      "--border": "43 22% 84%",
      "--input": "45 27% 91%",
      "--ring": "44 100% 33%",
      "--radius": "0.5rem",
      "--success": "159 80% 27%",
      "--success-foreground": "0 0% 100%",
      "--warning": "43 90% 41%",
      "--warning-foreground": "0 0% 100%",
      "--sidebar-background": "45 27% 94%",
      "--sidebar-foreground": "42 20% 10%",
      "--sidebar-muted": "45 27% 91%",
      "--sidebar-muted-foreground": "40 8% 50%",
      "--glow-primary": "44 100% 33%",
      "--glow-secondary": "159 80% 27%",
      "--glow-accent": "349 51% 46%",
    },
  };
}
