import { View, Text, TouchableOpacity, Animated, Alert } from 'react-native';
import { useState, useEffect } from 'react';
import { rose_home } from '@/styles';
import { Note, NotesData, CalendarDay } from '@constants/types';
import { schedulesService } from '@/services';
import { useAuth } from '@/contexts';
import { Calendar, ScheduleModal, ScheduleList } from '@/components';


export default function Home() {
    const [selectedDate, setSelectedDate] = useState<string>('');
    const [modalVisible, setModalVisible] = useState<boolean>(false);
    const [selectedNote, setSelectedNote] = useState<Note | null>(null);
    const [backgroundOpacity] = useState(new Animated.Value(0));
    const [notes, setNotes] = useState<NotesData>({});
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isScrolledToEnd, setIsScrolledToEnd] = useState<boolean>(false);

    const { isAuthenticated, user, logout } = useAuth();

    const fetchSchedules = async () => {
        setIsLoading(true);
        try {
            if (!isAuthenticated) {
                Alert.alert('Erro', 'Usuário não autenticado. Faça login novamente.');
                setIsLoading(false);
                return;
            }

            const schedulesData = await schedulesService.getUserSchedules();
            setNotes(schedulesData);
            setIsScrolledToEnd(false); // Reset scroll state when data is refreshed
        } catch (error) {
            console.error('Error fetching schedules:', error);
            Alert.alert('Erro', 'Não foi possível carregar os agendamentos. Tente novamente.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchSchedules();
    }, []);

    const handleDayPress = (day: CalendarDay) => {
        setSelectedDate(day.dateString);
        setIsScrolledToEnd(false); // Reset scroll state when date changes
    };

    const getNextFiveNotes = (): Note[] => {
        const today = new Date();
        const todayString = today.toISOString().split('T')[0];
        
        const allNotes: (Note & { date: string })[] = [];
        
        Object.keys(notes).forEach(date => {
            notes[date].forEach(note => {
                allNotes.push({ ...note, date });
            });
        });
        
        const upcomingNotes = allNotes
            .filter(note => note.date >= todayString)
            .sort((a, b) => {
                if (a.date !== b.date) {
                    return a.date.localeCompare(b.date);
                }
                return a.tm_init.localeCompare(b.tm_init);
            });
        
        return upcomingNotes.slice(0, 5);
    };

    const handleNotePress = (note: Note) => {
        setSelectedNote(note);
        setModalVisible(true);
        Animated.timing(backgroundOpacity, {
            toValue: 0.5,
            duration: 300,
            useNativeDriver: true,
        }).start();
    };

    const closeModal = () => {
        Animated.timing(backgroundOpacity, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
        }).start(() => {
            setModalVisible(false);
            setSelectedNote(null);
        });
    };

    const handleLogout = () => {
        Alert.alert(
            'Sair',
            'Tem certeza que deseja sair?',
            [
                {
                    text: 'Cancelar',
                    style: 'cancel'
                },
                {
                    text: 'Sair',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await logout();
                        } catch (error) {
                            console.error('Logout error:', error);
                        }
                    }
                }
            ]
        );
    };

    const handleScroll = (event: any) => {
        const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
        const isCloseToEnd = layoutMeasurement.height + contentOffset.y >= contentSize.height - 20;
        setIsScrolledToEnd(isCloseToEnd);
    };

    return (
        <View style={rose_home.container}>
            <View style={rose_home.header}>
                <View style={rose_home.userInfo}>
                    <Text style={rose_home.welcomeText}>Olá, {user?.email || 'Usuário'}</Text>
                    <Text style={rose_home.roleText}>
                        {user?.role.name === 'admin' ? 'Administrador' : 
                         user?.role.name === 'trainer' ? 'Instrutor':''}
                    </Text>
                </View>
                <TouchableOpacity style={rose_home.logoutButton} onPress={handleLogout}>
                    <Text style={rose_home.logoutText}>Sair</Text>
                </TouchableOpacity>
            </View>

            <View style={rose_home.calendarContainer}>
                <Calendar
                    selectedDate={selectedDate}
                    onDayPress={handleDayPress}
                />
            </View>
            
            <ScheduleList
                selectedDate={selectedDate}
                notes={selectedDate ? notes[selectedDate] || [] : getNextFiveNotes()}
                isLoading={isLoading}
                isScrolledToEnd={isScrolledToEnd}
                onNotePress={handleNotePress}
                onScroll={handleScroll}
            />
            
            <ScheduleModal
                visible={modalVisible}
                selectedNote={selectedNote}
                backgroundOpacity={backgroundOpacity}
                onClose={closeModal}
            />
        </View>
    );
}