import { View, Text, FlatList, Modal, TouchableOpacity, Animated } from 'react-native';
import { useState, useEffect } from 'react';
import { Calendar } from 'react-native-calendars';
import { rose_home, rose_callendar } from '@/styles';
import { Note,NotesData,CalendarDay } from '@constants/types';

export default function Home() {
    const [selectedDate, setSelectedDate] = useState<string>('');
    const [modalVisible, setModalVisible] = useState<boolean>(false);
    const [backgroundOpacity] = useState(new Animated.Value(0));
    const [notes, setNotes] = useState<NotesData>({});
    const [isLoading, setIsLoading] = useState<boolean>(false);

    useEffect(() => {
        setIsLoading(true);
        setTimeout(() => {
            setNotes({
                '2025-04-24': [
                    { time: '08:00', subject: 'Leg-Press', location: 'Instrutora: Mariana', note: '2 séries, 14 repetições' },
                    { time: '08:40', subject: 'Elevacao lateral', location: 'Instrutora: Juliano', note: '4 séries, 12 repetições' },
                    
                ],
                '2025-04-26': [
                    { time: '09:15', subject: 'Checkup', location: 'Laboratório A', note: 'jejum de 6 horas antes do exame' },
                    { time: '13:40', subject: 'ED. FIsica', location: 'Sala 10', note: 'intervalo de 3 minutos entre as duas series' },
                ],
            });
            setIsLoading(false);
        }, 1000);
    }, []);

    const formatDate = (dateString: string): string => {
        if (!dateString) return '...';
        const [year, month, day] = dateString.split('-');
        return `${day}/${month}/${year.slice(-2)}`;
    };

    const handleDayPress = (day: CalendarDay) => {
        setSelectedDate(day.dateString);
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
        }).start(() => setModalVisible(false));
    };

    return (
        <View style={rose_home.container}>
            <Calendar
                onDayPress={handleDayPress}
                markedDates={{[selectedDate]: { selected: true, selectedColor: '#FF6347' },}}
                theme={rose_callendar}
            />
            
            <Modal
                visible={modalVisible}
                transparent
                animationType="slide"
                onRequestClose={closeModal}
            >
                <Animated.View style={[rose_home.modalBackground, { opacity: backgroundOpacity }]} />
                <TouchableOpacity style={rose_home.modalWrapper} activeOpacity={1} onPress={closeModal}>
                    <View style={rose_home.modalContainer}>
                        <Text style={rose_home.title}>Aulas do dia {formatDate(selectedDate)}</Text>

                        {isLoading ? (
                            <Text style={rose_home.loadingText}>Carregando...</Text>
                        ) : (
                            <FlatList
                                data={notes[selectedDate] || []}
                                keyExtractor={(_, index) => index.toString()}
                                showsVerticalScrollIndicator={false}
                                renderItem={({ item }) => (
                                    <View style={rose_home.card}>
                                        <View style={rose_home.cardLeft}>
                                            <Text style={rose_home.cardTime}>{item.time}</Text>
                                            <Text style={rose_home.cardSubject}>{item.subject}</Text>
                                        </View>
                                        <View style={rose_home.cardRight}>
                                            <Text style={rose_home.cardLocation}>{item.location}</Text>
                                            <Text style={rose_home.cardNote}>{item.note}</Text>
                                        </View>
                                    </View>
                                )}
                                ListEmptyComponent={<Text style={rose_home.emptyText}>Nenhuma aula encontrada</Text>}
                            />
                        )}
                    </View>
                </TouchableOpacity>
            </Modal>
        </View>
    );
}