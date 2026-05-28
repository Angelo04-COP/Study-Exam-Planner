import React, { useState } from 'react';
import { ScrollView, Text, TextInput, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';

export default function NuovoCorsoScreen() {
  const router = useRouter();
  
  // Stati per gestire l'input da tastiera 
  const [nome, setNome] = useState('');
  const [docente, setDocente] = useState('');
  const [cfu, setCfu] = useState('');
  const [note, setNote] = useState('');

  const handleSalva = () => {
    // Qui andrà la logica per salvare l'oggetto nel database locale del gruppo
    console.log({ nome, docente, cfu, note });
    router.back(); // Chiude la modale e torna indietro
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.label}>Nome del Corso *</Text>
      <TextInput 
        style={styles.input} 
        placeholder="Es: Programmazione Mobile" 
        value={nome} 
        onChangeText={setNome} 
      />

      <Text style={styles.label}>Docente</Text>
      <TextInput 
        style={styles.input} 
        placeholder="Nome del professore" 
        value={docente} 
        onChangeText={setDocente} 
      />

      <Text style={styles.label}>Numero di CFU</Text>
      <TextInput 
        style={styles.input} 
        placeholder="Es: 6, 9" 
        keyboardType="numeric" 
        value={cfu} 
        onChangeText={setCfu} 
      />

      <Text style={styles.label}>Note o Descrizione</Text>
      <TextInput 
        style={[styles.input, styles.textArea]} 
        placeholder="Riferimenti, libri di testo..." 
        multiline 
        value={note} 
        onChangeText={setNote} 
      />

      <TouchableOpacity style={styles.btnSalva} onPress={handleSalva}>
        <Text style={styles.btnText}>Salva Corso</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 20 },
  label: { fontSize: 14, fontWeight: 'bold', color: '#333', marginBottom: 5, marginTop: 15 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, fontSize: 16, backgroundColor: '#f9f9f9' },
  textArea: { height: 100, textAlignVertical: 'top' },
  btnSalva: { backgroundColor: '#177AD5', padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 30, marginBottom: 50 },
  btnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});