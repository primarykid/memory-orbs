import React, { useEffect, useMemo, useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

type Emotion = {
  key: string;
  label: string;
  color: string;
};

const EMOTIONS: Emotion[] = [
  { key: 'joy', label: 'Joy', color: '#FFD56B' },
  { key: 'calm', label: 'Calm', color: '#7ED9B5' },
  { key: 'love', label: 'Love', color: '#FF8FC6' },
  { key: 'hopeful', label: 'Hopeful', color: '#8FA3FF' },
  { key: 'grateful', label: 'Grateful', color: '#B8E986' },
  { key: 'anxious', label: 'Anxious', color: '#F3A86D' },
  { key: 'sad', label: 'Sad', color: '#72A0E8' },
  { key: 'angry', label: 'Angry', color: '#FF6A6A' },
  { key: 'tired', label: 'Tired', color: '#A79CFF' },
  { key: 'focused', label: 'Focused', color: '#6BD0FF' },
];

export type JournalSheetProps = {
  visible: boolean;
  onClose?: () => void;
  onSubmit?: (payload: { note: string; emotion?: Emotion }) => void;
};

const CLOSED_TRANSLATE_Y = 520;

const JournalSheet = ({ visible, onClose, onSubmit }: JournalSheetProps) => {
  const [selectedEmotion, setSelectedEmotion] = useState<Emotion | undefined>();
  const [note, setNote] = useState('');
  const translateY = useSharedValue(CLOSED_TRANSLATE_Y);

  useEffect(() => {
    translateY.value = withSpring(visible ? 0 : CLOSED_TRANSLATE_Y, {
      damping: 0.8,
    });
  }, [translateY, visible]);

  const animatedSheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const isDisabled = useMemo(() => note.trim().length === 0, [note]);

  const handleSubmit = () => {
    if (isDisabled) {
      return;
    }

    onSubmit?.({ note: note.trim(), emotion: selectedEmotion });
  };

  return (
    <View
      pointerEvents={visible ? 'auto' : 'none'}
      style={[StyleSheet.absoluteFillObject, styles.root]}
    >
      <Pressable onPress={onClose} style={styles.backdrop}>
        <BlurView intensity={22} tint="dark" style={StyleSheet.absoluteFillObject} />
      </Pressable>

      <Animated.View style={[styles.sheet, animatedSheetStyle]}>
        <View style={styles.handle} />

        <Text style={styles.title}>How are you feeling?</Text>

        <View style={styles.grid}>
          {EMOTIONS.map((emotion) => {
            const selected = selectedEmotion?.key === emotion.key;
            return (
              <Pressable
                key={emotion.key}
                accessibilityRole="button"
                onPress={() => setSelectedEmotion(emotion)}
                style={[
                  styles.emotionButton,
                  selected && {
                    borderWidth: 2,
                    borderColor: emotion.color,
                    shadowColor: emotion.color,
                    shadowOpacity: 0.55,
                    shadowRadius: 12,
                    shadowOffset: { width: 0, height: 0 },
                    elevation: 8,
                  },
                ]}
              >
                <View
                  style={[
                    styles.emotionDot,
                    {
                      backgroundColor: emotion.color,
                      width: selected ? 20 : 16,
                      height: selected ? 20 : 16,
                      borderRadius: selected ? 10 : 8,
                    },
                  ]}
                />
              </Pressable>
            );
          })}
        </View>

        <View style={styles.inputRow}>
          <TextInput
            multiline
            numberOfLines={3}
            placeholder="Describe this feeling..."
            placeholderTextColor="rgba(255,255,255,0.25)"
            style={styles.textInput}
            value={note}
            onChangeText={setNote}
          />
          <Pressable style={styles.micButton}>
            <Text style={styles.micIcon}>🎤</Text>
          </Pressable>
        </View>

        <Pressable
          disabled={isDisabled}
          onPress={handleSubmit}
          style={[styles.ctaWrap, isDisabled && styles.ctaDisabled]}
        >
          <LinearGradient
            colors={['#6B7EF7', '#4A5CE8']}
            end={{ x: 1, y: 0 }}
            start={{ x: 0, y: 0 }}
            style={styles.ctaGradient}
          >
            <Text style={styles.ctaText}>Add to Universe</Text>
          </LinearGradient>
        </Pressable>
      </Animated.View>
    </View>
  );
};

export default JournalSheet;

const styles = StyleSheet.create({
  root: {
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(2,4,15,0.55)',
  },
  sheet: {
    backgroundColor: 'rgba(15,27,61,0.88)',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingTop: 12,
    paddingHorizontal: 20,
    paddingBottom: 22,
    gap: 16,
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 5,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.22)',
    marginBottom: 6,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 10,
  },
  emotionButton: {
    width: '19%',
    aspectRatio: 1,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    backgroundColor: 'rgba(255,255,255,0.03)',
    minWidth: 44,
    minHeight: 44,
  },
  emotionDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
  },
  textInput: {
    flex: 1,
    minHeight: 96,
    maxHeight: 140,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    backgroundColor: 'rgba(255,255,255,0.05)',
    color: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 12,
    textAlignVertical: 'top',
  },
  micButton: {
    width: 52,
    height: 52,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.07)',
  },
  micIcon: {
    fontSize: 22,
  },
  ctaWrap: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  ctaDisabled: {
    opacity: 0.4,
  },
  ctaGradient: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 16,
  },
  ctaText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
});
