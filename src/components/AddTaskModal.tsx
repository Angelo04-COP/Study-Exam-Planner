/**
 * Componente "Pop-up" per l'inserimento dei task.
 * E' un componente controllato: riceve la data selezionata 
 * dal calendario come "prop" e restituisce i dati inseriti 
 * tramite una funzione onSave
 * 
 */
import React from 'react';
import {useState, useEffect} from 'react';
import {View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView} from 'react-native';
import Modal from 'react-native-modal';
import Colors from '../constants/Colors';


//tipo di dato Corso
type Course = {
    id: string;
    nome: string;
}

//tipo Props per il componente Modal
type AddTaskModalProps = {
    isVisible: boolean;
    onClose : () => void;
    onSave: (data: any) => void;
    date: string;
    //proprietà courses è array di corsi
    courses: Course[]
    //taskToEdit riceve l'oggetto completo se siamo in modalità modifica; è una proprietà opzionale , si noti il ?
    taskToEdit ?: any;
}

const AddTaskModal = ({isVisible, onClose, onSave, date, courses, taskToEdit}: AddTaskModalProps) => {
    //Stati per gestire i dati del form relativi ad un'attività
    //Per associare uno stato ad un componente si usa una speciale funzione
    //hook chiamata useState; tale funzione:
    // -associa al componente una state variabile o variabile di stato
    // che serve a mantenere i dati persistenti tra i vari render;
    // - associa al componente una state setter function che permette di 
    // aggiornare la variabile di stato e invocare il rendering del componente

    //titolo attività
    const [title, setTitle] = useState('');
    //descrizione attività
    const [desc, setDesc] = useState('');
    //corso associato
    const [selectedCourse, setSelectedCourse] = useState('');
    //priorità
    const [priority, setPriority] = useState<'Bassa' | 'Media' | 'Alta'>('Media');
    //tipo di sessione
    const [sessionType, setSessionType] = useState('Studio');
    //stato per identificare se la durata di una sessione è espressa in giorni o in ore
    const [durationUnit, setDurationUnit] = useState<'giorni' | 'ore'>('giorni');
    //stato per la data di inizio sessione (se la durata è espressa in giorni)
    const [startDate, setStartDate] = useState<string>(date);
    //stato per data di fine sessione (se la durata è espressa in giorni)
    const [endDate, setEndDate] = useState<string>('');
    //stato per esprimere la durata di una sessione in giorni
    const [estDays, setEstDays] = useState<string>('');
    //tempo stimato
    const [estTime, setEstTime] = useState('');
    //tempo effettivamente impiegato
    const [actTime, setActTime] = useState('');
    //note aggiuntive
    const [notes, setNotes] = useState('');
    //stato per gestire la selezione della tipologia ('sessione' o 'attivita');
    // di default il valore iniziale dello stato è 'attivita'
    const [type, setType] = useState<'attivita' | 'sessione'> ('attivita')
    const [activityDate, setActivityDate] = useState<string>(date);

    //si imposta l'effetto useEffect per intercettare l'apertura e il tipo di operazione (INSERIMENTO O MODIFICA)
    /*L'array delle dipendenze in fondo alle parentesi quadre specifica quando far ripartire lo useEffect.
         1) taskToEdit: intercetta se stiamo passando da modalita INSERIMENTO a modalità MODIFICA (e viceversa); 
         2)  isVisible: riesegue il codice ogni volta che il modale si apre o si chiude, garantendo il reset dei campi;
         3) date: fondamentale per la reattività dell'interfaccia Utente. Se l'utente cambia giorno sul calendario, 
               lo useEffect si attiva immediatamente e sincronizza lo stato 'startDate' con la nuova data selezionata, evitando
               disallineamenti in modalità inserimento 
    */
    useEffect(() => {
        if (taskToEdit) {
            //Modalità MODIFICA: i valori salvati vengono ripristinati
            setTitle(taskToEdit.title);
            setType(taskToEdit.type);
            setDesc(taskToEdit.desc || '');
            setPriority(taskToEdit.priority);
            setNotes(taskToEdit.notes || '');
            setSessionType(taskToEdit.sessionType || 'Nessuna');
            setDurationUnit(taskToEdit.durationUnit || 'ore');
            setStartDate(taskToEdit.startDate || taskToEdit.date);
            setEndDate(taskToEdit.endDate || '');
            setEstDays(taskToEdit.estimatedDays ? taskToEdit.estimatedDays.toString() : '');

            setActivityDate(taskToEdit.date || date);
            
            //i tempi effettivi e reali vengono pre-compilati solo se l'elemento è un'attività
            if(taskToEdit.type === 'attivita') {
                //nel file principale i dati sono in minuti, qui il dividiamo per 60 
                //per mostrarli in ore nel TextInput
                setEstTime(taskToEdit.estimatedTime ? (taskToEdit.estimatedTime / 60).toString() : '');
                setActTime(taskToEdit.actualTime ? (taskToEdit.actualTime / 60).toString() : '');
            }else {
                //gestione per il macro-tipo 'sessione'
                if((taskToEdit.durationUnit || 'ore') === 'ore'){
                    //se la sessione è in ORE, si recupera e si ripristina la durata corretta
                    setEstTime(taskToEdit.estimatedTime ? (taskToEdit.estimatedTime / 60).toString() : '');
                }else{
                    //se la sessione è in GIORNI, la casella delle ore rimane giustamente vuota
                    setEstTime('');
                }

                //le sessioni non prevedono tempo effettivo
                setActTime('');

            }
            //si recupera il nome del corso partendo dal suo ID
            const corsoAssociato = courses.find(c => c.id == taskToEdit.course_id);
            if (corsoAssociato) {
                setSelectedCourse(corsoAssociato.nome);
            } else {
                setSelectedCourse('Nessuno');

            }
        } else {
            //Modalità INSERIMENTO NUOVO ELEMENTO: tutti i campi puliti vengono completamente resettati
            setTitle('');
            setDesc('');
            setType('attivita');
            setPriority('Media');
            setSessionType('Nessuna');
            setDurationUnit('ore');
            setStartDate(date);
            setEndDate('');
            setEstDays('');
            setEstTime('');
            setActTime('');
            setNotes('');
            setSelectedCourse('Nessuno');
            setActivityDate(date);
        }
    }, [taskToEdit, isVisible, date, courses]);

    const handleSave = () => {
        if(!title.trim()) return;
        
        // Cerchiamo l'oggetto corso nell'array per recuperare il suo ID originale
        const corsoTrovato = courses.find(c => c.nome === selectedCourse);

        // Invio dell'oggetto mappato e formattato al componente padre (_layout.tsx)
        onSave({
            title,
            desc,
            course: selectedCourse,
            date: type === 'attivita' ? activityDate.trim() : (durationUnit === 'giorni' ? startDate : date),
            //le sessioni usano un valore neutro di default per la priorità
            priority: type === 'sessione' ? 'Media' : priority,
            //si passa il valore calcolato di sessionType se il macro-tipo è 'sessione'
            // OPPURE se è un'attivita che ha una sessione associata (diversa da 'Nessuna')
            sessionType: sessionType === 'Nessuna' ? undefined : sessionType,
            durationUnit: type === 'sessione' ? durationUnit : undefined,
            startDate: type === 'sessione' && durationUnit === 'giorni' ? startDate : undefined,
            endDate: type === 'sessione' && durationUnit === 'giorni' ? endDate: undefined,
            estimatedDays: type === 'sessione' && durationUnit === 'giorni' ? (parseInt(estDays) || 1) : undefined,
            estimatedTime: estTime,
            actualTime: actTime,
            notes,
            //comunica se salvare come attività o sessione
            type,
            isCompleted: false

        });
        
        // Chiudiamo il modal dopo l'invio dei dati
        onClose();
    };
    

    return(
        //il componente Modal è l'equivalente digitale di una finestra 
        // di dialogo o di un popup che richiede l'attenzione immediata dell'utente 
        //senza farlo navigare verso una nuova schermata.
        
        //la proprietà isVisible determina se il modal è mostrato e nascosto
        //la proprietà onBackdropPress rappresenta un evento che viene attivato
        //quando l'utente tocca l'area esterna al contenuto principale del Modal, cioè lo sfondo
        // o "backdrop"; questa proprietà NON ESISTE nel componente Modal standard di React Native, 
        // ma è una delle caratteristiche principali della libreria della community react-native-modal
        <Modal isVisible={isVisible} style={styles.modalMargin} onBackdropPress={onClose}>
            {/*<View> principale del contenuto del Modal*/}
            <View style={styles.content}>
                {/*PULSANTE DI CHIUSURA "X" IN ALTO A DESTRA
                     Consente un'ancora visiva immediata ed esplicita per annullare l'operazione
                        e chiudere il modale in qualsiasi momento*/}
                <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                    <Text style={styles.closeButtonText}>X</Text>        
                </TouchableOpacity> 

                {/*Il titolo superiore si adatta dinamicamente all'operazione in corso*/}
                <Text style = {styles.header}>{taskToEdit ? "MODIFICA ATTIVITA' / SESSIONE" : "NUOVA ATTIVITA' / SESSIONE"}</Text>
                <Text style = {styles.dateText}>Data: {date}</Text>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 20}}
            >
                {/*SELETTORE DI MACRO-CATEGORIA PER INSERIRE SESSIONI O ATTIVITA' */}
                <Text style = {styles.label}> TIPOLOGIA PIANIFICAZIONE </Text>
                <View style={styles.typeRow}>
                    <TouchableOpacity 
                        style={[styles.typeBtn, type === 'attivita' && styles.typeBtnActive]}
                        onPress = { () => setType('attivita')}>
                            <Text style={{color: type === 'attivita' ? 'white' : 'black', fontWeight: 'bold'}}>
                                Attività
                            </Text>  
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={[styles.typeBtn, type === 'sessione' && styles.typeBtnActive]}
                        onPress = { () => {
                            setType('sessione');
                            //se si passa nella sezione di aggiunta di una sessione e precedentemente è stato selezionato
                            // 'Nessuna', allora la variabile di stato sessionType viene resettata al valore 'Studio'
                            if (sessionType === 'Nessuna'){
                                setSessionType('Studio');
                            }
                        }}>
                            <Text style={{color: type === 'sessione' ? 'white' : 'black', fontWeight: 'bold'}}>
                                Sessione
                            </Text>  
                    </TouchableOpacity>
                </View>

                <Text style = {styles.label}> DETTAGLI PIANIFICAZIONE </Text>
                {/*Input per il titolo
                    -la props onChangeText è una funzione di callback (gestore di eventi) che viene invocata automaticamente dal sistema
                    ogni singola volta che il testo all'interno del textInput cambia, ovvero quando l'utente digita un nuovo carattere,
                      ne cancella uno esistente o incolla del testo. Poiché onChangeText={setTitle}, la stringa scritta nel TextInput viene inoltrata 
                      istantaneamente alla state setter function setTitle. Lo stato title si aggiorna, forzando un micor-rendering che mostra il valore aggiornato
                      nel campo grazie a value={title}
                    - la props value rappresenta il contenuto attuale del campo di testo; solitamente è collegato
                    a una variabile di stato (in questo caso title)

                */}
                <TextInput placeholder = "Titolo" placeholderTextColor = "#7c7c80" style={styles.input} onChangeText={setTitle} value={title} />

                {/*Input per la descrizione*/}
                <TextInput placeholder="Descrizione breve" placeholderTextColor = "#7c7c80" style={styles.input} onChangeText = {setDesc} value={desc} />

                {type === 'attivita' && (
                    <View style={{ marginBottom: 10 }}>
                    <Text style={styles.label}>DATA SVOLGIMENTO ATTIVITÀ (AAAA-MM-GG) *</Text>
                    <TextInput 
                        placeholder="Es: 2026-05-29" 
                        placeholderTextColor="#7c7c80" 
                        style={styles.input} 
                        onChangeText={setActivityDate} 
                        value={activityDate} 
                    />
                </View>
                )}

                {/* Selettore dell'unità di durata per le sessioni, mostrato solo se type === 'sessione' */}
                { type === 'sessione' && (
                    <View style={{ marginBottom: 15 }}>
                        <Text style={[styles.label, {marginTop: 5, marginBottom: 5}]}>DURATA SESSIONE</Text>
                        <View style = {styles.typeRow}>
                            <TouchableOpacity
                                // se l'utente ha selezionato 'In ore' , viene applicato, oltre a styles.typeBtn (lo stile base), anche
                                // lo stile typeBtnActive; {height : 35} è un inline style fisso
                                style = {[styles.typeBtn, durationUnit === 'ore' && styles.typeBtnActive, {height: 35}]}
                                onPress={() => setDurationUnit('ore')}
                            >
                                <Text style={{ color: durationUnit === 'ore' ? 'white' : 'black', fontSize: 13}}>In Ore</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                 // se l'utente ha selezionato 'In giorni' , viene applicato, oltre a styles.typeBtn (lo stile base), anche
                                // lo stile typeBtnActive; {height : 35} è un inline style fisso
                               style={[styles.typeBtn, durationUnit === 'giorni' && styles.typeBtnActive, { height: 35 }]}
                               onPress={() => setDurationUnit('giorni')}
                            >
                                <Text style={{ color: durationUnit === 'giorni' ? 'white' : 'black', fontSize: 13}}>In Giorni</Text>   

                            </TouchableOpacity>
                        </View>
                    </View>
                )}

                {/*Input per tempo stimato ed effettivo dell'attività: i tempi stimati ed effettivi compaiono solo per
                le attività; in particolare: 
                    - il tempo stimato compare sempre se il tipo è 'attività';
                    - il tempo effettivo compare SOLO se il tipo è 'attività' E siamo in modalità modifica, poiché all'atto
                        del primo inserimento il tempo reale non è ancora quantificabile
                    
                  Caso A: è un'attività o una sessione che espressa in ORE*/}
                {((type === 'attivita') || (type === 'sessione' && durationUnit === 'ore')) && (
                    <View style = {styles.row}>
                        <TextInput 
                            placeholder={type === 'attivita' ? "Tempo Stimato (h)" : "Durata Sessione (h)"} 
                            placeholderTextColor = "#7c7c80"
                            keyboardType="numeric" 
                            style={[styles.input, {flex: 1, marginRight: 5 }]} 
                            onChangeText={setEstTime} 
                            value={estTime}/>

                    {type === 'attivita' && taskToEdit && (
                        <TextInput 
                            placeholder="Tempo Effettivo (h)" 
                            placeholderTextColor = "#7c7c80"
                            keyboardType= "numeric" 
                            style={[styles.input, {flex: 1, marginRight: 5}]} 
                            onChangeText={setActTime} 
                            value={actTime} />
                    )}
                    </View>
                )}  

                {/*Caso B: è una sessione espressa in GIORNI*/}
                {type === 'sessione' && durationUnit === 'giorni' && (
                    <View style={styles.row}>
                        <TextInput
                            placeholder="Data Inizio (AAAA-MM-GG)"
                            placeholderTextColor="#7c7c80"
                            style={[styles.input, { flex: 1, marginRight: 5}]}
                            onChangeText={setStartDate}
                            value={startDate}
                            />
                        <TextInput
                            placeholder="Data Fine (AAAA-MM-GG)"
                            placeholderTextColor="#7c7c80"
                            style={[styles.input, {flex: 1}]}
                            onChangeText={setEndDate}
                            value={endDate}
                        />  
                        <TextInput
                            placeholder="Durata Sessione (giorni)"
                            placeholderTextColor="#7c7c80"
                            keyboardType="numeric"
                            style={styles.input}
                            onChangeText={setEstDays}
                            value={estDays}
                        />       
                    </View>
                )}
                {/*Input per le note aggiuntive*/}
                <TextInput placeholder="Note aggiuntive" placeholderTextColor = "#7c7c80" multiline style={[styles.input, {height: 60}]} onChangeText={setNotes} value = {notes}/>

                {/*Corso associato*/}
                <Text style = {styles.label}>CORSO ASSOCIATO (OPZIONALE)</Text>
                {/*la proprietà horizontal permette all'utente di scorrere verso destra e sinsitra per vedere tutti i corsi
                    impostando showHorizontalScrollIndicator a false, la barra di scorrimento viene nascosta

                    IL metodo .map prende l'array courses e trasforma ogni oggetto in un componente TouchableOpacity
                    La proprieta key di TouchableOpacity serve a identificare univocamente ogni elemento della lista,
                    permettendo a React di aggiornare solo l'elemento che cambia senza dover ridisegnare l'intera interfaccia

                    Quando l'utente tocca il Tab (detto anche Chip) viene chiamata la funzione setSelectedCourse, a cui viene passato il
                    nome del corso corrente: questo comunica al resto dell'app quale corso è attualmente attivo

                    Per quanto rigurda lo stile, se il corso rappresentato da questo pulsante interattivo o Tab 
                    è quello selezionato, viene applicato anche lo stile styles.chipActive, altrimenti lo stile extra viene ignorayo

                    Per quanto riguarda lo stile del testo, se il Tab è selezionato, il testo diventa bianco , altrimenti
                    il testo rimane nero
                */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
                    
                    {/*Opzione NESSUNO per attività/sessioni trasversali*/}
                    <TouchableOpacity
                        onPress={() => setSelectedCourse('Nessuno')}
                        style={[styles.chip, selectedCourse === 'Nessuno' && styles.chipActive]}
                        >
                           <Text style={{ color: selectedCourse === 'Nessuno' ? 'white' : 'black' }}>
                                Nessuno
                            </Text>  

                    </TouchableOpacity>

                    {/*Renderizzazione dei corsi presenti nel sistema*/}
                    {courses.map((c) => (
                        //TouchableOpacity rende qualsiasi elemento dell'interfaccia "cliccabile" o "interattivo".
                        //E' un wrapper, in quanto serve a racchiudere altri componenti per intercettare i tocchi dell'utente
                        //la props onPress è la funzione che viene eseguita quando l'utente tocca e rilascia l'eleemnto
                        <TouchableOpacity key={c.id} onPress = {() => setSelectedCourse(c.nome)} style={[styles.chip, selectedCourse === c.nome && styles.chipActive]}>
                            <Text style={{color: selectedCourse === c.nome ? 'white' : 'black'}}>{c.nome}</Text>
                        </TouchableOpacity>

                    ))}


                </ScrollView> 
                
                {/*Tipo di Sessione*/}
                <Text style={styles.label}>
                    {type === 'sessione' ? "TIPOLOGIA SESSIONE" : "SESSIONE ASSOCIATA (OPZIONALE)"}
                </Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
                      {[ 'Nessuna', 'Studio', 'Ripasso', 'Esercitazione', 'Laboratorio']
                      //filtro dinamico: se si sta aggiungendo una sessione, si rimuove l'opzione 'Nessuna' dalle opzioni
                      // cliccabili mediante il metodo filter
                      //se si sta inserendo un'attività, la prima parte della condizione (type === 'attivita') è soddisfatta;
                      // di conseguenza l'operatore OR || interrompe il controllo e restituisce true per tutti gli elementi della lista
                      // se si sta inserendo una sessione , l'operatore OR si sposta a valutare la seconda parte della condizione
                      // (ovvero t !== 'Nessuna') la seconda parte della condizione restituisce falso quando si incontra l'opzione 'Nessuna', che 
                      // viene di conseguenza esclusa dal rendering
                      .filter(t => type === 'attivita' || t !== 'Nessuna')
                      .map((t) =>(
                        <TouchableOpacity key={t} onPress = {() => setSessionType(t)} style = {[styles.chip, sessionType === t && {backgroundColor: Colors.primary}]}> 
                              <Text style = {{color: sessionType === t ? 'white' : 'black'}}>{t}</Text>
                        </TouchableOpacity> 
                      ))}
                </ScrollView>  
                
                {/*Priorità dell'attività - Rendering condizionale inline: la priorità viene mostrata 
                     e configurata solo per le attività*/}
                {type === 'attivita' && (
                   <View>
                        <Text style = {styles.label}>PRIORITA'</Text>
                        <View style = {styles.priorityRow}>
                            {(['Bassa', 'Media', 'Alta'] as const).map((p) => (
                                <TouchableOpacity key={p} onPress={ () => setPriority(p)} style={[styles.priorityBtn, priority === p && {backgroundColor: Colors.primary}]}>
                                    <Text style = {{color: priority === p ? 'white' : 'black'}} > {p}</Text>
                                </TouchableOpacity>
                        ))}
                    </View>
                 </View>
                )}
            </ScrollView>
                
            {/*Pulsante di salvataggio finale adattivo*/}
            <TouchableOpacity style = {styles.btnSave} onPress={handleSave}>
                    <Text style = {styles.btnSaveText}>
                        {taskToEdit ? "AGGIORNA ATTIVITA'/SESSIONE" : "PIANIFICA ATTIVITA'/SESSIONE"}
                    </Text>
            </TouchableOpacity>
        </View>
     </Modal>
   );
};

