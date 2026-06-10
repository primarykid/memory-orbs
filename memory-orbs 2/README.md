# Memory Orbs 🔮

An AI-powered journal where every entry becomes a glowing crystal orb. Over time your universe fills with floating orbs you can push, shake, and tilt. Feelings made visible.

Inspired by *Inside Out 2* — 10 emotions, each mapped to a colour.

---

## Features

| | Feature |
|---|---|
| 🔮 | **Crystal orbs** — each journal entry becomes a unique coloured orb |
| 🌌 | **Living universe** — orbs drift, bounce off walls, and collide with each other |
| ✨ | **Gesture controls** — push with finger, shake to scatter, tilt for gravity |
| 🎭 | **10 emotions** — Joy, Sadness, Anger, Fear, Disgust, Anxiety, Envy, Embarrassment, Ennui, Nostalgia |
| 💫 | **Spawn animation** — new orbs burst into the universe with a spring effect |
| 🌠 | **Shooting stars** — the starfield comes alive every few seconds |
| 🔥 | **Streak tracking** — daily journaling streaks |
| 🤖 | **AI reflection** — Claude classifies your emotion and writes a reflection *(coming soon)* |
| 🎙️ | **Voice input** — speak your memory instead of typing *(transcription coming soon)* |

---

## Gestures

| Gesture | Action |
|---|---|
| Tap **+** or empty space | Add a new memory |
| Tap orb | View memory details |
| Long-press orb | Delete with confirmation |
| Drag finger across screen | Push orbs away |
| Shake phone | Scatter all orbs |
| Tilt phone | Apply gravity |
| Swipe down on sheet handle | Dismiss journal sheet |

---

## Emotion → Colour Map

| Emotion | Colour |
|---|---|
| Joy | `#FFD700` Golden |
| Sadness | `#4169E1` Royal Blue |
| Anger | `#FF4500` Red-Orange |
| Fear | `#9370DB` Purple |
| Disgust | `#50C878` Emerald |
| Anxiety | `#FF8C00` Dark Orange |
| Envy | `#00CED1` Teal |
| Embarrassment | `#FF69B4` Hot Pink |
| Ennui | `#778899` Slate |
| Nostalgia | `#DEB887` Burlywood |

---

## Tech Stack

| Layer | Tech |
|---|---|
| Framework | Expo React Native + TypeScript |
| State | Zustand + AsyncStorage |
| Animation | react-native-reanimated + Animated API |
| Audio | expo-av (voice recording) |
| Sensors | expo-sensors (accelerometer) |
| Backend | Supabase — Auth + Postgres *(coming soon)* |
| AI | Anthropic Claude API via Edge Function *(coming soon)* |
| Transcription | OpenAI Whisper *(coming soon)* |
| Payments | RevenueCat *(coming soon)* |

---

## Getting Started

```bash
git clone https://github.com/primarykid/memory-orbs
cd memory-orbs
npm install
npx expo start
```

Scan the QR code with **Expo Go** on your phone, or press `i` for iOS simulator / `a` for Android.

---

## Project Structure

```
src/
  components/
    CrystalOrb.tsx       — animated 6-layer crystal orb
    SpaceBackground.tsx  — deep navy + nebula gradients
    Starfield.tsx        — 135 stars + shooting stars
  constants/
    colors.ts            — colour palette (single source of truth)
    emotions.ts          — 10 emotions with keys + colours
    physics.ts           — physics simulation constants
  engines/
    PhysicsEngine.ts     — tick(), wall bounce, orb collisions, push, scatter, gravity
  hooks/
    useVoiceRecorder.ts  — expo-av recording wrapper
  screens/
    UniverseScreen.tsx   — main orb universe view
    JournalSheet.tsx     — bottom sheet for new entries
    MemoryModal.tsx      — orb detail overlay
    AuthScreen.tsx       — sign in / sign up / guest mode
    PaywallScreen.tsx    — premium upgrade
  stores/
    memoryStore.ts       — entries, streaks, physics persistence
    authStore.ts         — auth state
```

---

## Roadmap

- [ ] Supabase auth — email, Apple, Google sign-in
- [ ] Cloud sync — memories stored in Postgres
- [ ] Claude AI — emotion classification + reflections via Edge Function
- [ ] Voice transcription — Whisper via Edge Function
- [ ] RevenueCat paywall — unlimited orbs + AI features
- [ ] PostHog analytics
- [ ] Push notifications for daily streak reminders
