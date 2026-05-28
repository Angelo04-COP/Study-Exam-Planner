import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity } from 'react-native';

export default function NuovoEsameScreen() {
  const router = useRouter();
  const [titolo, setTitolo] = useState('');
  const [data, setData] = useState('');
  const [tipologia, setTipologia] = useState(''); // Scritto, Orale, Progetto

  const handleSalva = () => {
    router.back();
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.label}>Titolo Esame / Scadenza *</Text>
      <TextInput style={styles.input} placeholder="Es: Appello Gennaio o Consegna Progetto" value={titolo} onChangeText={setTitolo} />

      <Text style={styles.label}>Data (YYYY-MM-DD)</Text>
      <TextInput style={styles.input} placeholder="Es: 2026-06-15" value={data} onChangeText={setData} />

      <Text style={styles.label}>Tipologia</Text>
      <TextInput style={styles.input} placeholder="Es: Scritto, Orale, Progetto" value={tipologia} onChangeText={setTipologia} />

      <TouchableOpacity style={styles.btnSalva} onPress={handleSalva}>
        <Text style={styles.btnText}>Salva Esame</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 20 },
  label: { fontSize: 14, fontWeight: 'bold', color: '#333', marginBottom: 5, marginTop: 15 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, fontSize: 16, backgroundColor: '#f9f9f9' },
  btnSalva: { backgroundColor: '#FF5252', padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 30 },
  btnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});