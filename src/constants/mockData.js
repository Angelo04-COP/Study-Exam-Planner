// src/constants/mockData.js
//Questo file contiene liste di dati fittizzi esportabili per testare le schermate
//successivamente saranno sostituiti con i dati salvati sul dispositivo.

// 1. LISTA DEI CORSI
export const mockCorsi = [

  {
    id: 'c1', // L'ID univoco (utile per collegare esami e attività al corso)
    nome: 'ML',
    docente: 'Prof. Rossi',
    semestre: 'Secondo Semestre', //valutare se aggiungere un campo per l'anno accademico
    anno_accademico: '2025/2026', 
    cfu: 9,
    descrizione: 'Analisi di dataset e modelli di classificazione in Python.',
    stato: 'in corso', // Valori possibili: 'da iniziare', 'in corso', 'completato'
    voto_desiderato: 28,
    voto_ottenuto: null,
  },
  {
    id: 'c2',
    nome: 'Programmazione a Oggetti',
    docente: 'Prof. Verdi',
    semestre: 'Primo Semestre',
    cfu: 12,
    descrizione: 'Sviluppo software e implementazione pattern DAO in Java.',
    stato: 'completato',
    voto_desiderato: 26,
    voto_ottenuto: 28,
  },
  {
    id: 'c3',
    nome: 'Progettazione Interfacce',
    docente: 'Prof. Bianchi',
    semestre: 'Secondo Semestre',
    cfu: 6,
    descrizione: 'UI/UX design e sviluppo frontend.',
    stato: 'da iniziare',
    voto_desiderato: 30,
    voto_ottenuto: null,
  }
];

// 2. LISTA DEGLI ESAMI E DELLE SCADENZE
export const mockEsami = [
  {
    id: 'e1',
    corso_id: 'c1', // Questo ID collega l'esame al corso "Machine Learning"
    titolo: 'Progetto Pratico Python',
    data: '2026-06-15',
    tipologia: 'Progetto', // Esempi: 'Scritto', 'Orale', 'Progetto'
    priorita: 'Alta',
    stato: 'programmato', // Esempi: 'programmato', 'superato', 'non superato'
    note: 'Inviare il codice sorgente su GitHub prima dell\'esame.',
    voto_risultato: null,
  },
  {
    id: 'e2',
    corso_id: 'c2',
    titolo: 'Esame Orale Java',
    data: '2026-02-10',
    tipologia: 'Orale',
    priorita: 'Media',
    stato: 'superato',
    note: 'Portare il PC con NetBeans configurato.',
    voto_risultato: 28,
  }
];

// 3.1 LISTA DELLE SESSIONI DI STUDIO (I "Contenitori di tempo")
export const mockSessioni = [
  {
    id: 's1',
    titolo: 'Mattinata in Biblioteca',
    data: '2026-05-12', // Associata a un giorno specifico come chiede la traccia
    data_ora_inizio: '2026-05-12T09:00:00', // Data e ora di inizio in formato ISO
    data_ora_fine: '2026-05-12T13:00:00', // Data e ora di fine in formato ISO
    note: 'Studiare con il gruppo di progetto'
  },
  {
    id: 's2',
    titolo: 'Ripasso Serale pre-esame',
    data: '2026-05-14',
    data_ora_inizio: '2026-05-14T21:00:00',
    data_ora_fine: '2026-05-14T23:30:00',
    note: 'Focus totale, telefono spento'
  }
];

// 3.2 LISTA DELLE ATTIVITÀ E DEGLI OBIETTIVI DI STUDIO
export const mockAttivita = [
  {
    id: 'a1',
    corso_id: 'c1',
    sessione_id: 's1',      // Collegato alla sessione "Mattinata in Biblioteca"
    titolo: 'Test classificazione',
    descrizione: 'Completare l\'esercizio sul dataset Breast Cancer.',
    data_ora_inizio: '2026-05-12T10:00:00', // Inizio con data e ora in formato ISO
    data_ora_scadenza: '2026-05-15T00:00:00', // Scadenza con data e ora in formato ISO
    priorita: 'Alta',
    completata: false,
    tempo_stimato_minuti: 120,
    tempo_impiegato_minuti: 45,
    note: 'Rivedere la teoria dal pdf prima di iniziare.',
  },
  {
    id: 'a2',
    corso_id: 'c2', // Collegato al corso Java
    sessione_id: null,      // Questa attività non è associata a una sessione specifica (possibilità)
    titolo: 'Revisione codice di gruppo',
    descrizione: 'Sistemare il branch GitHub e controllare il file PartitaDao.',
    data_ora_inizio: '2026-05-08T14:00:00', // Inizio con data e ora in formato ISO
    data_ora_scadenza: '2026-05-08T00:00:00', // Scadenza con data e ora in formato ISO
    priorita: 'Media',
    completata: true,
    tempo_stimato_minuti: 60,
    tempo_impiegato_minuti: 60,
    note: 'Ignorare la classe di test per il momento.',
  },

  {
    id: 'a3',
    corso_id: 'c1',
    sessione_id: 's1', //  Un'altra attività per la stessa sessione in biblioteca
    titolo: 'Lettura Capitolo 4',
    descrizione: 'Leggere le pagine da 150 a 180',
    data_ora_inizio: '2026-05-12T00:00:00',
    data_ora_scadenza: '2026-05-12T00:00:00',
    priorita: 'Bassa',
    completata: false,
    tempo_stimato_minuti: 60,
    tempo_impiegato_minuti: 0,
    note: '',
  }
];

// 4. LISTA DEI RISULTATI DI STUDIO 
export const mockTempiStudio = [
  // Formato: data (YYYY-MM-DD), ore_studiate
  { id: '1', data: '2026-05-11', ore_studiate: 3 }, // Lunedì
  { id: '2', data: '2026-05-12', ore_studiate: 2.5 }, // Martedì
  { id: '3', data: '2026-05-12', ore_studiate: 1.5 }, // Martedì (seconda sessione)
  { id: '4', data: '2026-05-13', ore_studiate: 4 }, // Mercoledì
  { id: '5', data: '2026-05-14', ore_studiate: 2 }, // Giovedì
  { id: '6', data: '2026-05-17', ore_studiate: 1 }, // Domenica
];