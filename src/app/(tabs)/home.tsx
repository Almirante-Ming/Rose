import { View, Text, FlatList, Modal, TouchableOpacity, Animated, Alert } from 'react-native';
import { useState, useEffect } from 'react';
import { Calendar } from 'react-native-calendars';
import { rose_home, rose_callendar } from '@/styles';
import { Note,NotesData,CalendarDay } from '@constants/types';
import { schedulesService } from '@/services';
import { useAuth } from '@/contexts';
import { rose_theme } from '@constants/rose_theme';

export default function Home() {
    const [selectedDate, setSelectedDate] = useState<string>('');
    const [modalVisible, setModalVisible] = useState<boolean>(false);
    const [selectedNote, setSelectedNote] = useState<Note | null>(null);
    const [backgroundOpacity] = useState(new Animated.Value(0));
    const [notes, setNotes] = useState<NotesData>({});
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const { isAuthenticated, user, logout } = useAuth();

    const fetchSchedules = async () => {
        setIsLoading(true);
        try {
            // Check if user is authenticated
            if (!isAuthenticated) {
                Alert.alert('Erro', 'Usuário não autenticado. Faça login novamente.');
                setIsLoading(false);
                return;
            }

            // Fetch schedules from API
            const schedulesData = await schedulesService.getUserSchedules();
            setNotes(schedulesData);
        } catch (error) {
            console.error('Error fetching schedules:', error);
            Alert.alert('Erro', 'Não foi possível carregar os agendamentos. Tente novamente.');
            
            // Fallback to mock data for development/testing
            setNotes({
                '2025-04-24': [
                    { dt_init: '2025-04-24', tm_init: '08:00', trainer_name: 'Mariana', customer_name: 'Cliente', machine_name: 'Leg-Press', message: '2 séries, 14 repetições' },
                    { dt_init: '2025-04-24', tm_init: '08:40', trainer_name: 'Juliano', customer_name: 'Cliente', machine_name: 'Elevação lateral', message: '4 séries, 12 repetições' },
                ],
                '2025-04-26': [
                    { dt_init: '2025-04-26', tm_init: '09:15', trainer_name: 'Dr. Silva', customer_name: 'Cliente', machine_name: 'Laboratório A', message: 'jejum de 6 horas antes do exame' },
                    { dt_init: '2025-04-26', tm_init: '13:40', trainer_name: 'Prof. Santos', customer_name: 'Cliente', machine_name: 'Sala 10', message: 'intervalo de 3 minutos entre as duas series' },
                ],
            });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchSchedules();
    }, []);

    const formatDate = (dateString: string): string => {
        if (!dateString) return '...';
        const [year, month, day] = dateString.split('-');
        return `${day}/${month}/${year.slice(-2)}`;
    };

    const handleDayPress = (day: CalendarDay) => {
        setSelectedDate(day.dateString);
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

    return (
        <View style={rose_home.container}>
            {/* Header with user info and logout */}
            <View style={rose_home.header}>
                <View style={rose_home.userInfo}>
                    <Text style={rose_home.welcomeText}>Olá, {user?.email || 'Usuário'}</Text>
                    <Text style={rose_home.roleText}>
                        {user?.role.name === 'admin' ? 'Administrador' : 
                         user?.role.name === 'trainer' ? 'Instrutor' : 'Usuário'}
                    </Text>
                </View>
                <TouchableOpacity style={rose_home.logoutButton} onPress={handleLogout}>
                    <Text style={rose_home.logoutText}>Sair</Text>
                </TouchableOpacity>
            </View>

            <Calendar
                onDayPress={handleDayPress}
                markedDates={{[selectedDate]: { selected: true, selectedColor: rose_theme.rose_lightest },}}
                theme={rose_callendar}
            />
            
            <View style={rose_home.notesSection}>
                <Text style={rose_home.notesSectionTitle}>
                    {selectedDate ? `Aulas do dia ${formatDate(selectedDate)}` : 'Selecione uma data'}
                </Text>

                {isLoading ? (
                    <Text style={rose_home.loadingText}>Carregando...</Text>
                ) : (
                    <FlatList
                        data={notes[selectedDate] || []}
                        keyExtractor={(_, index) => index.toString()}
                        showsVerticalScrollIndicator={false}
                        renderItem={({ item }) => (
                            <TouchableOpacity 
                                style={rose_home.noteCard}
                                onPress={() => handleNotePress(item)}
                            >
                                <View style={rose_home.noteCardLeft}>
                                    <Text style={rose_home.noteCardTime}>{item.tm_init}</Text>
                                    <Text style={rose_home.noteCardSubject}>{item.machine_name}</Text>
                                </View>
                                <View style={rose_home.noteCardRight}>
                                    <Text style={rose_home.noteCardLocation}>{item.customer_name}</Text>
                                </View>
                            </TouchableOpacity>
                        )}
                        ListEmptyComponent={
                            selectedDate ? 
                                <Text style={rose_home.emptyText}>Nenhuma aula encontrada</Text> :
                                <Text style={rose_home.emptyText}>Selecione uma data para ver as aulas</Text>
                        }
                    />
                )}
            </View>
            
            <Modal
                visible={modalVisible}
                transparent
                animationType="slide"
                onRequestClose={closeModal}
            >
                <Animated.View style={[rose_home.modalBackground, { opacity: backgroundOpacity }]} />
                <TouchableOpacity style={rose_home.modalWrapper} activeOpacity={1} onPress={closeModal}>
                    <View style={rose_home.modalContainer}>
                        {selectedNote && (
                            <>
                                <Text style={rose_home.modalTitle}>Detalhes da Aula</Text>
                                <View style={rose_home.modalContent}>
                                    <View style={rose_home.modalRow}>
                                        <Text style={rose_home.modalLabel}>Data:</Text>
                                        <Text style={rose_home.modalValue}>{selectedNote.dt_init}</Text>
                                    </View>
                                    <View style={rose_home.modalRow}>
                                        <Text style={rose_home.modalLabel}>Horário:</Text>
                                        <Text style={rose_home.modalValue}>{selectedNote.tm_init}</Text>
                                    </View>
                                    <View style={rose_home.modalRow}>
                                        <Text style={rose_home.modalLabel}>Treinador:</Text>
                                        <Text style={rose_home.modalValue}>{selectedNote.trainer_name}</Text>
                                    </View>
                                    <View style={rose_home.modalRow}>
                                        <Text style={rose_home.modalLabel}>Cliente:</Text>
                                        <Text style={rose_home.modalValue}>{selectedNote.customer_name}</Text>
                                    </View>
                                    <View style={rose_home.modalRow}>
                                        <Text style={rose_home.modalLabel}>Equipamento:</Text>
                                        <Text style={rose_home.modalValue}>{selectedNote.machine_name}</Text>
                                    </View>
                                    <View style={rose_home.modalRow}>
                                        <Text style={rose_home.modalLabel}>Observações:</Text>
                                        <Text style={rose_home.modalValue}>{selectedNote.message}</Text>
                                    </View>
                                </View>
                            </>
                        )}
                    </View>
                </TouchableOpacity>
            </Modal>
        </View>
    );
}