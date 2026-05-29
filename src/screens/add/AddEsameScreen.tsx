// src/screens/add/AddEsameScreen.tsx
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity } from 'react-native';
import { aggiornaEsame, salvaNuovoEsame } from '../../constants/storage';

export default function NuovoEsameScreen({ route, navigation }: { route: any, navigation: any }) {
  
  // Recuperiamo l'eventuale parametro di modifica passato dalla rotta precedente
  const esameDaModificare = route.params?.esameDaModificare;

  const [titolo, setTitolo] = useState('');
  const [data, setData] = useState('');
  const [tipologia, setTipologia] = useState(''); 
  const [note, setNote] = useState('');

  // Precompilazione campi in modalità modifica
  useEffect(() => {
    if (esameDaModificare) {
      setTitolo(esameDaModificare.titolo || '');
      setData(esameDaModificare.data || '');
      setTipologia(esameDaModificare.tipologia || '');
      setNote(esameDaModificare.note || '');
    }
  }, [esameDaModificare]);

  const handleSalvaEsame = async () => {
    if (!titolo.trim()) {
      Alert.alert("Errore", "Il nome dell'esame è obbligatorio!");
      return;
    }
    if (!tipologia.trim()) {
      Alert.alert("Errore", "Seleziona la tipologia d'esame (Scritto, Orale o Progetto)!");
      return;
    }

    const esameSalvato = {
      id: esameDaModificare ? esameDaModificare.id : 'e' + Date.now(),
      corso_id: esameDaModificare ? esameDaModificare.corso_id : 'c2', 
      titolo: titolo.trim(),
      data: data || '2026-06-18', 
      tipologia: tipologia.trim(),
      priorita: esameDaModificare ? esameDaModificare.priorita : 'Alta',
      stato: esameDaModificare ? esameDaModificare.stato : 'programmato', 
      note: note.trim(),
      voto_risultato: esameDaModificare ? esameDaModificare.voto_risultato : null, 
    };

    try {
      if (esameDaModificare) {
        await aggiornaEsame(esameSalvato);
        Alert.alert("Successo", "Esame modificato con successo!");
      } else {
        await salvaNuovoEsame(esameSalvato);
        Alert.alert("Successo", "Esame aggiunto alla pianificazione!");
      }
      
      navigation.goBack(); 
    } catch (error) {
      Alert.alert("Errore", "Impossibile salvare l'esame sul dispositivo.");
      console.error(error);
    }
  };

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.label}>Titolo Esame / Scadenza *</Text>
      <TextInput style={styles.input} placeholder="Es: Presentazione Script Python" value={titolo} onChangeText={setTitolo} />

      <Text style={styles.label}>Data dell'Appello (YYYY-MM-DD)</Text>
      <TextInput style={styles.input} placeholder="Es: 2026-06-18" value={data} onChangeText={setData} />

      <Text style={styles.label}>Tipologia Esame</Text>
      <TextInput style={styles.input} placeholder="Es: Scritto, Orale, Progetto" value={tipologia} onChangeText={setTipologia} />

      <Text style={styles.label}>Note personali o promemoria</Text>
      <TextInput style={[styles.input, { height: 60 }]} placeholder="Es: Portare il PC..." multiline value={note} onChangeText={setNote} />

      <TouchableOpacity style={styles.btnSalva} onPress={handleSalvaEsame}>
        <Text style={styles.btnText}>{esameDaModificare ? "Salva Modifiche" : "Salva Esame"}</Text>
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