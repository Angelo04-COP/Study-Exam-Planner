// src/screens/aggiungi/AddCorsoScreen.tsx
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity } from 'react-native';
// L'import punta alla cartella delle costanti/storage in src
import { salvaNuovoCorso } from '../../constants/storage';

// PASSO 1: Inseriamo { navigation } come parametro dello schermo (Slide pag. 14, 18)
export default function NuovoCorsoScreen({ navigation }: { navigation: any }) {
  
  // Stati allineati con le proprietà del mockData
  const [nome, setNome] = useState('');
  const [docente, setDocente] = useState('');
  const [cfu, setCfu] = useState('');
  const [descrizione, setDescrizione] = useState('');
  const [votoDesiderato, setVotoDesiderato] = useState('');
  
  const semestre = "Secondo Semestre"; 
  const annoAccademico = "2025/2026";

  const handleSalvaCorso = async () => {
    if (!nome.trim()) {
      Alert.alert("Errore", "Il nome del corso è obbligatorio!");
      return;
    }

    const nuovoCorso = {
      id: 'c' + Date.now(), 
      nome: nome.trim(),
      docente: docente.trim(),
      semestre: semestre,
      anno_accademico: annoAccademico,
      cfu: cfu ? parseInt(cfu, 10) : 0,
      descrizione: descrizione.trim(),
      stato: 'in corso', 
      voto_desiderato: votoDesiderato ? parseInt(votoDesiderato, 10) : 18,
      voto_ottenuto: null, 
      data_inizio: '2026-03-01',
      data_fine: '2026-06-15',
      colore: '#177AD5', 
      anno: 1
    };

    try {
      console.log("Nuovo Corso pronto per lo storage:", nuovoCorso);

      // Salvataggio asincrono persistente locale
      await salvaNuovoCorso(nuovoCorso);

      Alert.alert("Successo", `Corso "${nome}" salvato con successo!`);
      
      // PASSO 2: Sostituiamo router.replace con la navigazione nativa (Slide pag. 14)
      // Specifichiamo il nome esatto della rotta della tab (es: 'Academic')
      navigation.navigate('MainTabs', { screen: 'Academic' });
      
    } catch (error) {
      Alert.alert("Errore", "Impossibile salvare il corso sul dispositivo.");
      console.error(error);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.label}>Nome del Corso *</Text>
      <TextInput style={styles.input} placeholder="Es: Computer Vision" value={nome} onChangeText={setNome} />

      <Text style={styles.label}>Docente</Text>
      <TextInput style={styles.input} placeholder="Nome del professore" value={docente} onChangeText={setDocente} />

      <Text style={styles.label}>Numero di CFU</Text>
      <TextInput style={styles.input} placeholder="Es: 9" keyboardType="numeric" value={cfu} onChangeText={setCfu} />

      <Text style={styles.label}>Voto Desiderato (Esame)</Text>
      <TextInput style={styles.input} placeholder="Es: 28" keyboardType="numeric" value={votoDesiderato} onChangeText={setVotoDesiderato} />

      <Text style={styles.label}>Descrizione del corso</Text>
      <TextInput style={[styles.input, styles.textArea]} placeholder="Cosa si studia..." multiline value={descrizione} onChangeText={setDescrizione} />

      <TouchableOpacity style={styles.btnSalva} onPress={handleSalvaCorso}>
        <Text style={styles.btnText}>Salva Corso</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 20 },
  label: { fontSize: 14, fontWeight: 'bold', color: '#333', marginBottom: 5, marginTop: 15 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, fontSize: 16, backgroundColor: '#f9f9f9' },
  textArea: { height: 80, textAlignVertical: 'top' },
  btnSalva: { backgroundColor: '#177AD5', padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 30, marginBottom: 50 },
  btnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});