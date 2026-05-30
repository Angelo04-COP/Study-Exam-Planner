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
  const [corsi, setCorsi] = useState<{ id: string; nome: string }[]>([]);
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
            nome: c.nome
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

  // Gestione del salvataggio finale dei dati provenienti dal form controllato del tuo collega
  const handleSaveTask = async (taskData: any) => {
    
    // 1. Troviamo l'ID del corso partendo dal nome (esattamente come fa PlanningScreen)
    const corsoSelezionato = corsi.find(c => c.nome === taskData.course);

    // 2. Dobbiamo convertire i tempi in minuti, come nel PlanningScreen
    const isSession = taskData.type === 'sessione';
    const isDays = taskData.durationUnit === 'giorni';

    // 3. Ricostruiamo l'oggetto usando le CHIAVI IN INGLESE che si aspetta l'app
    const nuovaAttivitaCoerente = {
      id: Date.now().toString(), // Generiamo l'ID univoco che mancava
      title: taskData.title,     // Usiamo "title" e non "titolo"
      desc: taskData.desc,       
      date: taskData.date,       // Usiamo "date" e non "data_ora_scadenza"
      course_id: corsoSelezionato ? corsoSelezionato.id : undefined,
      sessionType: taskData.sessionType,
      durationUnit: taskData.durationUnit,
      startDate: taskData.startDate,
      endDate: taskData.endDate,
      estimatedDays: taskData.estimatedDays,
      priority: taskData.priority,
      isCompleted: taskData.isCompleted,
      type: taskData.type,
      notes: taskData.notes,
      // Calcolo matematico identico a PlanningScreen per convertire le ore in minuti
      estimatedTime: isSession
          ? (isDays ? 0 : (Math.round(parseFloat(taskData.estimatedTime) * 60) || 0))
          : (Math.round(parseFloat(taskData.estimatedTime) * 60) || 0),
      actualTime: !isSession && taskData.actualTime
          ?  (Math.round(parseFloat(taskData.actualTime) * 60) || 0)
          : 0,
    };

    try {
      console.log("Salvataggio pianificazione in corso...", nuovaAttivitaCoerente);
      
      // Persistenza locale reale su file system mediante AsyncStorage
      await salvaNuovaAttivita(nuovaAttivitaCoerente);
      
      setModalVisibile(false);
      Alert.alert("Successo", "Pianificazione salvata con successo!");
      
      // PATTERN DELLE SLIDE: Torniamo alla tab principale del Planner
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

  const dataAttualeOggi = new Date().toISOString().split('T')[0];
  return (
    <View style={styles.container}>
      {/* Ci riferiamo direttamente al componente passandogli la data dinamica di oggi */}
      <AddTaskModal 
        isVisible={modalVisibile}
        date={dataAttualeOggi} // <-- Sostituito il valore fisso con la costante dinamica
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