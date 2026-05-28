// app/(tabs)/add.tsx
import { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';

export default function AddTabScreen() {
  const router = useRouter();

  useEffect(() => {
    // Quando premi il "+", vai dritto alla pagina di scelta
    router.push('/aggiungi/scelta');
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F5F5F5' }}>
      <ActivityIndicator size="large" color="#177AD5" />
    </View>
  );
}