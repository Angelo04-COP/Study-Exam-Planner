// src/screens/add/AddCorsoScreen.tsx
import React, { useEffect, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity } from 'react-native';
import { aggiornaCorso, salvaNuovoCorso } from '../../constants/storage';

export default function NuovoCorsoScreen({ route, navigation }: { route: any, navigation: any }) {
  
  // Recupero dell'eventuale parametro di modifica passato dalla route precedente
  const corsoDaModificare = route.params?.corsoDaModificare;

  const [nome, setNome] = useState('');
  const [docente, setDocente] = useState('');
  const [cfu, setCfu] = useState('');
  const [descrizione, setDescrizione] = useState('');
  const [votoDesiderato, setVotoDesiderato] = useState('');

  const [dataInizio, setDataInizio] = useState(''); 
  const [dataFine, setDataFine] = useState('');   
  
  const [semestre, setSemestre] = useState('');
  const [annoAccademico, setAnnoAccademico] = useState('');

  //Precompilazione campi in modalità modifica
  useEffect(() => {
    if (corsoDaModificare) {
      setNome(corsoDaModificare.nome || '');
      setDocente(corsoDaModificare.docente || '');
      setCfu(corsoDaModificare.cfu ? corsoDaModificare.cfu.toString() : '');
      setDescrizione(corsoDaModificare.descrizione || '');
      setVotoDesiderato(corsoDaModificare.voto_desiderato ? corsoDaModificare.voto_desiderato.toString() : '');
      setDataInizio(corsoDaModificare.data_inizio || '');
      setDataFine(corsoDaModificare.data_fine || '');
      setSemestre(corsoDaModificare.semestre || '');
      setAnnoAccademico(corsoDaModificare.anno_accademico || '');
    }
  }, [corsoDaModificare]);

  // Funzione helper per calcolare lo stato in base alle date 
  const calcolaStatoCorso = (inizio: string, fine: string): string => {
    const oggiStr = new Date().toISOString().split('T')[0]; 
    if (inizio > oggiStr) {
      return 'da iniziare';
    } else if (inizio <= oggiStr && fine >= oggiStr) {
      return 'in corso';
    } else {
      return 'completato';
    }
  };

  // Funzione di salvataggio del corso (creazione e modifica)
  const handleSalvaCorso = async () => {
    if (!nome.trim()) {
      Alert.alert("Errore", "Il nome del corso è obbligatorio!");
      return;
    }

    const annoAccTrim = annoAccademico.trim();
    const inizioTrim = dataInizio.trim();
    const fineTrim = dataFine.trim();

    if (annoAccTrim && inizioTrim && fineTrim) {

      const partiAnno = annoAccTrim.split('/');
      if (partiAnno.length === 2) {
        const annoInizioAccademico = partiAnno[0]; 
        const annoFineAccademico = partiAnno[1];   

        const annoDellaDataInizio = inizioTrim.substring(0, 4);
        const annoDellaDataFine = fineTrim.substring(0, 4);

        const inizioValido = (annoDellaDataInizio === annoInizioAccademico || annoDellaDataInizio === annoFineAccademico);
        const fineValido = (annoDellaDataFine === annoInizioAccademico || annoDellaDataFine === annoFineAccademico);

        if (!inizioValido || !fineValido) {
          Alert.alert(
            "Errore Date", 
            `Le date inserite devono essere coerenti con l'anno accademico ${annoAccTrim}.`
          );
          return;
        }
        if (inizioTrim && fineTrim) {
          if (inizioTrim > fineTrim) {
          Alert.alert(
            "Errore Cronologico", 
            "La data di inizio non può essere successiva alla data di fine corso!"
          );
          return; 
      }
    }
      } else {
        Alert.alert("Errore Formato", "L'anno accademico deve essere nel formato AAAA/AAAA (es. 2025/2026).");
        return;
      }
    }

    // Calcolo dello stato in modo dinamico 
    const statoDinamico = calcolaStatoCorso(dataInizio.trim(), dataFine.trim());

    // Costruzione dell'oggetto 
    const corsoSalvato = {
      id: corsoDaModificare ? corsoDaModificare.id : 'c' + Date.now(), 
      nome: nome.trim(),
      docente: docente.trim(),
      semestre: semestre.trim(),
      anno_accademico: annoAccademico.trim(),
      cfu: cfu ? parseInt(cfu, 10) : 0,
      descrizione: descrizione.trim(),
      
      stato: statoDinamico, 
      
      voto_desiderato: votoDesiderato ? parseInt(votoDesiderato, 10) : null,
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
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: '#fff' }} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      // AGGIUNTA FONDAMENTALE: Calcola lo spazio della barra di navigazione in alto
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0} 
    >
      <ScrollView 
        style={styles.container} 
        // Permette di cliccare fuori per chiudere la tastiera (senza bloccare il Web!)
        keyboardShouldPersistTaps="handled" 
        // Aggiunge spazio extra in fondo per non far coprire il pulsante "Salva" dalla tastiera
        contentContainerStyle={{ paddingBottom: 120}} 
      >
        <Text style={styles.label}>Nome del Corso *</Text>
        <TextInput style={styles.input} placeholder="Es: Computer Vision" placeholderTextColor="#64748B" value={nome} onChangeText={setNome} />

        <Text style={styles.label}>Docente</Text>
        <TextInput style={styles.input} placeholder="Nome del professore" placeholderTextColor="#64748B" value={docente} onChangeText={setDocente} />

        <Text style={styles.label}>Numero di CFU</Text>
        <TextInput style={styles.input} placeholder="Es: 9" placeholderTextColor="#64748B" keyboardType="numeric" value={cfu} onChangeText={setCfu} />

        <Text style={styles.label}>Voto Desiderato (Esame)</Text>
        <TextInput style={styles.input} placeholder="Es: 28" placeholderTextColor="#64748B" keyboardType="numeric" value={votoDesiderato} onChangeText={setVotoDesiderato} />

        <Text style={styles.label}>Semestre</Text>
        <TextInput style={styles.input} placeholder="Es: Primo Semestre, Secondo Semestre" placeholderTextColor="#64748B" value={semestre} onChangeText={setSemestre} />

        <Text style={styles.label}>Anno Accademico</Text>
        <TextInput style={styles.input} placeholder="Es: 2025/2026" placeholderTextColor="#64748B" value={annoAccademico} onChangeText={setAnnoAccademico} />

        <Text style={styles.label}>Data Inizio Corso (YYYY-MM-DD)</Text>
        <TextInput style={styles.input} placeholder="Es: 2026-03-01" placeholderTextColor="#64748B" value={dataInizio} onChangeText={setDataInizio} />

        <Text style={styles.label}>Data Fine Corso (YYYY-MM-DD)</Text>
        <TextInput style={styles.input} placeholder="Es: 2026-06-15" placeholderTextColor="#64748B"value={dataFine} onChangeText={setDataFine} />

        <Text style={styles.label}>Descrizione del corso</Text>
        <TextInput style={[styles.input, styles.textArea]} placeholder="Cosa si studia..." placeholderTextColor="#64748B" multiline value={descrizione} onChangeText={setDescrizione} />

        <TouchableOpacity style={styles.btnSalva} onPress={handleSalvaCorso}>
          <Text style={styles.btnText}>{corsoDaModificare ? "Salva Modifiche" : "Salva Corso"}</Text>
        </TouchableOpacity>
        
      </ScrollView>
    </KeyboardAvoidingView>
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