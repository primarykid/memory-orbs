import React, { useEffect, useMemo } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { colors } from '../constants/colors';

type StarSize = 'small' | 'medium' | 'large';

type StarData = {
  id: string;
  x: number;
  y: number;
  size: StarSize;
  duration: number;
  initialOpacity: number;
};

const buildStars = (count: number, size: StarSize, width: number, height: number): StarData[] => {
  return Array.from({ length: count }, (_, index) => ({
    id: `${size}-${index}`,
    x: Math.random() * width,
    y: Math.random() * height,
    size,
    duration: 1000 + Math.random() * 3000,
    initialOpacity: 0.3 + Math.random() * 0.7,
  }));
};

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

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
    };
  });

  return <Animated.View style={[styles.star, styles[`${size}Star`], { left: x, top: y }, animatedStyle]} />;
};

export const Starfield = () => {
  const { width, height } = useWindowDimensions();

  const stars = useMemo(() => {
    return [
      ...buildStars(80, 'small', width, height),
      ...buildStars(40, 'medium', width, height),
      ...buildStars(15, 'large', width, height),
    ];
  }, [width, height]);

  return (
    <View style={styles.container} pointerEvents="none">
      {stars.map((star) => (
        <Star key={star.id} {...star} />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
  },
  star: {
    position: 'absolute',
    backgroundColor: colors.space.star,
    borderRadius: 999,
  },
  smallStar: {
    width: 1,
    height: 1,
  },
  mediumStar: {
    width: 2,
    height: 2,
  },
  largeStar: {
    width: 3,
    height: 3,
    shadowColor: colors.space.star,
    shadowOpacity: 0.9,
    shadowRadius: 4,
    shadowOffset: {
      width: 0,
      height: 0,
    },
    elevation: 3,
  },
});
