import { Tabs } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function AdminTabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#d32f2f',
        tabBarInactiveTintColor: '#888888',
        headerStyle: { backgroundColor: '#2a2a2a' },
        headerShadowVisible: false,
        headerTintColor: '#ffffff',
        tabBarStyle: { backgroundColor: '#1a1a1a', borderTopColor: '#d32f2f', borderTopWidth: 2 },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'home-sharp' : 'home-outline'} color={color} size={24} />
          ),
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="new_schedule"
        options={{
          title: 'Novo Agendamento',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'calendar' : 'calendar-outline'} color={color} size={24} />
          ),
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="person_list"
        options={{
          title: 'Pessoas',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'people' : 'people-outline'} color={color} size={24} />
          ),
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="machine_list"
        options={{
          title: 'Atividades',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'list' : 'list-outline'} color={color} size={24} />
          ),
          headerShown: false,
        }}
      />
    </Tabs>
  );
}
