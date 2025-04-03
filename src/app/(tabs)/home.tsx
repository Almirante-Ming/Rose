import { CharmCalendar } from '@components/charm';
import { Text, View } from 'react-native';
import { rose_home } from '../../styles';


export default function Home() {
    return (
        <View style={rose_home.container}>
            <Text style={{ flex: 1,fontSize: 20, textAlign: 'center', marginTop: 50 }}>
                Edit app/tabs/index.tsx to edit this screen.
            </Text>
            <CharmCalendar />
        </View>
    )
}