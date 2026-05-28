import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function SceltaAggiuntaScreen() {
  const router = useRouter();

  // I 4 bottoni di smistamento richiesti dalla traccia 
  const opzioni = [
    { path: '/aggiungi/corso', title: 'Nuovo Corso Universitario', icon: 'book', color: '#177AD5' },
    { path: '/aggiungi/esame', title: 'Nuovo Esame o Scadenza', icon: 'document-text', color: '#FF5252' },
    { path: '/aggiungi/attivita', title: 'Nuova Attività (To-Do)', icon: 'checkbox', color: '#4CAF50' },
    { path: '/aggiungi/sessione', title: 'Nuova Sessione di Studio', icon: 'time', color: '#E2A64A' },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.subtitle}>Cosa desideri registrare nel tuo Planner?</Text>
      
      {/* Generazione dei 4 bottoni */}
      {opzioni.map((item) => (
        <TouchableOpacity
          key={item.path}
          style={[styles.card, { borderLeftColor: item.color }]}
          onPress={() => router.push(item.path as any)} // Va al form specifico 
        >
          <Ionicons name={item.icon as any} size={26} color={item.color} style={styles.icon} />
          <Text style={styles.cardText}>{item.title}</Text>
          <Ionicons name="chevron-forward" size={22} color="#ccc" />
        </TouchableOpacity>
      ))}

      {/* ⚠️ IL TASTO "MENO" / ANNULLA PER CHIUDERE LA MODALE */}
      <TouchableOpacity 
        style={styles.closeButton} 
        onPress={() => router.back()} // Scompare la modale e torna alle Tab principali
      >
        <Ionicons name="close-circle" size={20} color="#FF5252" style={{ marginRight: 8 }} />
        <Text style={styles.closeButtonText}>Annulla e Chiudi</Text>
      </TouchableOpacity>
    </View>
  );
}

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
  
  // Stile del tasto di chiusura dedicato
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