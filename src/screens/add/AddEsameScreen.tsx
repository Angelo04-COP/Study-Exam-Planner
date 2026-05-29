// src/screens/aggiungi/AddEsameScreen.tsx
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity } from 'react-native';
// Importiamo la funzione di salvataggio permanente dal file storage in src
import { salvaNuovoEsame } from '../../constants/storage';

// PASSO 1: Sostituiamo il router inserendo la prop nativa navigation (Slide pag. 14)
export default function NuovoEsameScreen({ navigation }: { navigation: any }) {
  const [titolo, setTitolo] = useState('');
  const [data, setData] = useState('');
  const [tipologia, setTipologia] = useState(''); // Scritto, Orale, Progetto
  const [note, setNote] = useState('');

  // FUNZIONE ASINCRONA DI SALVATAGGIO REALE
  const handleSalvaEsame = async () => {
    if (!titolo.trim()) {
      Alert.alert("Errore", "Il nome dell'esame è obbligatorio!");
      return;
    }
    if (!tipologia.trim()) {
      Alert.alert("Errore", "Seleziona la tipologia d'esame (Scritto, Orale o Progetto)!");
      return;
    }

    // Creiamo l'oggetto COERENTE con i requisiti d'esame
    const nuovoEsame = {
      id: 'e' + Date.now(),
      corso_id: 'c2', // Collegato a un ID corso del mock/storage
      titolo: titolo.trim(),
      data: data || '2026-06-18', 
      tipologia: tipologia.trim(),
      priorita: 'Alta',
      stato: 'programmato', 
      note: note.trim(),
      voto_risultato: null, 
    };

    try {
      console.log("Salvataggio esame in corso...", nuovoEsame);
      
      // Eseguiamo la persistenza asincrona reale su AsyncStorage
      await salvaNuovoEsame(nuovoEsame);

      Alert.alert("Successo", "Esame aggiunto alla pianificazione!");
      
      // PASSO 2: Sostituiamo router.back() con il metodo nativo dello Stack (Slide pag. 16)
      navigation.goBack(); 
      
    } catch (error) {
      Alert.alert("Errore", "Impossibile salvare l'esame sul dispositivo.");
      console.error(error);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.label}>Titolo Esame / Scadenza *</Text>
      <TextInput style={styles.input} placeholder="Es: Presentazione Script Python" value={titolo} onChangeText={setTitolo} />

      <Text style={styles.label}>Data dell'Appello (YYYY-MM-DD)</Text>
      <TextInput style={styles.input} placeholder="Es: 2026-06-18" value={data} onChangeText={setData} />

      <Text style={styles.label}>Tipologia Esame</Text>
      <TextInput style={styles.input} placeholder="Es: Scritto, Orale, Progetto" value={tipologia} onChangeText={setTipologia} />

      <Text style={styles.label}>Note personali o promemoria</Text>
      <TextInput style={[styles.input, { height: 60 }]} placeholder="Es: Portare il PC..." multiline value={note} onChangeText={setNote} />

      <TouchableOpacity style={styles.btnSalva} onPress={handleSalvaEsame}>
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