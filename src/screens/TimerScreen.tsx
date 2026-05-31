import { Ionicons } from '@expo/vector-icons';
import { useIsFocused } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// Importiamo le funzioni del nostro database locale
import { getAttivita, getStoricoTimer, salvaNuovoTimer } from '../constants/storage';

type Sessione = {
  id: string;
  title: string;
  startDate?: string;
  endDate?: string;
  estimatedTime?: number;
};

type Attivita = {
  id: string;
  session_id?: string | null;
  title: string;
};

type LogTimerUI = {
  id: string;
  sessioneTitolo: string;
  attivitaTitolo: string;
  durataEffettiva: string;
  stato: 'completato' | 'interrotto' | 'cambio';
  orario: string;
};

const COLORS = {
  primary: '#177AD5',
  background: '#F5F5F5',
  card: '#FFFFFF',
  text: '#333333',
  textLight: '#666666',
  danger: '#EF4444',
  success: '#22C55E',
  warning: '#F59E0B',
};

export default function TimerScreen() {
  const isFocused = useIsFocused();
  const [isLoading, setIsLoading] = useState(true);

  // Dati provenienti dal DB locale
  const [sessioniDisponibili, setSessioniDisponibili] = useState<Sessione[]>([]);
  const [tutteAttivita, setTutteAttivita] = useState<Attivita[]>([]);
  const [historyUI, setHistoryUI] = useState<LogTimerUI[]>([]);

  const [selectedSession, setSelectedSession] = useState<Sessione | null>(null);
  const [selectedActivity, setSelectedActivity] = useState<Attivita | null>(null);
  const [availableActivities, setAvailableActivities] = useState<Attivita[]>([]);
  
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [totalInitialSeconds, setTotalInitialSeconds] = useState(0);
  const [secondsAtLastSwitch, setSecondsAtLastSwitch] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  // --- 1. CARICAMENTO DATI
  useEffect(() => {
    const caricaDati = async () => {
      if (isFocused) {
        setIsLoading(true);
        try {
          // Recuperiamo tutto il blocco attività/sessioni e lo storico dei timer
          const [datiMisti, storicoSalvato] = await Promise.all([
            getAttivita(),
            getStoricoTimer()
          ]);

          const sessioni = datiMisti.filter((item: any) => item.type === 'sessione');
          const attivita = datiMisti.filter((item: any) => item.type === 'attivita');

          setSessioniDisponibili(sessioni);
          setTutteAttivita(attivita);

          // Costruiamo la history per la UI incrociando i dati salvati con i nomi reali
          const historyMappata = (storicoSalvato || []).map((record: any) => {
            const sess = sessioni.find((s: any) => s.id === record.sessione_id);
            const att = attivita.find((a: any) => a.id === record.attivita_id);
            
            const totalSeconds = (record.minuti_registrati || 0) * 60;
            return {
              id: record.id,
              sessioneTitolo: sess ? sess.title : 'Sessione generica',
              attivitaTitolo: att ? att.title : 'Attività generica',
              durataEffettiva: formatTime(totalSeconds),
              stato: record.stato,
              orario: record.completato_alle || '--:--',
            };
          });

          setHistoryUI(historyMappata);
        } catch (error) {
          console.error("Errore nel caricamento del TimerScreen:", error);
        } finally {
          setIsLoading(false);
        }
      }
    };
    caricaDati();
  }, [isFocused]);

  // --- 2. GESTIONE SELEZIONE SESSIONE ---
  useEffect(() => {
    if (selectedSession) {
      // Filtriamo le attività che appartengono alla sessione selezionata
      const filtered = tutteAttivita.filter(a => a.session_id === selectedSession.id);
      setAvailableActivities(filtered);
    }
  }, [selectedSession?.id, tutteAttivita]);


  const handleSessionSelect = (session: Sessione) => {
    // Blocco di sicurezza: se clicchi la sessione che è già attiva, ignora il click
    if (selectedSession?.id === session.id) return;

    setSelectedSession(session);
    setSelectedActivity(null);

    let duration = 3600; // Default di sicurezza (60 minuti)

      if (session.estimatedTime && session.estimatedTime > 0) {
        // Se per caso c'è un tempo pre-salvato in minuti, usa quello
        duration = session.estimatedTime * 60;
      } else if (session.startDate && session.endDate) {
        // Altrimenti, calcola i secondi esatti di differenza tra inizio e fine
        const start = new Date(session.startDate).getTime();
        const end = new Date(session.endDate).getTime();
        
        if (!isNaN(start) && !isNaN(end) && end > start) {
          duration = Math.floor((end - start) / 1000); 
        }
      }
      
      setTotalInitialSeconds(duration);
      setSecondsLeft(duration);
      setSecondsAtLastSwitch(duration);
      setIsRunning(false);
    }

  // --- 3. MOTORE DEL TIMER ---
  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    if (isRunning && secondsLeft > 0) {
      timeout = setTimeout(() => setSecondsLeft(s => s - 1), 1000);
    } else if (secondsLeft === 0 && isRunning) {
      handleTimerStop('completato');
    }
    return () => clearTimeout(timeout);
  }, [isRunning, secondsLeft]);

  const formatTime = (secs: number) => {
    const h = Math.floor(secs / 3600).toString().padStart(2, '0');
    const m = Math.floor((secs % 3600) / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return h === '00' ? `${m}:${s}` : `${h}:${m}:${s}`;
  };

  // --- 4. SALVATAGGIO REALE SU ASYNC STORAGE ---
  const logToHistory = async (activityObj: Attivita, durationSecs: number, stato: LogTimerUI['stato']) => {
    const oraAttuale = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const dataOggi = new Date().toISOString().split('T')[0];
    
    const nuovoRecordDB = {
      id: 't' + Date.now().toString(),
      sessione_id: selectedSession?.id || null,
      attivita_id: activityObj.id,
      data_registrazione: dataOggi,
      minuti_registrati: Math.round(durationSecs / 60), // Salva in minuti
      completato_alle: oraAttuale,
      stato: stato,
    };

    // Salviamo sul disco
    await salvaNuovoTimer(nuovoRecordDB);

    // Aggiorniamo la UI in tempo reale senza ricaricare tutto
    const newEntryUI: LogTimerUI = {
      id: nuovoRecordDB.id,
      sessioneTitolo: selectedSession?.title || '',
      attivitaTitolo: activityObj.title,
      durataEffettiva: formatTime(durationSecs),
      stato: stato,
      orario: oraAttuale,
    };
    setHistoryUI(prev => [newEntryUI, ...prev]);
  };

  const handleActivitySelect = (newActivity: Attivita) => {
    if (selectedActivity?.id === newActivity.id) return;

    if (selectedActivity) {
      const timeSpentOnOldActivity = secondsAtLastSwitch - secondsLeft;
      if (timeSpentOnOldActivity > 0) {
        logToHistory(selectedActivity, timeSpentOnOldActivity, 'cambio');
      }
    }

    setSelectedActivity(newActivity);
    setSecondsAtLastSwitch(secondsLeft);
  };

  const handleTimerStop = (stato: 'completato' | 'interrotto') => {
    setIsRunning(false);
    
    if (selectedActivity) {
      const timeSpent = secondsAtLastSwitch - secondsLeft;
      if (timeSpent > 0) {
        logToHistory(selectedActivity, timeSpent, stato);
      }
    }

    setSecondsLeft(totalInitialSeconds);
    setSecondsAtLastSwitch(totalInitialSeconds);
    setSelectedActivity(null); 
  };

  if (isLoading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#177AD5" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* CARD SELEZIONE */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>SESSIONE E ATTIVITÀ</Text>
          {sessioniDisponibili.length === 0 ? (
            <Text style={styles.emptyText}>Nessuna sessione di studio creata. Vai in Pianificazione per aggiungerne una.</Text>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 15 }}>
              {sessioniDisponibili.map(s => (
                <TouchableOpacity 
                  key={s.id} 
                  onPress={() => handleSessionSelect(s)}
                  style={[styles.chip, selectedSession?.id === s.id && styles.chipActive]}
                >
                  <Text style={[styles.chipText, selectedSession?.id === s.id && {color: '#fff'}]}>{s.title}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}

          {selectedSession && (
            <View style={styles.activitiesList}>
              {availableActivities.length === 0 ? (
                <Text style={styles.emptyText}>Nessuna attività collegata a questa sessione.</Text>
              ) : (
                availableActivities.map(a => (
                  <TouchableOpacity 
                    key={a.id} 
                    onPress={() => handleActivitySelect(a)}
                    style={[styles.activityItem, selectedActivity?.id === a.id && styles.activityItemActive]}
                  >
                    <Ionicons name="bookmark-outline" size={16} color={selectedActivity?.id === a.id ? COLORS.primary : COLORS.textLight} />
                    <Text style={[styles.activityText, selectedActivity?.id === a.id && {color: COLORS.primary}]}>
                      {a.title}
                    </Text>
                  </TouchableOpacity>
                ))
              )}
            </View>
          )}
        </View>

        {/* CARD TIMER */}
        <View style={[styles.card, { alignItems: 'center' }]}>
          <Text style={styles.timerDisplay}>{formatTime(secondsLeft)}</Text>
          <View style={styles.controls}>
            <TouchableOpacity 
              style={styles.btnStop} 
              onPress={() => handleTimerStop('interrotto')}
              disabled={!isRunning && secondsLeft === totalInitialSeconds}
            >
              <Text style={{color: COLORS.danger, fontWeight: '700'}}>STOP</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.btnStart, isRunning && {backgroundColor: COLORS.warning}]}
              onPress={() => setIsRunning(!isRunning)}
              disabled={!selectedActivity}
            >
              <Text style={{color: '#fff', fontWeight: '700'}}>{isRunning ? 'PAUSA' : 'AVVIA'}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* STORICO */}
        <View style={{ marginTop: 10 }}>
          <Text style={styles.historyHeader}>STORICO REGISTRAZIONI</Text>
          {historyUI.length === 0 ? (
            <Text style={styles.emptyText}>Nessuna registrazione salvata sul dispositivo.</Text>
          ) : (
            historyUI.map((item) => (
              <View key={item.id} style={styles.historyCard}>
                
                <View style={styles.historyInfo}>
                  <Text style={styles.historyActivity}>{item.attivitaTitolo}</Text>
                  <Text style={styles.historySession}>{item.sessioneTitolo} • {item.orario}</Text>
                </View>

                <View style={styles.historyStats}>
                  <Text style={styles.historyDuration}>{item.durataEffettiva}</Text>
                  <Text style={[styles.historyStatus, 
                    {color: item.stato === 'completato' ? COLORS.success : item.stato === 'cambio' ? COLORS.warning : COLORS.danger}
                  ]}>
                    {item.stato}
                  </Text>
                </View>

              </View>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scrollContent: { padding: 20, paddingBottom: 120 }, 
  card: { backgroundColor: '#fff', borderRadius: 15, padding: 20, marginBottom: 20, elevation: 3 },
  cardTitle: { fontSize: 12, fontWeight: 'bold', color: COLORS.textLight, marginBottom: 15 },
  chip: { padding: 10, backgroundColor: '#eee', borderRadius: 20, marginRight: 10 },
  chipActive: { backgroundColor: COLORS.primary },
  chipText: { fontSize: 13, fontWeight: '600' },
  activitiesList: { gap: 10 },
  activityItem: { flexDirection: 'row', alignItems: 'center', padding: 12, backgroundColor: '#f9f9f9', borderRadius: 10, gap: 10, borderWidth: 1, borderColor: 'transparent' },
  activityItemActive: { borderColor: COLORS.primary, backgroundColor: '#F0F8FF' },
  activityText: { fontWeight: '600' },
  timerDisplay: { fontSize: 60, fontWeight: 'bold', color: COLORS.primary, marginVertical: 20 },
  controls: { flexDirection: 'row', gap: 20, width: '100%' },
  btnStart: { width: '65%', backgroundColor: COLORS.primary, padding: 15, borderRadius: 12, alignItems: 'center' },
  btnStop: { width: '30%', borderWidth: 1, borderColor: COLORS.danger, padding: 15, borderRadius: 12, alignItems: 'center' },
  historyHeader: { fontSize: 14, fontWeight: 'bold', color: COLORS.textLight, marginBottom: 15 },
  historyCard: { flexDirection: 'row', backgroundColor: '#fff', padding: 15, borderRadius: 12, marginBottom: 10, alignItems: 'center', justifyContent: 'space-between', borderLeftWidth: 4, borderLeftColor: COLORS.primary },
  historyInfo: { width: '70%' },
  historyStats: { width: '25%', alignItems: 'flex-end' },
  historyActivity: { fontWeight: 'bold', fontSize: 15, color: '#000' },
  historySession: { fontSize: 12, color: COLORS.textLight },
  historyDuration: { fontWeight: 'bold', color: COLORS.primary },
  historyStatus: { fontSize: 10, textTransform: 'uppercase', marginTop: 2 },
  emptyText: { textAlign: 'center', color: COLORS.textLight, marginTop: 20, fontStyle: 'italic' }
});