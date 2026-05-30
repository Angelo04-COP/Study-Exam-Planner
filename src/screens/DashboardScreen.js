import { useIsFocused } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { BarChart, LineChart, PieChart } from 'react-native-gifted-charts';

// Funzioni Storage
import { getAttivita, getCorsi, getEsami } from '../constants/storage';
//Dati fittizi per timer
import { mockTempiStudio } from '../constants/mockData';

export default function DashboardScreen() {
  const isFocused = useIsFocused(); 
  const [mostraVoti, setMostraVoti] = useState(false); 

  const [corsi, setCorsi] = useState([]);
  const [esami, setEsami] = useState([]);
  const [attivita, setAttivita] = useState([]);
  const [isLoading, setIsLoading] = useState(true); 

  useEffect(() => {
    const caricaDatiDispositivo = async () => {
      if (isFocused) {
        setIsLoading(true);
        try {
          const [datiCorsi, datiEsami, datiAttivita] = await Promise.all([
            getCorsi(), getEsami(), getAttivita()
          ]);
          setCorsi(datiCorsi || []);
          setEsami(datiEsami || []);
          setAttivita(datiAttivita || []);
        } catch (error) {
          console.error("Errore nel caricamento dei dati del cruscotto:", error);
        } finally {
          setIsLoading(false);
        }
      }
    };
    caricaDatiDispositivo();
  }, [isFocused]);

  //PARTE DELLA LOGICA DI CALCOLO (per dashboard)

  // [1] MEDIA PONDERATA 
  const corsiCompletati = corsi.filter(
    corso => corso.stato === 'completato' && corso.voto_ottenuto !== null && corso.voto_ottenuto !== undefined
  );

  const cfuGuadagnati = corsiCompletati.reduce((tot, corso) => tot + Number(corso.cfu || 0), 0);
  const cfuTotali = corsi.reduce((tot, corso) => tot + Number(corso.cfu || 0), 0);

  const sommaPonderata = corsiCompletati.reduce(
    (tot, corso) => tot + (Number(corso.voto_ottenuto) * Number(corso.cfu || 0)), 
    0
  );
  const mediaAttuale = cfuGuadagnati > 0 ? (sommaPonderata / cfuGuadagnati).toFixed(2) : "0.00";


  // [2] PROSSIME SCADENZE E RIEPILOGO ATTIVITÀ (Adattato per PlanningScreen)
  const prossimeScadenze = attivita.filter(a => {
    const isCompletata = a.completata !== undefined ? a.completata : a.isCompleted;
    return !isCompletata;
  }).length;

  const oggi = new Date().toISOString().split('T')[0]; 
  const attivitaProcessate = attivita
    .map(att => {
      const corsoIdReale = att.corso_id || att.course_id;
      const corso = corsi.find(c => c.id === corsoIdReale);
      const isCompletata = att.completata !== undefined ? att.completata : att.isCompleted;
      const scadenzaReale = att.data_ora_scadenza || att.date || att.endDate;
      const titoloReale = att.titolo || att.title || 'Attività senza titolo';

      let stato = 'da iniziare';
      let colore = '#8EBBF3';
      let prioritaOrdine = 2;
      
      if (isCompletata) {
        stato = 'completata';
        colore = '#4CAF50'; 
        prioritaOrdine = 3;
      } else if(scadenzaReale && scadenzaReale < oggi) {
        stato = 'scaduta';
        colore = '#FF5252';
        prioritaOrdine = 1;
      }

      return {
        ...att,
        titolo_normalizzato: titoloReale,
        scadenza_normalizzata: scadenzaReale || 'Nessuna data',
        nome_corso: corso ? corso.nome : 'Nessun corso',
        statoLabel: stato,
        statoColore: colore,
        prioritaOrdine: prioritaOrdine,
      };
    })
    .sort((a, b) => {
      if (a.prioritaOrdine !== b.prioritaOrdine) return a.prioritaOrdine - b.prioritaOrdine;
      if (!a.scadenza_normalizzata || a.scadenza_normalizzata === 'Nessuna data') return 1;
      if (!b.scadenza_normalizzata || b.scadenza_normalizzata === 'Nessuna data') return -1;
      return new Date(a.scadenza_normalizzata) - new Date(b.scadenza_normalizzata); 
    })
    .slice(0, 8); 


  // [3] PROGRESSO ESAMI (GRAFICO A TORTA)
  const esamiSuperati = esami.filter(e => e.stato === 'superato').length;
  const esamiProgrammati = esami.filter(e => e.stato === 'programmato').length;
  const esamiDaInziare = Math.max(0, corsi.length - (esamiSuperati + esamiProgrammati)); 

  const pieData = [
    { value: esamiSuperati, color: '#177AD5', text:'Superati' },
    { value: esamiProgrammati, color: '#8EBBF3', text:'Programmati' },
    { value: esamiDaInziare, color: '#E2E2E2', text:'Da Iniziare' },
  ];
  const pieDataSicuri = (esamiSuperati === 0 && esamiProgrammati === 0 && esamiDaInziare === 0) 
    ? [{ value: 1, color: '#E2E2E2' }] : pieData;


  // [4] GRAFICO A BARRE (Ore Pianificate vs Effettive)
  const orePianificate = [0, 0, 0, 0, 0, 0, 0];
  const oreEffettive = [0, 0, 0, 0, 0, 0, 0];
  const etichetteGiorni = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

  attivita.forEach(att => {
    const dataInizioCorretta = att.data_ora_inizio || att.date || att.startDate;
    const tempoStimatoCorretto = att.tempo_stimato_minuti !== undefined ? att.tempo_stimato_minuti : att.estimatedTime;

    if (dataInizioCorretta && tempoStimatoCorretto) {
      const dataInizio = new Date(dataInizioCorretta);
      const giornoIndice = (dataInizio.getDay() + 6) % 7; // Trasla domenica a fine array
      orePianificate[giornoIndice] += (tempoStimatoCorretto / 60); // Converte da minuti a ore nel grafico
    }
  });

  mockTempiStudio.forEach(logTimer => {
    if (logTimer.data && logTimer.ore_studiate) {
      const dataLog = new Date(logTimer.data);
      const giornoIndice = (dataLog.getDay() + 6) % 7;
      oreEffettive[giornoIndice] += logTimer.ore_studiate;
    }
  });

  const stackData = etichetteGiorni.map((label, index) => {
    const effettive = oreEffettive[index];
    const pianificate = orePianificate[index];
    const rimanente = effettive < pianificate ? (pianificate - effettive) : 0;
    return {
      label: label,
      stacks: [
        { value: effettive, color: '#177AD5' }, 
        { value: rimanente, color: '#A7D7F9' }, 
      ],
    };
  });
  
  const maxAssoluto = Math.max(...orePianificate, ...oreEffettive);
  const maxOreGrafico = maxAssoluto > 0 ? Math.ceil(maxAssoluto) + 1 : 8;


  // [5] GRAFICO A LINEE (Andamento Voti)
  const esamiSuperatiOrdinati = [...esami]
    .filter(esame => esame.stato === 'superato' && esame.voto_risultato)
    .sort((a, b) => new Date(a.data) - new Date(b.data)); 

  let sommaVoti = 0;
  let sommaPonderataGrafico = 0; 
  let totalCfu = 0;

  const dataMediaPonderataRaw = esamiSuperatiOrdinati.map((esame) => {
    const corso = corsi.find(c => c.id === esame.corso_id);
    sommaPonderataGrafico += (esame.voto_risultato * (corso ? corso.cfu : 0));
    totalCfu += (corso ? corso.cfu : 0);
    return {
      value: totalCfu > 0 ? parseFloat((sommaPonderataGrafico / totalCfu).toFixed(2)) : 0, 
      label: esame.data ? esame.data.split('-')[2] + '/' + esame.data.split('-')[1] : '' 
    }; 
  });

  const dataMediaAritmeticaRaw = esamiSuperatiOrdinati.map((esame, index) => {
    sommaVoti += esame.voto_risultato;
    return {
      value: parseFloat((sommaVoti / (index + 1)).toFixed(2)),
      hideDataPoint: false 
    };
  });

  const dataMediaPonderata = dataMediaPonderataRaw.length > 0 ? dataMediaPonderataRaw : [{ value: 0, label: '-' }];
  const dataMediaAritmetica = dataMediaAritmeticaRaw.length > 0 ? dataMediaAritmeticaRaw : [{ value: 0, label: '-' }];


  // [6] TIMELINE CORSI
  const oggiCorrente = new Date(); 

  const progressGiorniCorsi = corsi
    .filter(corso => corso.data_inizio && corso.data_fine && corso.stato === 'in corso') 
    .map(corso => {
      const inizio = new Date(corso.data_inizio);
      const fine = new Date(corso.data_fine);
      
      const millisecondiInGiorno = 1000 * 60 * 60 * 24;
      const giorniTotali = Math.max(1, Math.round((fine - inizio) / millisecondiInGiorno));
      const giorniPassati = Math.round((oggiCorrente - inizio) / millisecondiInGiorno);
      
      const giorniEffettivi = Math.max(0, Math.min(giorniPassati, giorniTotali));
      const percentuale = (giorniEffettivi / giorniTotali) * 100;

      return {
        id: corso.id,
        nome: corso.nome,
        giorniPassati: giorniEffettivi,
        giorniTotali: giorniTotali,
        percentuale: percentuale
      };
    })
    .sort((a, b) => b.percentuale - a.percentuale); 


  //GRAFICO NON IN USO (RIDONDANTE)
  /*
  const attivitaApertePerCorso = {};
  attivita.forEach(att => {
    const isCompletata = att.completata !== undefined ? att.completata : att.isCompleted;
    if (!isCompletata) {
      const corsoId = att.corso_id || att.course_id;
      if(corsoId) {
          attivitaApertePerCorso[corsoId] = (attivitaApertePerCorso[corsoId] || 0) + 1;
      }
    }
  });*/

  //CARICAMENTO SCHERMATA
  if (isLoading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#177AD5" />
        <Text style={{ marginTop: 10, color: '#64748B', fontWeight: '500' }}>
          Aggiornamento cruscotto...
        </Text>
      </View>
    );
  }

  //RENDERING GRAFICO
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.headerTitle}>CRUSCOTTO</Text>

      {/* SEZIONE 1: ORE STUDIO E GRAFICI */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>{mostraVoti ? 'ANDAMENTO VOTI' : 'STUDIO ORE SETTIMANALI'}</Text>

          <TouchableOpacity 
            style={styles.switchContainer} 
            onPress={() => setMostraVoti(!mostraVoti)}
            activeOpacity={0.9}
          >
            <Text style={[styles.switchText, !mostraVoti && styles.switchTextActive]}>
              Tempo
            </Text>
            <Text style={[styles.switchText, mostraVoti && styles.switchTextActive]}>
              Media
            </Text>
            <View style={[
              styles.switchBall, 
              mostraVoti ? styles.switchBallRight : styles.switchBallLeft
            ]} />
          </TouchableOpacity>
        </View>

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

      {/* SEZIONE 2: METRICHE */}
      <View style={styles.row}>
        <View style={[styles.card, styles.halfCard]}>
          <Text style={styles.cardTitle}>PROGRESSO ESAMI</Text>
          <View style={styles.pieContent}>
            <View style={styles.pieChartContainer}>
                <PieChart
                  donut
                  innerRadius={30}
                  radius={50}
                  data={pieDataSicuri}
                  overflow="hidden"
                />
            </View>
            <View style={styles.legendContainer}>
              <View style={styles.legendItem}>
                <Text style={styles.dotSuperati}>●</Text>
                <Text style={styles.legendText}>Superati ({esamiSuperati})</Text>
              </View>
              <View style={styles.legendItem}>
                <Text style={styles.dotDaSostenere}>●</Text>
                <Text style={styles.legendText}>Programmati ({esamiProgrammati})</Text>
              </View>
              <View style={styles.legendItem}>
                <Text style={styles.dotDaIniziare}>●</Text>
                <Text style={styles.legendText}>Da Iniziare ({esamiDaInziare})</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={[styles.card, styles.halfCard]}>
          <Text style={styles.cardTitle}>CFU GUADAGNATI:</Text>
          <Text style={styles.statValue}>{cfuGuadagnati} / {cfuTotali}</Text>
          <View style={styles.divider} />
          <Text style={styles.cardTitle}>MEDIA PONDERATA:</Text>
          <Text style={styles.statValue}>{mediaAttuale}</Text>
          <View style={styles.divider} />
          <Text style={styles.cardTitle}>ATTIVITÀ DA FARE:</Text>
          <Text style={styles.statValue}>{prossimeScadenze}</Text>
        </View>
      </View>

      {/* SEZIONE 3: TIMELINE CORSI */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>TIMELINE CORSI ATTIVI</Text>
        <View style={{ marginTop: 10 }}>
          {progressGiorniCorsi.length > 0 ? (
            progressGiorniCorsi.map((item) => (
              <View key={item.id} style={{ marginBottom: 16 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                  <Text style={{ fontSize: 13, color: '#334155', fontWeight: '600' }} numberOfLines={1}>
                    {item.nome}
                  </Text>
                  <Text style={{ fontSize: 12, color: '#64748b', fontWeight: '500' }}>
                    {item.giorniPassati} / {item.giorniTotali} gg
                  </Text>
                </View>
                <View style={{ height: 8, backgroundColor: '#F1F5F9', borderRadius: 4, overflow: 'hidden' }}>
                  <View 
                    style={{ 
                      height: '100%', 
                      width: `${item.percentuale}%`, 
                      backgroundColor: item.percentuale > 90 ? '#FF5252' : '#177AD5', 
                      borderRadius: 4 
                    }} 
                  />
                </View>
              </View>
            ))
          ) : (
            <Text style={{ color: '#94a3b8', fontSize: 13, textAlign: 'center', marginVertical: 10 }}>
              Nessun corso attivo al momento.
            </Text>
          )}
        </View>
      </View>

      {/* SEZIONE 4: CRONOLOGIA E PROSSIME ATTIVITÀ */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>RIEPILOGO ATTIVITÀ</Text>
        {attivitaProcessate.map((attivita) => (
          <View key={attivita.id} style={styles.attivitaItem}>
            <View style={[styles.dotAttivita, { backgroundColor: attivita.statoColore }]} />
            <View style={styles.attivitaTextContainer}>
              <Text style={[
                styles.attivitaTitolo,
                attivita.statoLabel === 'completata' && { textDecorationLine: 'line-through', color: '#94a3b8' }
              ]}>
                {attivita.titolo_normalizzato}
              </Text>
              <Text style={[
                styles.attivitaCorso,
                attivita.statoLabel === 'scaduta' && { color: '#FF5252', fontWeight: 'bold' }
              ]}>
                {attivita.nome_corso} • 
                {attivita.statoLabel === 'scaduta' ? ' SCADUTA: ' : ' Scadenza: '} 
                {attivita.scadenza_normalizzata}
              </Text>
            </View>
            <Text style={styles.arrowIcon}>›</Text>
          </View>
        ))}

        {attivitaProcessate.length === 0 && (
          <Text style={{ textAlign: 'center', color: '#94a3b8', marginTop: 10 }}>
            Nessuna attività in scadenza. Ottimo lavoro!
          </Text>
        )}
      </View>

      <View style={{ marginBottom: 50 }} />
    </ScrollView>
  );
}

//STILI:
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5', padding: 20 },
  headerTitle: { fontSize: 28, fontWeight: 'bold', color: '#333', marginBottom: 20, marginTop: 40 },
  card: { backgroundColor: 'white', borderRadius: 12, padding: 16, marginBottom: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  cardTitle: { fontSize: 14, fontWeight: 'bold', color: '#333', marginBottom: 15 },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  halfCard: { width: '48%' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  switchContainer: { flexDirection: 'row', backgroundColor: '#E2E8F0', borderRadius: 20, width: 140, height: 36, alignItems: 'center', justifyContent: 'space-between', position: 'relative', paddingHorizontal: 14 },
  switchText: { fontSize: 12, fontWeight: '700', color: '#64748B', zIndex: 2 },
  switchTextActive: { color: 'white' },
  switchBall: { position: 'absolute', height: 30, width: 66, borderRadius: 15, backgroundColor: '#475569', zIndex: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 2, elevation: 3 },
  switchBallLeft: { left: 3 },
  switchBallRight: { right: 3 },
  pieContent: { alignItems: 'center', marginTop: 10 },
  pieChartContainer: { width: 100, height: 100, justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
  legendContainer: { marginTop: 20, marginHorizontal: 10, alignItems: 'flex-start' },
  legendItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, marginLeft: 5 },
  legendText: { fontSize: 11, color: '#666', fontWeight: '500', marginLeft: 8 },
  dotSuperati: { color: '#177AD5', fontSize: 16 },
  dotDaSostenere: { color: '#8EBBF3', fontSize: 16 },
  dotDaIniziare: { color: '#E2E2E2', fontSize: 16 },
  statValue: { fontSize: 20, fontWeight: 'bold', color: '#177AD5', marginBottom: 5 },
  divider: { height: 1, backgroundColor: '#EEEEEE', marginVertical: 5 },
  attivitaItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#EEEEEE' },
  dotAttivita: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#8EBBF3', marginRight: 15 },
  attivitaTextContainer: { flex: 1 },
  attivitaTitolo: { fontSize: 14, fontWeight: '600', color: '#333' },
  attivitaCorso: { fontSize: 12, color: '#666', marginTop: 2 },
  arrowIcon: { fontSize: 22, color: '#CCC', fontWeight: 'bold' },
  chartLegend: { flexDirection: 'row' },
  legendDot: { width: 8, height: 8, borderRadius: 4, marginRight: 5 },
  legendLabel: { fontSize: 10, color: '#666', fontWeight: '600' },
});