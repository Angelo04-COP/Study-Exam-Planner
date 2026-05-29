// src/screens/AcademicScreen.js
import { Ionicons } from '@expo/vector-icons';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

// Importiamo le funzioni dello storage locale
import { eliminaCorso, eliminaEsame, getCorsi, getEsami, verbalizzaEsitoEsame } from '../constants/storage';

export default function AcademicScreen() {
  const [mostraEsami, setMostraEsami] = useState(false);
  const navigation = useNavigation();
  const isFocused = useIsFocused();

  const [corsi, setCorsi] = useState([]);
  const [esami, setEsami] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // --- STATI PER IL MODALE GRAFICO DI VERBALIZZAZIONE REALE ---
  const [isVerbalizzaModalVisible, setVerbalizzaModalVisible] = useState(false);
  const [esameSelezionato, setEsameSelezionato] = useState(null);
  const [corsoAssociatoAllEsame, setCorsoAssociatoAllEsame] = useState(null);
  const [votoInserito, setVotoInserito] = useState('30');

  // --- 1. CARICAMENTO DATI DINAMICI DALLO STORAGE ---
  const caricaDatiCarriera = async () => {
    setIsLoading(true);
    try {
      const [corsiSalvati, esamiSalvati] = await Promise.all([ getCorsi(), getEsami() ]);
      
      const oggiStr = new Date().toISOString().split('T')[0];

      // Calcolo dello stato temporale dinamico basato sulle date (Requisito di Traccia)
      const corsiAggiornatiDinamici = (corsiSalvati || []).map(corso => {
        if (corso.data_inizio && corso.data_fine) {
          let nuovoStato = corso.stato;
          if (corso.data_inizio > oggiStr) {
            nuovoStato = 'da iniziare';
          } else if (corso.data_inizio <= oggiStr && corso.data_fine >= oggiStr) {
            nuovoStato = 'in corso';
          } else if (corso.data_fine < oggiStr) {
            nuovoStato = 'completato';
          }
          return { ...corso, stato: nuovoStato };
        }
        return corso;
      });

      setCorsi(corsiAggiornatiDinamici);
      setEsami(esamiSalvati || []);
    } catch (error) {
      console.error("Errore nel recupero dati per la Carriera:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isFocused) caricaDatiCarriera();
  }, [isFocused]);

  // --- 2. APERTURA INTERFACCIA MODALE INTEGRATA ---
  const apriVerbalizzazione = (esame) => {
    // Troviamo il corso reale collegato nel database per mostrarlo nel modale
    const corsoTrovato = corsi.find(c => c.id === esame.corso_id);
    
    setEsameSelezionato(esame);
    setCorsoAssociatoAllEsame(corsoTrovato);
    setVotoInserito('30'); // Default standard accademico
    setVerbalizzaModalVisible(true);
  };

  // --- 3. LOGICA DI VERBALIZZAZIONE CON REALE AGGIORNAMENTO DEL CORSO ---
  const confermaEsitoDettagliato = async (esito) => {
    if (!esameSelezionato) return;

    let votoFinalizzato = null;

    if (esito === 'SUPERATO') {
      const votoNum = parseInt(votoInserito, 10);
      // Validazione formale del voto secondo i vincoli richiesti dal progetto
      if (isNaN(votoNum) || votoNum < 18 || votoNum > 30) {
        Alert.alert("Errore", "Inserisci un voto valido compreso tra 18 e 30.");
        return;
      }
      votoFinalizzato = votoNum;
    }

    // Passiamo l'ID del corso reale associato per far sì che lo storage aggiorni la scheda del corso
    const success = await verbalizzaEsitoEsame(
      esameSelezionato.id, 
      esameSelezionato.corso_id, // L'ID reale del corso (es. 'c1')
      esito, 
      votoFinalizzato
    );
    
    if (success) {
      setVerbalizzaModalVisible(false);
      setEsameSelezionato(null);
      setCorsoAssociatoAllEsame(null);
      caricaDatiCarriera(); // Aggiorna istantaneamente i grafici e la lista
    }
  };

  // --- 4. LOGICA DI ELIMINAZIONE COMPATIBILE WEB/MOBILE ---
  const confermEliminazioneCorso = (id, nome) => {
    if (typeof window !== 'undefined' && window.confirm) {
      const confermaWeb = window.confirm(`Sei sicuro di voler eliminare il corso "${nome}"?`);
      if (confermaWeb) eseguiEliminazioneCorso(id);
    } else {
      Alert.alert(
        "Elimina Corso",
        `Sei sicuro di voler eliminare il corso "${nome}"?`,
        [
          { text: "Annulla", style: "cancel" },
          { text: "Elimina", style: "destructive", onPress: () => eseguiEliminazioneCorso(id) }
        ]
      );
    }
  };

  const eseguiEliminazioneCorso = async (id) => {
    const success = await eliminaCorso(id);
    if (success) setCorsi(corsi.filter(c => c.id !== id));
  };

  const confermEliminazioneEsame = (id, titolo) => {
    if (typeof window !== 'undefined' && window.confirm) {
      const confermaWeb = window.confirm(`Sei sicuro di voler eliminare l'esame "${titolo}"?`);
      if (confermaWeb) eseguiEliminazioneEsame(id);
    } else {
      Alert.alert(
        "Elimina Esame",
        `Sei sicuro di voler eliminare l'esame "${titolo}"?`,
        [
          { text: "Annulla", style: "cancel" },
          { text: "Elimina", style: "destructive", onPress: () => eseguiEliminazioneEsame(id) }
        ]
      );
    }
  };

  const eseguiEliminazioneEsame = async (id) => {
    const success = await eliminaEsame(id);
    if (success) setEsami(esami.filter(e => e.id !== id));
  };

  // --- 5. HELPERS BADGE ---
  const getColoreStatoCorso = (stato) => {
    switch (stato?.toLowerCase()) {
      case 'completato': return '#4CAF50';
      case 'in corso': return '#177AD5';
      case 'da iniziare': return '#F39C12';
      default: return '#94a3b8';
    }
  };

  const getColoreStatoEsame = (stato) => {
    const s = stato?.toLowerCase();
    if (s === 'superato') return '#4CAF50';
    if (s === 'bocciato/rifiutato') return '#FF5252';
    return '#8EBBF3';
  };

  if (isLoading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#177AD5" />
        <Text style={{ marginTop: 10, color: '#64748B', fontWeight: '500' }}>Caricamento carriera...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={styles.container}>
        {/* HEADER ROW */}
        <View style={styles.headerRow}>
          <Text style={styles.headerTitle}>CARRIERA</Text>
          <TouchableOpacity style={styles.switchContainer} onPress={() => setMostraEsami(!mostraEsami)} activeOpacity={0.9}>
            <Text style={[styles.switchText, !mostraEsami && styles.switchTextActive]}>Corsi</Text>
            <Text style={[styles.switchText, mostraEsami && styles.switchTextActive]}>Esami</Text>
            <View style={[styles.switchBall, mostraEsami ? styles.switchBallRight : styles.switchBallLeft]} />
          </TouchableOpacity>
        </View>

        {!mostraEsami ? (
          /* ================= VISTA CORSI ================= */
          <View style={styles.listaContainer}>
            {corsi.length > 0 ? (
              corsi.map((corso) => (
                <TouchableOpacity key={corso.id} style={styles.card} activeOpacity={0.7} onPress={() => navigation.navigate('CourseDetail', { courseData: corso, isExam: false })}>
                  <View style={styles.cardHeader}>
                    <View style={{ flex: 1, paddingRight: 10, alignItems: 'flex-start' }}>
                      <Text style={styles.cardMainTitle}>{corso.nome}</Text>
                      <View style={[styles.badge, { backgroundColor: getColoreStatoCorso(corso.stato), marginTop: 6 }]}>
                        <Text style={styles.badgeText}>{corso.stato ? corso.stato.toUpperCase() : 'N/D'}</Text>
                      </View>
                    </View>
                    <View style={styles.actionButtons}>
                      <TouchableOpacity onPress={() => navigation.navigate('AddCorso', { corsoDaModificare: corso })} style={styles.iconBtn}>
                        <Ionicons name="pencil" size={20} color="#64748B" />
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => confermEliminazioneCorso(corso.id, corso.nome)} style={styles.iconBtn}>
                        <Ionicons name="trash" size={20} color="#FF5252" />
                      </TouchableOpacity>
                    </View>
                  </View>

                  <Text style={styles.cardSubText}>Docente: {corso.docente || 'Non assegnato'}</Text>

                  <View style={styles.cardFooter}>
                    <View style={styles.infoTag}>
                      <Ionicons name="ribbon-outline" size={14} color="#64748B" />
                      <Text style={styles.infoTagText}>{corso.cfu || 0} CFU</Text>
                    </View>
                    {corso.voto_ottenuto && <Text style={styles.votoTesto}>Voto: {corso.voto_ottenuto}</Text>}
                  </View>
                </TouchableOpacity>
              ))
            ) : (
              <Text style={styles.emptyText}>Nessun corso aggiunto alla carriera.</Text>
            )}
          </View>
        ) : (
          /* ================= VISTA ESAMI ================= */
          <View style={styles.listaContainer}>
            {esami.length > 0 ? (
              esami.map((esame) => {
                const corsoCollegato = corsi.find(c => c.id === esame.corso_id);
                return (
                  <TouchableOpacity key={esame.id} style={styles.card} activeOpacity={0.7} onPress={() => navigation.navigate('CourseDetail', { courseData: esame, isExam: true })}>
                    <View style={styles.cardHeader}>
                      <View style={{ flex: 1, paddingRight: 10, alignItems: 'flex-start' }}>
                        <Text style={styles.cardMainTitle} numberOfLines={1}>{esame.titolo}</Text>
                        <Text style={styles.corsoIncrociatoText}>{corsoCollegato ? corsoCollegato.nome : 'Corso Non Trovato'}</Text>
                        <View style={[styles.badge, { backgroundColor: getColoreStatoEsame(esame.stato), marginTop: 6 }]}>
                          <Text style={styles.badgeText}>{esame.stato ? esame.stato.toUpperCase() : 'N/D'}</Text>
                        </View>
                      </View>

                      <View style={styles.actionButtons}>
                        {esame.stato !== 'superato' && (
                          <TouchableOpacity onPress={() => apriVerbalizzazione(esame)} style={styles.iconBtn}>
                            <Ionicons name="checkmark-done-circle" size={24} color="#4CAF50" />
                          </TouchableOpacity>
                        )}
                        <TouchableOpacity onPress={() => navigation.navigate('AddEsame', { esameDaModificare: esame })} style={styles.iconBtn}>
                          <Ionicons name="pencil" size={20} color="#64748B" />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => confermEliminazioneEsame(esame.id, esame.titolo)} style={styles.iconBtn}>
                          <Ionicons name="trash" size={20} color="#FF5252" />
                        </TouchableOpacity>
                      </View>
                    </View>

                    <View style={[styles.cardFooter, { marginTop: 15 }]}>
                      <View style={styles.infoTag}>
                        <Ionicons name="calendar-outline" size={14} color="#64748B" />
                        <Text style={styles.infoTagText}>{esame.data}</Text>
                      </View>
                      <View style={styles.infoTag}>
                        <Ionicons name="layers-outline" size={14} color="#64748B" />
                        <Text style={styles.infoTagText}>{esame.tipologia || 'Non specificata'}</Text>
                      </View>
                    </View>

                    {esame.voto_risultato && (
                      <View style={styles.esitoGuscio}>
                        <Text style={styles.esitoTesto}>Superato con: {esame.voto_risultato}</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })
            ) : (
              <Text style={styles.emptyText}>Nessun esame programmato.</Text>
            )}
          </View>
        )}
        <View style={{ marginBottom: 100 }} />
      </ScrollView>

      {/* ==========================================
          MODALE GRAFICO: CON AGGANCIO REALE AL CORSO
          ========================================== */}
      <Modal visible={isVerbalizzaModalVisible} transparent={true} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            
            <Text style={styles.modalTitle}>Verbalizzazione Esame</Text>
            
            <View style={styles.dettagliIncrociatiContainer}>
              <Text style={styles.modalSubtitle}>
                Stai registrando l'esito per:{"\n"}
                <Text style={{ fontWeight: 'bold', color: '#1E293B' }}>{esameSelezionato?.titolo}</Text>
              </Text>
              
              {/* Box informativo che mostra il corso reale che verrà modificato */}
              <View style={styles.boxCorsoIncrociato}>
                <Ionicons name="school" size={16} color="#177AD5" />
                <Text style={styles.testoBoxCorso}>
                  Corso associato: <Text style={{ fontWeight: '700' }}>{corsoAssociatoAllEsame ? corsoAssociatoAllEsame.nome : 'Nessuno'}</Text>
                </Text>
              </View>
            </View>

            {/* SEZIONE INPUT VOTO */}
            <View style={styles.votoInputContainer}>
              <Text style={styles.votoLabel}>Se hai ACCETTATO il voto, inseriscilo qui sotto:</Text>
              <TextInput 
                style={styles.votoInput}
                value={votoInserito}
                onChangeText={setVotoInserito}
                keyboardType="numeric"
                maxLength={2}
              />
            </View>

            {/* OPZIONI DI REGISTRAZIONE DINAMICA */}
            <View style={styles.modalActionsStack}>
              <TouchableOpacity 
                style={[styles.modalButton, { backgroundColor: '#4CAF50' }]} 
                onPress={() => confermaEsitoDettagliato('SUPERATO')}
              >
                <Ionicons name="checkmark-circle-outline" size={20} color="white" />
                <Text style={styles.modalButtonText}>Superato (Aggiorna Corso)</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.modalButton, { backgroundColor: '#FF5252' }]} 
                onPress={() => confermaEsitoDettagliato('RIFIUTATO')}
              >
                <Ionicons name="close-circle-outline" size={20} color="white" />
                <Text style={styles.modalButtonText}>Rifiutato / Bocciato</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.modalButton, { backgroundColor: '#94a3b8', marginTop: 8 }]} 
                onPress={() => setVerbalizzaModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>Annulla</Text>
              </TouchableOpacity>
            </View>

          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5', padding: 20 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, marginTop: 40 },
  headerTitle: { fontSize: 28, fontWeight: 'bold', color: '#333' },
  switchContainer: { flexDirection: 'row', backgroundColor: '#E2E8F0', borderRadius: 20, width: 140, height: 36, alignItems: 'center', position: 'relative' },
  switchText: { flex: 1, textAlign: 'center', fontSize: 12, fontWeight: '700', color: '#64748B', zIndex: 2 },
  switchTextActive: { color: 'white' },
  switchBall: { position: 'absolute', height: 30, width: 66, borderRadius: 15, backgroundColor: '#475569', zIndex: 1, top: 3 },
  switchBallLeft: { left: 3 },
  switchBallRight: { right: 3 },
  listaContainer: { gap: 16 },
  card: { backgroundColor: 'white', borderRadius: 12, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 3 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  actionButtons: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingLeft: 10 },
  iconBtn: { padding: 4 },
  cardMainTitle: { fontSize: 18, fontWeight: 'bold', color: '#1E293B' },
  corsoIncrociatoText: { fontSize: 13, color: '#177AD5', fontWeight: '600', marginTop: 2 },
  cardSubText: { fontSize: 14, color: '#64748B', marginBottom: 12 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  infoTag: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F1F5F9', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6, gap: 6 },
  infoTagText: { fontSize: 12, color: '#475569', fontWeight: '500' },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  badgeText: { color: 'white', fontSize: 10, fontWeight: 'bold' },
  votoTesto: { fontSize: 14, fontWeight: 'bold', color: '#4CAF50' },
  esitoGuscio: { marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#F1F5F9' },
  esitoTesto: { fontSize: 13, fontWeight: '600', color: '#4CAF50' },
  emptyText: { textAlign: 'center', color: '#94a3b8', marginTop: 30, fontSize: 15, fontStyle: 'italic' },
  
  // --- NUOVI STILI DEL SELETTORE GRAFICO ---
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: 'white', width: '85%', borderRadius: 20, padding: 24, alignItems: 'center', elevation: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 5 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#1E293B', marginBottom: 8 },
  dettagliIncrociatiContainer: { width: '100%', alignItems: 'center', marginBottom: 15 },
  modalSubtitle: { fontSize: 14, color: '#64748B', textAlign: 'center', marginBottom: 10, lineHeight: 20 },
  boxCorsoIncrociato: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#EFF6FF', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, gap: 8, borderWidth: 1, borderColor: '#BFDBFE' },
  testoBoxCorso: { fontSize: 12, color: '#1E40AF' },
  votoInputContainer: { width: '100%', alignItems: 'center', backgroundColor: '#F8FAFC', padding: 14, borderRadius: 12, marginBottom: 20, borderWidth: 1, borderColor: '#E2E8F0' },
  votoLabel: { fontSize: 13, color: '#475569', fontWeight: '500', marginBottom: 8 },
  votoInput: { backgroundColor: 'white', width: 65, height: 44, borderRadius: 8, borderWidth: 1, borderColor: '#CBD5E1', textAlign: 'center', fontSize: 18, fontWeight: 'bold', color: '#177AD5' },
  modalActionsStack: { width: '100%', gap: 10 },
  modalButton: { flexDirection: 'row', height: 46, borderRadius: 10, justifyContent: 'center', alignItems: 'center', gap: 8 },
  modalButtonText: { color: 'white', fontSize: 14, fontWeight: 'bold' }
});