import React from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import SpaceBackground from '../components/SpaceBackground';

const PaywallScreen = () => {
  const freeFeatures = ['Up to 30 memories', '10 emotions', 'Basic journaling'];
  const premiumFeatures = [
    'Unlimited memories',
    'AI reflections',
    'Extra themes',
    'Export GIF',
  ];

  return (
    <View style={styles.root}>
      <SpaceBackground />
      <BlurView intensity={30} tint="dark" style={styles.overlay}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.headerRow}>
            <View style={styles.spacer} />
            <TouchableOpacity style={styles.closeButton} activeOpacity={0.8}>
              <Ionicons name="close" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          <View style={styles.centered}>
            <View style={styles.cardWrapper}>
              <BlurView intensity={45} tint="dark" style={styles.card}>
                <Text style={styles.title}>Unlock Unlimited Universe</Text>

                <View style={styles.columns}>
                  <View style={[styles.tierColumn, styles.freeColumn]}>
                    <Text style={styles.tierTitle}>Free</Text>
                    {freeFeatures.map((feature) => (
                      <View key={feature} style={styles.featureRow}>
                        <Ionicons name="checkmark" size={16} color="#8A8FAD" />
                        <Text style={styles.freeFeatureText}>{feature}</Text>
                      </View>
                    ))}
                  </View>

                  <View style={[styles.tierColumn, styles.premiumColumn]}>
                    <Text style={styles.tierTitle}>Premium</Text>
                    {premiumFeatures.map((feature) => (
                      <View key={feature} style={styles.featureRow}>
                        <Ionicons name="checkmark" size={16} color="#5B6EF5" />
                        <Text style={styles.premiumFeatureText}>{feature}</Text>
                      </View>
                    ))}
                  </View>
                </View>

                <Text style={styles.price}>$4.99/month</Text>
                <Text style={styles.altPrice}>or $34.99 lifetime</Text>

                <TouchableOpacity style={styles.ctaButton} activeOpacity={0.85}>
                  <Text style={styles.ctaButtonText}>Start Premium</Text>
                </TouchableOpacity>

                <TouchableOpacity activeOpacity={0.75}>
                  <Text style={styles.restoreText}>Restore Purchases</Text>
                </TouchableOpacity>
              </BlurView>
            </View>
          </View>
        </SafeAreaView>
      </BlurView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#050915',
  },
  overlay: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 4,
    paddingBottom: 20,
  },
  headerRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  spacer: {
    width: 36,
    height: 36,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
  },
  cardWrapper: {
    width: '100%',
    borderRadius: 20,
    overflow: 'hidden',
  },
  card: {
    backgroundColor: 'rgba(15, 27, 61, 0.88)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    padding: 20,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '700',
    marginBottom: 18,
    textAlign: 'center',
  },
  columns: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 18,
  },
  tierColumn: {
    flex: 1,
    borderRadius: 14,
    backgroundColor: 'rgba(14, 20, 45, 0.65)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    padding: 12,
  },
  freeColumn: {
    borderColor: 'rgba(255,255,255,0.08)',
  },
  premiumColumn: {
    borderWidth: 2,
    borderColor: '#5B6EF5',
  },
  tierTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 10,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 6,
  },
  freeFeatureText: {
    color: '#9CA2BE',
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
  premiumFeatureText: {
    color: '#D8DEFF',
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
  price: {
    color: '#FFFFFF',
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  altPrice: {
    color: 'rgba(255,255,255,0.5)',
    textAlign: 'center',
    fontSize: 13,
    marginBottom: 16,
  },
  ctaButton: {
    width: '100%',
    minHeight: 50,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#5B6EF5',
    marginBottom: 10,
  },
  ctaButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  restoreText: {
    textAlign: 'center',
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
});

export default PaywallScreen;
