import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  AppState,
  PanResponder,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { Accelerometer } from 'expo-sensors';
import { LinearGradient } from 'expo-linear-gradient';

import { SpaceBackground } from '../components/SpaceBackground';
import { Starfield } from '../components/Starfield';
import CrystalOrb from '../components/CrystalOrb';
import JournalSheet from './JournalSheet';
import MemoryModal from './MemoryModal';
import { useMemoryStore, MemoryEntry } from '../stores/memoryStore';
import { useAuthStore } from '../stores/authStore';
import { Emotion } from '../constants/emotions';
import { PHYSICS } from '../constants/physics';
import {
  OrbPhysics,
  tick,
  pushOrbs,
  scatterOrbs,
  applyGravity,
} from '../engines/PhysicsEngine';

const RING_SIZE = PHYSICS.CURSOR_RADIUS * 2;

export default function UniverseScreen() {
  const entries = useMemoryStore((s) => s.entries);
  const currentStreak = useMemoryStore((s) => s.currentStreak);
  const addEntry = useMemoryStore((s) => s.addEntry);
  const deleteEntry = useMemoryStore((s) => s.deleteEntry);
  const updateOrbPhysics = useMemoryStore((s) => s.updateOrbPhysics);
  const signOut = useAuthStore((s) => s.signOut);

  const { width, height } = useWindowDimensions();

  const [isJournalOpen, setIsJournalOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<MemoryEntry | null>(null);

  // ─── Physics ──────────────────────────────────────────────────────────────
  const physicsRef = useRef<OrbPhysics[]>([]);
  const [renderOrbs, setRenderOrbs] = useState<OrbPhysics[]>([]);
  const rafRef = useRef<number>(0);
  const gravityRef = useRef({ gx: 0, gy: 0 });
  const activeTouchRef = useRef<{ x: number; y: number } | null>(null);

  // ─── Spawn animation ──────────────────────────────────────────────────────
  const spawnScales = useRef<Map<string, Animated.Value>>(new Map());
  const isMountedRef = useRef(false);

  useEffect(() => {
    const isFirstLoad = !isMountedRef.current;

    entries.forEach((entry) => {
      if (!spawnScales.current.has(entry.id)) {
        const scale = new Animated.Value(isFirstLoad ? 1 : 0);
        spawnScales.current.set(entry.id, scale);
        if (!isFirstLoad) {
          // 0 → 1.25 → 1.0 over ~600ms
          Animated.sequence([
            Animated.timing(scale, { toValue: 1.25, duration: 350, useNativeDriver: true }),
            Animated.spring(scale, { toValue: 1, friction: 8, tension: 100, useNativeDriver: true }),
          ]).start();
        }
      }
    });

    spawnScales.current.forEach((_, id) => {
      if (!entries.find((e) => e.id === id)) spawnScales.current.delete(id);
    });

    isMountedRef.current = true;
  }, [entries]);

  // ─── Sync entries → physics bodies (from saved state) ─────────────────────
  useEffect(() => {
    const currentIds = new Set(physicsRef.current.map((o) => o.id));
    const entryIds = new Set(entries.map((e) => e.id));

    entries.forEach((entry) => {
      if (!currentIds.has(entry.id)) {
        physicsRef.current.push({
          id: entry.id,
          x: entry.orbPosition.x,
          y: entry.orbPosition.y,
          vx: entry.orbVx,
          vy: entry.orbVy,
          radius: entry.orbRadius,
        });
      }
    });

    physicsRef.current = physicsRef.current.filter((o) => entryIds.has(o.id));
  }, [entries]);

  // ─── RAF physics loop ─────────────────────────────────────────────────────
  useEffect(() => {
    const animate = () => {
      let current = physicsRef.current;

      const { gx, gy } = gravityRef.current;
      if (gx !== 0 || gy !== 0) current = applyGravity(current, gx, gy);

      const touch = activeTouchRef.current;
      if (touch) current = pushOrbs(current, touch.x, touch.y);

      current = tick(current, width, height);
      physicsRef.current = current;
      setRenderOrbs([...current]);
      rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [width, height]);

  // ─── Save physics on app background ───────────────────────────────────────
  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'background' || state === 'inactive') {
        updateOrbPhysics(
          physicsRef.current.map((o) => ({ id: o.id, x: o.x, y: o.y, vx: o.vx, vy: o.vy })),
        );
      }
    });
    return () => sub.remove();
  }, [updateOrbPhysics]);

  // ─── Accelerometer: tilt gravity + shake to scatter ───────────────────────
  useEffect(() => {
    Accelerometer.setUpdateInterval(60);
    const prev = { x: 0, y: 0, z: 1 };
    let lastScatter = 0;

    const sub = Accelerometer.addListener(({ x, y, z }) => {
      const delta = Math.sqrt((x - prev.x) ** 2 + (y - prev.y) ** 2 + (z - prev.z) ** 2);
      const now = Date.now();
      if (delta > 1.8 && now - lastScatter > 1000) {
        physicsRef.current = scatterOrbs(physicsRef.current);
        lastScatter = now;
      }
      prev.x = x;
      prev.y = y;
      prev.z = z;
      gravityRef.current = {
        gx: x * PHYSICS.TILT_MULTIPLIER,
        gy: -y * PHYSICS.TILT_MULTIPLIER,
      };
    });

    return () => sub.remove();
  }, []);

  // ─── Cursor ring ──────────────────────────────────────────────────────────
  const ringPos = useRef(new Animated.ValueXY({ x: -200, y: -200 })).current;
  const ringOpacity = useRef(new Animated.Value(0)).current;

  // ─── Canvas PanResponder: finger push + cursor ring ───────────────────────
  // pageX/pageY are screen-absolute, so dragging over an orb doesn't skew
  // coordinates (locationX would be relative to the orb, not the canvas).
  const canvasPan = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, { dx, dy }) => Math.sqrt(dx * dx + dy * dy) > 4,
      onPanResponderGrant: (e) => {
        const { pageX: x, pageY: y } = e.nativeEvent;
        ringPos.setValue({ x, y });
        Animated.timing(ringOpacity, { toValue: 1, duration: 150, useNativeDriver: false }).start();
        activeTouchRef.current = { x, y };
      },
      onPanResponderMove: (e) => {
        const { pageX: x, pageY: y } = e.nativeEvent;
        ringPos.setValue({ x, y });
        activeTouchRef.current = { x, y };
      },
      onPanResponderRelease: () => {
        Animated.timing(ringOpacity, { toValue: 0, duration: 200, useNativeDriver: false }).start();
        activeTouchRef.current = null;
      },
      onPanResponderTerminate: () => {
        ringOpacity.setValue(0);
        activeTouchRef.current = null;
      },
    }),
  ).current;

  // ─── Long-press delete ────────────────────────────────────────────────────
  const handleLongPress = useCallback(
    (entry: MemoryEntry) => {
      Alert.alert('Remove Memory', 'Remove this orb from your universe?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Remove', style: 'destructive', onPress: () => deleteEntry(entry.id) },
      ]);
    },
    [deleteEntry],
  );

  // ─── Empty-state pulse ────────────────────────────────────────────────────
  const pulseAnim = useRef(new Animated.Value(0.4)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 0.8, duration: 1000, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 0.4, duration: 1000, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [pulseAnim]);

  const entryMap = useMemo(() => {
    const map = new Map<string, MemoryEntry>();
    entries.forEach((e) => map.set(e.id, e));
    return map;
  }, [entries]);

  const memoryLabel = useMemo(
    () => `${entries.length} ${entries.length === 1 ? 'memory' : 'memories'}`,
    [entries.length],
  );

  const handleSubmit = useCallback(
    ({ note, emotion, inputMethod }: { note: string; emotion?: Emotion; inputMethod?: 'text' | 'voice' }) => {
      addEntry(note, emotion?.label ?? 'Unknown', emotion?.color ?? '#FFFFFF', width, height, inputMethod);
      setIsJournalOpen(false);
    },
    [addEntry, width, height],
  );

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <View style={styles.container}>
      <View style={styles.layer0} pointerEvents="none"><SpaceBackground /></View>
      <View style={styles.layer0} pointerEvents="none"><Starfield /></View>

      <SafeAreaView style={styles.headerLayer}>
        <View style={styles.headerContent}>
          <View style={styles.brandRow}>
            <View style={styles.logoOrb} />
            <Text style={styles.brandText}>Memory Orbs</Text>
          </View>
          <View style={styles.rightMeta}>
            <View style={styles.streakBadge}>
              <Text style={styles.streakEmoji}>🔥</Text>
              <Text style={styles.streakCount}>{currentStreak}</Text>
            </View>
            <Pressable onPress={signOut} hitSlop={12}>
              <Text style={styles.memoryMeta}>{memoryLabel}</Text>
            </Pressable>
          </View>
        </View>
      </SafeAreaView>

      {/* Tap empty space → open journal (rendered behind orbs) */}
      <Pressable style={styles.tapBackground} onPress={() => setIsJournalOpen(true)} />

      {/* Orb canvas — drag for push */}
      <View style={styles.orbCanvas} {...canvasPan.panHandlers}>
        {renderOrbs.map((orb) => {
          const entry = entryMap.get(orb.id);
          if (!entry) return null;
          const diameter = orb.radius * 2;
          const spawnScale = spawnScales.current.get(orb.id) ?? new Animated.Value(1);
          return (
            <Animated.View
              key={orb.id}
              style={[
                styles.orbAnchor,
                {
                  left: orb.x - orb.radius,
                  top: orb.y - orb.radius,
                  width: diameter,
                  height: diameter,
                  transform: [{ scale: spawnScale }],
                },
              ]}
            >
              <CrystalOrb
                size={diameter}
                color={entry.color}
                onPress={() => setSelectedEntry(entry)}
                onLongPress={() => handleLongPress(entry)}
              />
            </Animated.View>
          );
        })}

        {entries.length === 0 && (
          <Animated.Text style={[styles.emptyText, { opacity: pulseAnim }]}>
            Tap anywhere to add your first memory
          </Animated.Text>
        )}

        {/* Cursor ring */}
        <Animated.View
          pointerEvents="none"
          style={[
            styles.cursorRing,
            {
              opacity: ringOpacity,
              transform: [
                { translateX: Animated.subtract(ringPos.x, RING_SIZE / 2) },
                { translateY: Animated.subtract(ringPos.y, RING_SIZE / 2) },
              ],
            },
          ]}
        />
      </View>

      {/* FAB */}
      <View style={styles.fabContainer} pointerEvents="box-none">
        <Pressable
          onPress={() => setIsJournalOpen(true)}
          style={({ pressed }) => [styles.fabPressable, pressed && styles.fabPressed]}
          accessibilityRole="button"
          accessibilityLabel="Add memory"
        >
          <LinearGradient
            colors={['#7B61FF', '#4A44D8']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.fabGradient}
          >
            <Text style={styles.plusIcon}>+</Text>
          </LinearGradient>
        </Pressable>
      </View>

      <JournalSheet
        visible={isJournalOpen}
        onClose={() => setIsJournalOpen(false)}
        onSubmit={handleSubmit}
      />

      <MemoryModal
        entry={selectedEntry}
        visible={selectedEntry !== null}
        onClose={() => setSelectedEntry(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#030712' },
  layer0: { ...StyleSheet.absoluteFillObject, zIndex: 0 },
  headerLayer: { zIndex: 10, paddingHorizontal: 20, paddingTop: 8 },
  headerContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logoOrb: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#7B61FF',
    shadowColor: '#7B61FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 8,
  },
  brandText: { color: '#FFF', fontSize: 18, fontWeight: '700' },
  rightMeta: { alignItems: 'flex-end', gap: 6 },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,140,66,0.15)',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  streakEmoji: { fontSize: 12 },
  streakCount: { color: '#FF8C42', fontSize: 13, fontWeight: '700' },
  memoryMeta: { color: '#FFF', fontSize: 13, opacity: 0.4 },
  tapBackground: { ...StyleSheet.absoluteFillObject, zIndex: 4 },
  orbCanvas: { ...StyleSheet.absoluteFillObject, zIndex: 5 },
  orbAnchor: { position: 'absolute' },
  emptyText: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: '50%',
    transform: [{ translateY: -12 }],
    textAlign: 'center',
    color: '#FFF',
    fontSize: 16,
    opacity: 0.4,
  },
  cursorRing: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: RING_SIZE,
    height: RING_SIZE,
    borderRadius: RING_SIZE / 2,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.45)',
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  fabContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 34,
    zIndex: 20,
  },
  fabPressable: {
    width: 64,
    height: 64,
    borderRadius: 32,
    shadowColor: '#6E56FF',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.45,
    shadowRadius: 18,
    elevation: 14,
  },
  fabPressed: { transform: [{ scale: 0.96 }] },
  fabGradient: { flex: 1, borderRadius: 32, alignItems: 'center', justifyContent: 'center' },
  plusIcon: { color: '#FFF', fontSize: 34, lineHeight: 34, fontWeight: '600', marginTop: -2 },
});
