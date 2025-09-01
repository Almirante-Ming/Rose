import { Tabs } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useAuth } from '@/contexts';

export default function TabLayout() {
  const { isAdmin } = useAuth();

  const screens = [
    {
      name: 'home',
      title: 'Home',
      icon: (color: string, focused: boolean) =>
        <Ionicons name={focused ? 'home-sharp' : 'home-outline'} color={color} size={24} />,
    },
    {
      name: 'new_schedule',
      title: 'Novo Agendamento',
      icon: (color: string, focused: boolean) =>
        <Ionicons name={focused ? 'calendar' : 'calendar-outline'} color={color} size={24} />,
    },
  ];

  if (isAdmin()) {
    screens.push(
      {
        name: 'person',
        title: 'Lista de Pessoas',
        icon: (color: string, focused: boolean) =>
          <Ionicons name={focused ? 'people' : 'people-outline'} color={color} size={24} />,
      },
      {
        name: 'machine_list',
        title: 'Lista de Atividades',
        icon: (color: string, focused: boolean) =>
          <Ionicons name={focused ? 'list' : 'list-outline'} color={color} size={24} />,
      }
    );
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#ffd33d',
        headerStyle: { backgroundColor: '#25292e' },
        headerShadowVisible: false,
        headerTintColor: '#fff',
        tabBarStyle: { backgroundColor: '#25292e' },
      }}
    >
      {screens.map(({ name, title, icon }) => (
        <Tabs.Screen
          key={name}
          name={name}
          options={{
            title,
            tabBarIcon: ({ color, focused }) => icon(color, focused),
            headerShown: false,
          }}
        />
      ))}
    </Tabs>
  );
}
