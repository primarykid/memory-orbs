import React from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import SpaceBackground from '../components/SpaceBackground';

const AuthScreen = () => {
  return (
    <View style={styles.root}>
      <SpaceBackground />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centered}>
          <View style={styles.logoContainer}>
            <View style={styles.logoOrb}>
              <Ionicons name="sparkles" size={30} color="#C9D3FF" />
            </View>
            <Text style={styles.title}>Memory Orbs</Text>
          </View>

          <View style={styles.cardWrapper}>
            <BlurView intensity={40} tint="dark" style={styles.card}>
              <TextInput
                placeholder="Email"
                placeholderTextColor="rgba(255,255,255,0.5)"
                keyboardType="email-address"
                autoCapitalize="none"
                style={styles.input}
              />

              <TextInput
                placeholder="Password"
                placeholderTextColor="rgba(255,255,255,0.5)"
                secureTextEntry
                style={styles.input}
              />

              <TouchableOpacity style={styles.signInButton} activeOpacity={0.85}>
                <Text style={styles.signInButtonText}>Sign In</Text>
              </TouchableOpacity>

              <TouchableOpacity activeOpacity={0.75}>
                <Text style={styles.toggleText}>
                  Don&apos;t have an account? <Text style={styles.toggleTextStrong}>Sign Up</Text>
                </Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.appleButton} activeOpacity={0.85}>
                <Text style={styles.appleButtonText}>Continue with Apple</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.googleButton} activeOpacity={0.85}>
                <Text style={styles.googleButtonText}>Continue with Google</Text>
              </TouchableOpacity>
            </BlurView>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#050915',
  },
  safeArea: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoOrb: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(125, 140, 255, 0.24)',
    borderWidth: 1,
    borderColor: 'rgba(201, 211, 255, 0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: 0.25,
  },
  cardWrapper: {
    width: '100%',
    maxWidth: 390,
    borderRadius: 20,
    overflow: 'hidden',
  },
  card: {
    backgroundColor: 'rgba(15, 27, 61, 0.88)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    padding: 20,
    gap: 12,
  },
  input: {
    backgroundColor: 'rgba(14, 20, 45, 0.72)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 12,
    color: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
  },
  signInButton: {
    marginTop: 6,
    backgroundColor: '#5B6EF5',
    borderRadius: 12,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  signInButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  toggleText: {
    color: 'rgba(255,255,255,0.5)',
    textAlign: 'center',
    fontSize: 14,
    marginTop: 6,
    marginBottom: 2,
  },
  toggleTextStrong: {
    color: 'rgba(255,255,255,0.5)',
    fontWeight: '700',
  },
  appleButton: {
    backgroundColor: '#000000',
    borderRadius: 12,
    minHeight: 46,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
  },
  appleButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 15,
  },
  googleButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    minHeight: 46,
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleButtonText: {
    color: '#111111',
    fontWeight: '600',
    fontSize: 15,
  },
});

export default AuthScreen;
