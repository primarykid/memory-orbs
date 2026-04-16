import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { SPACE } from './src/constants/colors';
import { EMOTIONS } from './src/constants/emotions';

export default function App() {
  return (
    <LinearGradient
      colors={[SPACE.DEEP_SPACE, SPACE.NEBULA_INDIGO, SPACE.DEEP_BLUE]}
      style={styles.container}
    >
      <View style={styles.card}>
        <Text style={styles.title}>Memory Orbs</Text>
        <Text style={styles.subtitle}>Emotional palette loaded: {EMOTIONS.length}</Text>
        <Pressable style={styles.button}>
          <Text style={styles.buttonLabel}>Begin</Text>
        </Pressable>
      </View>
      <StatusBar style="light" />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: SPACE.DEEP_SPACE,
    padding: 24,
  },
  card: {
    width: '100%',
    borderRadius: 20,
    backgroundColor: SPACE.GLASS_OVERLAY,
    padding: 24,
    gap: 12,
  },
  title: {
    color: SPACE.STAR_WHITE,
    fontSize: 32,
    fontWeight: '700',
  },
  subtitle: {
    color: SPACE.STAR_WARM,
    fontSize: 16,
  },
  button: {
    marginTop: 8,
    alignSelf: 'flex-start',
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: SPACE.ACCENT_INDIGO,
  },
  buttonLabel: {
    color: SPACE.STAR_WHITE,
    fontSize: 16,
    fontWeight: '600',
  },
});
