// src/constants/storage.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import { mockCorsi, mockEsami, mockAttivita } from './mockData';

// Chiavi segrete univoche per salvare i dati nel disco del telefono
const CHIAVE_CORSI = '@planner_corsi';
const CHIAVE_ESAMI = '@planner_esami';
const CHIAVE_ATTIVITA = '@planner_attivita';

/**
 * 1. INIZIALIZZA LO STORAGE
 * Se l'app viene aperta per la primissima volta, carica i vostri mockData 
 * e li salva sul telefono, così l'app non si presenta vuota.
 */
export const inizializzaStorage = async () => {
  try {
    const corsiEsistenti = await AsyncStorage.getItem(CHIAVE_CORSI);
    if (!corsiEsistenti) {
      await AsyncStorage.setItem(CHIAVE_CORSI, JSON.stringify(mockCorsi || []));
      await AsyncStorage.setItem(CHIAVE_ESAMI, JSON.stringify(mockEsami || []));
      await AsyncStorage.setItem(CHIAVE_ATTIVITA, JSON.stringify(mockAttivita || []));
      console.log("Database locale inizializzato con tutti i dati Mock!");
    }
  } catch (error) {
    console.error("Errore durante l'inizializzazione dello storage:", error);
  }
};

// ==========================================
// OPERAZIONI PER LE ATTIVITÀ / SESSIONI
// ==========================================

export const getAttivita = async () => {
  try {
    const dati = await AsyncStorage.getItem(CHIAVE_ATTIVITA);
    return dati ? JSON.parse(dati) : [];
  } catch (error) {
    console.error("Errore nel recupero delle attività:", error);
    return [];
  }
};

export const salvaNuovaAttivita = async (nuovaAttivita) => {
  try {
    const attuali = await getAttivita();
    const listaAggiornata = [nuovaAttivita, ...attuali];
    await AsyncStorage.setItem(CHIAVE_ATTIVITA, JSON.stringify(listaAggiornata));
    console.log("Nuova attività salvata sul telefono!");
  } catch (error) {
    console.error("Errore nel salvataggio dell'attività:", error);
  }
};

// ==========================================
// OPERAZIONI PER I CORSI
// ==========================================

export const getCorsi = async () => {
  try {
    const dati = await AsyncStorage.getItem(CHIAVE_CORSI);
    return dati ? JSON.parse(dati) : [];
  } catch (error) {
    console.error("Errore nel recupero dei corsi:", error);
    return [];
  }
};

export const salvaNuovoCorso = async (nuovoCorso) => {
  try {
    const attuali = await getCorsi();
    const listaAggiornata = [nuovoCorso, ...attuali];
    await AsyncStorage.setItem(CHIAVE_CORSI, JSON.stringify(listaAggiornata));
    console.log("Nuovo corso salvato sul telefono!");
  } catch (error) {
    console.error("Errore nel salvataggio del corso:", error);
  }
};

// ==========================================
// OPERAZIONI PER GLI ESAMI / SCADENZE
// ==========================================

export const getEsami = async () => {
  try {
    const dati = await AsyncStorage.getItem(CHIAVE_ESAMI);
    return dati ? JSON.parse(dati) : [];
  } catch (error) {
    console.error("Errore nel recupero degli esami:", error);
    return [];
  }
};

export const salvaNuovoEsame = async (nuovoEsame) => {
  try {
    const attuali = await getEsami();
    const listaAggiornata = [nuovoEsame, ...attuali];
    await AsyncStorage.setItem(CHIAVE_ESAMI, JSON.stringify(listaAggiornata));
    console.log("Nuovo esame salvato sul telefono!");
  } catch (error) {
    console.error("Errore nel salvataggio dell'esame:", error);
  }
};