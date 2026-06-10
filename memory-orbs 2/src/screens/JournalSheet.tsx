import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  PanResponder,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import ReAnimated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { EMOTIONS_LIST, Emotion } from '../constants/emotions';
import { useVoiceRecorder } from '../hooks/useVoiceRecorder';

export type JournalSheetProps = {
  visible: boolean;
  onClose?: () => void;
  onSubmit?: (payload: { note: string; emotion?: Emotion; inputMethod: 'text' | 'voice' }) => void;
};

const CLOSED_TRANSLATE_Y = 520;

const formatDuration = (ms: number): string => {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  return `${m}:${String(s % 60).padStart(2, '0')}`;
};

const JournalSheet = ({ visible, onClose, onSubmit }: JournalSheetProps) => {
  const [selectedEmotion, setSelectedEmotion] = useState<Emotion | undefined>();
  const [note, setNote] = useState('');
  const translateY = useSharedValue(CLOSED_TRANSLATE_Y);

  const { state: recState, start, stop, cancel, durationMs } = useVoiceRecorder();
  // Tracks whether any part of this entry came from voice
  const usedVoiceRef = useRef(false);

  // Mic button pulse while recording
  const micPulse = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    if (recState === 'recording') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(micPulse, { toValue: 1.25, duration: 600, useNativeDriver: true }),
          Animated.timing(micPulse, { toValue: 1, duration: 600, useNativeDriver: true }),
        ]),
      ).start();
    } else {
      micPulse.stopAnimation();
      micPulse.setValue(1);
    }
  }, [micPulse, recState]);

  // Drag-to-dismiss on the handle
  const dragPan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderRelease: (_, { dy, vy }) => {
        if (dy > 80 || vy > 0.8) onClose?.();
      },
    }),
  ).current;

  // Sheet open/close spring — visible only, so it doesn't re-fire on every render
  useEffect(() => {
    translateY.value = withSpring(visible ? 0 : CLOSED_TRANSLATE_Y, {
      damping: 18,
      stiffness: 200,
    });
  }, [translateY, visible]);

  // Cancel any active recording when the sheet is hidden
  useEffect(() => {
    if (!visible && recState === 'recording') {
      cancel();
    }
  }, [visible, recState, cancel]);

  const animatedSheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const isDisabled = useMemo(
    () => note.trim().length === 0 && recState !== 'recording',
    [note, recState],
  );

  const handleMicPress = async () => {
    if (recState === 'recording') {
      const transcript = await stop();
      if (transcript) {
        usedVoiceRef.current = true;
        setNote((prev) => (prev ? `${prev} ${transcript}` : transcript));
      }
    } else {
      await start();
    }
  };

  const handleSubmit = () => {
    if (isDisabled) return;
    onSubmit?.({
      note: note.trim(),
      emotion: selectedEmotion,
      inputMethod: usedVoiceRef.current ? 'voice' : 'text',
    });
    setNote('');
    setSelectedEmotion(undefined);
    usedVoiceRef.current = false;
  };

  const micIsRecording = recState === 'recording';
  const micIsProcessing = recState === 'processing';

  return (
    <View
      pointerEvents={visible ? 'auto' : 'none'}
      style={[StyleSheet.absoluteFillObject, styles.root]}
    >
      <Pressable onPress={onClose} style={styles.backdrop}>
        <BlurView intensity={22} tint="dark" style={StyleSheet.absoluteFillObject} />
      </Pressable>

      <ReAnimated.View style={[styles.sheet, animatedSheetStyle]}>
        {/* Drag handle */}
        <View style={styles.handle} {...dragPan.panHandlers} />

        <Text style={styles.title}>How are you feeling?</Text>

        {/* Emotion grid */}
        <View style={styles.grid}>
          {EMOTIONS_LIST.map((emotion) => {
            const selected = selectedEmotion?.key === emotion.key;
            return (
              <Pressable
                key={emotion.key}
                accessibilityRole="button"
                onPress={() => setSelectedEmotion(emotion)}
                style={[
                  styles.emotionButton,
                  selected && {
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
                <Text
                  style={[
                    styles.emotionLabel,
                    { color: selected ? emotion.color : 'rgba(255,255,255,0.4)' },
                  ]}
                >
                  {emotion.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Text input + mic */}
        <View style={styles.inputRow}>
          <TextInput
            multiline
            numberOfLines={3}
            placeholder={micIsRecording ? 'Listening…' : 'Describe this feeling…'}
            placeholderTextColor={
              micIsRecording ? 'rgba(255,100,100,0.6)' : 'rgba(255,255,255,0.25)'
            }
            style={[styles.textInput, micIsRecording && styles.textInputRecording]}
            value={note}
            onChangeText={setNote}
            editable={!micIsRecording}
          />

          <Pressable
            onPress={handleMicPress}
            disabled={micIsProcessing}
            style={[styles.micButton, micIsRecording && styles.micButtonActive]}
          >
            <Animated.View style={{ transform: [{ scale: micPulse }] }}>
              <Text style={styles.micIcon}>
                {micIsProcessing ? '⏳' : micIsRecording ? '⏹' : '🎤'}
              </Text>
            </Animated.View>
            {micIsRecording && (
              <Text style={styles.micDuration}>{formatDuration(durationMs)}</Text>
            )}
          </Pressable>
        </View>

        {/* Submit */}
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
      </ReAnimated.View>
    </View>
  );
};

export default JournalSheet;

const styles = StyleSheet.create({
  root: { justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(2,4,15,0.55)' },
  sheet: {
    backgroundColor: 'rgba(15,27,61,0.88)',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingTop: 12,
    paddingHorizontal: 20,
    paddingBottom: 34,
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
  title: { color: '#FFF', fontSize: 16, fontWeight: '700' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  emotionButton: {
    width: '18%',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
    backgroundColor: 'rgba(255,255,255,0.03)',
    paddingVertical: 10,
    gap: 6,
    minWidth: 44,
    minHeight: 44,
  },
  emotionDot: { width: 16, height: 16, borderRadius: 8 },
  emotionLabel: { fontSize: 9, fontWeight: '500', textAlign: 'center' },
  inputRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 10 },
  textInput: {
    flex: 1,
    minHeight: 96,
    maxHeight: 140,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    backgroundColor: 'rgba(255,255,255,0.05)',
    color: '#FFF',
    paddingHorizontal: 14,
    paddingVertical: 12,
    textAlignVertical: 'top',
  },
  textInputRecording: { borderColor: 'rgba(255,80,80,0.4)' },
  micButton: {
    width: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.07)',
    paddingVertical: 10,
    gap: 2,
  },
  micButtonActive: { backgroundColor: 'rgba(255,60,60,0.18)' },
  micIcon: { fontSize: 22 },
  micDuration: { color: 'rgba(255,100,100,0.9)', fontSize: 10, fontWeight: '600' },
  ctaWrap: { borderRadius: 16, overflow: 'hidden' },
  ctaDisabled: { opacity: 0.4 },
  ctaGradient: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 16,
  },
  ctaText: { color: '#FFF', fontWeight: '700', fontSize: 15 },
});
