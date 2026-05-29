// app/(tabs)/add.tsx
import React from 'react';
import { useNavigation } from 'expo-router';
import AddScreen from '../../src/screens/AddScreen';

export default function Route() {
  // Recuperiamo l'oggetto di navigazione nativo di Expo Router
  const navigation = useNavigation();

  // Passiamo questo oggetto come prop al tuo schermo reale in src
  return <AddScreen navigation={navigation} />;
}