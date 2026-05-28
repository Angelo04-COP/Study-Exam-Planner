import { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';

export default function AddTabScreen() {
  const router = useRouter();

  useEffect(() => {
    // Intercetta il click sulla Tab e spinge l'utente verso la modale di scelta
    router.push('/aggiungi/scelta' as any);
  }, []);

  return (
    // Usiamo l'ActivityIndicator suggerito dalle dispense del prof come feedback visivo
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F5F5F5' }}>
      <ActivityIndicator size="large" color="#177AD5" />
    </View>
  );
}