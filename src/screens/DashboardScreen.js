import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { BarChart, PieChart } from 'react-native-gifted-charts';

// ----------------- DATI FITTIZI (Mock Data) -----------------

import { mockAttivita, mockCorsi, mockEsami } from '../constants/mockData';

export default function DashboardScreen() {

//--------Calcoli Dinamici dei Dati per i Grafici---------
//[1] MEDIA  PONDERATA:
//1.1 Calcolo CFU Guadagnati
const corsiCompletati = mockCorsi.filter(corso => corso.stato === 'completato');
const cfuGuadagnati = corsiCompletati.reduce((tot, corso) => tot + corso.cfu, 0);

//1.2 Calcolo CFU totali del piano di studi
const cfuTotali = mockCorsi.reduce((tot, corso) => tot + corso.cfu, 0);

//1.3 Calcolo Media Ponderata
const sommaPonerata = corsiCompletati.reduce((tot, corso) => tot + (corso.voto_ottenuto * corso.cfu), 0);
const mediaAttuale = cfuGuadagnati > 0 ? (sommaPonerata / cfuGuadagnati).toFixed(2) : 0.00;

//[2] PROSSIME SCADENZE:
//2.1 Calcolo prossime Scadenze (numero diattività non completate)
const prossimeScadenze = mockAttivita.filter(attivita => !attivita.completata).length;

//2.2 Logica per prendere le  attività più vicine alla data odierna (ordinando per data)
const oggi = new Date().toISOString().split('T')[0]; // Otteniamo la data odierna in formato 'YYYY-MM-DD'
const attivitaProcessate = mockAttivita
  .map(attivita => {
    const corso = mockCorsi.find(c => c.id === attivita.corso_id);

    //Selezione stato e colore
    let stato = 'da iniziare';
    let colore = '#8EBBF3';
    let prioritaOrdine = 2;
    
    if (attivita.completata) {
      stato = 'completata';
      colore = '#4CAF50'; // Verde
      prioritaOrdine = 3;
    } else if(attivita.data_ora_scadenza < oggi) {
      stato = 'scaduta';
      colore = '#FF5252';
      prioritaOrdine = 1;
    }

    return{
      ...attivita,
      nome_corso: corso ? corso.nome : 'Corso Sconosciuto',
      statoLabel: stato,
      statoColore: colore,
      prioritaOrdine: prioritaOrdine,
    };
  })
  .sort((a, b) => {
    // Ordina prima per priorità (scadute, da iniziare, completate) e poi per data
    if (a.prioritaOrdine !== b.prioritaOrdine) {
      return a.prioritaOrdine - b.prioritaOrdine; // Ordina per priorità
    }
    return new Date(a.data_ora_scadenza) - new Date(b.data_ora_scadenza); // Se stessa priorità, ordina per data
  })
  .slice(0, 8); // Prendi solo le prime 8 attività più vicine
  

//[3] PROGRESSO ESAMI:
//3.1 Calcolo percentuale esami superati (grafico a torta)
const esamiSuperati = mockEsami.filter(esame => esame.stato === 'superato').length;
const esamiProgrammati = mockEsami.filter(esame => esame.stato === 'programmato').length;
const esamiDaInziare = mockCorsi.length - (esamiSuperati + esamiProgrammati); // Consideriamo "da iniziare" come quelli dei corsi che non hanno ancora un esame in programma
// ==========================================
  // 📊 DATI PER I GRAFICI (Ancora statici per ora)
  // ==========================================
  const barData = [
    { value: 11, label: 'Mo', frontColor: '#177AD5' },
    { value: 7, label: 'Tu', frontColor: '#177AD5' },
    { value: 14, label: 'We', frontColor: '#177AD5' },
    { value: 11, label: 'Th', frontColor: '#177AD5' },
    { value: 9, label: 'Fr', frontColor: '#177AD5' },
    { value: 13, label: 'Sa', frontColor: '#177AD5' },
    { value: 4, label: 'Su', frontColor: '#8EBBF3' },
  ];

  //dinamico
  const pieData = [
    { value: esamiSuperati, color: '#177AD5',text:'Superati' },
    { value: esamiProgrammati, color: '#8EBBF3',text:'Programmati' },
    { value: esamiDaInziare, color: '#E2E2E2',text:'Da Iniziare' },
  ];

// ----------------- COMPONENTE SCHERMATA -----------------
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
            
            {/* LEGENDA (sotto il grafico) */}
            <View style={styles.legendContainer}>
              <View style={styles.legendItem}>
                <Text style={styles.dotSuperati}>●</Text>
                <Text style={styles.legendText}>Superati ({esamiSuperati})</Text>
              </View>
              <View style={styles.legendItem}>
                <Text style={styles.dotDaSostenere}>●</Text>
                <Text style={styles.legendText}>Da Sostenere ({esamiProgrammati})</Text>
              </View>
              <View style={styles.legendItem}>
                <Text style={styles.dotDaIniziare}>●</Text>
                <Text style={styles.legendText}>Da Iniziare ({esamiDaInziare})</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Card Destra: Statistiche Testuali */}
        <View style={[styles.card, styles.halfCard]}>
          <Text style={styles.cardTitle}>CFU GUADAGNATI:</Text>
          <Text style={styles.statValue}>{cfuGuadagnati} / {cfuTotali}</Text>
          
          <View style={styles.divider} />
          
          <Text style={styles.cardTitle}>MEDIA PONDERATA:</Text>
          <Text style={styles.statValue}>{mediaAttuale}</Text>
          
          <View style={styles.divider} />
          
          <Text style={styles.cardTitle}>ATTIVITA DA FARE:</Text>
          <Text style={styles.statValue}>{prossimeScadenze}</Text>
        </View>

      </View>

      {/* ----------- SEZIONE 3: RECENTI ATTIVITÀ ----------- */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>RIEPILOGO ATTIVITÀ</Text>
        
        {/* Usiamo un loop sulle mockAttivita per creare gli item */}
        {attivitaProcessate.map((attivita) => (
          <View key={attivita.id} style={styles.attivitaItem}>
            {/* L'indicatore visuale a punto */}
            <View style={[styles.dotAttivita, { backgroundColor: attivita.statoColore }]} />

            <View style={styles.attivitaTextContainer}>
              <Text style={[
                styles.attivitaTitolo,
                attivita.statoLabel === 'completata' && { textDecorationLine: 'line-through', color: '#94a3b8' }
              ]}>
                {attivita.titolo}
              </Text>

              <Text style={[
                styles.attivitaCorso,
                attivita.statoLabel === 'scaduta' && { color: '#FF5252', fontWeight: 'bold' }
              ]}>
                {attivita.nome_corso} • 
                {attivita.statoLabel === 'scaduta' ? ' SCADUTA: ' : ' Scadenza: '} 
                {attivita.data_ora_scadenza}
              </Text>
            </View>
            {/* L'icona a freccia per accedere ai dettagli */}
            <Text style={styles.arrowIcon}>›</Text>
          </View>
        ))}

        {/* Messaggio se non ci sono attività */}
        {attivitaProcessate.length === 0 && (
          <Text style={{ textAlign: 'center', color: '#94a3b8', marginTop: 10 }}>
            Nessuna attività in scadenza. Ottimo lavoro!
          </Text>
        )}
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