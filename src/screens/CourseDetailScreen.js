import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function CourseDetailScreen({ route, navigation }) {
  // 1. Recuperiamo i dati passati dalla navigazione
  const { courseData, isExam } = route.params;

  // 2. Helper per il colore del badge
  const getBadgeColor = (stato) => {
    if (!stato) return '#94a3b8'; 
    const s = stato.toLowerCase();
    if (s === 'completato' || s === 'superato') return '#4CAF50';
    if (s === 'in corso') return '#177AD5';
    return '#8EBBF3';
  };

  return (
    <ScrollView style={styles.container}>

      {/* HEADER: Titolo e Badge dello stato */}
      <View style={styles.header}>
        <Text style={styles.title}>{courseData.nome || courseData.titolo}</Text>

        {courseData.stato && (
          <View style={[styles.badge, { backgroundColor: getBadgeColor(courseData.stato) }]}>
            <Text style={styles.badgeText}>{courseData.stato.toUpperCase()}</Text>
          </View>
        )}
      </View>

      {/* CARD PRINCIPALE CON LE INFORMAZIONI */}
      <View style={styles.infoCard}>

        {/* Riga Docente / Tipologia */}
        <View style={styles.infoRow}>
          <Ionicons name={isExam ? "layers-outline" : "person-outline"} size={20} color="#177AD5" />
          <View style={styles.textContainer}>
            <Text style={styles.label}>{isExam ? 'Tipologia' : 'Docente'}</Text>
            <Text style={styles.value}>{courseData.docente || courseData.tipologia || 'Non specificato'}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Riga CFU / Data Scadenza */}
        <View style={styles.infoRow}>
          <Ionicons name={isExam ? "calendar-outline" : "ribbon-outline"} size={20} color="#177AD5" />
          <View style={styles.textContainer}>
            <Text style={styles.label}>{isExam ? "Data dell'Appello" : 'Crediti Formativi'}</Text>
            <Text style={styles.value}>{courseData.cfu ? `${courseData.cfu} CFU` : (courseData.data || 'Nessuna data')}</Text>
          </View>
        </View>

        {/* ==========================================
            CAMPI SPECIFICI PER I CORSI (!isExam)
            ========================================== */}
        {!isExam && (
          <>
            <View style={styles.divider} />
            {/* Semestre e Anno Accademico */}
            <View style={styles.infoRow}>
              <Ionicons name="time-outline" size={20} color="#177AD5" />
              <View style={styles.textContainer}>
                <Text style={styles.label}>Periodo</Text>
                <Text style={styles.value}>
                  {courseData.semestre || 'Semestre N/D'} ({courseData.anno_accademico || 'Anno N/D'})
                </Text>
              </View>
            </View>

            <View style={styles.divider} />
            {/* Date Inizio e Fine */}
            <View style={styles.infoRow}>
              <Ionicons name="calendar-number-outline" size={20} color="#177AD5" />
              <View style={styles.textContainer}>
                <Text style={styles.label}>Durata Corso</Text>
                <Text style={styles.value}>
                  {courseData.data_inizio || 'N/D'} ➔ {courseData.data_fine || 'N/D'}
                </Text>
              </View>
            </View>

            {/* Voto Obiettivo (solo se presente) */}
            {courseData.voto_desiderato && (
              <>
                <View style={styles.divider} />
                <View style={styles.infoRow}>
                  <Ionicons name="star-outline" size={20} color="#FF9800" />
                  <View style={styles.textContainer}>
                    <Text style={styles.label}>Voto Obiettivo</Text>
                    <Text style={[styles.value, { color: '#FF9800', fontWeight: 'bold' }]}>
                      {courseData.voto_desiderato}
                    </Text>
                  </View>
                </View>
              </>
            )}
          </>
        )}

        {/* ==========================================
            CAMPI SPECIFICI PER GLI ESAMI (isExam)
            ========================================== */}
        {isExam && courseData.priorita && (
          <>
            <View style={styles.divider} />
            {/* Priorità */}
            <View style={styles.infoRow}>
              <Ionicons name="alert-circle-outline" size={20} color={courseData.priorita === 'Alta' ? '#FF5252' : '#177AD5'} />
              <View style={styles.textContainer}>
                <Text style={styles.label}>Priorità</Text>
                <Text style={[styles.value, { color: courseData.priorita === 'Alta' ? '#FF5252' : '#333' }]}>
                  {courseData.priorita}
                </Text>
              </View>
            </View>
          </>
        )}

        {/* ==========================================
            ESITO (Mostrato sia per Esami che per Corsi se esiste)
            ========================================== */}
        {(courseData.voto_ottenuto || courseData.voto_risultato) && (
          <>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <Ionicons name="school-outline" size={20} color="#4CAF50" />
              <View style={styles.textContainer}>
                <Text style={styles.label}>Esito Finale</Text>
                <Text style={[styles.value, { color: '#4CAF50', fontWeight: 'bold' }]}>
                  {courseData.voto_ottenuto || courseData.voto_risultato}
                </Text>
              </View>
            </View>
          </>
        )}
      </View>

      {/* SEZIONE DESCRIZIONE / NOTE */}
      <View style={styles.notesSection}>
        <Text style={styles.notesTitle}>{isExam ? 'Note e Promemoria' : 'Descrizione del Corso'}</Text>
        <Text style={styles.notesText}>
          {isExam 
            ? (courseData.note || "Nessuna nota aggiuntiva per questo appello.")
            : (courseData.descrizione || "Nessuna descrizione disponibile per questo corso.")}
        </Text>
      </View>

      {/* BOTTONE INDIETRO */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
        activeOpacity={0.8}
      >
        <Ionicons name="arrow-back" size={20} color="white" style={{ marginRight: 8 }} />
        <Text style={styles.buttonText}>Torna alla Carriera</Text>
      </TouchableOpacity>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    padding: 20,
  },
  header: {
    marginTop: 10,
    marginBottom: 24,
    alignItems: 'flex-start',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 12,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  infoCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 24,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  textContainer: {
    marginLeft: 16,
    flex: 1,
  },
  label: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 2,
  },
  value: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 12,
  },
  notesSection: {
    marginBottom: 30,
    paddingHorizontal: 5,
  },
  notesTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 10,
  },
  notesText: {
    fontSize: 15,
    lineHeight: 24,
    color: '#475569',
  },
  backButton: {
    backgroundColor: '#177AD5',
    flexDirection: 'row',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#177AD5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  }
});