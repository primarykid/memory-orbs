import React, { useEffect, useMemo, useRef } from 'react';
import {
  Animated,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';

import CrystalOrb from '../components/CrystalOrb';

type MemoryEntry = {
  id: string;
  text: string;
  emotion: string;
  color: string;
  date: string | number | Date;
  aiReflection: string;
};

type MemoryModalProps = {
  entry: MemoryEntry;
  visible: boolean;
  onClose: () => void;
};

const MemoryModal = ({ entry, visible, onClose }: MemoryModalProps) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.96)).current;

  useEffect(() => {
    if (visible) {
      opacity.setValue(0);
      scale.setValue(0.96);

      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.spring(scale, {
          toValue: 1,
          damping: 14,
          stiffness: 160,
          mass: 0.8,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [opacity, scale, visible]);

  const formattedDate = useMemo(() => {
    const parsed = new Date(entry.date);

    if (Number.isNaN(parsed.getTime())) {
      return '';
    }

    return parsed.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }, [entry.date]);

  return (
    <Modal transparent visible={visible} animationType="none" onRequestClose={onClose}>
      <View style={styles.modalRoot}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose}>
          <BlurView intensity={30} tint="dark" style={styles.backdrop}>
            <View style={styles.backdropTint} />
          </BlurView>
        </Pressable>

        <Animated.View
          style={[
            styles.card,
            {
              opacity,
              transform: [{ scale }],
            },
          ]}
        >
          <Pressable
            onPress={onClose}
            hitSlop={12}
            style={styles.closeButton}
            accessibilityRole="button"
            accessibilityLabel="Close memory"
          >
            <Ionicons name="close" size={20} color="rgba(255,255,255,0.35)" />
          </Pressable>

          <View style={styles.orbWrap}>
            <CrystalOrb size={68} color={entry.color} />
          </View>

          <Text style={[styles.emotion, { color: entry.color }]}>{entry.emotion}</Text>
          {!!formattedDate && <Text style={styles.date}>{formattedDate}</Text>}

          <Text style={styles.entryText}>{entry.text}</Text>

          <View style={styles.divider} />

          <Text style={styles.reflectionLabel}>AI REFLECTION</Text>

          <View style={styles.reflectionWrap}>
            <Text style={styles.reflectionText}>{entry.aiReflection}</Text>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalRoot: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  backdrop: {
    flex: 1,
  },
  backdropTint: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(2,4,15,0.7)',
  },
  card: {
    width: '100%',
    maxWidth: 420,
    borderRadius: 20,
    padding: 24,
    backgroundColor: 'rgba(15,27,61,0.92)',
  },
  closeButton: {
    position: 'absolute',
    top: 14,
    right: 14,
    zIndex: 2,
  },
  orbWrap: {
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 14,
  },
  emotion: {
    textAlign: 'center',
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 6,
  },
  date: {
    textAlign: 'center',
    fontSize: 12,
    color: 'rgba(255,255,255,0.35)',
    marginBottom: 20,
  },
  entryText: {
    fontSize: 14,
    lineHeight: 24,
    color: 'rgba(255,255,255,0.85)',
  },
  divider: {
    height: 0.5,
    backgroundColor: 'rgba(91,110,245,0.15)',
    marginVertical: 20,
  },
  reflectionLabel: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: 'rgba(91,110,245,0.6)',
    marginBottom: 10,
  },
  reflectionWrap: {
    borderLeftWidth: 3,
    borderLeftColor: '#5B6EF5',
    paddingLeft: 14,
  },
  reflectionText: {
    fontSize: 13,
    fontStyle: 'italic',
    color: 'rgba(255,255,255,0.5)',
    lineHeight: 20,
  },
});

export default MemoryModal;
