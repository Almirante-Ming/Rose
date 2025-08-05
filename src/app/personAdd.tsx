import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { router, Stack } from 'expo-router';
import { personsService } from '@/services';
import { useAuth } from '@/contexts';
import { rose_theme } from '@constants/rose_theme';
import { PersonData } from '@constants/types';

export default function PersonAdd() {
  const { isAdmin } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  
  const [formData, setFormData] = useState<PersonData>({
    cpf: '',
    name: '',
    email: '',
    phone: '',
    dt_birth: '',
    state: 'active',
    p_type: 'customer',
    password: '',
  });

  const [errors, setErrors] = useState<Partial<PersonData>>({});

  if (!isAdmin()) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.container}>
          <View style={styles.errorContainer}>
            <Ionicons name="warning" size={48} color={rose_theme.rose_main} />
            <Text style={styles.errorText}>Acesso negado</Text>
            <Text style={styles.errorSubText}>Apenas administradores podem acessar esta página</Text>
          </View>
        </View>
      </>
    );
  }

  const validateForm = (): boolean => {
    const newErrors: Partial<PersonData> = {};

    if (!formData.cpf.trim()) {
      newErrors.cpf = 'CPF é obrigatório';
    } else if (!/^\d{11}$/.test(formData.cpf.replace(/\D/g, ''))) {
      newErrors.cpf = 'CPF deve ter 11 dígitos';
    }

    if (!formData.name.trim()) {
      newErrors.name = 'Nome é obrigatório';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Telefone é obrigatório';
    }

    if (!formData.dt_birth.trim()) {
      newErrors.dt_birth = 'Data de nascimento é obrigatória';
    }

    if (!formData.password.trim()) {
      newErrors.password = 'Senha é obrigatória';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Senha deve ter pelo menos 6 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const formatCPF = (value: string): string => {
    const numbers = value.replace(/\D/g, '');
    return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  const formatPhone = (value: string): string => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 10) {
      return numbers.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    }
    return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  };

  const handleInputChange = (field: keyof PersonData, value: string) => {
    let formattedValue = value;

    if (field === 'cpf') {
      formattedValue = formatCPF(value);
    } else if (field === 'phone') {
      formattedValue = formatPhone(value);
    }

    setFormData(prev => ({ ...prev, [field]: formattedValue }));
    
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || parsedDate;
    
    if (event.type === 'dismissed') {
      setShowDatePicker(false);
      return;
    }
    
    if (selectedDate) {
      const year = selectedDate.getFullYear();
      const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const day = String(selectedDate.getDate()).padStart(2, '0');
      const formattedDate = `${year}-${month}-${day}`;
      
      setFormData(prev => ({ ...prev, dt_birth: formattedDate }));
      
      if (errors.dt_birth) {
        setErrors(prev => ({ ...prev, dt_birth: undefined }));
      }
    }
    
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      Alert.alert('Erro', 'Por favor, verifique o formulário');
      return;
    }

    setIsLoading(true);

    try {
      const cleanedData = {
        ...formData,
        cpf: formData.cpf.replace(/\D/g, ''),
        phone: formData.phone.replace(/\D/g, ''),
      };

      await personsService.createPerson(cleanedData);
      
      Alert.alert(
        'Sucesso',
        'Pessoa adicionada com sucesso!',
        [
          {
            text: 'OK',
            onPress: () => {
              router.back();
            }
          }
        ]
      );
    } catch (error: any) {
      Alert.alert(
        'Erro',
        error.response?.data?.message || 'Erro ao adicionar pessoa. verifique os dados e tente novamente.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const formatDateForDisplay = (dateString: string): string => {
    if (!dateString) return '';
    const [year, month, day] = dateString.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    return date.toLocaleDateString('pt-BR');
  };

  const parsedDate = (() => {
    if (formData.dt_birth) {
      const [year, month, day] = formData.dt_birth.split('-');
      const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      return isNaN(date.getTime()) ? new Date() : date;
    }
    return new Date();
  })();

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <KeyboardAvoidingView 
        style={styles.container} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <View style={styles.headerContent}>
              <Ionicons name="person-add" size={32} color="#FFFFFF" />
              <Text style={styles.title}>Adicionar Nova Pessoa</Text>
            </View>
            <View style={styles.placeholder} />
          </View>
        </View>

        <View style={styles.form}>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Nome *</Text>
            <TextInput
              style={[styles.input, errors.name && styles.inputError]}
              value={formData.name}
              onChangeText={(value) => handleInputChange('name', value)}
              placeholder="Nome completo"
            />
            {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Telefone *</Text>
            <TextInput
              style={[styles.input, errors.phone && styles.inputError]}
              value={formData.phone}
              onChangeText={(value) => handleInputChange('phone', value)}
              placeholder="(00) 00000-0000"
              keyboardType="phone-pad"
              maxLength={15}
            />
            {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}
          </View>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>CPF *</Text>
            <TextInput
              style={[styles.input, errors.cpf && styles.inputError]}
              value={formData.cpf}
              onChangeText={(value) => handleInputChange('cpf', value)}
              placeholder="000.000.000-00"
              keyboardType="numeric"
              maxLength={14}
            />
            {errors.cpf && <Text style={styles.errorText}>{errors.cpf}</Text>}
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Data de Nascimento *</Text>
            <TouchableOpacity
              style={[styles.input, styles.dateInput, errors.dt_birth && styles.inputError]}
              onPress={() => {
                setShowDatePicker(true);
              }}
            >
              <Text style={[styles.dateText, !formData.dt_birth && styles.placeholderText]}>
                {formData.dt_birth ? formatDateForDisplay(formData.dt_birth) : 'Selecionar data'}
              </Text>
              <Ionicons name="calendar" size={20} color={rose_theme.rose_main} />
            </TouchableOpacity>
            {errors.dt_birth && <Text style={styles.errorText}>{errors.dt_birth}</Text>}
          </View>

          {showDatePicker && (
            <DateTimePicker
              testID="dateTimePicker"
              value={parsedDate}
              mode="date"
              is24Hour={true}
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={handleDateChange}
              maximumDate={new Date()}
            />
          )}

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Tipo de Pessoa</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={formData.p_type}
                onValueChange={(value) => handleInputChange('p_type', value)}
                style={styles.picker}
              >
                <Picker.Item label="Cliente" value="customer" />
                <Picker.Item label="Instrutor" value="trainer" />
                <Picker.Item label="Administrador" value="admin" />
              </Picker>
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email *</Text>
            <TextInput
              style={[styles.input, errors.email && styles.inputError]}
              value={formData.email}
              onChangeText={(value) => handleInputChange('email', value)}
              placeholder="email@exemplo.com"
              keyboardType="email-address"
              autoCapitalize="none"
            />
            {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Senha *</Text>
            <TextInput
              style={[styles.input, errors.password && styles.inputError]}
              value={formData.password}
              onChangeText={(value) => handleInputChange('password', value)}
              placeholder="Senha (mínimo 6 caracteres)"
              secureTextEntry
            />
            {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
          </View>

          <TouchableOpacity
            style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="checkmark" size={20} color="#fff" />
                <Text style={styles.submitButtonText}>Adicionar Pessoa</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
    </>
  );
}

const styles = {
  container: {
    flex: 1,
    backgroundColor: rose_theme.rose_dark,
  },
  scrollView: {
    flex: 1,
    padding: 20,
  },
  header: {
    marginBottom: 30,
    paddingTop: 20,
  },
  headerRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
  },
  backButton: {
    padding: 8,
  },
  headerContent: {
    alignItems: 'center' as const,
    flex: 1,
  },
  placeholder: {
    width: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold' as const,
    color: '#FFFFFF',
    marginTop: 10,
    textAlign: 'center' as const,
  },
  form: {
    backgroundColor: rose_theme.rose_light,
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#FFFFFF',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  inputError: {
    borderColor: rose_theme.rose_main,
  },
  dateInput: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
  },
  dateText: {
    fontSize: 16,
    color: '#333',
  },
  placeholderText: {
    color: '#999',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  picker: {
    height: 50,
  },
  submitButton: {
    backgroundColor: rose_theme.rose_main,
    flexDirection: 'row' as const,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    padding: 15,
    borderRadius: 8,
    marginTop: 20,
  },
  submitButtonDisabled: {
    backgroundColor: '#ccc',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold' as const,
    marginLeft: 8,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    padding: 40,
    backgroundColor: rose_theme.rose_dark,
  },
  errorText: {
    fontSize: 12,
    color: rose_theme.rose_main,
    marginTop: 4,
  },
  errorSubText: {
    fontSize: 16,
    color: '#CCCCCC',
    textAlign: 'center' as const,
    marginTop: 10,
  },
};
