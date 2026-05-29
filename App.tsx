// App.tsx (nella cartella principale del progetto)
import { NavigationContainer } from '@react-navigation/native';
import React from 'react';
import AngeloNavigator from './src/navigation/AppNavigator';

export default function App() {
  return (
    // Il NavigationContainer DEVE stare qui, alla radice di tutto (Slide pag. 8)
    <NavigationContainer>
      <AngeloNavigator />
    </NavigationContainer>
  );
}