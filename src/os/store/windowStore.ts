// windowStore.ts — Zustand slice managing all open windows + focus stack
import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface WindowRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export type WindowState = "normal" | "minimized" | "maximized";

export interface WindowInstance {
  id: string;           // unique window id (uuid-ish)
  appId: string;        // maps to APP_REGISTRY key
  title: string;
  icon: string;
  rect: WindowRect;     // position + size when normal
  state: WindowState;
  zIndex: number;
  /** arbitrary data passed into the app component */
  data?: Record<string, unknown>;
}

interface WindowStore {
  windows: WindowInstance[];
  topZ: number;
  spawnOffset: number;

  openWindow: (
    appId: string,
    title: string,
    icon: string,
    defaultSize: { w: number; h: number },
    data?: Record<string, unknown>
  ) => string;
  closeWindow: (id: string) => void;
  minimizeWindow: (id: string) => void;
  maximizeWindow: (id: string) => void;
  restoreWindow: (id: string) => void;
  focusWindow: (id: string) => void;
  setRect: (id: string, rect: WindowRect) => void;
  setTitle: (id: string, title: string) => void;
  lastClosedApp: string | null;
  undoLastClose: () => void;
}

let _lastClosed: WindowInstance | null = null;

export const useWindowStore = create<WindowStore>()(
  persist(
    (set, get) => ({
      windows: [],
      topZ: 100,
      spawnOffset: 0,
      lastClosedApp: null,

      openWindow(appId, title, icon, defaultSize, data) {
        const { topZ, spawnOffset, windows } = get();
        const offset = (spawnOffset % 10) * 24;
        const newZ = topZ + 1;
        const id = `${appId}-${Date.now()}`;

        // Singleton check
        const existing = windows.find((w) => w.appId === appId);
        const singletonIds = ["calculator"]; // keep minimal for perf
        if (singletonIds.includes(appId) && existing) {
          set((s) => ({
            windows: s.windows.map((w) =>
              w.id === existing.id
                ? { ...w, state: w.state === "minimized" ? "normal" : w.state, zIndex: s.topZ + 1 }
                : w
            ),
            topZ: s.topZ + 1,
          }));
          return existing.id;
        }

        const newWin: WindowInstance = {
          id,
          appId,
          title,
          icon,
          rect: {
            x: 80 + offset,
            y: 40 + offset,
            w: defaultSize.w,
            h: defaultSize.h,
          },
          state: "normal",
          zIndex: newZ,
          data,
        };

        set((s) => ({
          windows: [...s.windows, newWin],
          topZ: newZ,
          spawnOffset: s.spawnOffset + 1,
        }));
        return id;
      },

      closeWindow(id) {
        const win = get().windows.find((w) => w.id === id);
        if (win) _lastClosed = win;
        set((s) => ({
          windows: s.windows.filter((w) => w.id !== id),
          lastClosedApp: win?.appId ?? null,
        }));
      },

      minimizeWindow(id) {
        set((s) => ({
          windows: s.windows.map((w) =>
            w.id === id ? { ...w, state: "minimized" } : w
          ),
        }));
      },

      maximizeWindow(id) {
        set((s) => ({
          windows: s.windows.map((w) =>
            w.id === id
              ? { ...w, state: "maximized", zIndex: s.topZ + 1 }
              : w
          ),
          topZ: s.topZ + 1,
        }));
      },

      restoreWindow(id) {
        set((s) => ({
          windows: s.windows.map((w) =>
            w.id === id
              ? { ...w, state: "normal", zIndex: s.topZ + 1 }
              : w
          ),
          topZ: s.topZ + 1,
        }));
      },

      focusWindow(id) {
        set((s) => {
          const newZ = s.topZ + 1;
          return {
            windows: s.windows.map((w) =>
              w.id === id ? { ...w, zIndex: newZ, state: w.state === "minimized" ? "normal" : w.state } : w
            ),
            topZ: newZ,
          };
        });
      },

      setRect(id, rect) {
        set((s) => ({
          windows: s.windows.map((w) => (w.id === id ? { ...w, rect } : w)),
        }));
      },

      setTitle(id, title) {
        set((s) => ({
          windows: s.windows.map((w) => (w.id === id ? { ...w, title } : w)),
        }));
      },

      undoLastClose() {
        if (!_lastClosed) return;
        const win = _lastClosed;
        _lastClosed = null;
        set((s) => ({
          windows: [...s.windows, { ...win, zIndex: s.topZ + 1, state: "normal" }],
          topZ: s.topZ + 1,
        }));
      },
    }),
    {
      name: "w98:v1:windows",
      // Don't persist windows across page reloads — fresh desktop each boot
      partialize: () => ({}),
    }
  )
);

