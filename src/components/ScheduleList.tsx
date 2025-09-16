import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Note } from '@constants/types';
import { rose_home } from '@/styles';

interface ScheduleListProps {
    selectedDate: string;
    notes: Note[];
    isLoading: boolean;
    isScrolledToEnd: boolean;
    onNotePress: (note: Note) => void;
    onScroll: (event: any) => void;
}

export default function ScheduleList({ 
    selectedDate, 
    notes, 
    isLoading, 
    isScrolledToEnd,
    onNotePress, 
    onScroll 
}: ScheduleListProps) {
    const formatDate = (dateString: string): string => {
        if (!dateString) return '...';
        const [year, month, day] = dateString.split('-');
        return `${day}/${month}/${year.slice(-2)}`;
    };

    const sectionTitle = selectedDate 
        ? `Aulas do dia ${formatDate(selectedDate)}` 
        : 'Próximas aulas';

    const emptyMessage = selectedDate 
        ? 'Nenhuma aula registrada' 
        : 'Nenhuma aula encontrada';

    return (
        <View style={rose_home.notesSection}>
            <Text style={rose_home.notesSectionTitle}>
                {sectionTitle}
            </Text>

            {isLoading ? (
                <Text style={rose_home.loadingText}>Carregando...</Text>
            ) : (
                <View style={rose_home.notesListContainer}>
                    <FlatList
                        data={notes}
                        keyExtractor={(item, index) => selectedDate ? index.toString() : `${(item as any).date}-${index}`}
                        showsVerticalScrollIndicator={false}
                        style={rose_home.notesList}
                        onScroll={onScroll}
                        scrollEventThrottle={16}
                        renderItem={({ item }) => (
                            <TouchableOpacity 
                                style={rose_home.noteCard}
                                onPress={() => onNotePress(item)}
                            >
                                <View style={rose_home.noteCardLeft}>
                                    <Text style={rose_home.noteCardTime}>{item.tm_init}</Text>
                                    <Text style={rose_home.noteCardSubject}>{item.machine_name}</Text>
                                    {!selectedDate && (
                                        <Text style={rose_home.noteCardDate}>
                                            {formatDate((item as any).date || item.dt_init)}
                                        </Text>
                                    )}
                                </View>
                                <View style={rose_home.noteCardRight}>
                                    <Text style={rose_home.noteCardLocation}>{item.customer_name}</Text>
                                </View>
                            </TouchableOpacity>
                        )}
                        ListEmptyComponent={
                            <Text style={rose_home.emptyText}>{emptyMessage}</Text>
                        }
                    />
                    {(notes.length > 2 && !isScrolledToEnd) && (
                        <View style={rose_home.downArrowContainer}>
                            <Ionicons name="chevron-down" size={24} color="#FFFFFF" />
                        </View>
                    )}
                </View>
            )}
        </View>
    );
}