// App.tsx (nella cartella principale del progetto)
import { NavigationContainer } from '@react-navigation/native';
import React, { useEffect } from 'react';
import { inizializzaStorage } from './src/constants/storage';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {

  useEffect(() => {
    const avviaDati = async () => {
      await inizializzaStorage();
    };
    
    avviaDati();
  }, []);

  return (
    <NavigationContainer>
      <AppNavigator />
    </NavigationContainer>
  );
}
