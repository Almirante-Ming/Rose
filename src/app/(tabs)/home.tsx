import { View, Text, FlatList, Modal, TouchableOpacity, Animated, Alert, Platform, NativeModules } from 'react-native';
import { useState, useEffect } from 'react';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import { Ionicons } from '@expo/vector-icons';
import { rose_home, rose_callendar } from '@/styles';
import { Note,NotesData,CalendarDay } from '@constants/types';
import { schedulesService } from '@/services';
import { useAuth } from '@/contexts';
import { rose_theme } from '@constants/rose_theme';


LocaleConfig.locales['pt'] = {
    monthNames: [
        'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ],
    monthNamesShort: [
        'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
        'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
    ],
    dayNames: [
        'Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 
        'Quinta-feira', 'Sexta-feira', 'Sábado'
    ],
    dayNamesShort: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'],
    today: 'Hoje'
};

const getSystemLocale = (): string => {
    let locale = 'pt';
    
    try {
        if (Platform.OS === 'ios') {
            locale = NativeModules.SettingsManager?.settings?.AppleLocale ||
                    NativeModules.SettingsManager?.settings?.AppleLanguages?.[0] || 'pt';
        } else {
            locale = NativeModules.I18nManager?.localeIdentifier || 'pt';
        }
        
        locale = locale.split(/[-_]/)[0].toLowerCase();
        
        if (locale === 'pt') {
            return 'pt';
        }

        return LocaleConfig.locales[locale] ? locale : 'en';
    } catch (error) {
        console.error(error);
        return 'en';
    }
};

LocaleConfig.defaultLocale = getSystemLocale();

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

    const formatDate = (dateString: string): string => {
        if (!dateString) return '...';
        const [year, month, day] = dateString.split('-');
        return `${day}/${month}/${year.slice(-2)}`;
    };

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
                    onDayPress={handleDayPress}
                    markedDates={{[selectedDate]: { selected: true, selectedColor: rose_theme.rose_lightest },}}
                    theme={rose_callendar}
                    monthFormat={'MMMM yyyy'}
                    disableMonthChange={false}
                    firstDay={0}
                    hideDayNames={false}
                    showWeekNumbers={false}
                    disableArrowLeft={false}
                    disableArrowRight={false}
                    enableSwipeMonths={true}
                />
            </View>
            
            <View style={rose_home.notesSection}>
                <Text style={rose_home.notesSectionTitle}>
                    {selectedDate ? `Aulas do dia ${formatDate(selectedDate)}` : 'Próximas aulas'}
                </Text>

                {isLoading ? (
                    <Text style={rose_home.loadingText}>Carregando...</Text>
                ) : (
                    <View style={rose_home.notesListContainer}>
                        <FlatList
                            data={selectedDate ? notes[selectedDate] || [] : getNextFiveNotes()}
                            keyExtractor={(item, index) => selectedDate ? index.toString() : `${item.date}-${index}`}
                            showsVerticalScrollIndicator={false}
                            style={rose_home.notesList}
                            onScroll={handleScroll}
                            scrollEventThrottle={16}
                            renderItem={({ item }) => (
                                <TouchableOpacity 
                                    style={rose_home.noteCard}
                                    onPress={() => handleNotePress(item)}
                                >
                                    <View style={rose_home.noteCardLeft}>
                                        <Text style={rose_home.noteCardTime}>{item.tm_init}</Text>
                                        <Text style={rose_home.noteCardSubject}>{item.machine_name}</Text>
                                        {!selectedDate && (
                                            <Text style={rose_home.noteCardDate}>{formatDate((item as any).date || item.dt_init)}</Text>
                                        )}
                                    </View>
                                    <View style={rose_home.noteCardRight}>
                                        <Text style={rose_home.noteCardLocation}>{item.customer_name}</Text>
                                    </View>
                                </TouchableOpacity>
                            )}
                            ListEmptyComponent={
                                selectedDate ? 
                                    <Text style={rose_home.emptyText}>Nenhuma aula registrada</Text> :
                                    <Text style={rose_home.emptyText}>Nenhuma aula encontrada</Text>
                            }
                        />
                        {((selectedDate ? notes[selectedDate] || [] : getNextFiveNotes()).length > 2 && !isScrolledToEnd) && (
                            <View style={rose_home.downArrowContainer}>
                                <Ionicons name="chevron-down" size={24} color="#FFFFFF" />
                            </View>
                        )}
                    </View>
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
                                        <Text style={rose_home.modalLabel}>Instrutor:</Text>
                                        <Text style={rose_home.modalValue}>{selectedNote.trainer_name}</Text>
                                    </View>
                                    <View style={rose_home.modalRow}>
                                        <Text style={rose_home.modalLabel}>Cliente:</Text>
                                        <Text style={rose_home.modalValue}>{selectedNote.customer_name}</Text>
                                    </View>
                                    <View style={rose_home.modalRow}>
                                        <Text style={rose_home.modalLabel}>tipo:</Text>
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