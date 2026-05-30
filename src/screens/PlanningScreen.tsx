import { useIsFocused } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { FlatList, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Calendar, DateData } from 'react-native-calendars'; //Libreria per il calendario
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AddTaskModal from '../components/AddTaskModal';
import Colors from '../constants/Colors';

import { getAttivita, getCorsi, salvaTutteLeAttivita } from '../constants/storage';

/*
*  Definiamo un tipo Ibrido per gestire sia sessioni che attività nella stessa lista,
*  con tutti i campi richiesti
*/ 
type StudyItem = {
    id: string;
    title: string;
    desc?: string;         //proprietà opzionale (si noti il ? )
    course_id?: string; //proprietà opzionale (si noti il ? )
    session_id?: string | null; //proprietà opzionale (si noti il ?)
    date: string;
    durationUnit?: 'ore' | 'giorni' //proprietà opzionale (si noti il ? )
    startDate?: string;       //proprietà opzionale (si noti il ?)
    endDate?: string;         //proprietà opzionale (si noti il ? )
    estimatedDays?: number;   //proprietà opzionale (si noti il ?)
    priority: string;
    sessionType?: string;    //proprietà opzionale (si noti il ?)
    isCompleted: boolean;
    estimatedTime: number;
    actualTime: number;
    notes: string;
    type: 'sessione' | 'attivita', //campo discriminante per la logica UI
};

