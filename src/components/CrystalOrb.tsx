import React, { useCallback, useEffect } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

type CrystalOrbProps = {
  size: number;
  color: string;
  onPress: () => void;
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const CrystalOrb = ({ size, color, onPress }: CrystalOrbProps) => {
  const pressScale = useSharedValue(1);
  const coreScale = useSharedValue(0.88);
  const coreOpacity = useSharedValue(0.45);
  const glowOpacity = useSharedValue(0.06);

  useEffect(() => {
    coreScale.value = withRepeat(
      withTiming(1.06, {
        duration: 4000,
        easing: Easing.inOut(Easing.ease),
      }),
      -1,
      true,
    );

    coreOpacity.value = withRepeat(
      withTiming(0.72, {
        duration: 4000,
        easing: Easing.inOut(Easing.ease),
      }),
      -1,
      true,
    );

    glowOpacity.value = withRepeat(
      withTiming(0.18, {
        duration: 3000,
        easing: Easing.inOut(Easing.ease),
      }),
      -1,
      true,
    );
  }, [coreOpacity, coreScale, glowOpacity]);

  const pressableAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pressScale.value }],
  }));

  const glowAnimatedStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  const coreAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: coreScale.value }],
    opacity: coreOpacity.value,
  }));

  const handlePressIn = useCallback(() => {
    pressScale.value = withSpring(1.08, {
      damping: 11,
      stiffness: 260,
      mass: 0.4,
    });
  }, [pressScale]);

  const handlePressOut = useCallback(() => {
    pressScale.value = withSpring(1, {
      damping: 12,
      stiffness: 240,
      mass: 0.4,
    });
  }, [pressScale]);

  const glowSize = size * 1.35;
  const inset = size * 0.18;

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[styles.container, pressableAnimatedStyle, { width: size, height: size }]}
      accessibilityRole="button"
    >
      <Animated.View
        style={[
          styles.absolute,
          styles.outerGlow,
          glowAnimatedStyle,
          {
            width: glowSize,
            height: glowSize,
            borderRadius: glowSize / 2,
            backgroundColor: color,
            shadowRadius: size * 0.4,
            shadowColor: color,
            shadowOpacity: 0.12,
            shadowOffset: { width: 0, height: 0 },
          },
        ]}
      />

      <LinearGradient
        colors={['rgba(255,255,255,0.3)', 'rgba(255,255,255,0)']}
        start={{ x: 0.15, y: 0.1 }}
        end={{ x: 0.85, y: 0.9 }}
        style={[
          styles.absolute,
          {
            borderRadius: size / 2,
            borderWidth: 1,
            borderColor: 'rgba(255,255,255,0.12)',
            overflow: 'hidden',
          },
        ]}
      />

      <Animated.View
        style={[
          styles.absolute,
          coreAnimatedStyle,
          {
            top: inset,
            right: inset,
            bottom: inset,
            left: inset,
            borderRadius: (size - inset * 2) / 2,
            backgroundColor: color,
            opacity: 0.65,
          },
        ]}
      />

      <View
        style={[
          styles.absolute,
          {
            width: size * 0.14,
            height: size * 0.95,
            borderRadius: size * 0.07,
            backgroundColor: 'rgba(255,255,255,0.08)',
            transform: [{ rotate: '-35deg' }],
          },
        ]}
      />

      <View
        style={[
          styles.absolute,
          {
            width: size * 0.34,
            height: size * 0.22,
            borderRadius: size * 0.18,
            backgroundColor: 'rgba(255,255,255,0.85)',
            top: size * 0.18,
            left: size * 0.18,
            transform: [{ rotate: '-20deg' }],
          },
        ]}
      />

      <View
        style={[
          styles.absolute,
          {
            width: size * 0.3,
            height: size * 0.2,
            borderRadius: size * 0.16,
            backgroundColor: 'rgba(255,255,255,0.5)',
            bottom: size * 0.17,
            right: size * 0.16,
            transform: [{ rotate: '18deg' }],
          },
        ]}
      />
    </AnimatedPressable>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  absolute: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  outerGlow: {
    zIndex: 0,
  },
});

export default CrystalOrb;
