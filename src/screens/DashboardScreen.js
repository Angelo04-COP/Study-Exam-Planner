import React, {useState} from 'react';
import { ScrollView, StyleSheet, Text, View, TouchableOpacity, Animated } from 'react-native';
import { BarChart, PieChart, LineChart } from 'react-native-gifted-charts';

// ----------------- DATI FITTIZI (Mock Data) -----------------

import { mockAttivita, mockCorsi, mockEsami, mockTempiStudio } from '../constants/mockData';
import { parse } from 'react-native-svg';

export default function DashboardScreen() {

//STATO PER IL TOGLEL DELLA VISTA (es. tra Grafico a Barre e Lineare)
const [mostraVoti, setMostraVoti] = useState(false); // false = Grafico a Barre (ore di studio), true = Grafico Lineare (voti esami)

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

//3.2 Conversione in formato adatto per il grafico a torta
const pieData = [
  { value: esamiSuperati, color: '#177AD5',text:'Superati' },
  { value: esamiProgrammati, color: '#8EBBF3',text:'Programmati' },
  { value: esamiDaInziare, color: '#E2E2E2',text:'Da Iniziare' },
];


//[4] LOGICA PER IL GRAFICO A BARRE (ore di studio settimanali):
  
  // 4.1 Inizializziamo gli array per i 7 giorni (Lunedì = 0 ... Domenica = 6)
  const orePianificate = [0, 0, 0, 0, 0, 0, 0];
  const oreEffettive = [0, 0, 0, 0, 0, 0, 0];
  const etichetteGiorni = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

  // 4.2 Calcoliamo il TEMPO PIANIFICATO dalle Attività (convertendo i minuti in ore)
  mockAttivita.forEach(attivita => {
    if (attivita.data_ora_inizio && attivita.tempo_stimato_minuti) {
      const dataInizio = new Date(attivita.data_ora_inizio);
      
      // Trasformiamo l'indice del giorno (Domenica=0) nel nostro formato (Lunedì=0)
      const giornoIndice = (dataInizio.getDay() + 6) % 7; 
      
      // Aggiungiamo le ore stimate per quel giorno
      orePianificate[giornoIndice] += (attivita.tempo_stimato_minuti / 60);
    }
  });

  // 4.3 Calcoliamo il TEMPO EFFETTIVO dai log del Timer
  mockTempiStudio.forEach(logTimer => {
    if (logTimer.data && logTimer.ore_studiate) {
      const dataLog = new Date(logTimer.data);
      const giornoIndice = (dataLog.getDay() + 6) % 7;
      
      oreEffettive[giornoIndice] += logTimer.ore_studiate;
    }
  });

  // 4.4 Creiamo la struttura a "Barre Sovrapposte" per il grafico
  const stackData = etichetteGiorni.map((label, index) => {
    const effettive = oreEffettive[index];
    const pianificate = orePianificate[index];
    
    // Calcoliamo se c'è un "gap" tra quanto studiato e quanto programmato
    // Se abbiamo studiato di più del programmato, il rimanente è 0.
    const rimanente = effettive < pianificate ? (pianificate - effettive) : 0;

    return {
      label: label,
      stacks: [
        { value: effettive, color: '#177AD5' }, // Base blu scuro: tempo reale
        { value: rimanente, color: '#A7D7F9' }, // Cima azzurra: gap mancante all'obiettivo
      ],
    };
  });
  // Calcoliamo il tetto massimo dinamico dell'asse Y (il valore più alto tra pianificato ed effettivo + margine)
  const maxAssoluto = Math.max(...orePianificate, ...oreEffettive);
  const maxOreGrafico = maxAssoluto > 0 ? Math.ceil(maxAssoluto) + 1 : 8;

  //[5] LOGICA PER GRAFICO A LINEE (voti esami nel tempo):
  const esamiSuperatiOrdinati = [...mockEsami]
    .filter(esame => esame.stato === 'superato' && esame.voto_risultato)
    .sort((a, b) => new Date(a.data) - new Date(b.data)); // Ordina per data

    let sommaVoti = 0;
    let sommaPonderata = 0;
    let totalCfu = 0;

    const dataMediaPonderata = esamiSuperatiOrdinati.map((esame, index) => {
      const corso = mockCorsi.find(c => c.id === esame.corso_id);
      sommaPonderata += (esame.voto_risultato * (corso ? corso.cfu : 0));
      totalCfu += (corso ? corso.cfu : 0);
      return {
        value: parseFloat((sommaPonderata / totalCfu).toFixed(2)), 
        label: esame.data.split('-')[2] + '/' + esame.data.split('-')[1] 
      }; // Etichetta "MM/DD"
    });

    const dataMediaAritmetica = esamiSuperatiOrdinati.map((esame, index) => {
      sommaVoti += esame.voto_risultato;
      return {
        value: parseFloat((sommaVoti / (index + 1)).toFixed(2)),
        hideDataPoint: false // Mostra il punto dati per ogni esame superato
      };
    });

// ----------------- COMPONENTE SCHERMATA -----------------
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.headerTitle}>CRUSCOTTO</Text>

      {/* ----------- SEZIONE 1: ORE STUDIO ----------- */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>{mostraVoti ? 'ANDAMENTO VOTI' : 'STUDIO ORE SETTIMANALI'}</Text>

          {/* Pulsante per togglare la vista tra Grafico a Barre e Lineare */}
          <TouchableOpacity 
            style={styles.switchContainer} 
            onPress={() => setMostraVoti(!mostraVoti)}
            activeOpacity={0.9}
          >
            {/* Testo Opzione Sinistra */}
            <Text style={[styles.switchText, !mostraVoti && styles.switchTextActive]}>
              Tempo
            </Text>
            
            {/* Testo Opzione Destra */}
            <Text style={[styles.switchText, mostraVoti && styles.switchTextActive]}>
              Media
            </Text>
            
            {/* Il cursore grigio scuro che si sposta a destra o a sinistra */}
            <View style={[
              styles.switchBall, 
              mostraVoti ? styles.switchBallRight : styles.switchBallLeft
            ]} />
          </TouchableOpacity>
        </View>

        {/* RENDERING CONDIZIONALE DEL GRAFICO */}
        {!mostraVoti ? (
          <View>
            <View style={styles.chartLegend}>
              <View style={styles.legendItem}><View style={[styles.legendDot, { backgroundColor: '#177AD5' }]} /><Text style={styles.legendLabel}>Effettivo</Text></View>
              <View style={styles.legendItem}><View style={[styles.legendDot, { backgroundColor: '#A7D7F9' }]} /><Text style={styles.legendLabel}>Pianificato</Text></View>
            </View>
            <BarChart
              stackData={stackData}
              barWidth={22}
              initialSpacing={10}
              spacing={14}
              barBorderRadius={4}
              noOfSections={maxOreGrafico}
              maxValue={maxOreGrafico}
              stepValue={1}
              yAxisTextStyle={{ color: '#94a3b8', fontSize: 11 }}
              rulesColor="#EEEEEE"
              showVerticalLines={false}
              rulesType="solid"
              dashWidth={0}
              xAxisThickness={0}
              yAxisThickness={0}
            />
          </View>
        ) : (
          <View>
            <View style={styles.chartLegend}>
              <View style={styles.legendItem}><View style={[styles.legendDot, { backgroundColor: '#177AD5' }]} /><Text style={styles.legendLabel}>Ponderata</Text></View>
              <View style={styles.legendItem}><View style={[styles.legendDot, { backgroundColor: '#94a3b8', borderRadius: 0 }]} /><Text style={styles.legendLabel}>Aritmetica</Text></View>
            </View>
            <LineChart
              data={dataMediaPonderata}
              data2={dataMediaAritmetica}
              color1="#177AD5"
              color2="#94a3b8"
              thickness={3}
              dataPointsColor1="#177AD5"
              dashGapArray={[5, 5]}
              noOfSections={5}
              maxValue={30}
              minValue={18}
              yAxisTextStyle={{ color: '#94a3b8', fontSize: 11 }}
              rulesColor="#EEEEEE"
              xAxisThickness={0}
              yAxisThickness={0}
            />
          </View>
        )}
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

  // Stili per il toggle di selezione tra Grafico a Barre e Lineare
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  // Il binario esterno della pillola
  switchContainer: {
    flexDirection: 'row',
    backgroundColor: '#E2E8F0', // Grigio chiaro di sfondo
    borderRadius: 20,
    width: 140,
    height: 36,
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'relative',
    paddingHorizontal: 14,
  },
  // Stile base dei testi interni
  switchText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B', // Grigio intermedio quando non attivo
    zIndex: 2, // Importante: mantiene il testo SOPRA il cursore mobile
  },
  // Colore del testo quando il cursore ci si posiziona sopra
  switchTextActive: {
    color: 'white', 
  },
  // Il cursore mobile (pallino/capsula)
  switchBall: {
    position: 'absolute',
    height: 30,
    width: 66, // Larghezza calcolata per coprire perfettamente una singola opzione
    borderRadius: 15,
    backgroundColor: '#475569', // Grigio scuro ardesia coerente con la palette minimale
    zIndex: 1, // Sta sotto al testo ma sopra lo sfondo grigio chiaro
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 3,
  },
  switchBallLeft: {
    left: 3,
  },
  switchBallRight: {
    right: 3,
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
  
  // Stili per la card del grafico a barre (separazione titolo e legenda)
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  chartLegend: {
    flexDirection: 'row',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 15,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 5,
  },
  legendLabel: {
    fontSize: 10,
    color: '#666',
    fontWeight: '600',
  },
});