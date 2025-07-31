import { Tabs } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useAuth } from '@/contexts';


export default function TabLayout() {
  const { isAdmin } = useAuth();

  return (
    <Tabs
    screenOptions={{
        tabBarActiveTintColor: '#ffd33d',
        headerStyle: {
            backgroundColor: '#25292e',
        },
        headerShadowVisible: false,
        headerTintColor: '#fff',
        tabBarStyle: {
            backgroundColor: '#25292e',
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'home-sharp' : 'home-outline'} color={color} size={24} />
          ), headerShown: false
        }}
      />
      {isAdmin() && (
        <Tabs.Screen
          name="person"
          options={{
            title: 'Lista de Pessoas',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons name={focused ? 'people' : 'people-outline'} color={color} size={24} />
            ), headerShown: false
          }}
        />
      )}
      <Tabs.Screen
        name="new_schedule"
        options={{
          title: 'Novo Agendamento',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'calendar' : 'calendar-outline'} color={color} size={24} />
          ), headerShown: false
        }}
      />
    </Tabs>
  );
}