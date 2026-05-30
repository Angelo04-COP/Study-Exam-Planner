// src/navigation/AppNavigator.tsx
import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useNavigation } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import CourseDetailScreen from '../screens/CourseDetailScreen';

import AcademicScreen from '../screens/AcademicScreen';
import DashboardScreen from '../screens/DashboardScreen'; 
import PlanningScreen from '../screens/PlanningScreen';
import TimerScreen from '../screens/TimerScreen';

import AddCorsoScreen from '../screens/add/AddCorsoScreen';
import AddEsameScreen from '../screens/add/AddEsameScreen';
import AddSceltaScreen from '../screens/add/AddTaskScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const CustomTabBarButton = ({ children, onPress }: any) => (
  <TouchableOpacity
    style={{
      top: -20, 
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
      backgroundColor: '#177AD5',
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

function TabNavigator() {
  const [isAddMenuVisible, setAddMenuVisible] = useState(false);
  const navigation = useNavigation<any>();

  // Chiusura del modale e navigazione verso la schermata scelta
  const navigateAndClose = (screenName: string, params?: any) => {
  setAddMenuVisible(false);
  
  setTimeout(() => {
    navigation.navigate(screenName, params);
  }, 100); 
  };

  return (
    <>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarShowLabel: false,
          tabBarStyle: {
            height: 60,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            backgroundColor: '#ffffff',
            position: 'absolute',
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
 
        <Tab.Screen name="Dashboard" component={DashboardScreen} />
        <Tab.Screen name="Planner" component={PlanningScreen} />

        <Tab.Screen
          name="AddTab"
          component={View} 
          options={{
            tabBarIcon: () => (
              <Ionicons name="add" size={32} color="white" />
            ),

            tabBarButton: (props) => (
              <CustomTabBarButton {...props} onPress={() => setAddMenuVisible(true)} />
            )
          }}
        />

        <Tab.Screen name="Academic" component={AcademicScreen} />
        <Tab.Screen name="Timer" component={TimerScreen} />
      </Tab.Navigator>

      <Modal visible={isAddMenuVisible} transparent={true} animationType="fade">
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setAddMenuVisible(false)} 
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

export default function AppNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="MainTabs"
        component={TabNavigator}
        options={{ headerShown: false }}
      />

      <Stack.Screen name="AddCorso" component={AddCorsoScreen} options={{ title: 'Nuovo Corso', headerShown: true, headerBackTitle: 'Indietro'}} />
      <Stack.Screen name="AddEsame" component={AddEsameScreen} options={{ title: 'Nuovo Esame', headerShown: true, headerBackTitle: 'Indietro'}} />
      <Stack.Screen name="AddScelta" component={AddSceltaScreen} options={{ title: 'Pianifica', headerShown: false, headerBackTitle: 'Indietro'}} />

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


const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)', 
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  modalMenu: {
    backgroundColor: 'white',
    width: '85%',
    borderRadius: 20,
    padding: 20,
    marginBottom: 100, 
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