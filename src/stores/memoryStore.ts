import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

const STORAGE_KEY = 'memory-orbs-entries';
const MIN_ORB_DISTANCE = 80;
const DEFAULT_ORB_BOUNDS = { width: 360, height: 640 };

export interface MemoryEntry {
  id: string;
  text: string;
  emotion: string;
  color: string;
  createdAt: string;
  aiReflection?: string;
  orbPosition: {
    x: number;
    y: number;
  };
}

interface MemoryStoreState {
  entries: MemoryEntry[];
  currentStreak: number;
  longestStreak: number;
  addEntry: (text: string, emotion: string, color: string) => void;
  deleteEntry: (id: string) => void;
  loadEntries: () => Promise<void>;
}

const randomId = (): string => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
};

const distanceBetween = (
  a: { x: number; y: number },
  b: { x: number; y: number },
): number => {
  const dx = a.x - b.x;
  const dy = a.y - b.y;

  return Math.sqrt(dx * dx + dy * dy);
};

const generateOrbPosition = (existingEntries: MemoryEntry[]): { x: number; y: number } => {
  const maxAttempts = 100;

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const candidate = {
      x: Math.round(Math.random() * DEFAULT_ORB_BOUNDS.width),
      y: Math.round(Math.random() * DEFAULT_ORB_BOUNDS.height),
    };

    const overlapsExisting = existingEntries.some((entry) => {
      return distanceBetween(candidate, entry.orbPosition) < MIN_ORB_DISTANCE;
    });

    if (!overlapsExisting) {
      return candidate;
    }
  }

  return {
    x: Math.round(Math.random() * DEFAULT_ORB_BOUNDS.width),
    y: Math.round(Math.random() * DEFAULT_ORB_BOUNDS.height),
  };
};

const calculateStreaks = (
  entries: MemoryEntry[],
  previousLongestStreak: number,
): { currentStreak: number; longestStreak: number } => {
  if (entries.length === 0) {
    return { currentStreak: 0, longestStreak: previousLongestStreak };
  }

  const uniqueDays = [...new Set(entries.map((entry) => entry.createdAt.slice(0, 10)))].sort();

  let longest = 1;
  let run = 1;

  for (let i = 1; i < uniqueDays.length; i += 1) {
    const prev = new Date(`${uniqueDays[i - 1]}T00:00:00.000Z`);
    const curr = new Date(`${uniqueDays[i]}T00:00:00.000Z`);
    const diffInDays = Math.round((curr.getTime() - prev.getTime()) / 86400000);

    if (diffInDays === 1) {
      run += 1;
      longest = Math.max(longest, run);
    } else {
      run = 1;
    }
  }

  const todayIso = new Date().toISOString().slice(0, 10);
  let current = 0;

  if (uniqueDays.includes(todayIso)) {
    current = 1;

    for (let i = uniqueDays.length - 1; i > 0; i -= 1) {
      const curr = new Date(`${uniqueDays[i]}T00:00:00.000Z`);
      const prev = new Date(`${uniqueDays[i - 1]}T00:00:00.000Z`);
      const diffInDays = Math.round((curr.getTime() - prev.getTime()) / 86400000);

      if (diffInDays === 1) {
        current += 1;
      } else {
        break;
      }
    }
  }

  return {
    currentStreak: current,
    longestStreak: Math.max(previousLongestStreak, longest),
  };
};

export const useMemoryStore = create<MemoryStoreState>()(
  persist(
    (set, get) => ({
      entries: [],
      currentStreak: 0,
      longestStreak: 0,
      addEntry: (text, emotion, color) => {
        const nextEntry: MemoryEntry = {
          id: randomId(),
          text,
          emotion,
          color,
          createdAt: new Date().toISOString(),
          orbPosition: generateOrbPosition(get().entries),
        };

        set((state) => {
          const entries = [nextEntry, ...state.entries];
          const streaks = calculateStreaks(entries, state.longestStreak);

          return {
            entries,
            currentStreak: streaks.currentStreak,
            longestStreak: streaks.longestStreak,
          };
        });
      },
      deleteEntry: (id) => {
        set((state) => {
          const entries = state.entries.filter((entry) => entry.id !== id);
          const streaks = calculateStreaks(entries, state.longestStreak);

          return {
            entries,
            currentStreak: streaks.currentStreak,
            longestStreak: streaks.longestStreak,
          };
        });
      },
      loadEntries: async () => {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);

        if (!raw) {
          return;
        }

        const persisted = JSON.parse(raw) as {
          state?: Pick<MemoryStoreState, 'entries' | 'currentStreak' | 'longestStreak'>;
        };

        if (!persisted.state) {
          return;
        }

        set({
          entries: persisted.state.entries ?? [],
          currentStreak: persisted.state.currentStreak ?? 0,
          longestStreak: persisted.state.longestStreak ?? 0,
        });
      },
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        entries: state.entries,
        currentStreak: state.currentStreak,
        longestStreak: state.longestStreak,
      }),
    },
  ),
);
