// themeStore.ts — Handles desktop wallpaper, CRT filter, and display settings
import { create } from "zustand";
import { persist } from "zustand/middleware";

export type WallpaperId = "teal" | "clouds" | "navy" | "setup" | "black";

interface ThemeState {
  wallpaper: WallpaperId;
  crtEnabled: boolean;
  setWallpaper: (id: WallpaperId) => void;
  setCrtEnabled: (enabled: boolean) => void;
  toggleCrt: () => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      wallpaper: "teal",
      crtEnabled: false,

      setWallpaper: (wallpaper) => set({ wallpaper }),
      setCrtEnabled: (crtEnabled) => set({ crtEnabled }),
      toggleCrt: () => set((s) => ({ crtEnabled: !s.crtEnabled })),
    }),
    {
      name: "w98:v1:theme",
    }
  )
);
