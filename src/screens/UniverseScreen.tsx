import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { SpaceBackground } from '../components/SpaceBackground';
import { Starfield } from '../components/Starfield';
import { CrystalOrb } from '../components/CrystalOrb';
import { JournalSheet } from '../components/JournalSheet';
import { useMemoryStore } from '../store/memoryStore';

type OrbPosition = {
  x: number;
  y: number;
};

type MemoryEntry = {
  id: string;
  orbPosition: OrbPosition;
};

export default function UniverseScreen() {
  const memories = useMemoryStore((state) => state.memories as MemoryEntry[]);
  const [isJournalOpen, setIsJournalOpen] = useState(false);
  const pulseAnim = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 0.8,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.4,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]),
    );

    loop.start();
    return () => loop.stop();
  }, [pulseAnim]);

  const memoryCount = memories.length;
  const streakCount = useMemoryStore((state) => (state as { streak?: number }).streak ?? 7);
  const hasMemories = memoryCount > 0;

  const memoryLabel = useMemo(
    () => `${memoryCount} ${memoryCount === 1 ? 'memory' : 'memories'}`,
    [memoryCount],
  );

  return (
    <View style={styles.container}>
      <View style={styles.backgroundLayer} pointerEvents="none">
        <SpaceBackground />
      </View>

      <View style={styles.starfieldLayer} pointerEvents="none">
        <Starfield />
      </View>

      <SafeAreaView style={styles.headerLayer}>
        <View style={styles.headerContent}>
          <View style={styles.brandRow}>
            <View style={styles.logoOrb} />
            <Text style={styles.brandText}>Memory Orbs</Text>
          </View>

          <View style={styles.rightMeta}>
            <View style={styles.streakBadge}>
              <Text style={styles.streakEmoji}>🔥</Text>
              <Text style={styles.streakCount}>{streakCount}</Text>
            </View>
            <Text style={styles.memoryMeta}>{memoryLabel}</Text>
          </View>
        </View>
      </SafeAreaView>

      <View style={styles.orbCanvas}>
        {memories.map((memory) => (
          <View
            key={memory.id}
            style={[
              styles.orbAnchor,
              {
                left: memory.orbPosition.x,
                top: memory.orbPosition.y,
              },
            ]}
          >
            <CrystalOrb memory={memory} />
          </View>
        ))}

        {!hasMemories && (
          <Animated.Text style={[styles.emptyStateText, { opacity: pulseAnim }]}>
            Tap + to add your first memory
          </Animated.Text>
        )}
      </View>

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

      <JournalSheet visible={isJournalOpen} onClose={() => setIsJournalOpen(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#030712',
  },
  backgroundLayer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0,
  },
  starfieldLayer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
  },
  headerLayer: {
    zIndex: 10,
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  headerContent: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  brandRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
  },
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
  brandText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  rightMeta: {
    alignItems: 'flex-end',
    gap: 6,
  },
  streakBadge: {
    alignItems: 'center',
    alignSelf: 'flex-end',
    backgroundColor: 'rgba(255,140,66,0.15)',
    borderRadius: 999,
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  streakEmoji: {
    fontSize: 12,
  },
  streakCount: {
    color: '#FF8C42',
    fontSize: 13,
    fontWeight: '700',
  },
  memoryMeta: {
    color: '#FFFFFF',
    fontSize: 13,
    opacity: 0.4,
  },
  orbCanvas: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 5,
  },
  orbAnchor: {
    position: 'absolute',
  },
  emptyStateText: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: '50%',
    transform: [{ translateY: -12 }],
    textAlign: 'center',
    color: '#FFFFFF',
    fontSize: 16,
    opacity: 0.4,
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
  fabPressed: {
    transform: [{ scale: 0.96 }],
  },
  fabGradient: {
    flex: 1,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  plusIcon: {
    color: '#FFFFFF',
    fontSize: 34,
    lineHeight: 34,
    fontWeight: '600',
    marginTop: -2,
  },
});
