// src/constants/mockData.js
//Questo file contiene liste di dati fittizzi esportabili per testare le schermate
//successivamente saranno sostituiti con i dati salvati sul dispositivo.


// 1. LISTA DEI CORSI
export const mockCorsi = [
  {
    id: 'c1',
    nome: 'Basi di Dati',
    docente: 'Prof. Rossi',
    semestre: 'Primo Semestre',
    anno_accademico: '2025/2026', 
    cfu: 9,
    descrizione: 'Progettazione relazionale e query SQL avanzate.',
    stato: 'completato',
    voto_desiderato: 28,
    voto_ottenuto: 30,
    data_inizio: '2025-10-01',
    data_fine: '2026-01-15',
  },
  {
    id: 'c2',
    nome: 'Computer Vision',
    docente: 'Prof. Verdi',
    semestre: 'Secondo Semestre',
    anno_accademico: '2025/2026', 
    cfu: 9,
    descrizione: 'Riconoscimento volti e object detection in Python.',
    stato: 'in corso',
    voto_desiderato: 28,
    voto_ottenuto: null,
    data_inizio: '2026-03-01',
    data_fine: '2026-06-15', // Corso di 106 giorni
  },
  {
    id: 'c3',
    nome: 'Sistemi di Intelligenza Artificiale',
    docente: 'Prof. Bianchi',
    semestre: 'Secondo Semestre',
    anno_accademico: '2025/2026', 
    cfu: 12,
    descrizione: 'Sviluppo di agenti autonomi, simulazioni TORCS.',
    stato: 'in corso',
    voto_desiderato: 26,
    voto_ottenuto: null,
    data_inizio: '2026-03-01',
    data_fine: '2026-05-30', // Corso agli sgoccioli
  },
  {
    id: 'c4',
    nome: 'Programmazione Java',
    docente: 'Prof. Neri',
    semestre: 'Primo Semestre',
    anno_accademico: '2025/2026', 
    cfu: 6,
    descrizione: 'Pattern architetturali e metodi helper.',
    stato: 'completato',
    voto_desiderato: 25,
    voto_ottenuto: 27,
    data_inizio: '2025-10-01',
    data_fine: '2026-01-15',
  }
];

// 2. LISTA DEGLI ESAMI E DELLE SCADENZE
export const mockEsami = [
  {
    id: 'e1',
    corso_id: 'c1',
    titolo: 'Esame Scritto SQL',
    data: '2026-01-20',
    tipologia: 'Scritto',
    priorita: 'Alta',
    stato: 'superato',
    note: 'Ricordarsi di rivedere la logica delle chiavi esterne 1:N.',
    voto_risultato: 30,
  },
  {
    id: 'e2',
    corso_id: 'c4',
    titolo: 'Progetto DAO',
    data: '2026-02-15',
    tipologia: 'Progetto',
    priorita: 'Media',
    stato: 'superato',
    note: 'Inviato su GitHub.',
    voto_risultato: 27,
  },
  {
    id: 'e3',
    corso_id: 'c2',
    titolo: 'Presentazione Script Python',
    data: '2026-06-18',
    tipologia: 'Orale',
    priorita: 'Alta',
    stato: 'programmato',
    note: 'Portare il PC con lo script per il rilevamento volti funzionante.',
    voto_risultato: null,
  },
  {
    id: 'e4',
    corso_id: 'c3',
    titolo: 'Consegna Simulatore',
    data: '2026-07-02',
    tipologia: 'Progetto',
    priorita: 'Alta',
    stato: 'programmato',
    note: 'Verificare l\'addestramento del Random Forest Regressor.',
    voto_risultato: null,
  }
];

// 3.1 LISTA DELLE SESSIONI DI STUDIO (I "Contenitori di tempo")
export const mockSessioni = [
  {
    id: 's1',
    titolo: 'Sviluppo Script Vision',
    data: '2026-05-25', 
    data_ora_inizio: '2026-05-25T09:00:00', 
    data_ora_fine: '2026-05-25T13:00:00', 
    note: 'Lavoro sui dataset in laboratorio'
  },
  {
    id: 's2',
    titolo: 'Training Modello AI',
    data: '2026-05-27',
    data_ora_inizio: '2026-05-27T14:00:00',
    data_ora_fine: '2026-05-27T18:00:00',
    note: 'Far girare l\'algoritmo sul server dell\'università'
  }
];

