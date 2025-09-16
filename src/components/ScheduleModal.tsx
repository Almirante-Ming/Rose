import { useState } from 'react';
import { Modal as RNModal, View, Text, TouchableOpacity, Animated, TextInput, Alert, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Note } from '@constants/types';
import { rose_home } from '@/styles';
import { rose_theme } from '@constants/rose_theme';
import { schedulesService } from '@/services';

interface ScheduleModalProps {
    visible: boolean;
    selectedNote: Note | null;
    backgroundOpacity: Animated.Value;
    onClose: () => void;
    onScheduleUpdate?: () => void;
}

export default function ScheduleModal({ 
    visible, 
    selectedNote, 
    backgroundOpacity, 
    onClose,
    onScheduleUpdate
}: ScheduleModalProps) {
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [cancelReason, setCancelReason] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleCancelPress = () => {
        setShowCancelModal(true);
        setCancelReason('');
    };

    const handleCancelConfirm = async () => {
        if (!selectedNote || !selectedNote.id) {
            Alert.alert('Erro', 'Informações da aula não encontradas');
            return;
        }

        setIsLoading(true);
        try {
            const updateData = {
                dt_init: selectedNote.dt_init,
                tm_init: selectedNote.tm_init,
                trainer_id: selectedNote.trainer_id || 0,
                customer_id: selectedNote.customer_id || 0,
                machine_id: selectedNote.machine_id || 0,
                message: cancelReason.trim() || selectedNote.message,
                c_status: 'cancelled' as const
            };

            await schedulesService.cancelSchedule(selectedNote.id, updateData);
            
            Alert.alert(
                'Sucesso',
                'Aula cancelada com sucesso!',
                [
                    {
                        text: 'OK',
                        onPress: () => {
                            setShowCancelModal(false);
                            onClose();
                            onScheduleUpdate?.();
                        }
                    }
                ]
            );
        } catch (error: any) {
            Alert.alert(
                'Erro',
                error.response?.data?.message || 'Erro ao cancelar aula. Tente novamente.'
            );
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancelModalClose = () => {
        setShowCancelModal(false);
        setCancelReason('');
    };

    const handleReschedulePress = () => {
        Alert.alert('Em Desenvolvimento', 'Funcionalidade de reagendar em desenvolvimento');
    };

    const isMarked = selectedNote?.c_status === 'marked' || !selectedNote?.c_status;

    return (
        <>
            <RNModal
                visible={visible}
                transparent
                animationType="slide"
                onRequestClose={onClose}
            >
                <Animated.View style={[rose_home.modalBackground, { opacity: backgroundOpacity }]} />
                <TouchableOpacity style={rose_home.modalWrapper} activeOpacity={1} onPress={onClose}>
                    <View style={[rose_home.modalContainer, styles.modalContainerFixed]}>
                        {selectedNote && (
                            <>
                                <Text style={rose_home.modalTitle}>Detalhes da Aula</Text>
                                
                                <ScrollView 
                                    style={styles.scrollContent}
                                    showsVerticalScrollIndicator={false}
                                    bounces={false}
                                >
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
                                    {selectedNote.c_status && (
                                        <View style={rose_home.modalRow}>
                                            <Text style={rose_home.modalLabel}>Status:</Text>
                                            <Text style={[
                                                rose_home.modalValue,
                                                { 
                                                    color: selectedNote.c_status === 'cancelled' ? '#e74c3c' : 
                                                           selectedNote.c_status === 'completed' ? '#27ae60' : '#f39c12'
                                                }
                                            ]}>
                                                {selectedNote.c_status === 'marked' ? 'Agendada' :
                                                 selectedNote.c_status === 'cancelled' ? 'Cancelada' :
                                                 selectedNote.c_status === 'completed' ? 'Concluída' : selectedNote.c_status}
                                            </Text>
                                        </View>
                                    )}
                                    </View>
                                </ScrollView>

                                {isMarked && (
                                    <View style={styles.actionButtons}>
                                        <TouchableOpacity 
                                            style={[styles.actionButton, styles.cancelButton]}
                                            onPress={handleCancelPress}
                                        >
                                            <Ionicons name="close-circle" size={20} color="#FFFFFF" />
                                            <Text style={styles.cancelButtonText}>Cancelar</Text>
                                        </TouchableOpacity>

                                        <TouchableOpacity 
                                            style={[styles.actionButton, styles.rescheduleButton]}
                                            onPress={handleReschedulePress}
                                        >
                                            <Ionicons name="time" size={20} color="#FFFFFF" />
                                            <Text style={styles.rescheduleButtonText}>Remarcar</Text>
                                        </TouchableOpacity>
                                    </View>
                                )}
                            </>
                        )}
                    </View>
                </TouchableOpacity>
            </RNModal>

            {/* Cancel Confirmation Modal */}
            <RNModal
                visible={showCancelModal}
                transparent
                animationType="fade"
                onRequestClose={handleCancelModalClose}
            >
                <View style={styles.cancelModalBackground}>
                    <View style={styles.cancelModalContainer}>
                        <Text style={styles.cancelModalTitle}>Cancelar Aula</Text>
                        
                        <TextInput
                            style={styles.cancelInput}
                            value={cancelReason}
                            onChangeText={setCancelReason}
                            placeholder="Digite a justificativa (opcional)"
                            placeholderTextColor="#999"
                            multiline
                            numberOfLines={4}
                            textAlignVertical="top"
                        />

                        <View style={styles.cancelModalButtons}>
                            <TouchableOpacity 
                                style={[styles.cancelModalButton, styles.cancelModalCancelButton]}
                                onPress={handleCancelModalClose}
                                disabled={isLoading}
                            >
                                <Text style={styles.cancelModalCancelText}>Voltar</Text>
                            </TouchableOpacity>

                            <TouchableOpacity 
                                style={[styles.cancelModalButton, styles.cancelModalConfirmButton]}
                                onPress={handleCancelConfirm}
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <Text style={styles.cancelModalConfirmText}>Cancelando...</Text>
                                ) : (
                                    <Text style={styles.cancelModalConfirmText}>Confirmar</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </RNModal>
        </>
    );
}

const styles = {
    modalContainerFixed: {
        height: 'auto' as const,
        maxHeight: '85%' as const,
        minHeight: '40%' as const,
    },
    scrollContent: {
        flexGrow: 1,
        paddingBottom: 10,
    },
    actionButtons: {
        flexDirection: 'row' as const,
        justifyContent: 'space-between' as const,
        marginTop: 20,
        gap: 15,
        paddingTop: 15,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255, 255, 255, 0.2)',
    },
    actionButton: {
        flex: 1,
        flexDirection: 'row' as const,
        alignItems: 'center' as const,
        justifyContent: 'center' as const,
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 8,
        gap: 8,
    },
    cancelButton: {
        backgroundColor: '#e74c3c',
    },
    rescheduleButton: {
        backgroundColor: rose_theme.rose_main,
    },
    cancelButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600' as const,
    },
    rescheduleButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600' as const,
    },
    cancelModalBackground: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center' as const,
        alignItems: 'center' as const,
        padding: 20,
    },
    cancelModalContainer: {
        backgroundColor: '#FFFFFF',
        borderRadius: 15,
        padding: 20,
        width: '100%' as const,
        maxWidth: 400,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 10,
    },
    cancelModalTitle: {
        fontSize: 20,
        fontWeight: 'bold' as const,
        color: '#333',
        textAlign: 'center' as const,
        marginBottom: 10,
    },
    cancelModalSubtitle: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center' as const,
        marginBottom: 20,
    },
    cancelInput: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 15,
        fontSize: 16,
        color: '#333',
        backgroundColor: '#f9f9f9',
        minHeight: 100,
        marginBottom: 20,
    },
    cancelModalButtons: {
        flexDirection: 'row' as const,
        justifyContent: 'space-between' as const,
        gap: 15,
    },
    cancelModalButton: {
        flex: 1,
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 8,
        alignItems: 'center' as const,
        justifyContent: 'center' as const,
    },
    cancelModalCancelButton: {
        backgroundColor: '#95a5a6',
    },
    cancelModalConfirmButton: {
        backgroundColor: '#e74c3c',
    },
    cancelModalCancelText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600' as const,
    },
    cancelModalConfirmText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600' as const,
    },
};