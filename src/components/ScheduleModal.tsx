import { Modal as RNModal, View, Text, TouchableOpacity, Animated } from 'react-native';
import { Note } from '@constants/types';
import { rose_home } from '@/styles';

interface ScheduleModalProps {
    visible: boolean;
    selectedNote: Note | null;
    backgroundOpacity: Animated.Value;
    onClose: () => void;
}

export default function ScheduleModal({ 
    visible, 
    selectedNote, 
    backgroundOpacity, 
    onClose 
}: ScheduleModalProps) {
    return (
        <RNModal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={onClose}
        >
            <Animated.View style={[rose_home.modalBackground, { opacity: backgroundOpacity }]} />
            <TouchableOpacity style={rose_home.modalWrapper} activeOpacity={1} onPress={onClose}>
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
        </RNModal>
    );
}