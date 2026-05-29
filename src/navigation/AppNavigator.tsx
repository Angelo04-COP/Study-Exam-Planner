// src/navigation/AngeloNavigator.tsx
import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useNavigation } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import CourseDetailScreen from '../screens/CourseDetailScreen';
// 1. IMPORT DELLE 4 SCHERMATE PRINCIPALI DEI TAB
import AcademicScreen from '../screens/AcademicScreen';
import DashboardScreen from '../screens/DashboardScreen'; // <-- Aggiunto il Cruscotto!
import PlanningScreen from '../screens/PlanningScreen';
import TimerScreen from '../screens/TimerScreen';

// 2. IMPORT DELLE SCHERMATE DI AGGIUNTA (Modali della collega)
import AddCorsoScreen from '../screens/add/AddCorsoScreen';
import AddEsameScreen from '../screens/add/AddEsameScreen';
import AddSceltaScreen from '../screens/add/AddSceltaScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// --- COMPONENTE CUSTOM: IL PULSANTE CENTRALE FLUTTUANTE ---
const CustomTabBarButton = ({ children, onPress }: any) => (
  <TouchableOpacity
    style={{
      top: -20, // Lo fa sporgere verso l'alto
      justifyContent: 'center',
      alignItems: 'center',
    }}
    onPress={onPress}
    activeOpacity={0.8}
  >
    <View style={{
      width: 60,
      height: 60,
      borderRadius: 30,
      backgroundColor: '#177AD5', // Il blu principale
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: '#177AD5',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.4,
      shadowRadius: 4,
      elevation: 5,
    }}>
      {children}
    </View>
  </TouchableOpacity>
);

// --- NAVIGATORE A SCHEDE (BOTTOM TABS) ---
function TabNavigator() {
  // Stato per gestire l'apertura del modale al click del "+"
  const [isAddMenuVisible, setAddMenuVisible] = useState(false);
  const navigation = useNavigation<any>();

  // Funzione che chiude il modale e naviga verso la schermata scelta
  const navigateAndClose = (screenName: string, params?: any) => {
  // 1. Chiudiamo prima il modale visivamente
  setAddMenuVisible(false);
  
  // 2. Ritardiamo leggermente la navigazione per permettere allo Stack 
  // di riprendere il controllo corretto della cronologia
  setTimeout(() => {
    navigation.navigate(screenName, params);
  }, 100); // 100 millisecondi bastano a garantire la stabilità dello Stack
};

  return (
    <>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarShowLabel: false, // Rimuove il testo sotto le icone per un look più moderno
          tabBarStyle: {
            height: 60,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            backgroundColor: '#ffffff',
            position: 'absolute', // Necessario per far sporgere bene il tasto fluttuante
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -2 },
            shadowOpacity: 0.1,
            shadowRadius: 5,
            elevation: 10,
          },
          tabBarIcon: ({ focused, color }) => {
            let iconName: any;

            if (route.name === 'Dashboard') {
              iconName = focused ? 'home' : 'home-outline';
            } else if (route.name === 'Planner') {
              iconName = focused ? 'calendar' : 'calendar-outline';
            } else if (route.name === 'Academic') {
              iconName = focused ? 'school' : 'school-outline';
            } else if (route.name === 'Timer') {
              iconName = focused ? 'time' : 'time-outline';
            }

            return <Ionicons name={iconName} size={26} color={color} />;
          },
          tabBarActiveTintColor: '#177AD5',
          tabBarInactiveTintColor: '#94a3b8',
        })}
      >
        {/* TAB 1 e 2 */}
        <Tab.Screen name="Dashboard" component={DashboardScreen} />
        <Tab.Screen name="Planner" component={PlanningScreen} />

        {/* TAB 3: IL TASTO PIÙ CENTRALE */}
        <Tab.Screen
          name="AddTab"
          component={View} // Usiamo una View vuota perché intercettiamo il click con onPress
          options={{
            tabBarIcon: () => (
              <Ionicons name="add" size={32} color="white" />
            ),
            // Qui iniettiamo il nostro pulsante fluttuante
            tabBarButton: (props) => (
              <CustomTabBarButton {...props} onPress={() => setAddMenuVisible(true)} />
            )
          }}
        />

        {/* TAB 4 e 5 */}
        <Tab.Screen name="Academic" component={AcademicScreen} />
        <Tab.Screen name="Timer" component={TimerScreen} />
      </Tab.Navigator>

      {/* --- IL MODALE DI SCELTA (Si apre solo cliccando il +) --- */}
      <Modal visible={isAddMenuVisible} transparent={true} animationType="fade">
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setAddMenuVisible(false)} // Chiude cliccando fuori
        >
          <View style={styles.modalMenu}>

            <TouchableOpacity style={styles.menuItem} onPress={() => navigateAndClose('AddCorso')}>
              <Ionicons name="book-outline" size={24} color="#177AD5" />
              <Text style={styles.menuText}>Aggiungi Corso</Text>
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity style={styles.menuItem} onPress={() => navigateAndClose('AddEsame')}>
              <Ionicons name="document-text-outline" size={24} color="#177AD5" />
              <Text style={styles.menuText}>Aggiungi Esame</Text>
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity style={styles.menuItem} onPress={() => navigateAndClose('AddScelta')}>
              <Ionicons name="list-outline" size={24} color="#177AD5" />
              <Text style={styles.menuText}>Pianifica Attività/Sessione</Text>
            </TouchableOpacity>

          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

// Navigatore radice a pila (Slide pag. 7, 25)
export default function AppNavigator() {
  return (
    <Stack.Navigator>
      {/* La schermata base contiene l'intera bottoniera dei Tab */}
      <Stack.Screen
        name="MainTabs"
        component={TabNavigator}
        options={{ headerShown: false }}
      />

      {/* Le tre schermate di aggiunta. */}
      <Stack.Screen name="AddCorso" component={AddCorsoScreen} options={{ title: 'Nuovo Corso', headerShown: true, headerBackTitle: 'Indietro'}} />
      <Stack.Screen name="AddEsame" component={AddEsameScreen} options={{ title: 'Nuovo Esame', headerShown: true, headerBackTitle: 'Indietro'}} />
      <Stack.Screen name="AddScelta" component={AddSceltaScreen} options={{ title: 'Pianifica', headerShown: true, headerBackTitle: 'Indietro' }} />

      {/* AGGIUNGI LA TUA NUOVA SCHERMATA QUI: */}
      <Stack.Screen
        name="CourseDetail"
        component={CourseDetailScreen}
        options={({ route }: any) => ({
          title: route.params?.isExam ? 'Dettaglio Esame' : 'Dettaglio Corso',
        })}

      />
    </Stack.Navigator>
  );
}

// --- STILI DEL MODALE ---
const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)', // Sfondo semi-trasparente scuro
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  modalMenu: {
    backgroundColor: 'white',
    width: '85%',
    borderRadius: 20,
    padding: 20,
    marginBottom: 100, // Lo posiziona esattamente sopra al pulsante fluttuante
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
  },
  menuText: {
    fontSize: 18,
    marginLeft: 15,
    color: '#333',
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 4,
  }
});