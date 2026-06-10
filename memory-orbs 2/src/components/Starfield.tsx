import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, StyleSheet, useWindowDimensions, View } from 'react-native';
import ReAnimated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { colors } from '../constants/colors';

// ─── Static stars ─────────────────────────────────────────────────────────────

type StarSize = 'small' | 'medium' | 'large';

type StarData = {
  id: string;
  x: number;
  y: number;
  size: StarSize;
  duration: number;
  initialOpacity: number;
};

const buildStars = (count: number, size: StarSize, width: number, height: number): StarData[] =>
  Array.from({ length: count }, (_, index) => ({
    id: `${size}-${index}`,
    x: Math.random() * width,
    y: Math.random() * height,
    size,
    duration: 1000 + Math.random() * 3000,
    initialOpacity: 0.3 + Math.random() * 0.7,
  }));

const Star = ({ x, y, size, duration, initialOpacity }: StarData) => {
  const opacity = useSharedValue(initialOpacity);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(opacity.value >= 0.65 ? 0.3 : 1, {
        duration,
        easing: Easing.inOut(Easing.ease),
      }),
      -1,
      true,
    );
  }, [duration, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <ReAnimated.View
      style={[styles.star, styles[`${size}Star`], { left: x, top: y }, animatedStyle]}
    />
  );
};

// ─── Shooting star ────────────────────────────────────────────────────────────

type ShootingStarProps = {
  screenWidth: number;
  screenHeight: number;
  onDone: () => void;
};

const ShootingStar = ({ screenWidth, screenHeight, onDone }: ShootingStarProps) => {
  const startX = useRef(Math.random() * screenWidth * 0.6).current;
  const startY = useRef(Math.random() * screenHeight * 0.35).current;
  const progress = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.9, duration: 80, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0, duration: 500, delay: 80, useNativeDriver: true }),
      ]),
      Animated.timing(progress, { toValue: 1, duration: 660, useNativeDriver: true }),
    ]).start(() => onDone());
  }, [onDone, opacity, progress]);

  const translateX = progress.interpolate({ inputRange: [0, 1], outputRange: [0, 180] });
  const translateY = progress.interpolate({ inputRange: [0, 1], outputRange: [0, 180] });

  return (
    <Animated.View
      style={[
        styles.shootingStar,
        {
          left: startX,
          top: startY,
          opacity,
          transform: [{ rotate: '40deg' }, { translateX }, { translateY }],
        },
      ]}
    />
  );
};

// ─── Starfield ────────────────────────────────────────────────────────────────

export const Starfield = () => {
  const { width, height } = useWindowDimensions();
  const [shootingStars, setShootingStars] = useState<number[]>([]);
  const nextId = useRef(0);

  const stars = useMemo(
    () => [
      ...buildStars(80, 'small', width, height),
      ...buildStars(40, 'medium', width, height),
      ...buildStars(15, 'large', width, height),
    ],
    [width, height],
  );

  // Spawn a shooting star every 4-12 seconds
  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;

    const spawn = () => {
      setShootingStars((prev) => [...prev, nextId.current++]);
      timeoutId = setTimeout(spawn, 4000 + Math.random() * 8000);
    };

    timeoutId = setTimeout(spawn, 2000 + Math.random() * 3000);
    return () => clearTimeout(timeoutId);
  }, []);

  return (
    <View style={styles.container} pointerEvents="none">
      {stars.map((star) => (
        <Star key={star.id} {...star} />
      ))}
      {shootingStars.map((id) => (
        <ShootingStar
          key={id}
          screenWidth={width}
          screenHeight={height}
          onDone={() => setShootingStars((prev) => prev.filter((s) => s !== id))}
        />
      ))}
    </View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
  },
  star: {
    position: 'absolute',
    backgroundColor: colors.space.star,
    borderRadius: 999,
  },
  smallStar: { width: 1, height: 1 },
  mediumStar: { width: 2, height: 2 },
  largeStar: {
    width: 3,
    height: 3,
    shadowColor: colors.space.star,
    shadowOpacity: 0.9,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 0 },
    elevation: 3,
  },
  shootingStar: {
    position: 'absolute',
    width: 90,
    height: 2,
    borderRadius: 1,
    backgroundColor: '#FFFFFF',
  },
});
