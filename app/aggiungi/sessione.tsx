import React, { useState } from 'react';
import { ScrollView, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

export default function NuovaSessioneScreen() {
  const router = useRouter();
  const [ore, setOre] = useState('');
  const [note, setNote] = useState('');

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.label}>Ore di studio effettuate *</Text>
      <TextInput style={styles.input} placeholder="Es: 2, 4" keyboardType="numeric" value={ore} onChangeText={setOre} />

      <Text style={styles.label}>Note della sessione</Text>
      <TextInput style={[styles.input, styles.textArea]} placeholder="Cosa hai ripassato?" multiline value={note} onChangeText={setNote} />

      <TouchableOpacity style={styles.btnSalva} onPress={() => router.back()}>
        <Text style={styles.btnText}>Registra Sessione</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 20 },
  label: { fontSize: 14, fontWeight: 'bold', color: '#333', marginBottom: 5, marginTop: 15 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, fontSize: 16, backgroundColor: '#f9f9f9' },
  textArea: { height: 80, textAlignVertical: 'top' },
  btnSalva: { backgroundColor: '#E2A64A', padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 30 },
  btnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});