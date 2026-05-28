// app/aggiungi/scelta.tsx
import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AddTaskModal from '../../src/components/AddTaskModal'; // Importiamo il pop-up del tuo amico

export default function SceltaAggiuntaScreen() {
  const router = useRouter();
  
  // Stato per controllare se il pop-up del tuo amico deve essere visibile
  const [modalVisibile, setModalVisibile] = useState(false);

  // Dati fittizi richiesti dal componente del tuo amico
  const corsiFittizi = [
    { id: '1', name: 'Programmazione Mobile' },
    { id: '2', name: 'Analisi Matematica' }
  ];

  const handleSaveTask = (taskData: any) => {
    console.log("Dati salvati dalla modale del mio amico:", taskData);
    setModalVisibile(false);
    router.replace('/planner'); // Torna alla bacheca principale
  };

  return (
    <View style={styles.container}>
      <Text style={styles.subtitle}>Cosa desideri registrare nel tuo Planner?</Text>
      
      {/* BOTTONE 1: NUOVO CORSO (Va alla tua pagina intera) */}
      <TouchableOpacity
        style={[styles.card, { borderLeftColor: '#177AD5' }]}
        onPress={() => router.push('/aggiungi/corso')}
      >
        <Ionicons name="book" size={26} color="#177AD5" style={styles.icon} />
        <Text style={styles.cardText}>Nuovo Corso Universitario</Text>
        <Ionicons name="chevron-forward" size={22} color="#ccc" />
      </TouchableOpacity>

      {/* BOTTONE 2: NUOVO ESAME (Va alla tua pagina intera) */}
      <TouchableOpacity
        style={[styles.card, { borderLeftColor: '#FF5252' }]}
        onPress={() => router.push('/aggiungi/esame')}
      >
        <Ionicons name="document-text" size={26} color="#FF5252" style={styles.icon} />
        <Text style={styles.cardText}>Nuovo Esame o Scadenza</Text>
        <Ionicons name="chevron-forward" size={22} color="#ccc" />
      </TouchableOpacity>

      {/* BOTTONE 3 & 4 UNITI: ATTIVITÀ / SESSIONE (Apre il pop-up del tuo amico) */}
      <TouchableOpacity
        style={[styles.card, { borderLeftColor: '#4CAF50' }]}
        onPress={() => setModalVisibile(true)} // <-- APRE IL POP-UP!
      >
        <Ionicons name="checkbox" size={26} color="#4CAF50" style={styles.icon} />
        <Text style={styles.cardText}>Nuova Attività o Sessione di Studio</Text>
        <Ionicons name="chevron-forward" size={22} color="#ccc" />
      </TouchableOpacity>

      {/* TASTO ANNULLA PER TORNARE INDIETRO */}
      <TouchableOpacity style={styles.closeButton} onPress={() => router.back()}>
        <Ionicons name="close-circle" size={20} color="#FF5252" style={{ marginRight: 8 }} />
        <Text style={styles.closeButtonText}>Annulla e Chiudi</Text>
      </TouchableOpacity>

      {/* IL POP-UP DEL TUO AMICO: 
          Resta invisibile finché l'utente non clicca sul bottone verde delle attività
      */}
      <AddTaskModal 
        isVisible={modalVisibile}
        date="2026-05-28"
        courses={corsiFittizi}
        onClose={() => setModalVisibile(false)}
        onSave={handleSaveTask}
      />
    </View>
  );
}

// I tuoi stili grafici della scelta rimangono perfetti e inalterati...
const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#F9F9F9', justifyContent: 'center' },
  subtitle: { fontSize: 15, color: '#666', marginBottom: 25, textAlign: 'center', fontWeight: '500' },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 18,
    borderRadius: 12,
    marginBottom: 15,
    borderLeftWidth: 6,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  icon: { marginRight: 15 },
  cardText: { flex: 1, fontSize: 16, fontWeight: '600', color: '#333' },
  closeButton: { 
    flexDirection: 'row',
    marginTop: 25, 
    padding: 15, 
    alignItems: 'center', 
    justifyContent: 'center',
    backgroundColor: '#FFF1F1',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FFAAAA'
  },
  closeButtonText: { color: '#FF5252', fontWeight: 'bold', fontSize: 15 }
});