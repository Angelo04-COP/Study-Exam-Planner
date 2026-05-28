import React, { useState } from 'react';
import { ScrollView, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

export default function NuovaAttivitaScreen() {
  const router = useRouter();
  const [titolo, setTitolo] = useState('');
  const [tempoStimato, setTempoStimato] = useState('');

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.label}>Cosa devi fare? (To-Do) *</Text>
      <TextInput style={styles.input} placeholder="Es: Leggere capitolo 3, Esercitazione..." value={titolo} onChangeText={setTitolo} />

      <Text style={styles.label}>Tempo Stimato (in minuti)</Text>
      <TextInput style={styles.input} placeholder="Es: 60, 120" keyboardType="numeric" value={tempoStimato} onChangeText={setTempoStimato} />

      <TouchableOpacity style={styles.btnSalva} onPress={() => router.back()}>
        <Text style={styles.btnText}>Aggiungi Attività</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 20 },
  label: { fontSize: 14, fontWeight: 'bold', color: '#333', marginBottom: 5, marginTop: 15 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, fontSize: 16, backgroundColor: '#f9f9f9' },
  btnSalva: { backgroundColor: '#4CAF50', padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 30 },
  btnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});