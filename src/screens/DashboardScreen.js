import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { BarChart, PieChart } from 'react-native-gifted-charts';

// ----------------- DATI FITTIZI (Mock Data) -----------------
// 1. Ore di studio settimanali (Grafico a Barre)
const barData = [
  { value: 11, label: 'Mo', frontColor: '#177AD5' },
  { value: 7, label: 'Tu', frontColor: '#177AD5' },
  { value: 14, label: 'We', frontColor: '#177AD5' },
  { value: 11, label: 'Th', frontColor: '#177AD5' },
  { value: 9, label: 'Fr', frontColor: '#177AD5' },
  { value: 13, label: 'Sa', frontColor: '#177AD5' },
  { value: 4, label: 'Su', frontColor: '#8EBBF3' },
];

// 2. Progresso Esami (Grafico a Torta)
const pieData = [
  { value: 50, color: '#177AD5' }, // Superati
  { value: 30, color: '#8EBBF3' }, // Da Sostenere
  { value: 20, color: '#E2E2E2' }, // Da Iniziare
];

// 3. Recenti Attività (Lista in basso)
const mockAttivita = [
  { id: '1', titolo: 'Ripasso Algoritmi', corso: 'Algoritmi II', completata: false },
  { id: '2', titolo: 'Esercizi Java', corso: 'Programmazione I', completata: false },
  { id: '3', titolo: 'Preparazione Esame', corso: 'Sistemi Operativi', completata: false },
];

// ----------------- COMPONENTE SCHERMATA -----------------
export default function DashboardScreen() {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.headerTitle}>CRUSCOTTO</Text>

      {/* ----------- SEZIONE 1: ORE STUDIO ----------- */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>STUDIO ORE SETTIMANALI</Text>
        <BarChart
          data={barData}
          barWidth={22}
          initialSpacing={10}
          spacing={14}
          barBorderRadius={4}
          hideRules
          xAxisThickness={0}
          yAxisThickness={0}
          yAxisTextStyle={{ color: '#666', fontSize: 11 }}
          noOfSections={4}
          maxValue={16}
        />
      </View>

      {/* ----------- SEZIONE 2: RIGA CENTRALE ----------- */}
      <View style={styles.row}>
        
        {/* Card Sinistra: Grafico Esami */}
        <View style={[styles.card, styles.halfCard]}>
          <Text style={styles.cardTitle}>PROGRESSO ESAMI</Text>
          
          <View style={styles.pieContent}>
            {/* Il Grafico PieChart */}
            <View style={styles.pieChartContainer}>
                <PieChart
                  donut
                  innerRadius={30}
                  radius={50}
                  data={pieData}
                  overflow="hidden"
                />
            </View>
            
            {/* LEGENDA (Ora sotto il grafico) */}
            <View style={styles.legendContainer}>
              <View style={styles.legendItem}>
                <Text style={styles.dotSuperati}>●</Text>
                <Text style={styles.legendText}>Superati</Text>
              </View>
              <View style={styles.legendItem}>
                <Text style={styles.dotDaSostenere}>●</Text>
                <Text style={styles.legendText}>Da Sostenere</Text>
              </View>
              <View style={styles.legendItem}>
                <Text style={styles.dotDaIniziare}>●</Text>
                <Text style={styles.legendText}>Da Iniziare</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Card Destra: Statistiche Testuali */}
        <View style={[styles.card, styles.halfCard]}>
          <Text style={styles.cardTitle}>CFU GUADAGNATI:</Text>
          <Text style={styles.statValue}>48 / 180</Text>
          
          <View style={styles.divider} />
          
          <Text style={styles.cardTitle}>MEDIA ATTUALE:</Text>
          <Text style={styles.statValue}>28.5</Text>
          
          <View style={styles.divider} />
          
          <Text style={styles.cardTitle}>PROSSIME SCADENZE:</Text>
          <Text style={styles.statValue}>3</Text>
        </View>

      </View>

      {/* ----------- SEZIONE 3: RECENTI ATTIVITÀ ----------- */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>RECENTI ATTIVITÀ</Text>
        
        {/* Usiamo un loop sulle mockAttivita per creare gli item */}
        {mockAttivita.map((attivita) => (
          <View key={attivita.id} style={styles.attivitaItem}>
            {/* L'indicatore visuale a punto */}
            <View style={styles.dotAttivita} />
            <View style={styles.attivitaTextContainer}>
              <Text style={styles.attivitaTitolo}>{attivita.titolo}</Text>
              <Text style={styles.attivitaCorso}>Corso: {attivita.corso}</Text>
            </View>
            {/* L'icona a freccia per accedere ai dettagli */}
            <Text style={styles.arrowIcon}>›</Text>
          </View>
        ))}
      </View>

      {/* Margine inferiore extra per ScrollView */}
      <View style={{ marginBottom: 50 }} />

    </ScrollView>
  );
}

// ----------------- STILI (Styles) -----------------
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    padding: 20,
  },
  
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    marginTop: 40,
  },

  // Stili generici delle card
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },

  cardTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },

  // Stili per la riga centrale a due colonne
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  halfCard: {
    width: '48%',
  },

  // -- Stili CORRETTI per PieChart e Legenda --
  pieContent: {
    // Rimosso flexDirection: 'row' per farli impilare verticalmente
    alignItems: 'center', // Centra orizzontalmente sia il grafico che la legenda
    marginTop: 10,
  },

  pieChartContainer: {
    width: 100, 
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },

  legendContainer: {
    marginTop: 20, // Aggiunge spazio tra il grafico e la legenda
    alignItems: 'flex-start', // Allinea i testi della legenda a sinistra tra di loro
  },

  legendItem: {
    flexDirection: 'row', 
    alignItems: 'center',
    marginBottom: 6, // Leggermente ridotto per non allungare troppo la card
  },

  legendText: {
    fontSize: 11,
    color: '#666',
    fontWeight: '500',
    marginLeft: 6,
  },

  // Stili per i punti della legenda
  dotSuperati: {
    color: '#177AD5',
    fontSize: 16,
  },

  dotDaSostenere: {
    color: '#8EBBF3',
    fontSize: 16,
  },

  dotDaIniziare: {
    color: '#E2E2E2',
    fontSize: 16,
  },

  // Stili per la card di destra
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#177AD5',
    marginBottom: 5,
  },

  divider: {
    height: 1,
    backgroundColor: '#EEEEEE',
    marginVertical: 5,
  },

  // Stili per la lista Recenti Attività
  attivitaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },

  dotAttivita: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#8EBBF3',
    marginRight: 15,
  },

  attivitaTextContainer: {
    flex: 1,
  },

  attivitaTitolo: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },

  attivitaCorso: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },

  arrowIcon: {
    fontSize: 22,
    color: '#CCC',
    fontWeight: 'bold',
  },
});