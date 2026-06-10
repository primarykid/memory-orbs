import React, { useState } from 'react';
import {
  ActivityIndicator,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';

import { SpaceBackground } from '../components/SpaceBackground';
import { useAuthStore } from '../stores/authStore';

const AuthScreen = () => {
  const continueAsGuest = useAuthStore((s) => s.continueAsGuest);

  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!email || !password) {
      setError('Please enter your email and password.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // TODO: replace with real Supabase auth once credentials are set up
      // const { error } = isSignUp
      //   ? await supabase.auth.signUp({ email, password })
      //   : await supabase.auth.signInWithPassword({ email, password });
      // if (error) throw error;
      setError('Auth not connected yet. Use "Try it out" to continue.');
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.root}>
      <SpaceBackground />

      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centered}>
          {/* Logo */}
          <View style={styles.logoContainer}>
            <LinearGradient colors={['#7B61FF', '#4A44D8']} style={styles.logoOrb}>
              <Text style={styles.logoEmoji}>🔮</Text>
            </LinearGradient>
            <Text style={styles.title}>Memory Orbs</Text>
            <Text style={styles.subtitle}>Feelings made visible</Text>
          </View>

          {/* Card */}
          <View style={styles.cardWrapper}>
            <BlurView intensity={40} tint="dark" style={styles.card}>
              <Text style={styles.cardTitle}>
                {isSignUp ? 'Create account' : 'Welcome back'}
              </Text>

              <TextInput
                placeholder="Email"
                placeholderTextColor="rgba(255,255,255,0.35)"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                style={styles.input}
                value={email}
                onChangeText={(t) => {
                  setEmail(t);
                  setError('');
                }}
              />

              <TextInput
                placeholder="Password"
                placeholderTextColor="rgba(255,255,255,0.35)"
                secureTextEntry
                style={styles.input}
                value={password}
                onChangeText={(t) => {
                  setPassword(t);
                  setError('');
                }}
              />

              {!!error && <Text style={styles.errorText}>{error}</Text>}

              <TouchableOpacity
                style={[styles.primaryButton, loading && styles.buttonDisabled]}
                onPress={handleSubmit}
                activeOpacity={0.85}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <Text style={styles.primaryButtonText}>
                    {isSignUp ? 'Create account' : 'Sign in'}
                  </Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  setIsSignUp((v) => !v);
                  setError('');
                }}
                activeOpacity={0.75}
              >
                <Text style={styles.toggleText}>
                  {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
                  <Text style={styles.toggleLink}>{isSignUp ? 'Sign in' : 'Sign up'}</Text>
                </Text>
              </TouchableOpacity>

              <View style={styles.dividerRow}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerLabel}>or</Text>
                <View style={styles.dividerLine} />
              </View>

              {/* Guest mode — always available */}
              <TouchableOpacity
                style={styles.guestButton}
                onPress={continueAsGuest}
                activeOpacity={0.85}
              >
                <Text style={styles.guestButtonText}>Try it out  →</Text>
              </TouchableOpacity>

              <Text style={styles.guestNote}>
                Your memories are saved locally. Sign in anytime to sync.
              </Text>
            </BlurView>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
};

export default AuthScreen;

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#02040F' },
  safeArea: { flex: 1 },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  logoContainer: { alignItems: 'center', marginBottom: 32 },
  logoOrb: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    shadowColor: '#7B61FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 10,
  },
  logoEmoji: { fontSize: 32 },
  title: { color: '#FFF', fontSize: 30, fontWeight: '700', letterSpacing: 0.3 },
  subtitle: { color: 'rgba(255,255,255,0.4)', fontSize: 14, marginTop: 4 },
  cardWrapper: { width: '100%', maxWidth: 390, borderRadius: 20, overflow: 'hidden' },
  card: {
    backgroundColor: 'rgba(15,27,61,0.88)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    padding: 20,
    gap: 12,
  },
  cardTitle: { color: '#FFF', fontSize: 17, fontWeight: '700', marginBottom: 4 },
  input: {
    backgroundColor: 'rgba(14,20,45,0.72)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 12,
    color: '#FFF',
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
  },
  errorText: { color: '#FF6B6B', fontSize: 13, textAlign: 'center' },
  primaryButton: {
    marginTop: 4,
    backgroundColor: '#5B6EF5',
    borderRadius: 12,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: { opacity: 0.6 },
  primaryButtonText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
  toggleText: { color: 'rgba(255,255,255,0.45)', textAlign: 'center', fontSize: 14 },
  toggleLink: { color: '#7B8FFF', fontWeight: '600' },
  dividerRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginVertical: 4 },
  dividerLine: { flex: 1, height: 0.5, backgroundColor: 'rgba(255,255,255,0.12)' },
  dividerLabel: { color: 'rgba(255,255,255,0.3)', fontSize: 12 },
  guestButton: {
    borderRadius: 12,
    minHeight: 46,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(123,97,255,0.4)',
    backgroundColor: 'rgba(123,97,255,0.08)',
  },
  guestButtonText: { color: '#A89DFF', fontWeight: '600', fontSize: 15 },
  guestNote: {
    color: 'rgba(255,255,255,0.25)',
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 16,
  },
});
