import { useState } from 'react';
import { Modal as RNModal, View, Text, TouchableOpacity, Animated, TextInput, Alert, ScrollView } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { Note } from '@constants/types';
import { rose_home } from '@/styles';
import { rose_theme } from '@constants/rose_theme';
import { schedulesService, apiService } from '@/services';
import { useAuth } from '@/contexts';

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
    const { user } = useAuth();
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [cancelReason, setCancelReason] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    
    // Reschedule states
    const [showRescheduleModal, setShowRescheduleModal] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [selectedTime, setSelectedTime] = useState(new Date());

    const handleCancelPress = () => {
        setShowCancelModal(true);
        setCancelReason('');
    };

    const handleCancelConfirm = async () => {
        if (!selectedNote || !selectedNote.schedule_id) {
            Alert.alert('Erro', 'Informações da aula não encontradas');
            return;
        }

        setIsLoading(true);
        try {
            // Create updated schedule with cancel reason in message
            const updatedSchedule = {
                ...selectedNote,
                message: cancelReason.trim() || selectedNote.message
            };

            await schedulesService.cancelSchedule(updatedSchedule);
            
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
        setShowRescheduleModal(true);
        // Initialize with current schedule date/time
        if (selectedNote) {
            const currentDateTime = new Date(`${selectedNote.dt_init}T${selectedNote.tm_init}`);
            setSelectedDate(currentDateTime);
            setSelectedTime(currentDateTime);
        }
    };

    const handleRescheduleConfirm = async () => {
        if (!selectedNote || !selectedNote.schedule_id) {
            Alert.alert('Erro', 'Informações da aula não encontradas');
            return;
        }

        setIsLoading(true);
        try {
            // Combine date and time
            const year = selectedDate.getFullYear();
            const month = selectedDate.getMonth();
            const day = selectedDate.getDate();
            const hours = selectedTime.getHours();
            const minutes = selectedTime.getMinutes();
            
            const newDateTime = new Date(year, month, day, hours, minutes);
            const newDateTimeString = newDateTime.toISOString();

            await schedulesService.rescheduleSchedule(selectedNote, newDateTimeString);
            
            Alert.alert(
                'Sucesso',
                'Aula remarcada com sucesso!',
                [
                    {
                        text: 'OK',
                        onPress: () => {
                            setShowRescheduleModal(false);
                            onClose();
                            onScheduleUpdate?.();
                        }
                    }
                ]
            );
        } catch (error: any) {
            Alert.alert(
                'Erro',
                error.response?.data?.message || 'Erro ao remarcar aula. Tente novamente.'
            );
        } finally {
            setIsLoading(false);
        }
    };

    const handleRescheduleModalClose = () => {
        setShowRescheduleModal(false);
        setShowDatePicker(false);
        setShowTimePicker(false);
    };

    const handleConfirmReserved = async () => {
        if (!selectedNote || !selectedNote.schedule_id) {
            Alert.alert('Erro', 'Informações da aula não encontradas');
            return;
        }

        setIsLoading(true);
        try {
            // Create updated schedule with 'marked' status
            const updatedSchedule = {
                ...selectedNote,
                c_status: 'marked' as const
            };

            const requestData = {
                schedule_id: selectedNote.schedule_id,
                dt_init: selectedNote.dt_init,
                tm_init: selectedNote.tm_init,
                trainer_name: selectedNote.trainer_name,
                customer_name: selectedNote.customer_name,
                machine_name: selectedNote.machine_name,
                message: selectedNote.message || '',
                c_status: 'marked'
            };

            await apiService.put(`/schedules/${selectedNote.schedule_id}`, requestData);
            
            Alert.alert(
                'Sucesso',
                'Aula confirmada com sucesso!',
                [
                    {
                        text: 'OK',
                        onPress: () => {
                            onClose();
                            onScheduleUpdate?.();
                        }
                    }
                ]
            );
        } catch (error: any) {
            Alert.alert(
                'Erro',
                error.response?.data?.message || 'Erro ao confirmar aula. Tente novamente.'
            );
        } finally {
            setIsLoading(false);
        }
    };

    const isMarked = selectedNote?.c_status === 'marked' || !selectedNote?.c_status;
    const canConfirm = user?.role?.level === 1 || user?.role?.level === 2;

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
                                                           selectedNote.c_status === 'completed' ? '#27ae60' :
                                                           selectedNote.c_status === 'reserved' ? '#f39c12' : '#f39c12'
                                                }
                                            ]}>
                                                {selectedNote.c_status === 'marked' ? 'Agendada' :
                                                 selectedNote.c_status === 'reserved' ? 'Aguardando reserva' :
                                                 selectedNote.c_status === 'cancelled' ? 'Cancelada' :
                                                 selectedNote.c_status === 'completed' ? 'Concluída' : selectedNote.c_status}
                                            </Text>
                                        </View>
                                    )}
                                    </View>
                                </ScrollView>

                                {(isMarked || selectedNote?.c_status === 'reserved') && (
                                    <View style={styles.actionButtons}>
                                        <TouchableOpacity 
                                            style={[styles.actionButton, styles.cancelButton]}
                                            onPress={handleCancelPress}
                                        >
                                            <Ionicons name="close-circle" size={20} color="#FFFFFF" />
                                            <Text style={styles.cancelButtonText}>Cancelar</Text>
                                        </TouchableOpacity>

                                        {selectedNote?.c_status === 'reserved' ? (
                                            canConfirm ? (
                                                <TouchableOpacity 
                                                    style={[styles.actionButton, styles.confirmButton]}
                                                    onPress={handleConfirmReserved}
                                                    disabled={isLoading}
                                                >
                                                    <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
                                                    <Text style={styles.confirmButtonText}>
                                                        {isLoading ? 'Confirmando...' : 'Confirmar'}
                                                    </Text>
                                                </TouchableOpacity>
                                            ) : (
                                                // Empty space to maintain layout for users without permission
                                                <View style={[styles.actionButton, { opacity: 0 }]} />
                                            )
                                        ) : (
                                            <TouchableOpacity 
                                                style={[styles.actionButton, styles.rescheduleButton]}
                                                onPress={handleReschedulePress}
                                            >
                                                <Ionicons name="time" size={20} color="#FFFFFF" />
                                                <Text style={styles.rescheduleButtonText}>Remarcar</Text>
                                            </TouchableOpacity>
                                        )}
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

            {/* Reschedule Modal */}
            <RNModal
                visible={showRescheduleModal}
                transparent
                animationType="slide"
                onRequestClose={handleRescheduleModalClose}
            >
                <View style={styles.cancelModalBackground}>
                    <View style={styles.cancelModalContainer}>
                        <Text style={styles.cancelModalTitle}>Remarcar Aula</Text>
                        <Text style={styles.cancelModalSubtitle}>
                            Selecione a nova data e horário para a aula
                        </Text>

                        <View style={styles.dateTimeContainer}>
                            <TouchableOpacity 
                                style={styles.dateTimeButton}
                                onPress={() => setShowDatePicker(true)}
                            >
                                <Ionicons name="calendar" size={20} color={rose_theme.rose_main} />
                                <Text style={styles.dateTimeButtonText}>
                                    {selectedDate.toLocaleDateString('pt-BR')}
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity 
                                style={styles.dateTimeButton}
                                onPress={() => setShowTimePicker(true)}
                            >
                                <Ionicons name="time" size={20} color={rose_theme.rose_main} />
                                <Text style={styles.dateTimeButtonText}>
                                    {selectedTime.toLocaleTimeString('pt-BR', { 
                                        hour: '2-digit', 
                                        minute: '2-digit' 
                                    })}
                                </Text>
                            </TouchableOpacity>
                        </View>

                        {showDatePicker && (
                            <DateTimePicker
                                value={selectedDate}
                                mode="date"
                                display="default"
                                onChange={(event, date) => {
                                    setShowDatePicker(false);
                                    if (date) setSelectedDate(date);
                                }}
                                minimumDate={new Date()}
                            />
                        )}

                        {showTimePicker && (
                            <DateTimePicker
                                value={selectedTime}
                                mode="time"
                                display="default"
                                onChange={(event, time) => {
                                    setShowTimePicker(false);
                                    if (time) setSelectedTime(time);
                                }}
                            />
                        )}

                        <View style={styles.cancelModalButtons}>
                            <TouchableOpacity 
                                style={[styles.cancelModalButton, styles.cancelModalCancelButton]}
                                onPress={handleRescheduleModalClose}
                            >
                                <Text style={styles.cancelModalCancelText}>Cancelar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity 
                                style={[styles.cancelModalButton, styles.cancelModalConfirmButton]}
                                onPress={handleRescheduleConfirm}
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <Text style={styles.cancelModalConfirmText}>Remarcando...</Text>
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
        borderTopColor: rose_theme.rose_main,
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
        backgroundColor: rose_theme.rose_main,
    },
    rescheduleButton: {
        backgroundColor: rose_theme.rose_main,
    },
    confirmButton: {
        backgroundColor: rose_theme.rose_main,
    },
    cancelButtonText: {
        color: rose_theme.text_light,
        fontSize: 16,
        fontWeight: '600' as const,
    },
    rescheduleButtonText: {
        color: rose_theme.text_light,
        fontSize: 16,
        fontWeight: '600' as const,
    },
    confirmButtonText: {
        color: rose_theme.text_light,
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
        backgroundColor: rose_theme.light_surface,
        borderRadius: 15,
        padding: 20,
        width: '100%' as const,
        maxWidth: 400,
        borderWidth: 2,
        borderColor: rose_theme.rose_main,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 10,
    },
    cancelModalTitle: {
        fontSize: 20,
        fontWeight: 'bold' as const,
        color: rose_theme.text_dark,
        textAlign: 'center' as const,
        marginBottom: 10,
        borderBottomWidth: 2,
        borderBottomColor: rose_theme.rose_main,
        paddingBottom: 10,
    },
    cancelModalSubtitle: {
        fontSize: 16,
        color: rose_theme.text_secondary,
        textAlign: 'center' as const,
        marginBottom: 20,
    },
    cancelInput: {
        borderWidth: 1,
        borderColor: rose_theme.rose_main,
        borderRadius: 8,
        padding: 15,
        fontSize: 16,
        color: rose_theme.text_dark,
        backgroundColor: rose_theme.light_bg,
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
        backgroundColor: rose_theme.gray_dark,
    },
    cancelModalConfirmButton: {
        backgroundColor: rose_theme.rose_main,
    },
    cancelModalCancelText: {
        color: rose_theme.text_light,
        fontSize: 16,
        fontWeight: '600' as const,
    },
    cancelModalConfirmText: {
        color: rose_theme.text_light,
        fontSize: 16,
        fontWeight: '600' as const,
    },
    dateTimeContainer: {
        flexDirection: 'row' as const,
        justifyContent: 'space-between' as const,
        gap: 15,
        marginBottom: 20,
    },
    dateTimeButton: {
        flex: 1,
        flexDirection: 'row' as const,
        alignItems: 'center' as const,
        justifyContent: 'center' as const,
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 8,
        borderWidth: 2,
        borderColor: rose_theme.rose_main,
        backgroundColor: rose_theme.light_bg,
        gap: 8,
    },
    dateTimeButtonText: {
        color: rose_theme.text_dark,
        fontSize: 16,
        fontWeight: '500' as const,
    },
};