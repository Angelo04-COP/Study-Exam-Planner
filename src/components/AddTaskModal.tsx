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
    name: string;
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
    //tempo stimato
    const [estTime, setEstTime] = useState('');
    //tempo effettivamente impiegato
    const [actTime, setActTime] = useState('');
    //note aggiuntive
    const [notes, setNotes] = useState('');
    //stato per gestire la selezione della tipologia ('sessione' o 'attivita');
    // di default il valore iniziale dello stato è 'attivita'
    const [type, setType] = useState<'attivita' | 'sessione'> ('attivita')


    //si imposta l'effetto useEffect per intercettare l'apertura e il tipo di operazione (INSERIMENTO O MODIFICA)
    useEffect(() => {
        if (taskToEdit) {
            //Modalità MODIFICA: i valori salvati vengono ripristinati
            setTitle(taskToEdit.title);
            setType(taskToEdit.type);
            setDesc(taskToEdit.desc || '');
            setPriority(taskToEdit.priority);
            setNotes(taskToEdit.notes || '');
            setSessionType(taskToEdit.sessionType || 'Nessuna');

            //i tempi effettivi e reali vengono pre-compilati solo se l'elemento è un'attività
            if(taskToEdit.type === 'attivita') {
                //nel file principale i dati sono in minuti, qui il dividiamo per 60 
                //per mostrarli in ore nel TextInput
                setEstTime(taskToEdit.estimatedTime ? (taskToEdit.estimatedTime / 60).toString() : '');
                setActTime(taskToEdit.actualTime ? (taskToEdit.actualTime / 60).toString() : '');
            }else {
                setEstTime('');
                setActTime('');

            }
            //si recupera il nome del corso partendo dal suo ID
            const corsoAssociato = courses.find(c => c.id == taskToEdit.course_id);
            if (corsoAssociato) {
                setSelectedCourse(corsoAssociato.name);
            } else {
                setSelectedCourse('');

            }
        } else {
            //Modalità INSERIMENTO NUOVO ELEMENTO: tutti i campi puliti vengono completamente resettati
            setTitle('');
            setDesc('');
            setType('attivita');
            setPriority('Media');
            setSessionType('Studio');
            setEstTime('');
            setActTime('');
            setNotes('');
            setSelectedCourse('');


        }
    }, [taskToEdit, isVisible]);

    const handleSave = () => {
        if(!title.trim()) return;
        
        //invio dell'oggetto completo al componente padre
        onSave({
            title,
            desc,
            course: selectedCourse,
            date, 
            //le sessioni usano un valore neutro di default per la priorità
            priority: type === 'sessione' ? 'Media' : priority,
            //si passa il valore calcolato di sessionType se il macro-tipo è 'sessione'
            // OPPURE se è un'attivita che ha una sessione associata (diversa da 'Nessuna')
            sessionType: sessionType === 'Nessuna' ? undefined : sessionType,
            estimatedTime: estTime,
            actualTime: actTime,
            notes,
            //comunica se salvare come attività o sessione
            type,
            isCompleted: false

        });
        
        //chiudiamo il modal dopo il salvataggio
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
                {/*Il titolo superiore si adatta dinamicamente all'operazione in corso*/}
                <Text style = {styles.header}>{taskToEdit ? "MODIFICA ELEMENTO" : "NUOVA ATTIVITA' / SESSIONE"}</Text>
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
                                Attività/Obiettivo
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
                    -la props onChangeText è un evento che viene attivato ogni volta che l'utente digita o cancella
                    un caratter
                    - la props value rappresenta il contenuto attuale del campo di testo; solitamente è collegato
                    a una variabile di stato

                */}
                <TextInput placeholder = "Titolo" style={styles.input} onChangeText={setTitle} value={title} />

                {/*Input per la descrizione*/}
                <TextInput placeholder="Descrizione breve" style={styles.input} onChangeText = {setDesc} value={desc} />

                {/*Input per tempo stimato ed effettivo dell'attività: i tempi stimati ed effettivi compaiono solo per
                le attività*/}
                {type === 'attivita' && (
                <View style = {styles.row}>
                    <TextInput placeholder="Tempo Stimato (h)" keyboardType="numeric" style={[styles.input, {flex: 1, marginRight: 5 }]} onChangeText={setEstTime} value={estTime}/>
                    <TextInput placeholder="Tempo Effettivo (h)" keyboardType= "numeric" style={[styles.input, {flex: 1, marginRight: 5}]} onChangeText={setActTime} value={actTime} />
                </View>
                )}  
                {/*Input per le note aggiuntive*/}
                <TextInput placeholder="Note aggiuntive" multiline style={[styles.input, {height: 60}]} onChangeText={setNotes} value = {notes}/>

                {/*Corso associato*/}
                <Text style = {styles.label}>CORSO ASSOCIATO</Text>
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
                    
                    {courses.map((c) => (
                        //TouchableOpacity rende qualsiasi elemento dell'interfaccia "cliccabile" o "interattivo".
                        //E' un wrapper, in quanto serve a racchiudere altri componenti per intercettare i tocchi dell'utente
                        //la props onPress è la funzione che viene eseguita quando l'utente tocca e rilascia l'eleemnto
                        <TouchableOpacity key={c.id} onPress = {() => setSelectedCourse(c.name)} style={[styles.chip, selectedCourse === c.name && styles.chipActive]}>
                            <Text style={{color: selectedCourse === c.name ? 'white' : 'black'}}>{c.name}</Text>
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



