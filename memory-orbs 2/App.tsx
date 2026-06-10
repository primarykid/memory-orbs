import { StatusBar } from 'expo-status-bar';

import AuthScreen from './src/screens/AuthScreen';
import UniverseScreen from './src/screens/UniverseScreen';
import { useAuthStore } from './src/stores/authStore';

export default function App() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isGuest = useAuthStore((s) => s.isGuest);
  const isLoggedIn = isAuthenticated || isGuest;

  return (
    <>
      {isLoggedIn ? <UniverseScreen /> : <AuthScreen />}
      <StatusBar style="light" />
    </>
  );
}
