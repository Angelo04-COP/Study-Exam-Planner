// src/screens/aggiungi/AddSceltaScreen.tsx
import { useIsFocused } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, View } from 'react-native';

// CORRETTO: Punta dritto alla cartella componenti dentro src
import AddTaskModal from '../../components/AddTaskModal';

// CORRETTO: Punta alle costanti di storage dentro src
import { getCorsi, salvaNuovaAttivita } from '../../constants/storage';

// Accettiamo la prop nativa navigation passata dallo Stack Navigator (Slide pag. 14)[cite: 2]
export default function SceltaAggiuntaScreen({ navigation }: { navigation: any }) {
  const isFocused = useIsFocused(); // Intercetta se lo schermo è attivo in primo piano[cite: 2]
  const [modalVisibile, setModalVisibile] = useState(false);
  const [corsi, setCorsi] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);

  // Effetto per caricare i corsi salvati dal database locale non appena lo schermo è attivo[cite: 2]
  useEffect(() => {
    const caricaCorsiSalvati = async () => {
      if (isFocused) {
        setLoading(true);
        try {
          const corsiDispositivo = await getCorsi();
          // Mappiamo i dati nel formato richiesto dal tipo Course del Modal del tuo amico (id, name)[cite: 2]
          const formattati = corsiDispositivo.map((c: any) => ({
            id: c.id,
            name: c.nome
          }));
          setCorsi(formattati);
          setModalVisibile(true); // Apriamo immediatamente la modale del tuo collega[cite: 2]
        } catch (error) {
          Alert.alert("Errore", "Impossibile recuperare i corsi.");
        } finally {
          setLoading(false);
        }
      }
    };

    caricaCorsiSalvati();
  }, [isFocused]);

  // Gestione del salvataggio finale dei dati provenienti dal form controllato del tuo collega[cite: 2]
  const handleSaveTask = async (taskData: any) => {
    // Ricostruiamo l'oggetto mappando i dati ricevuti da AddTaskModal[cite: 2]
    const nuovaAttivitaCoerente = {
      id: taskData.id,
      corso_id: taskData.corso_id,
      sessione_id: null, 
      titolo: taskData.titolo,
      descrizione: taskData.descrizione,
      data_ora_inizio: taskData.data_ora_inizio, 
      data_ora_scadenza: taskData.data_ora_scadenza,
      priorita: taskData.priorita, 
      completata: taskData.completata,
      // I dati arrivano già mappati in minuti dal form del tuo amico![cite: 2]
      tempo_stimato_minuti: taskData.tempo_stimato_minuti, 
      tempo_impiegato_minuti: taskData.tempo_impiegato_minuti,
      note: taskData.note,
    };

    try {
      console.log("Salvataggio pianificazione in corso...", nuovaAttivitaCoerente);
      
      // Persistenza locale reale su file system mediante AsyncStorage[cite: 2]
      await salvaNuovaAttivita(nuovaAttivitaCoerente);
      
      setModalVisibile(false);
      Alert.alert("Successo", "Pianificazione salvata con successo!");
      
      // PATTERN DELLE SLIDE: Torniamo alla tab principale del Planner (Slide pag. 14, 25)[cite: 2]
      navigation.navigate('MainTabs', { screen: 'Planner' });
    } catch (e) {
      Alert.alert("Errore", "Impossibile salvare l'attività nel dispositivo.");
    }
  };

  // Funzione invocata se l'utente clicca fuori o annulla dal pop-up[cite: 2]
  const handleClose = () => {
    setModalVisibile(false);
    navigation.navigate('MainTabs', { screen: 'Planner' }); // Rispedisce l'utente alla home del Planner[cite: 2]
  };

  // Durante il caricamento asincrono mostriamo un indicatore nativo di attesa[cite: 2]
  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Ci riferiamo direttamente al componente del tuo amico passandogli le proprietà necessarie */}
      <AddTaskModal 
        isVisible={modalVisibile}
        date="2026-05-28" // Agganciabile dinamicamente alla data del calendario[cite: 2]
        courses={corsi} 
        onClose={handleClose}
        onSave={handleSaveTask}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#fff' 
  },
  loaderContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center',
    backgroundColor: '#F9F9F9'
  }
});