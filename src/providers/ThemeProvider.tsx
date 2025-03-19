
import React, { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "@/providers/AuthProvider";
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/firebase";

export type Theme = "dark" | "light" | "system";
export type AccentColor = string;

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
  const { currentUser, userDetails } = useAuth();
  
  const [theme, setThemeState] = useState<Theme>(
    () => (localStorage.getItem(storageKey) as Theme) || defaultTheme
  );
  const [accentColor, setAccentColorState] = useState<AccentColor>(
    () => localStorage.getItem(`${storageKey}-accent`) || defaultAccentColor
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const saveThemeSettings = async (userId: string, newTheme?: Theme, newAccentColor?: AccentColor) => {
    try {
      const settingsRef = doc(db, "settings", userId);
      const docSnap = await getDoc(settingsRef);
      
      if (docSnap.exists()) {
        await updateDoc(settingsRef, {
          ...(newTheme && { theme: newTheme }),
          ...(newAccentColor && { accentColor: newAccentColor }),
          updatedAt: serverTimestamp()
        });
      } else {
        await setDoc(settingsRef, {
          theme: newTheme || theme,
          accentColor: newAccentColor || accentColor,
          userId,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      }
      return true;
    } catch (error) {
      console.error("Error saving theme settings:", error);
      return false;
    }
  };

  const loadThemeSettings = async (userId: string) => {
    try {
      const settingsRef = doc(db, "theme_settings", userId);
      const docSnap = await getDoc(settingsRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.theme) {
          setThemeState(data.theme);
          localStorage.setItem(storageKey, data.theme);
        }
        if (data.accentColor) {
          setAccentColorState(data.accentColor);
          localStorage.setItem(`${storageKey}-accent`, data.accentColor);
          document.documentElement.style.setProperty('--accent-color', data.accentColor);
        }
        return true;
      } else {
        await saveThemeSettings(userId);
        return false;
      }
    } catch (error) {
      console.error("Error loading theme settings:", error);
      return false;
    }
  };

  useEffect(() => {
    const getUserId = () => {
      if (userDetails?.id) return userDetails.id;
      if (currentUser?.uid) return currentUser.uid;
      return null;
    };

    const userId = getUserId();
    if (userId) {
      setIsLoading(true);
      loadThemeSettings(userId).finally(() => {
        setIsLoading(false);
      });
    } else {
      setIsLoading(false);
    }
  }, [currentUser, userDetails]);

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

    const userId = userDetails?.id || currentUser?.uid;
    if (userId) {
      saveThemeSettings(userId, newTheme);
    }
  };

  const setAccentColor = async (newColor: AccentColor) => {
    setAccentColorState(newColor);
    localStorage.setItem(`${storageKey}-accent`, newColor);
    
    const userId = userDetails?.id || currentUser?.uid;
    if (userId) {
      saveThemeSettings(userId, undefined, newColor);
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