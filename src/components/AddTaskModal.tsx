/**
 * Componente "Pop-up" per l'inserimento dei task.
 * E' un componente controllato: riceve la data selezionata 
 * dal calendario come "prop" e restituisce i dati inseriti 
 * tramite una funzione onSave
 * 
 */
import React from 'react';
import {useState} from 'react';
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
    onSave: (task: any) => void;
    date: string;
    //proprietà courses è array di corsi
    courses: Course[]
}

const AddTaskModal = ({isVisible, onClose, onSave, date, courses}: AddTaskModalProps) => {
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

    const handleSave = () => {
        if(!title.trim()) return;
        
        //invio dell'oggetto completo al componente padre
        onSave({
            title,
            desc,
            course: selectedCourse,
            date, 
            priority,
            sessionType,
            estimatedTime: estTime,
            actualTime: actTime,
            notes,
            isCompleted: false

        });

        //reset dei campi
        setTitle('');
        setDesc('');
        setSelectedCourse('');
        setEstTime('');
        setActTime('');
        setNotes('');

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
                <Text style = {styles.header}>NUOVA ATTIVITA' / SESSIONE</Text>
                <Text style = {styles.dateText}>Data: {date}</Text>

                {/*Input per il titolo
                    -la props onChangeText è un evento che viene attivato ogni volta che l'utente digita o cancella
                    un caratter
                    - la props value rappresenta il contenuto attuale del campo di testo; solitamente è collegato
                    a una variabile di stato

                */}
                <TextInput placeholder = "Titolo (es: Studio Cap.1) " style={styles.input} onChangeText={setTitle} value={title} />

                {/*Input per la descrizione*/}
                <TextInput placeholder="Descrizione breve" style={styles.input} onChangeText = {setDesc} value = {desc} />

                {/*Input per tempo stimato ed effettivo dell'attività*/}
                <View style = {styles.row}>
                    <TextInput placeholder="Tempo Stimato (h)" keyboardType="numeric" style={[styles.input, {flex: 1, marginRight: 5 }]} onChangeText={setEstTime}/>
                    <TextInput placeholder="Tempo effettivo (h)" keyboardType= "numeric" style={[styles.input, {flex: 1, marginRight: 5}]} onChangeText={setActTime} />
                </View>
                
                {/*Input per le note aggiuntive*/}
                <TextInput placeholder="{Note aggiuntive" multiline style={[styles.input, {height: 60}]} onChangeText={setNotes} />

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
                <Text style={styles.label}>TIPO SESSIONE</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
                      {['Studio', 'Ripasso', 'Esercitazione', 'Laboratorio'].map((t) =>(
                        <TouchableOpacity key={t} onPress = {() => setSessionType(t)} style = {[styles.chip, sessionType === t && {backgroundColor: Colors.primary}]}> 
                              <Text style = {{color: sessionType === t ? 'white' : 'black'}}>{t}</Text>
                        </TouchableOpacity> 
                      ))}
                </ScrollView>  
                
                {/*Priorità dell'attività*/}
                <Text style = {styles.label}>PRIORITA'</Text>
                <View style = {styles.priorityRow}>
                    {(['Bassa', 'Media', 'Alta'] as const).map((p) => (
                        <TouchableOpacity key={p} onPress={ () => setPriority(p)} style={[styles.priorityBtn, priority === p && {backgroundColor: Colors.primary}]}>
                           <Text style = {{color: priority === p ? 'white' : 'black'}} > {p}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
                
                <TouchableOpacity style = {styles.btnSave} onPress={handleSave}>
                        <Text style = {styles.btnSaveText}>PIANIFICA ATTIVITA'</Text>
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
    btnSaveText : {color: 'white', fontWeight: 'bold', fontSize: 16}


});

export default AddTaskModal;



