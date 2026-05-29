// src/screens/add/AddCorsoScreen.tsx
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity } from 'react-native';
import { aggiornaCorso, salvaNuovoCorso } from '../../constants/storage';

// Inserito 'route' nei parametri accettati, in linea con la pagina 19 delle slide del docente
export default function NuovoCorsoScreen({ route, navigation }: { route: any, navigation: any }) {
  
  // Recuperiamo l'eventuale parametro di modifica passato dalla rotta precedente
  const corsoDaModificare = route.params?.corsoDaModificare;

  const [nome, setNome] = useState('');
  const [docente, setDocente] = useState('');
  const [cfu, setCfu] = useState('');
  const [descrizione, setDescrizione] = useState('');
  const [votoDesiderato, setVotoDesiderato] = useState('');
  
  // NUOVI STATI: Gestione delle date di inizio e fine corso
  const [dataInizio, setDataInizio] = useState('2026-03-01'); // Valore di default standard
  const [dataFine, setDataFine] = useState('2026-06-15');   // Valore di default standard
  
  const semestre = "Secondo Semestre"; 
  const annoAccademico = "2025/2026";

  // Se siamo in modalità modifica, compiliamo automaticamente i campi all'avvio
  useEffect(() => {
    if (corsoDaModificare) {
      setNome(corsoDaModificare.nome || '');
      setDocente(corsoDaModificare.docente || '');
      setCfu(corsoDaModificare.cfu ? corsoDaModificare.cfu.toString() : '');
      setDescrizione(corsoDaModificare.descrizione || '');
      setVotoDesiderato(corsoDaModificare.voto_desiderato ? corsoDaModificare.voto_desiderato.toString() : '');
      
      // Carica le date salvate nel record esistente
      setDataInizio(corsoDaModificare.data_inizio || '2026-03-01');
      setDataFine(corsoDaModificare.data_fine || '2026-06-15');
    }
  }, [corsoDaModificare]);

  // Funzione helper per calcolare lo stato in base alle date (Formato YYYY-MM-DD)
  const calcolaStatoCorso = (inizio: string, fine: string): string => {
    const oggiStr = new Date().toISOString().split('T')[0]; // Ottiene la data odierna in formato YYYY-MM-DD

    if (inizio > oggiStr) {
      return 'da iniziare';
    } else if (inizio <= oggiStr && fine >= oggiStr) {
      return 'in corso';
    } else {
      return 'completato';
    }
  };

  const handleSalvaCorso = async () => {
    if (!nome.trim()) {
      Alert.alert("Errore", "Il nome del corso è obbligatorio!");
      return;
    }

    // Calcoliamo lo stato in modo dinamico basandoci sulle date inserite
    const statoDinamico = calcolaStatoCorso(dataInizio.trim(), dataFine.trim());

    // Costruiamo l'oggetto preservando i dati storici se stiamo modificando
    const corsoSalvato = {
      id: corsoDaModificare ? corsoDaModificare.id : 'c' + Date.now(), 
      nome: nome.trim(),
      docente: docente.trim(),
      semestre: corsoDaModificare ? corsoDaModificare.semestre : semestre,
      anno_accademico: corsoDaModificare ? corsoDaModificare.anno_accademico : annoAccademico,
      cfu: cfu ? parseInt(cfu, 10) : 0,
      descrizione: descrizione.trim(),
      
      // APPLICAZIONE DELLA NUOVA LOGICA RICHIESTA
      stato: statoDinamico, 
      
      voto_desiderato: votoDesiderato ? parseInt(votoDesiderato, 10) : 18,
      voto_ottenuto: corsoDaModificare ? corsoDaModificare.voto_ottenuto : null, 
      data_inizio: dataInizio.trim(),
      data_fine: dataFine.trim(),
      colore: corsoDaModificare ? corsoDaModificare.colore : '#177AD5', 
      anno: corsoDaModificare ? corsoDaModificare.anno : 1
    };

    try {
      if (corsoDaModificare) {
        await aggiornaCorso(corsoSalvato);
        Alert.alert("Successo", `Corso "${nome}" modificato con successo!`);
      } else {
        await salvaNuovoCorso(corsoSalvato);
        Alert.alert("Successo", `Corso "${nome}" salvato con successo!`);
      }
      
      navigation.goBack();
    } catch (error) {
      Alert.alert("Errore", "Impossibile salvare il corso sul dispositivo.");
      console.error(error);
    }
  };

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.label}>Nome del Corso *</Text>
      <TextInput style={styles.input} placeholder="Es: Computer Vision" value={nome} onChangeText={setNome} />

      <Text style={styles.label}>Docente</Text>
      <TextInput style={styles.input} placeholder="Nome del professore" value={docente} onChangeText={setDocente} />

      <Text style={styles.label}>Numero di CFU</Text>
      <TextInput style={styles.input} placeholder="Es: 9" keyboardType="numeric" value={cfu} onChangeText={setCfu} />

      <Text style={styles.label}>Voto Desiderato (Esame)</Text>
      <TextInput style={styles.input} placeholder="Es: 28" keyboardType="numeric" value={votoDesiderato} onChangeText={setVotoDesiderato} />

      {/* NUOVO CAMPO: DATA INIZIO */}
      <Text style={styles.label}>Data Inizio Corso (YYYY-MM-DD)</Text>
      <TextInput style={styles.input} placeholder="Es: 2026-03-01" value={dataInizio} onChangeText={setDataInizio} />

      {/* NUOVO CAMPO: DATA FINE */}
      <Text style={styles.label}>Data Fine Corso (YYYY-MM-DD)</Text>
      <TextInput style={styles.input} placeholder="Es: 2026-06-15" value={dataFine} onChangeText={setDataFine} />

      <Text style={styles.label}>Descrizione del corso</Text>
      <TextInput style={[styles.input, styles.textArea]} placeholder="Cosa si studia..." multiline value={descrizione} onChangeText={setDescrizione} />

      <TouchableOpacity style={styles.btnSalva} onPress={handleSalvaCorso}>
        <Text style={styles.btnText}>{corsoDaModificare ? "Salva Modifiche" : "Salva Corso"}</Text>
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