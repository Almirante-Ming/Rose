import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  ActivityIndicator,
  Modal,
  FlatList,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { personsService, machinesService, schedulesService } from '@/services';
import { ScheduleData, PersonResponse, MachineResponse } from '@constants/types';
import { rose_theme } from '@constants/rose_theme';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Platform } from 'react-native';

interface FilterableSelectProps {
  data: Array<{ id: number; name: string }>;
  onSelect: (item: { id: number; name: string }) => void;
  placeholder: string;
  selectedValue?: { id: number; name: string } | null;
}

const FilterableSelect: React.FC<FilterableSelectProps> = ({
  data,
  onSelect,
  placeholder,
  selectedValue,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [searchText, setSearchText] = useState('');

  const filteredData = data.filter(item =>
    item.name.toLowerCase().includes(searchText.toLowerCase())
  );

  const handleSelect = (item: { id: number; name: string }) => {
    onSelect(item);
    setIsVisible(false);
    setSearchText('');
  };

  return (
    <>
      <TouchableOpacity
        style={styles.selectButton}
        onPress={() => setIsVisible(true)}
      >
        <Text style={[styles.selectButtonText, !selectedValue && styles.placeholder]}>
          {selectedValue ? selectedValue.name : placeholder}
        </Text>
        <Ionicons name="chevron-down" size={20} color="#666" />
      </TouchableOpacity>

      <Modal visible={isVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{placeholder}</Text>
              <TouchableOpacity onPress={() => setIsVisible(false)}>
                <Ionicons name="close" size={24} color={rose_theme.text_light} />
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.searchInput}
              placeholder="Buscar..."
              value={searchText}
              onChangeText={setSearchText}
              placeholderTextColor="#999"
            />

            <FlatList
              data={filteredData}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.selectItem}
                  onPress={() => handleSelect(item)}
                >
                  <Text style={styles.selectItemText}>{item.name}</Text>
                </TouchableOpacity>
              )}
              style={styles.selectList}
            />
          </View>
        </View>
      </Modal>
    </>
  );
};

export default function NewSchedule() {
  const insets = useSafeAreaInsets();
  
  const [formData, setFormData] = useState<ScheduleData>({
    dt_init: '',
    tm_init: '',
    trainer_id: 0,
    customer_id: 0,
    machine_id: 0,
    message: '',
    c_status: 'marked',
  });

  const [trainers, setTrainers] = useState<PersonResponse[]>([]);
  const [customers, setCustomers] = useState<PersonResponse[]>([]);
  const [machines, setMachines] = useState<MachineResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState(new Date());

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [personsData, machinesData] = await Promise.all([
        personsService.getPersons(),
        machinesService.getMachines(),
      ]);

      // Filter persons by type, excluding admins
      const trainersData = personsData.filter(person => person.p_type === 'trainer');
      const customersData = personsData.filter(person => person.p_type === 'customer');

      setTrainers(trainersData);
      setCustomers(customersData);
      setMachines(machinesData);
    } catch (error: any) {
      Alert.alert(
        'Erro',
        error.response?.data?.message || 'Erro ao carregar dados. Tente novamente.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const formatTime = (date: Date): string => {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setSelectedDate(selectedDate);
      setFormData(prev => ({
        ...prev,
        dt_init: formatDate(selectedDate),
      }));
    }
  };

  const handleTimeChange = (event: any, selectedTime?: Date) => {
    setShowTimePicker(false);
    if (selectedTime) {
      setSelectedTime(selectedTime);
      setFormData(prev => ({
        ...prev,
        tm_init: formatTime(selectedTime),
      }));
    }
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.dt_init) {
      Alert.alert('Erro', 'Por favor, selecione uma data.');
      return;
    }
    if (!formData.tm_init) {
      Alert.alert('Erro', 'Por favor, selecione um horário.');
      return;
    }
    if (!formData.trainer_id) {
      Alert.alert('Erro', 'Por favor, selecione um instrutor.');
      return;
    }
    if (!formData.customer_id) {
      Alert.alert('Erro', 'Por favor, selecione um cliente.');
      return;
    }
    if (!formData.machine_id) {
      Alert.alert('Erro', 'Por favor, selecione uma máquina.');
      return;
    }

    try {
      setIsLoading(true);
      await schedulesService.createSchedule(formData);
      
      Alert.alert(
        'Sucesso',
        'Agendamento criado com sucesso!',
        [
          {
            text: 'OK',
            onPress: () => {
              // Reset form
              setFormData({
                dt_init: '',
                tm_init: '',
                trainer_id: 0,
                customer_id: 0,
                machine_id: 0,
                message: '',
                c_status: 'marked',
              });
            },
          },
        ]
      );
    } catch (error: any) {
      Alert.alert(
        'Erro',
        error.response?.data?.message || 'Erro ao criar agendamento. Tente novamente.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && trainers.length === 0) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={rose_theme.rose_main} />
          <Text style={styles.loadingText}>Carregando dados...</Text>
        </View>
      </View>
    );
  }

  const selectedTrainer = trainers.find(t => t.id === formData.trainer_id) || null;
  const selectedCustomer = customers.find(c => c.id === formData.customer_id) || null;
  const selectedMachine = machines.find(m => m.id === formData.machine_id) || null;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Ionicons name="calendar" size={32} color={rose_theme.rose_main} />
          <Text style={styles.title}>Novo Agendamento</Text>
        </View>

        <View style={styles.form}>
          {/* Date Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Data</Text>
            <TouchableOpacity
              style={styles.dateTimeButton}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={[styles.dateTimeButtonText, !formData.dt_init && styles.placeholder]}>
                {formData.dt_init || 'Selecione a data'}
              </Text>
              <Ionicons name="calendar-outline" size={20} color="#666" />
            </TouchableOpacity>
          </View>

          {/* Time Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Horário</Text>
            <TouchableOpacity
              style={styles.dateTimeButton}
              onPress={() => setShowTimePicker(true)}
            >
              <Text style={[styles.dateTimeButtonText, !formData.tm_init && styles.placeholder]}>
                {formData.tm_init || 'Selecione o horário'}
              </Text>
              <Ionicons name="time-outline" size={20} color="#666" />
            </TouchableOpacity>
          </View>

          {/* Trainer Select */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Instrutor</Text>
            <FilterableSelect
              data={trainers.map(t => ({ id: t.id, name: t.name }))}
              onSelect={(item) => setFormData(prev => ({ ...prev, trainer_id: item.id }))}
              placeholder="Selecione um instrutor"
              selectedValue={selectedTrainer ? { id: selectedTrainer.id, name: selectedTrainer.name } : null}
            />
          </View>

          {/* Customer Select */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Cliente</Text>
            <FilterableSelect
              data={customers.map(c => ({ id: c.id, name: c.name }))}
              onSelect={(item) => setFormData(prev => ({ ...prev, customer_id: item.id }))}
              placeholder="Selecione um cliente"
              selectedValue={selectedCustomer ? { id: selectedCustomer.id, name: selectedCustomer.name } : null}
            />
          </View>

          {/* Machine Select */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Máquina</Text>
            <FilterableSelect
              data={machines.map(m => ({ id: m.id, name: m.name }))}
              onSelect={(item) => setFormData(prev => ({ ...prev, machine_id: item.id }))}
              placeholder="Selecione uma máquina"
              selectedValue={selectedMachine ? { id: selectedMachine.id, name: selectedMachine.name } : null}
            />
          </View>

          {/* Message Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Observações</Text>
            <TextInput
              style={styles.textArea}
              placeholder="Digite observações adicionais (opcional)"
              value={formData.message}
              onChangeText={(text) => setFormData(prev => ({ ...prev, message: text }))}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
              placeholderTextColor="#999"
            />
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <Ionicons name="checkmark" size={20} color="#FFFFFF" />
                <Text style={styles.submitButtonText}>Criar Agendamento</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Date Picker */}
      {showDatePicker && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleDateChange}
          minimumDate={new Date()}
        />
      )}

      {/* Time Picker */}
      {showTimePicker && (
        <DateTimePicker
          value={selectedTime}
          mode="time"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleTimeChange}
        />
      )}
    </View>
  );
}

