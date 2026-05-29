import { Ionicons } from '@expo/vector-icons';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// Importiamo le funzioni di lettura E di eliminazione
import { eliminaCorso, eliminaEsame, getCorsi, getEsami } from '../constants/storage';

export default function AcademicScreen() {
  const [mostraEsami, setMostraEsami] = useState(false);
  const navigation = useNavigation();
  const isFocused = useIsFocused();

  const [corsi, setCorsi] = useState([]);
  const [esami, setEsami] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // --- 1. CARICAMENTO DATI ---
  const caricaDatiCarriera = async () => {
    setIsLoading(true);
    try {
      const [corsiSalvati, esamiSalvati] = await Promise.all([ getCorsi(), getEsami() ]);
      
      const oggiStr = new Date().toISOString().split('T')[0];

      // Mappiamo i corsi per aggiornare lo stato in tempo reale se le date sono cambiate nel tempo
      const corsiAggiornatiDinamici = (corsiSalvati || []).map(corso => {
        // Se il corso ha le date inserite, ricalcola lo stato attuale
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

  // --- 2. LOGICA DI ELIMINAZIONE (Compatibile sia con Web che Mobile) ---
  const confermEliminazioneCorso = (id, nome) => {
    // 1. GESTIONE SE L'APP GIRA SUL WEB (Browser)
    if (typeof window !== 'undefined' && window.confirm) {
      const confermaWeb = window.confirm(`Sei sicuro di voler eliminare il corso "${nome}"?`);
      if (confermaWeb) {
        eseguiEliminazioneCorso(id);
      }
    } else {
      // 2. GESTIONE SE L'APP GIRA SU SMARTPHONE (Android / iOS)
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

  // Funzione isolata che cancella effettivamente il corso
  const eseguiEliminazioneCorso = async (id) => {
    const success = await eliminaCorso(id); //
    if (success) {
      setCorsi(corsi.filter(c => c.id !== id)); //
    }
  };


  const confermEliminazioneEsame = (id, titolo) => {
    // 1. GESTIONE SE L'APP GIRA SUL WEB (Browser)
    if (typeof window !== 'undefined' && window.confirm) {
      const confermaWeb = window.confirm(`Sei sicuro di voler eliminare l'esame "${titolo}"?`);
      if (confermaWeb) {
        eseguiEliminazioneEsame(id);
      }
    } else {
      // 2. GESTIONE SE L'APP GIRA SU SMARTPHONE (Android / iOS)
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

  // Funzione isolata che cancella effettivamente l'esame
  const eseguiEliminazioneEsame = async (id) => {
    const success = await eliminaEsame(id); //
    if (success) {
      setEsami(esami.filter(e => e.id !== id)); //
    }
  };

  // --- 3. LOGICA DI MODIFICA (Navigazione ai form) ---
  const gestisciModificaCorso = (corso) => {
    navigation.navigate('AddCorso', { corsoDaModificare: corso });
  };

  const gestisciModificaEsame = (esame) => {
    navigation.navigate('AddEsame', { esameDaModificare: esame });
  };

  // Helper Colori
  const getColoreStatoCorso = (stato) => {
    switch (stato) {
      case 'completato': return '#4CAF50'; // Verde
      case 'in corso': return '#177AD5';    // Blu
      case 'da iniziare': return '#F39C12'; // Arancione / Giallo scuro
      default: return '#94a3b8';
    }
  };

  const getColoreStatoEsame = (stato) => {
    return stato?.toLowerCase() === 'superato' ? '#4CAF50' : '#8EBBF3';
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
    <ScrollView style={styles.container}>
      {/* HEADER E SWITCH */}
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
                
                {/* Nuova struttura Header Card con pulsanti Azione */}
                <View style={styles.cardHeader}>
                  <View style={{ flex: 1, paddingRight: 10, alignItems: 'flex-start' }}>
                    <Text style={styles.cardMainTitle}>{corso.nome}</Text>
                    <View style={[styles.badge, { backgroundColor: getColoreStatoCorso(corso.stato), marginTop: 6 }]}>
                      <Text style={styles.badgeText}>{corso.stato ? corso.stato.toUpperCase() : 'N/D'}</Text>
                    </View>
                  </View>
                  
                  {/* Pulsanti Modifica e Elimina */}
                  <View style={styles.actionButtons}>
                    <TouchableOpacity onPress={() => gestisciModificaCorso(corso)} style={styles.iconBtn}>
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
                  
                  {/* Nuova struttura Header Card con pulsanti Azione */}
                  <View style={styles.cardHeader}>
                    <View style={{ flex: 1, paddingRight: 10, alignItems: 'flex-start' }}>
                      <Text style={styles.cardMainTitle} numberOfLines={1}>{esame.titolo}</Text>
                      <Text style={styles.corsoIncrociatoText}>{corsoCollegato ? corsoCollegato.nome : 'Corso Non Trovato'}</Text>
                      <View style={[styles.badge, { backgroundColor: getColoreStatoEsame(esame.stato), marginTop: 6 }]}>
                        <Text style={styles.badgeText}>{esame.stato ? esame.stato.toUpperCase() : 'N/D'}</Text>
                      </View>
                    </View>

                    {/* Pulsanti Modifica e Elimina */}
                    <View style={styles.actionButtons}>
                      <TouchableOpacity onPress={() => gestisciModificaEsame(esame)} style={styles.iconBtn}>
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
  
  // Stili modificati per ospitare le icone
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  actionButtons: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingLeft: 10 },
  iconBtn: { padding: 4 }, // Aumenta leggermente l'area cliccabile dell'icona
  
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
  emptyText: { textAlign: 'center', color: '#94a3b8', marginTop: 30, fontSize: 15, fontStyle: 'italic' }
});