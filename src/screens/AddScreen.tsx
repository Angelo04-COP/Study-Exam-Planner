// src/screens/AddScreen.tsx
import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useIsFocused } from '@react-navigation/native';

export default function AddScreen({ navigation }: { navigation: any }) {
  const isFocused = useIsFocused(); 
  const [modalVisibile, setModalVisibile] = useState(false);

  useEffect(() => {
    if (isFocused) {
      setModalVisibile(true);
    }
  }, [isFocused]);

  // CORREZIONE 1: Puntiamo alla rotta minuscola del Planner di Expo Router
  const chiudiPopUp = () => {
    setModalVisibile(false);
    navigation.navigate('planner'); 
  };

  return (
    <View style={styles.backgroundFinto}>
      <Modal
        visible={modalVisibile}
        animationType="slide" 
        transparent={true}    
        onRequestClose={chiudiPopUp}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.popupContainer}>
            
            <Text style={styles.title}>Cosa vuoi aggiungere?</Text>
            <Text style={styles.subtitle}>Seleziona una voce per registrarla nel tuo Planner scolastico</Text>
            
            {/* BOTTONE 1: NUOVO CORSO */}
            <TouchableOpacity
              style={[styles.card, { borderLeftColor: '#177AD5' }]}
              onPress={() => {
                setModalVisibile(false);
                // CORREZIONE 2: Nome rotta identico al name del tuo app/_layout.tsx
                navigation.navigate('aggiungi/corso'); 
              }}
            >
              <Ionicons name="book" size={26} color="#177AD5" style={styles.icon} />
              <Text style={styles.cardText}>Nuovo Corso Universitario</Text>
              <Ionicons name="chevron-forward" size={22} color="#ccc" />
            </TouchableOpacity>

            {/* BOTTONE 2: NUOVO ESAME */}
            <TouchableOpacity
              style={[styles.card, { borderLeftColor: '#FF5252' }]}
              onPress={() => {
                setModalVisibile(false);
                // CORREZIONE 3: Nome rotta identico al name del tuo app/_layout.tsx
                navigation.navigate('aggiungi/esame'); 
              }}
            >
              <Ionicons name="document-text" size={26} color="#FF5252" style={styles.icon} />
              <Text style={styles.cardText}>Nuovo Esame o Scadenza</Text>
              <Ionicons name="chevron-forward" size={22} color="#ccc" />
            </TouchableOpacity>

            {/* BOTTONE 3 & 4: ATTIVITÀ / SESSIONE */}
            <TouchableOpacity
              style={[styles.card, { borderLeftColor: '#4CAF50' }]}
              onPress={() => {
                setModalVisibile(false);
                // CORREZIONE 4: Nome rotta identico al name del tuo app/_layout.tsx
                navigation.navigate('aggiungi/scelta'); 
              }}
            >
              <Ionicons name="checkbox" size={26} color="#4CAF50" style={styles.icon} />
              <Text style={styles.cardText}>Nuova Attività o Sessione di Studio</Text>
              <Ionicons name="chevron-forward" size={22} color="#ccc" />
            </TouchableOpacity>

            {/* TASTO ANNULLA */}
            <TouchableOpacity style={styles.closeButton} onPress={chiudiPopUp}>
              <Ionicons name="close-circle" size={20} color="#FF5252" style={{ marginRight: 8 }} />
              <Text style={styles.closeButtonText}>Annulla e Chiudi</Text>
            </TouchableOpacity>

          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  backgroundFinto: { flex: 1, backgroundColor: '#f5f5f5' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.4)', justifyContent: 'flex-end' },
  popupContainer: { 
    backgroundColor: 'white', padding: 25, borderTopLeftRadius: 30, borderTopRightRadius: 30, paddingBottom: 45,
    shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.12, shadowRadius: 6, elevation: 5
  },
  title: { fontSize: 22, fontWeight: 'bold', color: '#333', textAlign: 'center', marginBottom: 6 },
  subtitle: { fontSize: 13, color: '#666', marginBottom: 25, textAlign: 'center', fontWeight: '500' },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 18, borderRadius: 14, marginBottom: 14, borderLeftWidth: 6, borderWidth: 1, borderColor: '#eee' },
  icon: { marginRight: 15 },
  cardText: { flex: 1, fontSize: 15, fontWeight: '600', color: '#333' },
  closeButton: { flexDirection: 'row', marginTop: 10, padding: 15, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFF1F1', borderRadius: 12, borderWidth: 1, borderColor: '#FFAAAA' },
  closeButtonText: { color: '#FF5252', fontWeight: 'bold', fontSize: 15 }
});