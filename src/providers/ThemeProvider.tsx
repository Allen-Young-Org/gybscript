 
import React, { createContext, useContext, useEffect, useState } from "react";
 
import { useAuth } from "@/providers/AuthProvider";
import { AccentColor, ThemeSettingsService } from "@/api/ThemeSetting";
 
export type Theme = "dark" | "light" | "system";
 
interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: Theme;
  defaultAccentColor?: AccentColor;
  storageKey?: string;
}
 
interface ThemeContextState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  accentColor: AccentColor;
  setAccentColor: (color: AccentColor) => void;
  isDarkMode: boolean;
  isLoading: boolean;
}
 
const DEFAULT_ACCENT_COLOR = "#C09239";
 
const initialState: ThemeContextState = {
  theme: "system",
  setTheme: () => null,
  accentColor: DEFAULT_ACCENT_COLOR,
  setAccentColor: () => null,
  isDarkMode: false,
  isLoading: true
};
 
const ThemeProviderContext = createContext<ThemeContextState>(initialState);

 
export function ThemeProvider({
  children,
  defaultTheme = "system",
  defaultAccentColor = DEFAULT_ACCENT_COLOR,
  storageKey = "vite-ui-theme",
  ...props
}: ThemeProviderProps) { 
  const { currentUser } = useAuth();
   
  const [theme, setThemeState] = useState<Theme>(
    () => (localStorage.getItem(storageKey) as Theme) || defaultTheme
  );
  const [accentColor, setAccentColorState] = useState<AccentColor>(defaultAccentColor);
  const [isLoading, setIsLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);
 
  useEffect(() => {
    const loadThemeSettings = async () => {
      if (currentUser?.id) {
        setIsLoading(true);
        try {
          const settings = await ThemeSettingsService.getThemeSettings(currentUser.id);
          
          if (settings) { 
            if (settings.theme) {
              setThemeState(settings.theme);
              localStorage.setItem(storageKey, settings.theme);
            }
             
            if (settings.accentColor) {
              setAccentColorState(settings.accentColor);
              document.documentElement.style.setProperty('--accent-color', settings.accentColor);
            }
          }
        } catch (error) {
          console.error("Error loading theme settings:", error);
        } finally {
          setIsLoading(false);
        }
      } else { 
        setIsLoading(false);
      }
    };

    loadThemeSettings();
  }, [currentUser, storageKey]);
 
  useEffect(() => {
    const root = window.document.documentElement;
     
    root.classList.remove("light", "dark");
    
    let appliedTheme: "light" | "dark";
     
    if (theme === "system") {
      appliedTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
    } else {
      appliedTheme = theme as "light" | "dark";
    }
     
    root.classList.add(appliedTheme);
    setIsDarkMode(appliedTheme === "dark");
     
    document.documentElement.style.setProperty('--accent-color', accentColor);
  }, [theme, accentColor]);
 
  const setTheme = async (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem(storageKey, newTheme);
     
    if (currentUser?.id) {
      try {
        await ThemeSettingsService.updateThemeSettings(currentUser.id, {
          theme: newTheme
        });
      } catch (error) {
        console.error("Error saving theme to Firestore:", error);
      }
    }
  };
 
  const setAccentColor = async (newColor: AccentColor) => {
    setAccentColorState(newColor);
 
    if (currentUser?.id) {
      try {
        await ThemeSettingsService.updateThemeSettings(currentUser.id, {
          accentColor: newColor
        });
      } catch (error) {
        console.error("Error saving accent color to Firestore:", error);
      }
    }
  };
 
  const value: ThemeContextState = {
    theme,
    setTheme,
    accentColor,
    setAccentColor,
    isDarkMode,
    isLoading
  };

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

 
export const useTheme = () => {
  const context = useContext(ThemeProviderContext);
  
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  
  return context;
};