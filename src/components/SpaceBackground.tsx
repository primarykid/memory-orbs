import React from 'react';
import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { colors } from '../constants/colors';

export const SpaceBackground = () => {
  return (
    <View style={styles.container} pointerEvents="none">
      <View style={styles.baseLayer} />

      <LinearGradient
        colors={[colors.space.nebulaPurple, 'transparent']}
        style={[styles.nebula, styles.topLeftGlow]}
      />

      <LinearGradient
        colors={[colors.space.nebulaIndigo, 'transparent']}
        style={[styles.nebula, styles.bottomRightGlow]}
      />

      <LinearGradient
        colors={[colors.space.nebulaBlue, 'transparent']}
        style={[styles.nebula, styles.centerGlow]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
  },
  baseLayer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.space.background,
  },
  nebula: {
    position: 'absolute',
    borderRadius: 999,
  },
  topLeftGlow: {
    width: 420,
    height: 420,
    top: -120,
    left: -130,
    opacity: 0.35,
  },
  bottomRightGlow: {
    width: 460,
    height: 460,
    bottom: -170,
    right: -150,
    opacity: 0.3,
  },
  centerGlow: {
    width: 520,
    height: 520,
    top: '28%',
    left: '50%',
    marginLeft: -260,
    marginTop: -260,
    opacity: 0.22,
  },
});