const PlanningScreen = () => {
    //stato per gestire la data attualmente selezionata sul calendario (formato YYYY-MM-DD)
    //ciò che è presente tra le parentesi tonde di useState rappresenta il valore
    // che la variabile di stato selectedDate assumerà al primo avvio dell'app; si utilizza 
    // una tecnica comune per ottenere la data odierna in formato stringa YYYY-MM-DD; in particolare
    //  - new Date() crea un nuovo oggetto data che rappresenta l'istante esatto (giorno e ora) in cui il codice
    //     viene eseguito; 
    //   -  .toISOString() è un metodo che converte l'oggetto Data in una stringa seguendo lo standard
    //          ISO 8601 (ad esempio "2026-05-12T12:30:00.000Z")
    //    - .split('T') è un metodo che taglia la stringa in due parti usando la lettera 'T' come punto di rottura; separa
    //         la parte della data dalla parte dell'ora, creando un array con due elementi (ad esempio ["2026-05-12", "12:30:00.000Z"])
    //    - [0] accede al primo elemento dell'array appena creato (nell'esempio , "2026-05-12")
    const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);

    //stato booleano per controllare l'apertura/la chiusura del Pop-Up (Modal) di inserimento
    const [isModalVisible, setModalVisible] = useState<boolean>(false);

    //stato boolean per controllare l'apertuta/chiusura del modal per la cancellazione del task
    const [isDeleteTaskModalVisible, setDeleteTaskModalVisible] = useState(false);

    //stato per memorizzare temporaneamente l'ID dell'item da cancellare
    const [itemToDelete, setItemToDelete] = useState<string | null>(null);

    //stato per memorizzare l'attività che si sta modificando (lo stato assume valore null se si sta inserendo)
    const [taskToEdit, setTaskToEdit] = useState<StudyItem | null>(null);
    
    // stato che restituisce true se la schermata è visibile, false se è nascosta
    const isFocused = useIsFocused(); 

    //lo stato contenente gli item viene inizializzato come vuoto all'inizio
   const [items, setItems] = useState<StudyItem[]>([]);

   //stato per i corsi reali; tale stato memorizza l'elenco dei corsi di indirizzo recuperati permanentemente dal database locale tramite 
   // il file storage.js
   const [courses, setCourses] = useState<{id: string; nome: string}[]>([]);

   // Stato booleano di controllo che funge da "semaforo" per la sincronizzazione asincrona.
    // Viene inizializzato a 'false' e diventerà 'true' unicamente quando la procedura di lettura 
    // dei dati iniziali da AsyncStorage sarà stata completata con successo.
   const [isLoaded, setIsLoaded] = useState<boolean>(false);

   //stato che tiene traccia della selezione per lo stato dei compiti ('Tutte', 'Da completare', 'Completate')
   const [statoFiltro, setStatoFiltro] = useState<string>('Tutte');

   //stato che memorizza il filtro sull'urgenza impostato dall'utente ('Tutte', 'Alta', 'Media', 'Bassa')
   const [prioritaFiltro, setPrioritaFiltro] = useState<string>('Tutte');

   //stato che isola le attività collegate a un corso specifico memorizzandone il nome ('Tutte' o nome reale)
   const [corsoFiltro, setCorsoFiltro] = useState<string>('Tutte');



    /**
     * CARICAMENTO DATI All'avvio del componente
     * A differenza di un tradizionale hook di inizializzazione con array di dipendenze vuoto, questo useEffect 
     * monitora costantemente la variabile booleana 'isFocused' fornita dall'hook useIsFocused() di React Navigation.
     * Nelle architetture a schede (Tab Navigation), le schermate rimangono montate in background per ottimizzare le prestazioni; 
     * di conseguenza, navigando tra i menu, un normale hook iniziale non verrebbe rieseguito. Legando l'effetto a 'isFocused', 
     * costringiamo l'applicazione a intercettare ogni singolo istante in cui l'utente torna visualizzare questa pagina.
     * La funzione loadData è asincrona: leggere dati infatti dalla memoria richiede tempo; se l'applicazione
     * si bloccasse in attesa della memoria, la UI si congelerebbe
     * Nel blocco try, invece di accedere direttamente ad AsyncStorage, si utilizzano i metodi getCorsi() e getAttivita() 
     * definiti nel file storage.js (percorso ../constants/storage). La parola chiave await ferma l'esecuzione di questa specifica
     * funzione finché il modulo di storage non ha recuperato i dati, senza però bloccare il thread principale dell'applicazione.
     * L'infrastruttura di storage si fa carico di convertire autonomamente i dati salvati in memoria in oggetti JavaScript utilizzabili. 
     * Questo ci permette di mantenere il codice della schermata snello, pulito e focalizzato unicamente sulla logica di presentazione.
     * Di conseguenza, questo useEffect (hook) riceve direttamente gli array di oggetti JavaScript puliti:
     * - getCorsi() restituirà i corsi reali d'indirizzo pronti per essere salvati nello stato 'courses'.
     * - getAttivita() restituirà l'elenco delle attività/sessioni pianificate (o un array vuoto [] al primissimo avvio assoluto) 
     * per aggiornare lo stato 'items', lasciando l'interfaccia pulita e pronta all'uso.
     * Se si verificasse un errore imprevisto durante la lettura, il codice salterebbe immediatamente dentro il
     * catch . Invece di far andare l'applicazione in crash, si stampa l'errore in console e l'app si avvia comunque con un array 
     * vuoto, garantendo la massima robustezza del software
     * Il blocco finally viene eseguito tassativamente al termine del ciclo try/catch: qui viene invocata la state setter function 
     * setIsLoaded(true) per notificare reattivamente all'applicazione che i dati storici sono stati interamente ripristinati in memoria.
     * La clausola condizionale esterna (if (isFocused)) garantisce che l'interrogazione del database avvenga esclusivamente 
     * quando la schermata è effettivamente attiva sullo schermo, azzerando inutili sprechi di risorse hardware in background.
     */
    useEffect(() => {
        const loadData = async () => {
            try {
                //1 . Recupera i corsi reali dal database locale
                const savedCourse = await getCorsi();
                setCourses(savedCourse);

                //2. Recupera l'elenco delle attività/sessioni (sarà [] al primo avvio)
                const savedTasksSessions = await getAttivita();
                setItems(savedTasksSessions);
            } catch (error) {
                console.error("Errore nel recupero da AsyncStorage: ", error);
                setItems([]); //fallback di sicurezza in caso di memoria corrotta
            } finally {
                setIsLoaded(true);

            }
        };

       // si esegue il caricamento solo se la schermata è effettivamente attiva/visibile
       if (isFocused) {
            loadData();
        }


    }, [isFocused]);

    /**
     * MODIFICATA CON LA NUOVA FUNZIONE salvaTutteLeAttivita() CENTRALIZZATA IN storage.js!!!!
     * 
     * 
     * SALVATAGGIO REATTIVO (Eseguito AUTOMATICAMENTE a ogni modifica)
     * A differenza del primo hook, nelle dipendenze sono presenti sia la variabile di stato items sia la variabile 'isLoaded': 
     * ciò significa che ogni volta che il suo valore cambia (perché l'utente ha aggiunto una sessione, modificato un'attività o cliccato sul
     * cestino per eliminare un elemento, oppure perché la lettura asincrona iniziale si è conclusa) , viene eseguito immediatamente il codice presente nell'hook
     * Come la funzione loadData, anche la funzione saveData è asincrona per non bloccare l'applicazione durante la scrittura fisica in memoria
     * La condizione if(!isLoaded) return; funge da fondamentale "clausola di guardia": impedisce matematicamente all'hook di sovrascrivere 
     *  il database locale all'avvio dell'app. Poiché infatti lo stato iniziale di 'items' nasce vuoto ([]), senza questa barriera l'app registrerebbe
     *  un array vuoto sul disco fisso un istante prima che il primo hook riesca a completare la lettura dei dati reali
     * Nel blocco try, la funzione AsyncStorage.setItem ha bisogno di due argomenti: la stringa identificativa globale delle attività (@planner_attivita)
     *  e il dato da salvare. Poiché pero AsyncStorage memorizza esclusivamente testo semplice (ossia stringhe), si utlizza la funzione
     *  JSON.stringify(items) che trasforma l'array di oggetti items in una singola stringa di testo continua in formato JSON
     *  Una volta trasformato in testo, la parola chiave await si assicura che il dato venga scritto in modo asincrono in memoria, senza bloccare
     * l'interfaccia grafica
     * Se la scrittura dovesse fallire per un errore imprevisto, il sistema non andrà in crash, ma intercetterà l'anomalia
     *  nel catch, stamperà un log di avviso e lascerà l'utente libero di continuare a usare l'applicazione
     */
    useEffect(() => {
        const saveData = async () => {
            if(!isLoaded){
                return;
            }
            try {
                // Utilizziamo la funzione centralizzata di storage.js
                await salvaTutteLeAttivita(items);
            } catch (error) {
                console.error("Errore nel salvataggio centralizzato:", error);
            }
        };

        saveData();

    }, [items, isLoaded]);

    /**
     *  Funzione che restituisce il colore associato alla priorità
     *  dell'attività
     */
    const getPriorityColor = (item : StudyItem) => {
        if (item.type === 'sessione') {
            return '#94a3b8';

        }

        switch(item.priority) {
            case 'Alta': return '#ef4444'; //Colore Rosso per priorità alta
            case 'Media': return '#eab308'; //Colore Giallo per priorità media
            case 'Bassa': return '#22c55e'; //Colore Verde per priorità bassa
            default: return '#94a3b8';   //Colore grigio di fallback
        }
    };

    /**
     * Funzione per aggiungere/modificare una nuova attività/sessione dal Modal
     * I dati vengono mapparti per essere coerenti con la struttura dei mockData
     */
    const handleSaveNewTask = (taskData: any) => {
        if(taskToEdit){
            //Logica di MODIFICA
            //il metodo .map() non modifica direttamente la vecchia lista di attività, 
            // ma ne crea una copia di origine completamente nuova scorrendo tutti gli elementi presenti
            // Ogni singolo elemento viene analizzato tramite la variabile temporanea item
            // if (item.id === taskToEdit.id) confronta l'ID del task che sta scorrendo in quel momento (item.id)
            // con l'ID dell'attività che l'utente ha scelto di modificare (taskToEdit.id)
            //     - se l'ID è diverso, l'if viene saltato e il codice esegue l'ulitmo return item; in fondo, rimettendo
            //         l'attività nella nuova lista esattamente così com'era
            //      - se l'ID coincide, significa che è stato trovato il task esatto da aggiornare e quindi entra in gioco la logica
            //         di modifica.
            //  const isNowSession = taskData.type === 'sessione'; crea una variabile booleana per capire se l'utente, durante la modifica,
            //   ha trasformato questo elemento in una Sessione Studio oppure lo ha lasciato come Attività
            // Il blocco return { ..item, } restituisce un nuovo oggetto che prenderà il posto di quello vecchio nella lista: 
            //     - ...item copia tutte le vecchie proprietà dell'attività original per non perdere i dati strutturali di base che non cambiano
            //              (come l'ID);
            //     - title: taskData.title e date: taskData.date sovrascrivono il titolo e la data con i nuovi valori digitati dall'utente
            //     - priority: isNowSession ? 'Media' : taskData.priority: se l'elemento è diventato una sessione, la priorità viene forzata 
            //                a 'Media' (valore neutro); se invece è un'attività registra la priorità scelta
            //      - notes: taskData.notes e type: taskData.type aggiornano le note testuali e cambiano il macro-tipo se l'utente ha modificato la selezione;
            //      - estimatedTime e actualTime: prende le ore digitate dall'utente nel form le trasforma in numeri interi con parseInt e le moltiplica per 60 per salvarle sotto forma di minuti. L'operatore || 0 è un paracadute: se l'utente
            //              lascia il campo vuoto, assegna automaticamente 0 evitando che il valore diventi NaN (Not a number). Se la durata di una session è in termini di giorni, il tempo stimato viene azzerato. Se la durata di una sessione 
            //               è invece in termini di ore, viene viuslizzata la durata della sessione convertita in minuti
            //      - course_id: courses.find(...)?.id: cerca all'interno dell'array dei corsi reali caricati dallo storage locale quello il cui nome corrisponde
            //                 a quello selezionato nel form, e ne estrae il codice ID corrispondente per salvarlo come chiave esterna di associazione;
            //   setTaskToEdit(null) : una volta che l'array aggiornato è stato passato alla state setter function setItems, l'operazione è conclusa; quindi lo stato di modifica
            //      viene resettato a null; in questo modo l'applicazione esce dalla "modalità modifica" e, la prossima volta che l'utente cliccherà sul pulsante + , il pop-up si riaprirà
            //      vuoto in modalità "nuovo inserimento"
            setItems(items.map(item => {
                if(item.id === taskToEdit.id) {
                    const isNowSession = taskData.type === 'sessione';
                    const isDays = taskData.durationUnit === 'giorni';
                    return {
                        ...item, 
                        title: taskData.title,
                        desc: taskData.desc,
                        date: taskData.date,
                        sessionType: taskData.sessionType,
                        //le sessioni hanno priorità fissa 'Media'
                        priority: isNowSession ? 'Media' : taskData.priority,
                        notes: taskData.notes,
                        //calcolo dei tempi in modalità modifica
                        estimatedTime: isNowSession
                            ? (isDays ? 0 : (Math.round(parseFloat(taskData.estimatedTime) * 60) || 0))
                            : (Math.round(parseFloat(taskData.estimatedTime) * 60) || 0),
                        actualTime: !isNowSession && taskData.actualTime
                            ?  (Math.round(parseFloat(taskData.actualTime) * 60) || 0)
                            : 0,
                        durationUnit: taskData.type === 'sessione' ? (taskData.durationUnit || 'ore') : undefined,
                        startDate: taskData.startDate,
                        endDate: taskData.endDate,
                        estimatedDays: taskData.estimatedDays,
                        
                        type: taskData.type,
                        course_id: courses.find(c => c.nome === taskData.course)?.id
                    };
                }
                return item;
            }));
            setTaskToEdit(null); //reset dello stato di modifica    


        } else {
            //Logica di INSERIMENTO DINAMICA
            const isSession = taskData.type === 'sessione';
            const isDays = taskData.durationUnit === 'giorni';
            const newItem: StudyItem = {
                id: Date.now().toString(),
                title: taskData.title,
                date: taskData.date,
                desc: taskData.desc,
                priority: isSession ? 'Media' : taskData.priority,
                isCompleted: false,
                //calcolo dei tempi in modalità INSERIMENTO
                estimatedTime: isSession
                    ? (isDays ? 0 : (Math.round(parseFloat(taskData.estimatedTime) * 60) || 0))
                    : (Math.round(parseFloat(taskData.estimatedTime) * 60) || 0),
                actualTime: !isSession && taskData.actualTime
                    ?  (Math.round(parseFloat(taskData.actualTime) * 60) || 0)
                    : 0,
                durationUnit: taskData.type === 'sessione' ? (taskData.durationUnit || 'ore') : undefined,
                startDate: taskData.startDate,
                endDate: taskData.endDate,
                estimatedDays: taskData.estimatedDays,
                type: taskData.type,
                sessionType: taskData.sessionType,
                notes: taskData.notes,
                //il metodo courses.find() analizza l'array courses elemento per elemento. Si ferma
                //non appena trova un elemento che soddisfa la condizione tra parentesi
                // Nella condizione c => c.name === taskData.course: 
                //   -   c rappresenta il singolo elemento nell'array courses
                //   -   viene confrontato il nome dell'elemento con quello ricevuto dal Modal
                // Se il metodo find trova il corso, allora restituisce tale elemento e il codice prosegue leggendo
                // la proprietà .id
                //Se find non trova nulla, invece, viene restituito undefined (si noti infatti l'utilizzo di ? )
                course_id: courses.find(c => c.nome === taskData.course)?.id

            };
            setItems([...items, newItem]);
        }
        
        //il Modal si chiude dopo il salvataggio
        setModalVisible(false);


    };

    //segnare un task come completato (solo per i task di tipo 'attività')
    const toggleComplete = (id: string) => {
        //La funzione items.map crea un nuovo array scorrendo ogni singolo elemento della
        // lista attuale; per ogni item, viene verificata la condizione item.id === id
        // - Se l'ID corrisponde viene creato un nuovo oggetto: 
        //       1) ...item copia tutte le proprietà attuali del task (titolo, data, corso, ecc)
        //       2)  isCompleted: !item.isCompleted sovrascrive solo la proprieta isCompleted, invertendo
        //           il suo valore booleano: se il valore era false, ora diventa true, e viceversa
        // - Se l'ID non corrisponde viene restituito l'oggetto item esattamente così com'è senza modificarlo.  
        setItems(items.map(item => 
            item.id === id ? {...item, isCompleted: !item.isCompleted } : item
        ));
    };     

    //eliminare un'attività
    const deleteItem = (id: string) => {
        //Si memorizza l'id dell'elemento che l'utente ha cliccato
        setItemToDelete(id);

        //si apre il modal di conferma del'eliminazione
        setDeleteTaskModalVisible(true);
    };

    //nuova funzione per eseguire l'effettiva cancellazione dopo la conferma
    const confirmDeleteTask = () => {
        if(itemToDelete) {
            //Il metodo filter è un modo per rimuovere un elemento da un array mantenendo l'immutabilià dello stato
            //In particolare, il metodo filter non modifica la lista originale, ma ne crea una nuova, all'interno della quale
            //sono presenti tuttli gli elementi il cui ID è diverso da quello che si vuole eliminare
            //In questo modo l'elemento con ID corrispondente, cioè quello che si vuole eliminare, viene esclusa dal nuovo array e la state setter function
            // aggiorna l'interfaccia rimuovendo il task dallo schermo.
            setItems(items.filter(i => i.id !== itemToDelete));

            //si chiude il modal
            setDeleteTaskModalVisible(false);

            //si resetta l'ID
            setItemToDelete(null);
        }
    };

    //Attivazione della modalità di modifica
    const startEditItem = (item: StudyItem) => {
        setTaskToEdit(item);
        setModalVisible(true);

    }

    //Visualizzazione del componente PlanningScreen per la schermata di pianificazione dei task
    return(
        <ScrollView style = {styles.container}>
            <Text style = {styles.screenTitle}>PIANIFICAZIONE</Text>

            {/*Componente Calendar per pianificare un'attività
                Il componente Calendar è il componente che permette di gestire calendari in React Native: 
                   - la proprietà onDayPress rappresenta l'evento che scatta quando l'utente tocca un giorno sul calendario; in particolare riceve un oggetto day di 
                      tipo DateData, ed esegue setSelectedDate(day.dateString): in questo modo, aggiornando lo stato mediante la state setter function setSelectedDate, viene scatenato un re-rendering del calendario 
                      che permette al calendario di "evidenziare" il nuovo giorno scelto;
                    - la proprieta markedDates serve a dire al calendario quali giorni devono avere uno stile speciale
                      Le parentesi quadre in [selectedDate]indicano una chiave calcolata: cioè invece di cercare una proprietà
                      che si chiama selectedDate, viene utilizzato il VALORE contenuto nella variabile. Se selectedDate è ad esempio "2026-05-12" l'oggetto diventa:
                       {"2026-05-12": {selected: true, selectedColor: '#...'}}
                    - la proprietà theme permette di personalizzare i color del componente per adattarli al design dell'app
                         1) todayTextColor colora il numero del giorno corrente (oggi);
                         2) arrowColor cambia il colore delle frecce per cambiare mese (destra/sinistra)
            */}
            <Calendar
                onDayPress={(day: DateData) => setSelectedDate(day.dateString)}
                markedDates = {{ [selectedDate]: {selected: true, selectedColor: Colors.primary} }}
                theme={{ todayTextColor: Colors.primary, arrowColor: Colors.primary}}
            />

            {/*Questa View racchiude l'interfaccia di filtraggio rapido. Ogni riga genera orizzontalmente i componenti selezionabili,
            sincronizzati reattivamente con gli stati dei filtri*/}
            <View style={styles.filterContainer}>
                {/*Sezione A: Ricerca/Filtro per Corso
                    Questa sezione renderizza un selettore orizzontale scorrevole. Il pulsante di reset 'Tutte' 
                    viene gestito separatamente come punto di sblocco iniziale. Successivamente, tramite il 
                    metodo .map(), si cicla l'array di oggetti 'courses' recuperati dal database locale. 
                    Cliccando su un chip la funzione 'setCorsoFiltro' salva l'ID univoco del corso (corso.id) 
                    per azzerare ogni conflitto con le chiavi esterne, mentre a schermo viene stampata la stringa testuale (corso.nome) 
                    per preservare un'esperienza utente pulita.
                    La proprietà key serve a assegnare a ogni singolo chip un identificatore unico e fisso. 
                    In questo modo, quando l'utente cambia un filtro, l'applicazione riconosce all'istante quale pulsante 
                    è stato premuto ed evita di dover ridisegnare l'intera barra, eliminando bug grafici e lag.*/}
                <Text style={styles.filterLabel}>FILTRA PER CORSO: </Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
                    {/* Pulsante di Reset 'Tutte' gestito separatamente */}
                    <TouchableOpacity
                        key="all-courses"
                        onPress={() => setCorsoFiltro('Tutte')}
                        style={[styles.filterTailoredChip, corsoFiltro === 'Tutte' && styles.filterChipActive]}
                    >   
                        <Text style={[styles.filterChipText, corsoFiltro === 'Tutte' && styles.filterChipTextActive]}>
                            Tutte
                        </Text>
                    </TouchableOpacity>

                    {/* Generazione dinamica dei corsi reali usando l'ID per la logica e il Nome per la grafica */}
                    {courses.map((corso) => (
                        <TouchableOpacity
                            key={corso.id} //identificativo unico
                            onPress={() => setCorsoFiltro(corso.id)} //salva l'ID nel filtro
                            style={[styles.filterTailoredChip, corsoFiltro === corso.id && styles.filterChipActive]}
                        >
                            <Text style={[styles.filterChipText, corsoFiltro === corso.id && styles.filterChipTextActive]}>
                                {corso.nome}
                            </Text>

                        </TouchableOpacity>
                    ))}
                
                </ScrollView>

                {/*Sezione B: Stato dell'attività (Completate / Da Completare) 
                    Questa sezione disegna tre pulsanti statici ('Tutte', 'Da Completare', 'Completate') per 
                    consentire il filtraggio delle attività in base al loro ciclo di vita operativo. Il tocco su 
                    un pulsante aggiorna lo stato 'statoFiltro', modificando istantaneamente lo stile visivo 
                    del chip selezionato (styles.filterChipActive) per fornire un chiaro feedback all'utente 
                    La proprietà key serve a assegnare a ogni singolo chip un identificatore unico e fisso. 
                    In questo modo, quando l'utente cambia un filtro, l'applicazione riconosce all'istante quale pulsante 
                    è stato premuto ed evita di dover ridisegnare l'intera barra, eliminando bug grafici e lag.*/}
                <Text style={styles.filterLabel}>FILTRA PER STATO (SOLO ATTIVITA'):</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
                    {['Tutte', 'Da completare', 'Completate'].map((stato) => (
                        <TouchableOpacity
                            key={stato}
                            onPress={() => setStatoFiltro(stato)}
                            style={[styles.filterTailoredChip, statoFiltro === stato && styles.filterChipActive]}
                        >         
                            <Text style={[styles.filterChipText, statoFiltro === stato && styles.filterChipTextActive]}>
                                {stato}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
                
                {/*Sezione C: Livello di priorità dell'Attivita
                    Questo blocco genera i pulsanti chip per il filtraggio delle attività in base alla priorità. 
                    Mappa le quattro stringhe opzionali legandole tramite un click alla state setter function 
                    'setPrioritaFiltro'. 
                    La proprietà key serve a assegnare a ogni singolo chip un identificatore unico e fisso. 
                    In questo modo, quando l'utente cambia un filtro, l'applicazione riconosce all'istante quale pulsante 
                    è stato premuto ed evita di dover ridisegnare l'intera barra, eliminando bug grafici e lag."*/}
                <Text style={styles.filterLabel}>FILTRA PER PRIORITA' (SOLO ATTIVITA'):</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
                    {['Tutte', 'Alta', 'Media', 'Bassa'].map((prior) => (
                        <TouchableOpacity
                            key={prior}
                            onPress={() => setPrioritaFiltro(prior)}
                            style={[styles.filterTailoredChip, prioritaFiltro === prior && styles.filterChipActive]}
                        >         
                            <Text style={[styles.filterChipText, prioritaFiltro === prior && styles.filterChipTextActive]}>
                                {prior}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            <View style = {styles.todoContainer}>
                <Text style= {styles.subTitle}>Agenda del {selectedDate}</Text>
                {/*FlatList è un componente List Views; serve per reinderizzare una lista
                    Richiede due props obbligatorie: 
                       1) data, cioè un oggetto array-like di item da reinderizzare 
                       2) renderItem, ovvero la funzione per reinderizzare ogni elemento presente in data
                */}
                <FlatList
                    // In data, invece di passare tutta la lista, si passano solo quegli elementi dell'array items,
                    // cioè quei task la cui data corrisponde a quella selezionata nel calendario (selectedDate)
                    // Subito dopo, si agganciano in cascata tre controlli sequenziali (.filter) che valutano simultaneamente se l'attività/sessione
                    // rispetta i parametri di Corso Selezionato, Stato (isCompleted) e Livello di priorità
                    // La proprietà keyExtractor serve ad assegnare un'identità univoca a ogni elemento della lista: 
                    //   - (item) è il singolo oggetto estratto dall'array passato alla prop data
                    //    - item.id è il valore che verrà usato come chiave
                    // All'interno della prop renderItem, si esegue una ricerca inversa. Il task infatti salva solo l'ID
                    // del corso, ma si vuole mostrare il nome del corso, per cui si utilizza il metodo .find() per recuperare l'oggetto 
                    // corso completo partendo dal codice ID
                    // - scrollEnabled={false} disattiva lo Scrolling autonomo della FlatList, delegando l'intero scorrimento verticale
                    //  alla ScrollView principale che fa da contenitore alla pagina
                    // - nestedScrollEnabled={true}: permette al sistema operativo di calcolare correttamente i tocchi tra componenti nidificati,
                    //   evitando conflitti di input e preservando l'esatto layout grafico
                    data={items
                    // --- STEP 1: FILTRO TEMPORALE MIGLIORATO ---
                    .filter(item => {
                        // Se non c'è una data, ignoralo
                        if (!item.date) return false;
                        // Taglia un eventuale orario "2026-05-28T23..." in "2026-05-28" e confronta
                        return item.date.split('T')[0] === selectedDate;
                        })
                        // --- STEP 2: NUOVO FILTRO PER CORSO ASSOCIATO ---
                        // Avendo standardizzato il filtro sull'ID, si confronta
                        //  direttamente la chiave esterna 'item.course_id' con lo stato 'corsoFiltro'.
                        .filter(item => {
                            if (corsoFiltro === 'Tutte') return true;
                            return item.course_id === corsoFiltro;

                        })
                        // --- STEP 3: NUOVO FILTRO SULLO STATO DI AVANZAMENTO ---
                        // Se il filtro è su 'Tutte', facciamo passare sia le attività che le sessioni.
                        // Se il filtro è su 'Completate' o 'Da Completare', le sessioni vengono escluse a priori (ritornano false),
                        // e viene controllato lo stato di completamento solo sulle attività, quindi vengono filtrate come completate solo
                        // le attività per cui item.isCompleted è true e vengono filtrate come non completate le attività 
                        // per cui item.isCompleted è false 
                        .filter(item => {
                            if (statoFiltro === 'Tutte') return true;
                            if (item.type === 'sessione') return false;
                            return statoFiltro === 'Completate' ? item.isCompleted : !item.isCompleted;


                        })
                        // --- STEP 4: NUOVO FILTRO SUL LIVELLO DI PRIORITÀ ---
                        // Se lo stato 'prioritaFiltro' è 'Tutte', lascia transitare tutti gli elementi.
                        // Se l'utente isola una priorità, le sessioni devono essere tassativamente escluse (ritornano false), 
                        // poiché non possiedono una priorità.
                        // Nel caso di un'attività, si estrae il valore della priorità dell'oggetto (es. 'Alta') e si 
                        // verifica la perfetta uguaglianza testuale (item.priority === prioritaFiltro).
                        .filter(item => {
                            if (prioritaFiltro === 'Tutte') return true;
                            if (item.type === 'sessione') return false;
                            return item.priority === prioritaFiltro;


                        })
                    }
                    keyExtractor={(item) => item.id}
                    scrollEnabled={false}
                    nestedScrollEnabled={true}
                    //si aggiunge un padding in fondo alla lista per non far finire i task sotto il tasto +
                    contentContainerStyle = {{ paddingBottom: 200 }}
                    renderItem={({item}) => {
                        //si trova il nome del corso tramite l'ID
                        const corso = courses.find(c => c.id === item.course_id);

                        return(

                            /*Se item.isCompleted è vero, alla card viene applicato lo stile styles.completedCard*/
                            <View style = {[styles.taskCard, item.isCompleted && styles.completedCard]}>
                                {/*Icona Differenziata: check per attivita, orologio per sessioni
                                   Se si tratta di un'attività, allora l'icona è racchiusa in un TouchableOpacity, cioè un elemento cliccabile
                                   Quando si clicca sul TouchableOpacity (onPress = {() => toggleComplete(item.id)}) , l'attivita viene
                                   segnata come completata o viceversa. Se è completata viene mostrato un cerchio con spunta (check-cirle),
                                   altrimenti un cerchio vuoto (circle-outline)

                                   Se si tratta di una sessione, viene mostrata un'icona di orologio (clock-outline)
                                   Non è cliccabile, in quanto una sessione di studio è un evento temporale fisso

                                
                                */}
                                <View style = {styles.iconContainer}>
                                    {item.type === 'attivita' ? 
                                    (
                                        <TouchableOpacity onPress={() => toggleComplete(item.id)}>
                                            <Icon
                                            name ={item.isCompleted ? "check-circle" : "circle-outline"}
                                            size = {26}
                                            color = {item.isCompleted ? Colors.completed : Colors.primary}/>
                                        </TouchableOpacity>
                                    ) : (
                                        <Icon name = "clock-outline"
                                        size = {26}
                                        color = {Colors.textGray}
                                        />
                                    )}
                                </View>
                                

                                {/*Informazioni sul task*/}
                                <View style = {styles.taskInfo}>
                                    <View style={styles.titleRow}>
                                        {/*Colore priorità : badge circolare dinamico inserito a sinistra del titolo*/}
                                          <View style = {[styles.priorityDot, {backgroundColor: getPriorityColor(item) }]}/>

                                        {/*Se item.isCompleted è true viene applicato lo stile styles.textStrikethrough*/}
                                        <Text style={[styles.taskTitle, item.isCompleted && styles.textStrikethrough]}>
                                            {item.title}
                                        </Text>
                                     </View>

                                    {/*Badge del corso (se presente)*/}
                                    {corso && <Text style= {styles.courseTag}>{corso.nome}</Text>}
                                    
                                    {/*Tipologia di Sessione Associata (il badge relativo alla sessione associata
                                        è visibile solo se la sessione è presente e se l'elemento che si sta inserendo si tratta di un'attività)*/}
                                    {item.type === 'attivita' && item.sessionType && (
                                        <Text style={[styles.sessionBadge, item.isCompleted && styles.textStrikethrough]}>
                                            Tipologia Sessione: <Text style={{ fontWeight: '600'}}>{item.sessionType}</Text>
                                        </Text>

                                    )}

                                    {/*Se si tratta di una sessione:
                                          - se la durata della sessione è in giorni allora vengono mostrate la data di inizio e di fine sessione;
                                          - se la durata della sessione è in ore, allora viene mostrata la durata stessa converita in minuti
                                        altrimenti se è un'attività,  viene mostrato il tempo stimato iniziale e, 
                                        solo se l'attività è completata, viene mostrato anche il tempo effettivo */}
                                    <Text style = {styles.taskDetails}>
                                        {item.type === 'sessione' ? (
                                            item.durationUnit === 'giorni' 
                                            ? `Sessione di ${item.sessionType || 'Studio'}: dal ${item.startDate} al ${item.endDate} (${item.estimatedDays} gg)` 
                                            : `Sessione di ${item.sessionType || 'Studio'}: ${item.estimatedTime} min`
                                        ) : (
                                            `Stimato: ${item.estimatedTime} min${item.isCompleted ? ` (Effettivo: ${item.actualTime} min)` : ''}`
                                        )}

                                    </Text>
                                    
                                    {/*eventuali note aggiuntive*/}
                                    {item.notes ? <Text style = {styles.notesText}>{item.notes}</Text> : null}

                                </View>

                                
                                <View style = {styles.actionButtons}>
                                    {/*Pulsante per effettuare la modifica di un elemento: la modifica di un'attività non è permessa
                                          se l'attività è spuntata come completata*/}
                                    {!item.isCompleted ? (
                                    <TouchableOpacity
                                        style={styles.actionBtn}
                                        onPress={ () => startEditItem(item)}
                                    >
                                        <Icon name="pencil-outline" size={22} color={Colors.primary} />
                                    </TouchableOpacity>
                                   ) : (    
                                        <Icon name = "pencil-outline" size = {20} color="#cbd5e1" style={{opacity: 0.5}}/>
                                   )}
                                    
                                    {/*Pulsante di eliminazione per ogni singolo elemento della lista; tale pulsante, che ha l'icona di un
                                        cestino (trash-can-outline) è wrappato in un TouchableOpacity
                                        per renderlo cliccabile. Quando l'utente tocca il pulsante del cestino ( onPress = {() => deleteItem(item.id)})
                                        viene chiamata la funzione deleteItem passandogli l'ID specifico di quell'attività (task), quindi apparirà un
                                        Alert che chiede all'utente se vuole effettivamente eliminare il task
                                        size = {22} definisce la dimensione dell'icona 
                                    */}
                                    <TouchableOpacity 
                                        style = {styles.actionBtn}
                                        onPress = {() => deleteItem(item.id)} 
                                    >
                                        <Icon name="trash-can-outline" size={22} color="#e74c3c"/>
                                    </TouchableOpacity>
                                </View> 

                             </View>   


                        );
                    }}

                    /*La prop ListEmptyComponent della FlatList è un componente che viene visualizzato automaticamente solo quando l'array passato
                    alla prop data è vuoto. Se quindi l'array data ottenuto da items.filter(item => item.date === selectedDate) è vuoto, cioè non ci sono attvità programmate
                    per quel giorno, viene visualizzato il testo 'Nessun attività/sessione per questa data'*/
                    ListEmptyComponent={<Text style={styles.emptyText}> Nessun attività/sessione per questa data</Text>}
                />

                  {/*Piccolo modal per l'eliminazione di un task*/}
                <Modal
                    /*
                        -La props animationType controlla l'effetto visivo di entrata e uscita del Modal. Poiché animationType = "fade" 
                        il modal appare e scompare con una dissolvenza graduale
                        - Con transparent = {true} il Modal viene reinderizzato sopra la schermata precedente, ma permette di vedere cosa c'è sotto
                            nelle zone non coperte dal contenuto del Modal stesso
                        - Poiché visible={isDeleteTaskModalVisible}, il Modal viene mostrato solo se la variabile di stato isDeleteTaskModalVisible
                              è true (di default la variabile di stato isDeleteTaskModalVisible è false)
                        - onRequestClose rappresenta l'azione da compiere quando l'utente preme il tasto "Annulla": in questo caso il modal per la 
                             cancellazione dell'attività viene chiuso 
                              */
                    animationType="fade"
                    transparent={true}
                    visible={isDeleteTaskModalVisible}
                    onRequestClose={() => setDeleteTaskModalVisible(false)}
                >
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalAlertContent}>
                            <Text style={styles.modalAlertTitle}>Elimina</Text>
                            <Text style={styles.modalAlertText}>
                                Rimuovere questa attività/sessione dalla pianificazione?
                            </Text>

                            <View style={styles.modalAlertButtons}>
                                {/*Pulsante Annulla per annullare l'operazione di cancellazione: quando si preme questo pulsante
                                (onPress = {() => setDeleteTaskModalVisible(false) } ) il modal per l'eliminazione del task si chiude, annullando
                                di fatto l'operazione  */}
                                <TouchableOpacity 
                                    style={[styles.modalAlertBtn, styles.cancelBtn]}
                                    onPress = {() => setDeleteTaskModalVisible(false)}
                                >
                                    <Text style = {styles.cancelBtnText}>Annulla</Text>
                                </TouchableOpacity>
                
                                {/*Pulsante Elimina per eliminare un task; quando si preme questo pulsante 
                                (onPress = {confirmDeleteTask} ) si chiama la funzione confirmDeleteTask che procede all'eliminazione
                                del task*/}
                                <TouchableOpacity
                                    style={[styles.modalAlertBtn, styles.confirmDeleteBtn]}
                                    onPress = {confirmDeleteTask}>
                                        <Text style={styles.confirmBtnText}>Elimina</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>

        </View>


            {/*Floating Action Button per aggiungere nuovi task*/}
            <TouchableOpacity 
             style = {styles.fab}
             //quando si clicca il pulsante per l'inserimento del task, il Modal AddTaskModal si apre
            onPress = {() => setModalVisible(true)} >
                <Icon name="plus" size={30} color = "white"/>
            </TouchableOpacity>

            {/*Modal di inserimento/modifica dei task: si passano i corsi reali dai mockData*/}
            <AddTaskModal 
                isVisible = {isModalVisible}
                //chiusura del modal: il modal non è più visibile
                onClose={() => {
                    setModalVisible(false);
                    setTaskToEdit(null);
                }}
                //onSave per salvare le attività
                onSave={handleSaveNewTask}
                date={selectedDate}
                //si passa il riferimento allo stato dinamico dei corsi
                courses = {courses}
                taskToEdit={taskToEdit}
                
            />
        </ScrollView> 
    );

};

const styles = StyleSheet.create({
    container: {flex: 1, backgroundColor: Colors.background, paddingTop: 40},
    screenTitle: {
        fontSize: 27, 
        fontWeight: 'bold', 
        color: '#2c2c2e',
        textAlign: 'left',
        alignSelf: 'flex-start',
        marginTop: 25,
        paddingHorizontal: 20,
        marginBottom: 15
    },
    filterContainer: {
        paddingHorizontal: 14,
        paddingVertical: 12,
        backgroundColor: '#f8fafc',
        borderRadius: 14,
        marginHorizontal: 16,
        marginBottom: 5,
        marginTop: 10,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        //ombra leggere per conferire profondità visiva
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 1},
        shadowOpacity: 0.04,
        shadowRadius: 2,
        elevation: 1
    },
    filterLabel: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#64748b',
        marginBottom: 6,
        letterSpacing: 0.6
    },
    filterScroll: {
        marginBottom: 12 //fornisce lo stacco geometrico tra le diverse categorie di filtri
    },
    filterTailoredChip: {
        paddingHorizontal: 14,
        paddingVertical: 6,
        backgroundColor: '#e2e8f0',
        borderRadius: 20,
        marginRight: 8
    },
    filterChipActive: {
        //tonalità blu primaria per identificare lo stato di selezione attivo
        backgroundColor: '#177AD5'
    },
    filterChipText: {
        fontSize: 12,
        color: '#334155'

    },
    filterChipTextActive: {
        color: '#ffffff',
        fontWeight: 'bold'

    },
    todoContainer: {flex: 1, padding: 20},
    subTitle: {fontSize: 16, fontWeight: 'bold', marginBottom: 15, color: '#34495e'},
    taskCard: {
        backgroundColor: 'white',
        padding: 15,
        borderRadius: 15,
        marginBottom: 10,
        flexDirection: 'row',
        alignItems: 'center',
        elevation: 2,
        marginHorizontal: 2

    },
    actionButtons: {
        flexDirection: 'row',
        alignItems: 'center'

    },
    actionBtn: {
        padding: 5,
        marginLeft: 8

    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 2

    },
    priorityDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        marginRight: 8
    },
    completedCard: {opacity: 0.6, backgroundColor: '#f8f9fa'},
    iconContainer: { marginRight: 10 },
    taskInfo: { flex: 1},
    taskTitle: { fontSize: 16, fontWeight: 'bold', color: '#2c3e50'},
    courseTag: {
        fontSize: 10,
        color: Colors.primary,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        marginTop: 2
    },
    sessionBadge: {
        fontSize: 12,
        color: '#64748b',
        marginTop: 2,
        marginBottom: 4,
        fontStyle: 'italic'
    },
    taskDetails: { fontSize: 11, color: Colors.textGray, marginTop: 2},
    textStrikethrough : { textDecorationLine: 'line-through', color: 'gray'},
    notesText: {fontSize: 10, color: '#95a5a6', fontStyle: 'italic', marginTop: 5},
    emptyText: { textAlign: 'center', color: Colors.textGray, marginTop: 30},
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)' ,//sfondo semitrasparente
        justifyContent: 'center',
        alignItems: 'center'

    },
    modalAlertContent: {
        width: '80%',
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 20,
        alignItems: 'center',
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2},
        shadowOpacity: 0.25,
        shadowRadius: 4

    },
    modalAlertTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10

    },
    modalAlertText: {
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 20,
        color: '#475569'
    },
    modalAlertButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%'

    },
    modalAlertBtn: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 10,
        alignItems: 'center',
        marginHorizontal: 5
    },
    cancelBtn: {
        backgroundColor: '#f1f5f9'

    },

    confirmDeleteBtn: {
        backgroundColor: '#ef4444' //colore rosso
    },
    
    cancelBtnText: {
        color: '#475569',
        fontWeight: '600'

    },

    confirmBtnText: {
        color: 'white',
        fontWeight: '600'
    },

    fab: {
        position: 'absolute',
        bottom: 110,
        right: 25,
        width: 65,
        height: 65,
        borderRadius: 30,
        backgroundColor: Colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 12,
        //il pulsante è SOPRA alla Tab Bar
        zIndex: 9999


    }
});

export default PlanningScreen;



