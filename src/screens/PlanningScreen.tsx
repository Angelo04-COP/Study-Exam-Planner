import React from 'react';
import {useState} from 'react';
import {View, ScrollView, Text, StyleSheet, TouchableOpacity, FlatList, Modal} from 'react-native';
import {Calendar, DateData} from 'react-native-calendars'; //Libreria per il calendario
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AddTaskModal from '../components/AddTaskModal';
import Colors from '../constants/Colors';

//--INTEGRAZIONE MOCK DATA ---
// si importano i dati fittizi definiti nel file mockData.js
import { mockCorsi, mockSessioni, mockAttivita } from '../constants/mockData';



/*
*  Definiamo un tipo Ibrido per gestire sia sessioni che attività nella stessa lista,
*  con tutti i campi richiesti:
*  Titolo, Descrizione, Corso, Data, Priorità, Sessione, Note, Stato e Tempi
*/ 
type StudyItem = {
    id: string;
    title: string;
    desc?: string;
    course_id?: string; //proprietà opzionale (si noti il ? )
    session_id?: string | null; //proprietà opzionale (si noti il ?)
    date: string;
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
    


    /**
     * INIZIALIZZAZIONE STATO CON MOCK DATA: 
     * Qui si uniscono le sessioni e le attività in un unico array
     * gestibile. Per le attività, si estrae la data dalla stringa ISO data_ora_inizio
     */

    /*
    * Qui si prendono due liste di dati diverse , ovvero mockSessioni e
    * mockAttivita e le si fondono in una unica lista uniforme chiamata initialData; in particolare: 
    *    - il simbolo dei tre punti (...), noto come Spread Operator, viene utilizzato per "spalmare"
    *       gli elementi di un array dentro un altro array: in questo modo invece di avere un array che contiene altri
    *        due array (cioè un array annidato), si ottiene un unico array piatto che contiene tutti gli oggetti individuali
    *    - per ogni lista, si usa il metodo .map() per trasformare gli oggetti originali prima di inserirli nella nuova lista: 
    * 
    *         mockSessioni
    *         1) si copiano tutte le proprietà originali della sessione;
    *        2)  type: 'sessione' as const aggiunge un'etichetta fissa per distinguere questo oggetto. 'as const' serve a TypeScript
    *            per capire che il valore è esattamente quella stringa specifica, non una stringa generica 
    *         3) per tutte le sessioni all'inizio isCompleted: false e priority: 'Media'
    * 
    *        mockAttivita
    *        1) per mockAttivita, si effettuano le stesse operazioni
    *        2) date: a.data_ora_inizio.split('T')[0] estra solo la data da un timestamp completo,
    *                proprio come accade poco prima con .toISOTring() 
    */
    const initialData: StudyItem[] = [
        ...mockSessioni.map(s => ({
            id: s.id,
            title: s.titolo,
            date: s.data,
            estimatedTime: 0, 
            actualTime: 0,
            notes: s.note || '',
            type: 'sessione' as const,
            isCompleted: false,
            priority: 'Media'
        })),
        ...mockAttivita.map(a => ({
            id: a.id,
            title: a.titolo,
            date: a.data_ora_inizio.split('T')[0], //trasformazione nel formato YYYY-MM-DD
            course_id: a.corso_id,
            session_id: a.sessione_id,
            priority: a.priorita,
            isCompleted: a.completata,
            estimatedTime: a.tempo_stimato_minuti || 0,
            actualTime: a.tempo_impiegato_minuti || 0,
            notes: a.note || '',
            type: 'attivita' as const,
        }))
    ];
    
    //il valore iniziale della variabile di stato items è l'array appena creato initalData che contiene elementi
    // di tipo StudyItem
    const [items, setItems] = useState<StudyItem[]>(initialData)

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
            //      - estimatedTime e actualTime: se l'elemento è una sessione, azzera i tempi a 0; se è un'attività, prende le ore digitate dall'utente nel form
            //            le trasforma in numeri interi con parseInt e le moltiplica per 60 per salvarle sotto forma di minuti. L'operatore || 0 è un paracadute: se l'utente
            //              lascia il campo vuoto, assegna automaticamente 0 evitando che il valore diventi NaN (Not a number)
            //      - course_id: mockCorsi.find(...)?.id: cerca all'interno dell'array globale dei corsi quello il cui nome corrisponde
            //                 a quello selezionato nel form,  e ne estrae il codice ID corrispondente per salvarlo come chiave esterna di associazione;
            //   setTaskToEdit(null) : una volta che l'array aggiornato è stato passato alla state setter function setItems, l'operazione è conclusa; quindi lo stato di modifica
            //      viene resettato a null; in questo modo l'applicazione esce dalla "modalità modifica" e, la prossima volta che l'utente cliccherà sul pulsante + , il pop-up si riaprirà
            //      vuoto in modalità "nuovo inserimento"
            setItems(items.map(item => {
                if(item.id === taskToEdit.id) {
                    const isNowSession = taskData.type === 'sessione';
                    return {
                        ...item, 
                        title: taskData.title,
                        desc: taskData.desc,
                        date: taskData.date,
                        sessionType: taskData.sessionType,
                        //le sessioni hanno priorità fissa 'Media'
                        priority: isNowSession ? 'Media' : taskData.priority,
                        notes: taskData.notes,
                        //i tempi servono solo per l'attività
                        estimatedTime: isNowSession ? 0 : Math.round(parseFloat(taskData.estimatedTime) * 60) || 0,
                        actualTime: isNowSession ? 0 : Math.round(parseFloat(taskData.actualTime) * 60) || 0,
                        type: taskData.type,
                        course_id: mockCorsi.find(c => c.nome === taskData.course)?.id
                    };
                }
                return item;
            }));
            setTaskToEdit(null); //reset dello stato di modifica    


        } else {
            //Logica di INSERIMENTO DINAMICA
            const isSession = taskData.type === 'sessione';
            const newItem: StudyItem = {
                id: Date.now().toString(),
                title: taskData.title,
                date: taskData.date,
                desc: taskData.desc,
                priority: isSession ? 'Media' : taskData.priority,
                isCompleted: false,
                //conversione in minuti
                estimatedTime: isSession ? 0 : Math.round(parseFloat(taskData.estimatedTime) * 60) || 0,
                actualTime: isSession ? 0 :  Math.round(parseFloat(taskData.actualTime) * 60) || 0,
                type: taskData.type,
                sessionType: taskData.sessionType,
                notes: taskData.notes,
                //il metodo mockCorsi.find() analizza l'array mockCorsi elemento per elemento. Si ferma
                //non appena trova un elemento che soddisfa la condizione tra parentesi
                // Nella condizione c => c.nome === taskData.course: 
                //   -   c rappresenta il singolo elemento nell'array mockCorsi
                //   -   viene confrontato il nome dell'elemento con quello ricevuto dal Modal
                // Se il metodo find trova il corso, allora restituisce tale elemento e il codice prosegue leggendo
                // la proprietà .id
                //Se find non trova nulla, invece, viene restituito undefined (si noti infatti l'utilizzo di ? )
                course_id: mockCorsi.find(c => c.nome === taskData.course)?.id

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
            <Text style = {styles.screenTitle}>PIANIFICAZIONE STUDIO</Text>

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
                    // La proprietà keyExtractor serve ad assegnare un'identità univoca a ogni elemento della lista: 
                    //   - (item) è il singolo oggetto estratto dall'array passato alla prop data
                    //    - item.id è il valore che verrà usato come chiave
                    // All'interno della prop renderItem, si esegue una ricerca inversa. Il task infatti salva solo l'ID
                    // del corso, ma si vuole mostrare il nome del corso, per cui si utilizza il metodo .find() per recuperare l'oggetto 
                    // corso completo partendo dal codice ID
                    data={items.filter(item => item.date === selectedDate)}
                    keyExtractor={(item) => item.id}
                    //si aggiunge un padding in fondo alla lista per non far finire i task sotto il tasto +
                    contentContainerStyle = {{ paddingBottom: 200 }}
                    renderItem={({item}) => {
                        //si trova il nome del corso tramite l'ID
                        const corso = mockCorsi.find(c => c.id === item.course_id);

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

                                    {/*Se si tratta di una sessione viene mostrato 'Sessione di studio', altrimenti 'Obiettivo: tempo stimato in min' 
                                    in riferimento ad un'attività*/}
                                    <Text style = {styles.taskDetails}>
                                        {item.type === 'sessione' ? `Sessione di ${item.sessionType || 'Studio'}` : `Obiettivo: ${item.estimatedTime} min`}

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
                                Rimuovere questa attivita dalla pianificazione?
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
                <Icon name="plus" size={30} color = "blue"/>
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
                //non si passa l'intero array mockCorsi, ma si crea una versione semplificata utilizzando
                // il metodo .map, in modo tale da passare al componente AddTaskModal solo l'ID e il nome del corso
                courses = {mockCorsi.map(c => ({ id: c.id, name: c.nome}))}
                taskToEdit={taskToEdit}
                
            />
        </ScrollView> 
    );

};

const styles = StyleSheet.create({
    container: {flex: 1, backgroundColor: Colors.background, paddingTop: 40},
    screenTitle: {fontSize: 18, fontWeight: 'bold', textAlign: 'center', marginBottom: 10},
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



