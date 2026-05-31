// src/screens/aggiungi/AddTaskScreen.tsx
import { useIsFocused } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import {Alert, StyleSheet, View } from 'react-native';
import AddTaskModal from '../../components/AddTaskModal';
import { getCorsi, salvaNuovaAttivita } from '../../constants/storage';

// Accettiamo la prop nativa navigation passata dallo Stack Navigator 
export default function SceltaAggiuntaScreen({ navigation }: { navigation: any }) {
  const isFocused = useIsFocused(); 
  const [modalVisibile, setModalVisibile] = useState(false);
  const [corsi, setCorsi] = useState<{ id: string; nome: string }[]>([]);
  const [loading, setLoading] = useState(true);

  // Caricamento corsi 
  useEffect(() => {
    const caricaCorsiSalvati = async () => {
      if (isFocused) {
        try {
          const corsiDispositivo = await getCorsi();
          const formattati = corsiDispositivo.map((c: any) => ({
            id: c.id,
            nome: c.nome
          }));
          setCorsi(formattati);
          setModalVisibile(true); 
        } catch (error) {
          Alert.alert("Errore", "Impossibile recuperare i corsi.");
        } finally {
          setLoading(false);
        }
      }
    };

    caricaCorsiSalvati();
  }, [isFocused]);

  // Salvataggio finale dei dati 
  const handleSaveTask = async (taskData: any) => {
    
    const corsoSelezionato = corsi.find(c => c.nome === taskData.course);
    const isSession = taskData.type === 'sessione';
    const isDays = taskData.durationUnit === 'giorni';

    const nuovaAttivitaCoerente = {
      id: Date.now().toString(), 
      title: taskData.title,     
      desc: taskData.desc,       
      date: taskData.date,       
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

      estimatedTime: isSession
          ? (isDays ? 0 : (Math.round(parseFloat(taskData.estimatedTime) * 60) || 0))
          : (Math.round(parseFloat(taskData.estimatedTime) * 60) || 0),
      actualTime: !isSession && taskData.actualTime
          ?  (Math.round(parseFloat(taskData.actualTime) * 60) || 0)
          : 0,
    };

    try {
      await salvaNuovaAttivita(nuovaAttivitaCoerente);
      setModalVisibile(false);
      Alert.alert("Successo", "Pianificazione salvata con successo!");

      navigation.goBack();
    } catch (e) {
      Alert.alert("Errore", "Impossibile salvare l'attività nel dispositivo.");
    }
  };

  // Funzione invocata se l'utente clicca fuori o annulla dal pop-up
  const handleClose = () => {
    setModalVisibile(false);
    navigation.goBack();
  };


  const dataAttualeOggi = new Date().toISOString().split('T')[0];
  return (
    <View style={styles.container}>
      <AddTaskModal 
        isVisible={modalVisibile}
        date={dataAttualeOggi} 
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