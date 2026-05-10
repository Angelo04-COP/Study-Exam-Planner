// src/constants/mockData.js
//Questo file contiene liste di dati fittizzi esportabili per testare le schermate
//successivamente saranno sostituiti con i dati salvati sul dispositivo.

// 1. LISTA DEI CORSI
export const mockCorsi = [
  {
    id: 'c1', // L'ID univoco (utile per collegare esami e attività al corso)
    nome: 'Machine Learning',
    docente: 'Prof. Rossi',
    semestre: 'Secondo Semestre', //valutare se aggiungere un campo per l'anno accademico
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
    stato: 'programmato', // Esempi: 'programmato', 'superato', 'annullato'
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

// 3. LISTA DELLE ATTIVITÀ E DEGLI OBIETTIVI DI STUDIO
export const mockAttivita = [
  {
    id: 'a1',
    corso_id: 'c1',
    titolo: 'Test classificazione',
    descrizione: 'Completare l\'esercizio sul dataset Breast Cancer.',
    data_scadenza: '2026-05-15',
    priorita: 'Alta',
    completata: false,
    tempo_stimato_minuti: 120,
    tempo_impiegato_minuti: 45,
    note: 'Rivedere la teoria dal pdf prima di iniziare.',
  },
  {
    id: 'a2',
    corso_id: 'c2', // Collegato al corso Java
    titolo: 'Revisione codice di gruppo',
    descrizione: 'Sistemare il branch GitHub e controllare il file PartitaDao.',
    data_scadenza: '2026-05-08',
    priorita: 'Media',
    completata: true,
    tempo_stimato_minuti: 60,
    tempo_impiegato_minuti: 60,
    note: 'Ignorare la classe di test per il momento.',
  }
];