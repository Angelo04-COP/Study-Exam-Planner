// src/screens/add/AddEsameScreen.tsx
import { useIsFocused } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { aggiornaEsame, getCorsi, salvaNuovoEsame } from '../../constants/storage';

export default function NuovoEsameScreen({ route, navigation }: { route: any, navigation: any }) {
  
  const esameDaModificare = route.params?.esameDaModificare;
  const isFocused = useIsFocused();

  const [titolo, setTitolo] = useState('');
  const [data, setData] = useState('');
  const [tipologia, setTipologia] = useState('');
  const [note, setNote] = useState('');
  
  const [corsiDisponibili, setCorsiDisponibili] = useState<{ id: string; nome: string }[]>([]);
  const [corsoSelezionatoId, setCorsoSelezionatoId] = useState('');
  const [loadingCorsi, setLoadingCorsi] = useState(true);

  // Caricamento corsi salvati
  useEffect(() => {
    const caricaCorsi = async () => {
      if (isFocused) {
        try {
          const corsiSalvati = await getCorsi();
          setCorsiDisponibili(corsiSalvati || []);
          
          // In modalità modifica pre-seleziona il corso associato originale
          if (esameDaModificare) {
            setCorsoSelezionatoId(esameDaModificare.corso_id || '');
          } else if (corsiSalvati && corsiSalvati.length > 0) {
            // Altrimenti seleziona in automatico il primo della lista 
            setCorsoSelezionatoId(corsiSalvati[0].id);
          }
        } catch (e) {
          console.error("Errore nel caricamento dei corsi nel form esame", e);
        } finally {
          setLoadingCorsi(false);
        }
      }
    };

    caricaCorsi();
  }, [isFocused, esameDaModificare]);

  // Precompilazione campi in modalità modifica
  useEffect(() => {
    if (esameDaModificare) {
      setTitolo(esameDaModificare.titolo || '');
      setData(esameDaModificare.data || '');
      setTipologia(esameDaModificare.tipologia || '');
      setNote(esameDaModificare.note || '');
    }
  }, [esameDaModificare]);

  // Funzione di salvataggio dell'esame (creazione e modifica)
  const handleSalvaEsame = async () => {
    if (!titolo.trim()) {
      Alert.alert("Errore", "Il nome dell'esame è obbligatorio!");
      return;
    }
    if (!tipologia.trim()) {
      Alert.alert("Errore", "Seleziona la tipologia d'esame!");
      return;
    }
    if (!corsoSelezionatoId) {
      Alert.alert("Errore", "Devi associare l'esame a un corso! Se la lista è vuota, crea prima un corso nella sezione Carriera.");
      return;
    }

    const dataEsameStr: string = data.trim() || '';

    if (!dataEsameStr) {
      Alert.alert("Errore", "La data dell'esame è obbligatoria!");
      return; 
    }
    
    const corsoSelezionato = corsiDisponibili.find(c => c.id === corsoSelezionatoId) as any;

    if (corsoSelezionato && corsoSelezionato.data_inizio) {
      const dataEsame = new Date(dataEsameStr);
      const dataInizioCorso = new Date(corsoSelezionato.data_inizio);

      if (!isNaN(dataEsame.getTime()) && !isNaN(dataInizioCorso.getTime())) {
        if (dataEsame < dataInizioCorso) {
          Alert.alert(
            "Data non valida", 
            `L'esame non può essere antecedente alla data di inizio del corso (${corsoSelezionato.data_inizio}).`
          );
          return; 
        }
      }
    }

    try {
      if (esameDaModificare) {
        const esameAggiornato = {
          ...esameDaModificare,
          titolo: titolo.trim(),
          data: data.trim(),
          tipologia: tipologia.trim(),
          note: note.trim(),
          corso_id: corsoSelezionatoId,
        };
        await aggiornaEsame(esameAggiornato);
        Alert.alert("Successo", "Esame modificato con successo!");
      } else {
        const nuovoEsame = {
          id: 'e' + Date.now(),
          corso_id: corsoSelezionatoId, 
          titolo: titolo.trim(),
          data: data.trim() || '2026-06-18',
          tipologia: tipologia.trim(),
          priorita: 'Alta',
          stato: 'programmato',
          note: note.trim(),
          voto_risultato: null,
        };
        await salvaNuovoEsame(nuovoEsame);
        Alert.alert("Successo", "Esame aggiunto alla pianificazione!");
      }

      navigation.goBack();
    } catch (error) {
      Alert.alert("Errore", "Impossibile salvare l'esame sul dispositivo.");
    }
  };

  if (loadingCorsi) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#177AD5" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.label}>Titolo Esame / Scadenza *</Text>
      <TextInput style={styles.input} placeholder="Es: Presentazione Script Python" value={titolo} onChangeText={setTitolo} />
      <Text style={styles.label}>Corso di appartenenza *</Text>
      {corsiDisponibili.length === 0 ? (
        <Text style={styles.errorText}>Nessun corso trovato nel database locale. Crea prima un corso nella sezione Carriera!</Text>
      ) : (
        <View style={styles.listaCorsiGuscio}>
          {corsiDisponibili.map((corso) => {
            const IsSelezionato = corsoSelezionatoId === corso.id;
            return (
              <TouchableOpacity
                key={corso.id}
                style={[
                  styles.opzioneCorsoCard,
                  IsSelezionato && styles.opzioneCorsoSelezionata
                ]}
                activeOpacity={0.8}
                onPress={() => setCorsoSelezionatoId(corso.id)}
              >
                <View style={[styles.cerchioCheck, IsSelezionato && styles.cerchioCheckAttivo]}>
                  {IsSelezionato && <View style={styles.pallinoInterno} />}
                </View>
                <Text style={[styles.testoCorsoOpzione, IsSelezionato && styles.testoCorsoSelezionato]}>
                  {corso.nome}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      <Text style={styles.label}>Data dell'Appello (YYYY-MM-DD)</Text>
      <TextInput style={styles.input} placeholder="Es: 2026-06-18" value={data} onChangeText={setData} />

      <Text style={styles.label}>Tipologia Esame</Text>
      <TextInput style={styles.input} placeholder="Es: Scritto, Orale, Progetto" value={tipologia} onChangeText={setTipologia} />

      <Text style={styles.label}>Note personali o promemoria</Text>
      <TextInput style={[styles.input, { height: 60 }]} placeholder="Es: Portare il PC..." multiline value={note} onChangeText={setNote} />

      <TouchableOpacity 
        style={[styles.btnSalva, corsiDisponibili.length === 0 && styles.btnDisattivato]} 
        onPress={handleSalvaEsame}
        disabled={corsiDisponibili.length === 0}
      >
        <Text style={styles.btnText}>{esameDaModificare ? "Salva Modifiche" : "Salva Esame"}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 20 },
  label: { fontSize: 14, fontWeight: 'bold', color: '#333', marginBottom: 5, marginTop: 15 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, fontSize: 16, backgroundColor: '#f9f9f9' },
  
  listaCorsiGuscio: { gap: 8, marginTop: 4, marginBottom: 5 },
  opzioneCorsoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    backgroundColor: '#fff',
  },
  opzioneCorsoSelezionata: {
    borderColor: '#177AD5',
    backgroundColor: '#EFF6FF',
  },
  cerchioCheck: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cerchioCheckAttivo: {
    borderColor: '#177AD5',
  },
  pallinoInterno: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#177AD5',
  },
  testoCorsoOpzione: {
    fontSize: 15,
    color: '#475569',
    fontWeight: '500',
  },
  testoCorsoSelezionato: {
    color: '#177AD5',
    fontWeight: 'bold',
  },
  errorText: { color: '#FF5252', fontSize: 13, fontWeight: '500', marginTop: 4 },

  btnSalva: { backgroundColor: '#177AD5', padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 35, marginBottom: 50 },
  btnDisattivato: { backgroundColor: '#CBD5E1' },
  btnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});