const styles = {
  container: {
    flex: 1,
    backgroundColor: rose_theme.dark_bg,
  },
  scrollContainer: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  loadingText: {
    fontSize: 16,
    color: rose_theme.text_light,
    marginTop: 16,
  },
  header: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    padding: 20,
    paddingTop: 60,
    gap: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold' as const,
    color: rose_theme.text_light,
  },
  form: {
    padding: 20,
    gap: 20,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: rose_theme.text_light,
  },
  dateTimeButton: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    backgroundColor: rose_theme.dark_surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: rose_theme.rose_main,
  },
  dateTimeButtonText: {
    fontSize: 16,
    color: rose_theme.text_light,
  },
  selectButton: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    backgroundColor: rose_theme.dark_surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: rose_theme.rose_main,
  },
  selectButtonText: {
    fontSize: 16,
    color: rose_theme.text_light,
  },
  placeholder: {
    color: rose_theme.text_secondary,
  },
  textArea: {
    backgroundColor: rose_theme.dark_surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: rose_theme.rose_main,
    color: rose_theme.text_light,
    fontSize: 16,
    minHeight: 80,
  },
  submitButton: {
    backgroundColor: rose_theme.rose_main,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row' as const,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    gap: 8,
    marginTop: 20,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: rose_theme.text_light,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  modalContent: {
    backgroundColor: rose_theme.dark_surface,
    borderRadius: 12,
    margin: 20,
    maxHeight: '80%' as any,
    width: '90%' as any,
    borderWidth: 2,
    borderColor: rose_theme.rose_main,
  },
  modalHeader: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    padding: 20,
    borderBottomWidth: 2,
    borderBottomColor: rose_theme.rose_main,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: rose_theme.text_light,
  },
  searchInput: {
    backgroundColor: rose_theme.dark_bg,
    borderRadius: 8,
    padding: 12,
    margin: 20,
    marginBottom: 10,
    color: rose_theme.text_light,
    fontSize: 16,
    borderWidth: 1,
    borderColor: rose_theme.rose_main,
  },
  selectList: {
    maxHeight: 300,
  },
  selectItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: rose_theme.gray_dark,
  },
  selectItemText: {
    fontSize: 16,
    color: rose_theme.text_light,
  },
};