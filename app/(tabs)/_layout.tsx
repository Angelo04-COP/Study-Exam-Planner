import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { StyleSheet, View } from 'react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: '#177AD5',
        tabBarInactiveTintColor: '#94a3b8',
      }}>
      
      {/* collegamento alla pagina principale (Dashboard e statistiche) */}
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ color }) => (
            <Ionicons name="stats-chart" color={color} size={28} />
          ),
        }}
      />

      {/* Collegamento alla pagina degli studi (Corsi ed Esami) */}
      <Tabs.Screen
        name="academic"
        options={{
          tabBarIcon: ({ color }) => (
            <Ionicons name="school" color={color} size={28} />
          ),
        }}
      />

      {/* Collegamento ai modali per aggiungere elementi (Corsi, Esami, Sessioni, attività) */}
      <Tabs.Screen
        name="add"
        options={{
          tabBarIcon: () => (
            <View style={styles.floatingButton}>
              <Ionicons name="add" color="white" size={38} />
            </View>
          ),
        }}
      />

      {/* Collegamento alla pagina per la pianificazione (Calendario e Sessioni e attività) */}
      <Tabs.Screen
        name="planner"
        options={{
          tabBarIcon: ({ color }) => (
            <Ionicons name="calendar" color={color} size={28} />
          ),
        }}
      />

      {/* collegamento alla pagina del timer (Focus e Pomodoro) */}
      <Tabs.Screen
        name="timer"
        options={{
          tabBarIcon: ({ color }) => (
            <Ionicons name="timer-outline" color={color} size={30} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    height: 75,
    backgroundColor: 'white',
    borderTopWidth: 0,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    paddingBottom: 10,
  },
  floatingButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#177AD5',
    justifyContent: 'center',
    alignItems: 'center',
    top: -15, // Solleva il bottone rispetto alla barra per l'effetto FAB
    shadowColor: '#177AD5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  }
});
