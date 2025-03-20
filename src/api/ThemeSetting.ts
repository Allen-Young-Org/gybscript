/* eslint-disable @typescript-eslint/no-explicit-any */
// src/services/ThemeSettingsService.ts
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/firebase";
import { Theme } from "@/providers/ThemeProvider";

export type AccentColor = string;

export interface ThemeSettings {
  theme: Theme;
  accentColor: AccentColor;
  updatedAt?: any;
  userId: string;
}

export interface ThemeSettingsUpdateParams {
  theme?: Theme;
  accentColor?: AccentColor;
}

const COLLECTION_NAME = "settings";
const DEFAULT_ACCENT_COLOR = "#C09239";


export class ThemeSettingsService {

  static async getThemeSettings(userId: string): Promise<ThemeSettings | null> {
    try {
      const docRef = doc(db, COLLECTION_NAME, userId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return docSnap.data() as ThemeSettings;
      }

      const defaultSettings: ThemeSettings = {
        theme: 'system',
        accentColor: DEFAULT_ACCENT_COLOR,
        userId: userId,
        updatedAt: serverTimestamp()
      };

      await setDoc(docRef, defaultSettings);
      return defaultSettings;
    } catch (error) {
      console.error("Error getting theme settings:", error);
      return null;
    }
  }


  static async updateThemeSettings(
    userId: string,
    settings: ThemeSettingsUpdateParams
  ): Promise<void> {
    try {
      const docRef = doc(db, COLLECTION_NAME, userId);
      const docSnap = await getDoc(docRef);

      const updateData = {
        ...settings,
        updatedAt: serverTimestamp()
      };

      if (docSnap.exists()) {
        await updateDoc(docRef, updateData);
      } else {
        await setDoc(docRef, {
          theme: settings.theme || 'system',
          accentColor: settings.accentColor || DEFAULT_ACCENT_COLOR,
          userId: userId,
          updatedAt: serverTimestamp()
        });
      }
    } catch (error) {
      console.error("Error updating theme settings:", error);
      throw error;
    }
  }
}