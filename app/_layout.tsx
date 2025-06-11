import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { useFonts } from 'expo-font';
import { PressStart2P_400Regular } from '@expo-google-fonts/press-start-2p';
import { Orbitron_400Regular, Orbitron_700Bold } from '@expo-google-fonts/orbitron';
import * as SplashScreen from 'expo-splash-screen';
import { AuthProvider } from '@/components/AuthContext';
import { aiService } from '@/services/aiService';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useFrameworkReady();

  const [fontsLoaded] = useFonts({
    'PressStart2P': PressStart2P_400Regular,
    'Orbitron-Regular': Orbitron_400Regular,
    'Orbitron-Bold': Orbitron_700Bold,
  });

  const [aiInitialized, setAiInitialized] = useState(false);

  useEffect(() => {
    // Initialize AI services
    const initializeAI = async () => {
      try {
        await aiService.initialize();
        setAiInitialized(true);
        console.log('AI services ready');
      } catch (error) {
        console.error('AI initialization failed:', error);
        setAiInitialized(true); // Continue anyway with fallback
      }
    };

    initializeAI();
  }, []);

  useEffect(() => {
    if (fontsLoaded && aiInitialized) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, aiInitialized]);

  if (!fontsLoaded || !aiInitialized) {
    return null;
  }

  return (
    <AuthProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="light" />
    </AuthProvider>
  );
}