// 3.2 LISTA DELLE ATTIVITÀ E DEGLI OBIETTIVI DI STUDIO
// NOTA: Ho impostato date attorno alla settimana del 25-31 Maggio 2026
export const mockAttivita = [
  {
    id: 'a1',
    corso_id: 'c2',
    sessione_id: 's1',
    titolo: 'Test riconoscimento giallo',
    descrizione: 'Testare lo script per isolare i palloncini gialli.',
    data_ora_inizio: '2026-05-25T10:00:00', 
    data_ora_scadenza: '2026-05-25T23:59:00', // SCADUTA (siamo oltre il 25)
    priorita: 'Alta',
    completata: false,
    tempo_stimato_minuti: 180, // 3 ore pianificate per il Lunedì (25 Maggio)
    tempo_impiegato_minuti: 120,
    note: 'Il filtro HSV dà problemi con la luce solare.',
  },
  {
    id: 'a2',
    corso_id: 'c3', 
    sessione_id: null,
    titolo: 'Pulizia dataset simulatore',
    descrizione: 'Rimuovere i log corrotti di TORCS.',
    data_ora_inizio: '2026-05-26T14:00:00', 
    data_ora_scadenza: '2026-05-26T23:59:00', // COMPLETATA (nonostante la data passata, andrà in fondo sbarrata)
    priorita: 'Media',
    completata: true,
    tempo_stimato_minuti: 120, // 2 ore pianificate per il Martedì (26 Maggio)
    tempo_impiegato_minuti: 120,
    note: 'Chiedere a Rita se ha i file mancanti.',
  },
  {
    id: 'a3',
    corso_id: 'c3',
    sessione_id: 's2', 
    titolo: 'Ottimizzazione tempi sul giro',
    descrizione: 'Regolare i parametri del Random Forest.',
    data_ora_inizio: '2026-05-27T15:00:00',
    data_ora_scadenza: '2026-05-29T23:59:00', // DA FARE / PENDENTE
    priorita: 'Alta',
    completata: false,
    tempo_stimato_minuti: 240, // 4 ore pianificate per il Mercoledì (27 Maggio)
    tempo_impiegato_minuti: 0,
    note: 'Puntare a scendere sotto il minuto.',
  },
  {
    id: 'a4',
    corso_id: 'c2',
    sessione_id: null, 
    titolo: 'Stesura documentazione',
    descrizione: 'Iniziare a scrivere il file README del progetto.',
    data_ora_inizio: '2026-05-28T10:00:00',
    data_ora_scadenza: '2026-05-30T23:59:00', // DA FARE / PENDENTE
    priorita: 'Bassa',
    completata: false,
    tempo_stimato_minuti: 60, // 1 ora pianificata per il Giovedì (28 Maggio)
    tempo_impiegato_minuti: 0,
    note: '',
  },
  // --- AGGIUNTE PER IL TIMER --- 
  {
    id: 'a5',
    corso_id: 'c2',
    sessione_id: 's1', 
    titolo: 'Lettura documentazione OpenCV',
    descrizione: 'Studiare la documentazione sui filtri colore.',
    data_ora_inizio: '2026-05-25T11:00:00',
    data_ora_scadenza: '2026-05-25T23:59:00',
    priorita: 'Media',
    completata: false,
    tempo_stimato_minuti: 60,
    tempo_impiegato_minuti: 0,
    note: '',
  },
  {
    id: 'a6',
    corso_id: 'c3',
    sessione_id: 's2', 
    titolo: 'Verifica pesi rete neurale',
    descrizione: 'Salvare i pesi del modello addestrato.',
    data_ora_inizio: '2026-05-27T16:00:00',
    data_ora_scadenza: '2026-05-29T23:59:00',
    priorita: 'Media',
    completata: false,
    tempo_stimato_minuti: 90,
    tempo_impiegato_minuti: 0,
    note: '',
  }
];

// 4. LISTA DEI RISULTATI DI STUDIO (Timer Effettivo)
// Inseriti dati per la settimana corrente (25-31 Maggio 2026) per testare il grafico a barre impilate
export const mockTempiStudio = [
  // LUNEDÌ (25 Maggio): 3 ore stimate (attività a1) -> 2 ore studiate. 
  // Risultato grafico: Barra sotto blu scuro (2h), barra sopra azzurro chiaro (1h gap).
  { id: '1', data: '2026-05-25', ore_studiate: 2 }, 

  // MARTEDÌ (26 Maggio): 2 ore stimate (attività a2) -> 2 ore studiate.
  // Risultato grafico: Barra interamente blu scuro (obiettivo perfettamente raggiunto).
  { id: '2', data: '2026-05-26', ore_studiate: 2 }, 

  // MERCOLEDÌ (27 Maggio): 4 ore stimate (attività a3) -> 5.5 ore studiate.
  // Risultato grafico: Barra interamente blu scuro molto alta (superato l'obiettivo).
  { id: '3', data: '2026-05-27', ore_studiate: 3.5 }, 
  { id: '4', data: '2026-05-27', ore_studiate: 2.0 }, // Seconda sessione nello stesso giorno

  // GIOVEDÌ (28 Maggio): 1 ora stimata (attività a4) -> 0 ore studiate (per ora).
  // Risultato grafico: Barra interamente azzurra (ancora tutto da studiare).
  // Non essendoci log, il motore grafico calcolerà 0 e metterà 1h rimanente.
];

// 5. STORICO DEI TIMER COMPLETATI
export const mockStoricoTimer = [
  {
    id: 't1',
    sessione_id: 's1',
    attivita_id: 'a1', 
    data_registrazione: '2026-05-25',
    minuti_registrati: 120, 
    completato_alle: '11:00',
    stato: 'completato',
  },
  {
    id: 't2',
    sessione_id: 's1',
    attivita_id: 'a5',
    data_registrazione: '2026-05-25',
    minuti_registrati: 45,
    completato_alle: '12:30',
    stato: 'interrotto',
  },
  {
    id: 't3',
    sessione_id: 's2',
    attivita_id: 'a3',
    data_registrazione: '2026-05-27',
    minuti_registrati: 35, 
    completato_alle: '15:35', 
    stato: 'cambio',
  }
];