// achievementStore.ts — tracks Easter egg unlocks
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AchievementStore {
  unlocked: Record<string, boolean>;
  count: number;
  lastUnlocked: string | null;
  unlock: (id: string, friendlyName?: string) => void;
  reset: () => void;
}

export const useAchievementStore = create<AchievementStore>()(
  persist(
    (set, get) => ({
      unlocked: {},
      count: 0,
      lastUnlocked: null,

      unlock(id, friendlyName) {
        const { unlocked } = get();
        if (unlocked[id]) return; // idempotent
        set((s) => ({
          unlocked: { ...s.unlocked, [id]: true },
          count: s.count + 1,
          lastUnlocked: friendlyName ?? id,
        }));
      },

      reset() {
        set({ unlocked: {}, count: 0, lastUnlocked: null });
      },
    }),
    { name: "w98:v1:achievements" }
  )
);

