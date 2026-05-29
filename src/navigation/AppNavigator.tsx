// src/navigation/AppNavigator.tsx
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

// 1. IMPORT DEGLI SCHERMI DEI TUOI COLLEGHI (Con le estensioni reali del tuo VS Code)
import PlanningScreen from '../screens/PlanningScreen';
import AcademicScreen from '../screens/AcademicScreen.js'; // Mantenuto .js come da screenshot
import TimerScreen from '../screens/TimerScreen';

// 2. IMPORT DEI TUOI SCHERMI (Focalizzati sul tasto "+")
import AddScreen from '../screens/AddScreen';
import AddCorsoScreen from '../screens/add/AddCorsoScreen';
import AddEsameScreen from '../screens/add/AddEsameScreen';
import AddSceltaScreen from '../screens/add/AddSceltaScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Navigatore inferiore a schede (Slide pag. 24-25)
function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: any;

          if (route.name === 'Planner') {
            iconName = focused ? 'calendar' : 'calendar-outline';
          } else if (route.name === 'Academic') {
            iconName = focused ? 'school' : 'school-outline';
          } else if (route.name === 'AddTab') {
            iconName = focused ? 'add-circle' : 'add-circle-outline';
          } else if (route.name === 'Timer') {
            iconName = focused ? 'time' : 'time-outline';
          }

          return <Ionicons name={iconName} size={size + 4} color={color} />;
        },
        tabBarActiveTintColor: '#177AD5',
        tabBarInactiveTintColor: 'gray',
      })}
    >
      <Tab.Screen name="Planner" component={PlanningScreen} />
      <Tab.Screen name="Academic" component={AcademicScreen} />
      <Tab.Screen name="AddTab" component={AddScreen} options={{ title: 'Aggiungi' }} />
      <Tab.Screen name="Timer" component={TimerScreen} />
    </Tab.Navigator>
  );
}

// Navigatore radice a pila (Slide pag. 7, 25)
export default function AppNavigator() {
  return (
    <Stack.Navigator>
      {/* La schermata base contiene l'intera botoniera dei Tab */}
      <Stack.Screen
        name="MainTabs"
        component={TabNavigator}
        options={{ headerShown: false }}
      />

      {/* Le tue tre schermate di aggiunta (si aprono sopra ai Tab a tutto schermo) */}
      <Stack.Screen name="AddCorso" component={AddCorsoScreen} options={{ title: 'Nuovo Corso' }} />
      <Stack.Screen name="AddEsame" component={AddEsameScreen} options={{ title: 'Nuovo Esame' }} />
      <Stack.Screen name="AddScelta" component={AddSceltaScreen} options={{ title: 'Pianifica Attività' }} />
    </Stack.Navigator>
  );
}