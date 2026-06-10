import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { PHYSICS } from '../constants/physics';

const STORAGE_KEY = 'memory-orbs-entries';
const MIN_ORB_DISTANCE = 80;

// ─── Types ────────────────────────────────────────────────────────────────────

export interface MemoryEntry {
  id: string;
  text: string;
  emotion: string;
  color: string;
  inputMethod: 'text' | 'voice';
  aiClassified: boolean;
  aiReflection?: string;
  createdAt: string;
  updatedAt: string;
  // Physics state — persisted so orbs resume where they left off
  orbPosition: { x: number; y: number };
  orbVx: number;
  orbVy: number;
  orbRadius: number;
}

interface MemoryStoreState {
  entries: MemoryEntry[];
  currentStreak: number;
  longestStreak: number;
  addEntry: (
    text: string,
    emotion: string,
    color: string,
    screenWidth?: number,
    screenHeight?: number,
    inputMethod?: 'text' | 'voice',
  ) => void;
  deleteEntry: (id: string) => void;
  updateOrbPhysics: (
    updates: Array<{ id: string; x: number; y: number; vx: number; vy: number }>,
  ) => void;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const randomId = (): string => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
};

const distanceBetween = (a: { x: number; y: number }, b: { x: number; y: number }): number => {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
};

const randomOrbRadius = (): number =>
  PHYSICS.ORB_RADIUS_MIN +
  Math.floor(Math.random() * (PHYSICS.ORB_RADIUS_MAX - PHYSICS.ORB_RADIUS_MIN + 1));

const randomInitialVelocity = (): { vx: number; vy: number } => {
  const angle = Math.random() * Math.PI * 2;
  const speed =
    PHYSICS.MIN_SPEED + Math.random() * (PHYSICS.MAX_SPEED - PHYSICS.MIN_SPEED) * 0.4;
  return { vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed };
};

/** Place a new orb without overlapping existing ones, using real screen size. */
const generateOrbPosition = (
  existingEntries: MemoryEntry[],
  screenWidth: number,
  screenHeight: number,
): { x: number; y: number } => {
  const pad = PHYSICS.ORB_RADIUS_MAX;
  const randomPos = () => ({
    x: Math.round(pad + Math.random() * Math.max(1, screenWidth - pad * 2)),
    y: Math.round(pad + Math.random() * Math.max(1, screenHeight - pad * 2)),
  });

  for (let attempt = 0; attempt < 100; attempt += 1) {
    const candidate = randomPos();
    const overlaps = existingEntries.some(
      (e) => distanceBetween(candidate, e.orbPosition) < MIN_ORB_DISTANCE,
    );
    if (!overlaps) return candidate;
  }

  return randomPos();
};

/**
 * Backfill physics fields on entries saved by older app versions.
 * Without this, orbVx/orbVy/orbRadius are undefined → NaN positions → invisible orbs.
 */
const normalizeEntry = (entry: Partial<MemoryEntry> & { id: string }): MemoryEntry => {
  const { vx, vy } = randomInitialVelocity();
  return {
    text: '',
    emotion: 'Unknown',
    color: '#FFFFFF',
    inputMethod: 'text',
    aiClassified: false,
    createdAt: new Date().toISOString(),
    updatedAt: entry.createdAt ?? new Date().toISOString(),
    orbPosition: { x: 100, y: 100 },
    ...entry,
    orbVx: typeof entry.orbVx === 'number' ? entry.orbVx : vx,
    orbVy: typeof entry.orbVy === 'number' ? entry.orbVy : vy,
    orbRadius: typeof entry.orbRadius === 'number' ? entry.orbRadius : randomOrbRadius(),
  } as MemoryEntry;
};

const calculateStreaks = (
  entries: MemoryEntry[],
  previousLongestStreak: number,
): { currentStreak: number; longestStreak: number } => {
  if (entries.length === 0) {
    return { currentStreak: 0, longestStreak: previousLongestStreak };
  }

  const uniqueDays = [...new Set(entries.map((e) => e.createdAt.slice(0, 10)))].sort();

  let longest = 1;
  let run = 1;

  for (let i = 1; i < uniqueDays.length; i += 1) {
    const prev = new Date(`${uniqueDays[i - 1]}T00:00:00.000Z`);
    const curr = new Date(`${uniqueDays[i]}T00:00:00.000Z`);
    const diff = Math.round((curr.getTime() - prev.getTime()) / 86400000);
    if (diff === 1) {
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
      const diff = Math.round((curr.getTime() - prev.getTime()) / 86400000);
      if (diff === 1) current += 1;
      else break;
    }
  }

  return {
    currentStreak: current,
    longestStreak: Math.max(previousLongestStreak, longest),
  };
};

// ─── Store ────────────────────────────────────────────────────────────────────

export const useMemoryStore = create<MemoryStoreState>()(
  persist(
    (set, get) => ({
      entries: [],
      currentStreak: 0,
      longestStreak: 0,

      addEntry: (text, emotion, color, screenWidth = 390, screenHeight = 844, inputMethod = 'text') => {
        const now = new Date().toISOString();
        const { vx, vy } = randomInitialVelocity();

        const nextEntry: MemoryEntry = {
          id: randomId(),
          text,
          emotion,
          color,
          inputMethod,
          aiClassified: false,
          createdAt: now,
          updatedAt: now,
          orbPosition: generateOrbPosition(get().entries, screenWidth, screenHeight),
          orbVx: vx,
          orbVy: vy,
          orbRadius: randomOrbRadius(),
        };

        set((state) => {
          const entries = [nextEntry, ...state.entries];
          const streaks = calculateStreaks(entries, state.longestStreak);
          return { entries, ...streaks };
        });
      },

      deleteEntry: (id) => {
        set((state) => {
          const entries = state.entries.filter((e) => e.id !== id);
          const streaks = calculateStreaks(entries, state.longestStreak);
          return { entries, ...streaks };
        });
      },

      /** Save live physics positions back to the store (called on app background). */
      updateOrbPhysics: (updates) => {
        set((state) => ({
          entries: state.entries.map((entry) => {
            const u = updates.find((up) => up.id === entry.id);
            if (!u) return entry;
            return {
              ...entry,
              orbPosition: { x: u.x, y: u.y },
              orbVx: u.vx,
              orbVy: u.vy,
              updatedAt: new Date().toISOString(),
            };
          }),
        }));
      },
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => AsyncStorage),
      version: 2,
      // Backfill physics fields for entries saved by older versions
      migrate: (persisted: unknown) => {
        const state = persisted as Partial<MemoryStoreState>;
        return {
          ...state,
          entries: (state.entries ?? []).map(normalizeEntry),
        };
      },
      partialize: (state) => ({
        entries: state.entries,
        currentStreak: state.currentStreak,
        longestStreak: state.longestStreak,
      }),
    },
  ),
);
