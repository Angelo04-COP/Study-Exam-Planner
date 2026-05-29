// app/_layout.tsx
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        {/* La barra principale con i tab inferiori dei tuoi colleghi */}
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        
        {/* Schermata modale predefinita di Expo */}
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />

        {/* Nota come il "name" corrisponde esattamente alla struttura delle sottocartelle dentro app/ */}
        <Stack.Screen 
          name="aggiungi/corso" 
          options={{ headerShown: true, title: 'Nuovo Corso', headerBackTitle: 'Indietro' }} 
        />
        <Stack.Screen 
          name="aggiungi/esame" 
          options={{ headerShown: true, title: 'Nuovo Esame', headerBackTitle: 'Indietro' }} 
        />
        <Stack.Screen 
          name="aggiungi/scelta" 
          options={{ headerShown: false }} 
        />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}