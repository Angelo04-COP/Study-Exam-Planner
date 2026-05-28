import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
// IL PERCORSO QUI È CAMBIATO PERCHÉ ORA SIAMO IN src/screens
import { mockAttivita, mockSessioni, mockStoricoTimer } from '../constants/mockData';

type Sessione = {
  id: string;
  titolo: string;
  data_ora_inizio: string;
  data_ora_fine: string;
};

type Attivita = {
  id: string;
  sessione_id: string | null;
  titolo: string;
};

type LogTimer = {
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
  const [selectedSession, setSelectedSession] = useState<Sessione | null>(null);
  const [selectedActivity, setSelectedActivity] = useState<Attivita | null>(null);
  const [availableActivities, setAvailableActivities] = useState<Attivita[]>([]);
  
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [totalInitialSeconds, setTotalInitialSeconds] = useState(0);
  
  const [secondsAtLastSwitch, setSecondsAtLastSwitch] = useState(0);
  
  const [isRunning, setIsRunning] = useState(false);
  const [history, setHistory] = useState<LogTimer[]>(() => {
    if (!mockStoricoTimer) return []; 
    
    return mockStoricoTimer.map((item: any) => { 
      const sessione = mockSessioni.find((s: any) => s.id === item.sessione_id); 
      const attivita = mockAttivita.find((a: any) => a.id === item.attivita_id); 
      
      const minuti = typeof item.minuti_registrati === 'number' ? item.minuti_registrati : 0;
      const totalSeconds = minuti * 60;

      const h = Math.floor(totalSeconds / 3600).toString().padStart(2, '0');
      const m = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0');
      const s = (totalSeconds % 60).toString().padStart(2, '0');
      const durataFormattata = h === '00' ? `${m}:${s}` : `${h}:${m}:${s}`;

      return {
        id: item.id || Math.random().toString(),
        sessioneTitolo: sessione?.titolo || 'Sessione non trovata',
        attivitaTitolo: attivita?.titolo || 'Attività passata',
        durataEffettiva: durataFormattata,
        stato: item.stato as 'completato' | 'interrotto' | 'cambio',
        orario: item.completato_alle || '--:--',
      };
    });
  });

  useEffect(() => {
    if (selectedSession) {
      const filtered = mockAttivita.filter(a => a.sessione_id === selectedSession.id);
      setAvailableActivities(filtered);
      setSelectedActivity(null);

      const start = new Date(selectedSession.data_ora_inizio).getTime();
      const end = new Date(selectedSession.data_ora_fine).getTime();
      const duration = Math.floor((end - start) / 1000);
      
      setTotalInitialSeconds(duration);
      setSecondsLeft(duration);
      setSecondsAtLastSwitch(duration);
      setIsRunning(false);
    }
  }, [selectedSession]);

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

  const logToHistory = (activityTitle: string, durationSecs: number, stato: LogTimer['stato']) => {
    const oraAttuale = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newEntry: LogTimer = {
      id: Date.now().toString() + Math.random(),
      sessioneTitolo: selectedSession?.titolo || '',
      attivitaTitolo: activityTitle,
      durataEffettiva: formatTime(durationSecs),
      stato: stato,
      orario: oraAttuale,
    };
    setHistory(prev => [newEntry, ...prev]);
  };

  const handleActivitySelect = (newActivity: Attivita) => {
    if (selectedActivity?.id === newActivity.id) return;

    if (selectedActivity) {
      const timeSpentOnOldActivity = secondsAtLastSwitch - secondsLeft;
      if (timeSpentOnOldActivity > 0) {
        logToHistory(selectedActivity.titolo, timeSpentOnOldActivity, 'cambio');
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
        logToHistory(selectedActivity.titolo, timeSpent, stato);
      }
    }

    setSecondsLeft(totalInitialSeconds);
    setSecondsAtLastSwitch(totalInitialSeconds);
    setSelectedActivity(null); 
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* CARD SELEZIONE */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>SESSIONE E ATTIVITÀ</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 15 }}>
            {mockSessioni.map(s => (
              <TouchableOpacity 
                key={s.id} 
                onPress={() => setSelectedSession(s)}
                style={[styles.chip, selectedSession?.id === s.id && styles.chipActive]}
              >
                <Text style={[styles.chipText, selectedSession?.id === s.id && {color: '#fff'}]}>{s.titolo}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {selectedSession && (
            <View style={styles.activitiesList}>
              {availableActivities.map(a => (
                <TouchableOpacity 
                  key={a.id} 
                  onPress={() => handleActivitySelect(a)}
                  style={[styles.activityItem, selectedActivity?.id === a.id && styles.activityItemActive]}
                >
                  <Ionicons name="bookmark-outline" size={16} color={selectedActivity?.id === a.id ? COLORS.primary : COLORS.textLight} />
                  <Text style={[styles.activityText, selectedActivity?.id === a.id && {color: COLORS.primary}]}>
                    {a.titolo}
                  </Text>
                </TouchableOpacity>
              ))}
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
          <Text style={styles.historyHeader}>ATTIVITÀ COMPLETATE OGGI</Text>
          {history.length === 0 ? (
            <Text style={styles.emptyText}>Nessuna attività registrata in questa sessione.</Text>
          ) : (
            history.map((item) => (
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
  historyCard: { 
    flexDirection: 'row', 
    backgroundColor: '#fff', 
    padding: 15, 
    borderRadius: 12, 
    marginBottom: 10, 
    alignItems: 'center',
    justifyContent: 'space-between',
    borderLeftWidth: 4, 
    borderLeftColor: COLORS.primary
  },
  historyInfo: { width: '70%' },
  historyStats: { width: '25%', alignItems: 'flex-end' },
  historyActivity: { fontWeight: 'bold', fontSize: 15, color: '#000' },
  historySession: { fontSize: 12, color: COLORS.textLight },
  historyDuration: { fontWeight: 'bold', color: COLORS.primary },
  historyStatus: { fontSize: 10, textTransform: 'uppercase', marginTop: 2 },
  emptyText: { textAlign: 'center', color: COLORS.textLight, marginTop: 20, fontStyle: 'italic' }
});