import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native'; // 1. IMPORTA LA NAVIGAZIONE

// Import dei dati condivisi
import { mockCorsi, mockEsami } from '../constants/mockData';

export default function AcademicScreen() {
  const [mostraEsami, setMostraEsami] = useState(false);
  const navigation = useNavigation(); // 2. INIZIALIZZA IL NAVIGATORE

  // Funzione helper per colorare i badge dei corsi in base allo stato
  const getColoreStatoCorso = (stato) => {
    switch (stato) {
      case 'completato': return '#4CAF50';
      case 'in corso': return '#177AD5';
      default: return '#94a3b8';
    }
  };

  // Funzione helper per colorare i badge degli esami
  const getColoreStatoEsame = (stato) => {
    return stato === 'superato' ? '#4CAF50' : '#8EBBF3';
  };

  return (
    <ScrollView style={styles.container}>
      {/* ----------- INTESTAZIONE E SWITCH ----------- */}
      <View style={styles.headerRow}>
        <Text style={styles.headerTitle}>CARRIERA</Text>

        {/* INTERRUTTORE DOPPIA FUNZIONALITÀ */}
        <TouchableOpacity
          style={styles.switchContainer}
          onPress={() => setMostraEsami(!mostraEsami)}
          activeOpacity={0.9}
        >
          <Text style={[styles.switchText, !mostraEsami && styles.switchTextActive]}>
            Corsi
          </Text>
          <Text style={[styles.switchText, mostraEsami && styles.switchTextActive]}>
            Esami
          </Text>
          <View style={[
            styles.switchBall,
            mostraEsami ? styles.switchBallRight : styles.switchBallLeft
          ]} />
        </TouchableOpacity>
      </View>

      {/* ----------- RENDERING DELLE LISTE ----------- */}
      {!mostraEsami ? (
        /* ================= VISTA CORSI ================= */
        <View style={styles.listaContainer}>
          {mockCorsi.map((corso) => (
            <TouchableOpacity
              key={corso.id}
              style={styles.card}
              activeOpacity={0.7}
              // 3. COLLEGA IL CLICK: Passiamo il corso alla schermata di dettaglio
              onPress={() => navigation.navigate('CourseDetail', { courseData: corso })}
            >
              <View style={styles.cardHeader}>
                <Text style={styles.cardMainTitle}>{corso.nome}</Text>
                <View style={[styles.badge, { backgroundColor: getColoreStatoCorso(corso.stato) }]}>
                  <Text style={styles.badgeText}>{corso.stato.toUpperCase()}</Text>
                </View>
              </View>

              <Text style={styles.cardSubText}>Docente: {corso.docente}</Text>

              <View style={styles.cardFooter}>
                <View style={styles.infoTag}>
                  <Ionicons name="ribbon-outline" size={14} color="#64748B" />
                  <Text style={styles.infoTagText}>{corso.cfu} CFU</Text>
                </View>
                {corso.voto_ottenuto && (
                  <Text style={styles.votoTesto}>Voto: {corso.voto_ottenuto}</Text>
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>
      ) : (
        /* ================= VISTA ESAMI ================= */
        <View style={styles.listaContainer}>
          {mockEsami.map((esame) => {
            // Recuperiamo il nome del corso associato all'esame
            const corsoCollegato = mockCorsi.find(c => c.id === esame.corso_id);

            return (
              <TouchableOpacity
                key={esame.id}
                style={styles.card}
                activeOpacity={0.7}
                // (Opzionale): In futuro potresti voler fare una ExamDetailScreen separata.
                // Per ora inviamo i dati dell'esame alla CourseDetail per evitare che si blocchi
                onPress={() => navigation.navigate('CourseDetail', { courseData: esame, isExam: true })}
              >
                <View style={styles.cardHeader}>
                  <View style={{ flex: 1, paddingRight: 10 }}>
                    <Text style={styles.cardMainTitle} numberOfLines={1}>{esame.titolo}</Text>
                    <Text style={styles.corsoIncrociatoText}>{corsoCollegato ? corsoCollegato.nome : 'Insegnamento'}</Text>
                  </View>
                  <View style={[styles.badge, { backgroundColor: getColoreStatoEsame(esame.stato) }]}>
                    <Text style={styles.badgeText}>{esame.stato.toUpperCase()}</Text>
                  </View>
                </View>

                <View style={[styles.cardFooter, { marginTop: 15 }]}>
                  <View style={styles.infoTag}>
                    <Ionicons name="calendar-outline" size={14} color="#64748B" />
                    <Text style={styles.infoTagText}>{esame.data}</Text>
                  </View>
                  <View style={styles.infoTag}>
                    <Ionicons name="layers-outline" size={14} color="#64748B" />
                    <Text style={styles.infoTagText}>{esame.tipologia}</Text>
                  </View>
                </View>

                {esame.voto_risultato && (
                  <View style={styles.esitoGuscio}>
                    <Text style={styles.esitoTesto}>Superato con: {esame.voto_risultato}</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      {/* Spazio extra inferiore */}
      <View style={{ marginBottom: 100 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5', padding: 20 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#333' },
  switchContainer: { flexDirection: 'row', backgroundColor: '#E2E8F0', borderRadius: 20, width: 140, height: 36, alignItems: 'center', position: 'relative' },
  switchText: { flex: 1, textAlign: 'center', fontSize: 12, fontWeight: '700', color: '#64748B', zIndex: 2 },
  switchTextActive: { color: 'white' },
  switchBall: { position: 'absolute', height: 30, width: 66, borderRadius: 15, backgroundColor: '#475569', zIndex: 1, top: 3 },
  switchBallLeft: { left: 3 },
  switchBallRight: { right: 3 },
  listaContainer: { gap: 16 },
  card: { backgroundColor: 'white', borderRadius: 12, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 3 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
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
  esitoTesto: { fontSize: 13, fontWeight: '600', color: '#4CAF50' }
});