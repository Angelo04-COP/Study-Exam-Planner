// App.tsx (nella cartella principale del progetto)
import { NavigationContainer } from '@react-navigation/native';
import React, { useEffect } from 'react';
import { inizializzaStorage } from './src/constants/storage';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {

  useEffect(() => {
    const avviaDati = async () => {
      // Quando l'app parte, esegue questa funzione.
      // Se l'app è già stata usata, non farà nulla.
      // Se l'app è nuova, inietterà i mockData!
      await inizializzaStorage();
    };
    
    avviaDati();
  }, []);

  return (
    // Il NavigationContainer DEVE stare qui, alla radice di tutto (Slide pag. 8)
    <NavigationContainer>
      <AppNavigator />
    </NavigationContainer>
  );
}