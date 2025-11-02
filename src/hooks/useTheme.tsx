import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type ThemeName = "binance" | "terminal" | "glassmorphism" | "monochrome";

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
      "--background": "216 14% 10%",
      "--foreground": "0 0% 95%",
      "--card": "220 13% 18%",
      "--card-foreground": "0 0% 95%",
      "--popover": "220 13% 18%",
      "--popover-foreground": "0 0% 95%",
      "--primary": "44 92% 50%",
      "--primary-foreground": "0 0% 0%",
      "--secondary": "220 13% 22%",
      "--secondary-foreground": "0 0% 95%",
      "--muted": "220 13% 15%",
      "--muted-foreground": "0 0% 60%",
      "--accent": "44 92% 50%",
      "--accent-foreground": "0 0% 0%",
      "--destructive": "351 83% 62%",
      "--destructive-foreground": "0 0% 100%",
      "--border": "220 13% 25%",
      "--input": "220 13% 15%",
      "--ring": "44 92% 50%",
      "--radius": "0.375rem",
      "--success": "158 64% 52%",
      "--success-foreground": "0 0% 0%",
      "--warning": "44 92% 50%",
      "--warning-foreground": "0 0% 0%",
      "--sidebar-background": "216 14% 10%",
      "--sidebar-foreground": "0 0% 95%",
      "--sidebar-muted": "220 13% 15%",
      "--sidebar-muted-foreground": "0 0% 60%",
      "--glow-primary": "44 92% 50%",
      "--glow-secondary": "158 64% 52%",
      "--glow-accent": "351 83% 62%",
    },
    terminal: {
      "--background": "0 0% 0%",
      "--foreground": "0 0% 95%",
      "--card": "0 0% 5%",
      "--card-foreground": "0 0% 95%",
      "--popover": "0 0% 5%",
      "--popover-foreground": "0 0% 95%",
      "--primary": "142 76% 36%",
      "--primary-foreground": "0 0% 100%",
      "--secondary": "0 0% 20%",
      "--secondary-foreground": "0 0% 95%",
      "--muted": "0 0% 15%",
      "--muted-foreground": "0 0% 60%",
      "--accent": "45 93% 47%",
      "--accent-foreground": "0 0% 0%",
      "--destructive": "0 84% 60%",
      "--destructive-foreground": "0 0% 100%",
      "--border": "0 0% 20%",
      "--input": "0 0% 10%",
      "--ring": "142 76% 36%",
      "--radius": "0.125rem",
      "--success": "142 76% 36%",
      "--success-foreground": "0 0% 100%",
      "--warning": "45 93% 47%",
      "--warning-foreground": "0 0% 0%",
      "--sidebar-background": "0 0% 0%",
      "--sidebar-foreground": "0 0% 95%",
      "--sidebar-muted": "0 0% 10%",
      "--sidebar-muted-foreground": "0 0% 60%",
      "--glow-primary": "142 76% 36%",
      "--glow-secondary": "0 84% 60%",
      "--glow-accent": "45 93% 47%",
    },
    glassmorphism: {
      "--background": "240 10% 8%",
      "--foreground": "0 0% 98%",
      "--card": "240 10% 12%",
      "--card-foreground": "0 0% 98%",
      "--popover": "240 10% 12%",
      "--popover-foreground": "0 0% 98%",
      "--primary": "221 83% 53%",
      "--primary-foreground": "0 0% 100%",
      "--secondary": "262 52% 47%",
      "--secondary-foreground": "0 0% 100%",
      "--muted": "240 10% 20%",
      "--muted-foreground": "240 5% 65%",
      "--accent": "280 65% 60%",
      "--accent-foreground": "0 0% 100%",
      "--destructive": "0 72% 51%",
      "--destructive-foreground": "0 0% 100%",
      "--border": "240 10% 25%",
      "--input": "240 10% 15%",
      "--ring": "221 83% 53%",
      "--radius": "0.75rem",
      "--success": "142 71% 45%",
      "--success-foreground": "0 0% 100%",
      "--warning": "38 92% 50%",
      "--warning-foreground": "0 0% 0%",
      "--sidebar-background": "240 10% 10%",
      "--sidebar-foreground": "0 0% 98%",
      "--sidebar-muted": "240 10% 15%",
      "--sidebar-muted-foreground": "240 5% 65%",
      "--glow-primary": "221 83% 53%",
      "--glow-secondary": "262 52% 47%",
      "--glow-accent": "280 65% 60%",
    },
    monochrome: {
      "--background": "0 0% 0%",
      "--foreground": "0 0% 95%",
      "--card": "0 0% 8%",
      "--card-foreground": "0 0% 95%",
      "--popover": "0 0% 8%",
      "--popover-foreground": "0 0% 95%",
      "--primary": "0 0% 95%",
      "--primary-foreground": "0 0% 10%",
      "--secondary": "0 0% 18%",
      "--secondary-foreground": "0 0% 95%",
      "--muted": "0 0% 12%",
      "--muted-foreground": "0 0% 60%",
      "--accent": "14 100% 57%",
      "--accent-foreground": "0 0% 100%",
      "--destructive": "0 0% 35%",
      "--destructive-foreground": "0 0% 95%",
      "--border": "0 0% 18%",
      "--input": "0 0% 10%",
      "--ring": "14 100% 57%",
      "--radius": "0rem",
      "--success": "0 0% 95%",
      "--success-foreground": "0 0% 10%",
      "--warning": "14 100% 57%",
      "--warning-foreground": "0 0% 100%",
      "--sidebar-background": "0 0% 0%",
      "--sidebar-foreground": "0 0% 95%",
      "--sidebar-muted": "0 0% 10%",
      "--sidebar-muted-foreground": "0 0% 60%",
      "--glow-primary": "0 0% 95%",
      "--glow-secondary": "0 0% 60%",
      "--glow-accent": "14 100% 57%",
    },
  };
}