const styles = StyleSheet.create({
    modalMargin: { margin: 0},
    content: { backgroundColor: 'white', flex: 1, marginTop: 80, padding: 25, borderTopLeftRadius: 30, borderTopRightRadius: 30},
    closeButton: {
        position: 'absolute',
        top: 15,
        right: 15,
        backgroundColor: '#f0f0f0', 
        width: 30,
        height: 30,
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10 //mantiene il pulsante al di sopra di altri testi o elementi dello sfondo
    },
    closeButtonText: {
        fontSize: 14,
        color: '#666',
        fontWeight: 'bold'
    },
    header: { fontSize: 20, fontWeight: 'bold', textAlign: 'center', marginBottom: 5},
    dateText: {textAlign: 'center', color: Colors.textGray, marginBottom: 15},
    input: {backgroundColor: '#f0f2f5', borderRadius: 10, padding: 12, marginBottom: 10 },
    label: {fontSize: 11, fontWeight: 'bold', marginBottom: 5, color: Colors.textGray},
    row: {flexDirection: 'row'},
    chipScroll: {marginBottom: 15},
    chip: { padding: 10, backgroundColor: '#eee', borderRadius: 20, marginRight: 8, height: 40 },
    chipActive : { backgroundColor: Colors.primary},
    priorityRow: {flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20},
    priorityBtn: {flex: 1, padding: 10, alignItems: 'center', backgroundColor: '#eee', borderRadius: 10, marginHorizontal: 2 },
    btnSave: {backgroundColor: Colors.primary, padding: 18, borderRadius: 15, alignItems: 'center'},
    btnSaveText : {color: 'white', fontWeight: 'bold', fontSize: 16},
    typeRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        backgroundColor: '#f0f2f5',
        borderRadius: 12,
        padding: 4,
        marginBottom: 15
    },
    typeBtn: {
        flex: 1,
        paddingVertical: 10,
        alignItems: 'center',
        borderRadius: 10
    },
    typeBtnActive: {
        backgroundColor: Colors.primary,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1},
        shadowOpacity: 0.2,
        shadowRadius: 1.41
    }
});

export default AddTaskModal;



