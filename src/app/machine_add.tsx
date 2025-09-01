import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';
import { router, Stack } from 'expo-router';
import { machinesService } from '@/services';
import { useAuth } from '@/contexts';
import { rose_theme } from '@constants/rose_theme';
import { MachineData } from '@constants/types';

export default function MachineAdd() {
  const { isAdmin } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState<MachineData>({
    name: '',
    m_state: 'active',
  });

  const [errors, setErrors] = useState<Partial<MachineData>>({});

  if (!isAdmin()) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <SafeAreaView style={styles.container}>
          <View style={styles.errorContainer}>
            <Ionicons name="warning" size={48} color={rose_theme.rose_main} />
            <Text style={styles.errorText}>Acesso negado</Text>
            <Text style={styles.errorSubText}>Apenas administradores podem acessar esta página</Text>
          </View>
        </SafeAreaView>
      </>
    );
  }

  const validateForm = (): boolean => {
    const newErrors: Partial<MachineData> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Nome é obrigatório';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Nome deve ter pelo menos 2 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof MachineData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      Alert.alert('Erro', 'Por favor, verifique o formulário');
      return;
    }

    try {
      setIsLoading(true);
      await machinesService.createMachine(formData);
      
      Alert.alert(
        'Sucesso',
        'Máquina registrada com sucesso!',
        [
          {
            text: 'OK',
            onPress: () => {
              // Reset form and go back to machine list
              setFormData({
                name: '',
                m_state: 'active',
              });
              setErrors({});
              router.back();
            },
          },
        ]
      );
    } catch (error: any) {
      Alert.alert(
        'Erro',
        error.response?.data?.message || 'Erro ao registrar máquina. Tente novamente.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <KeyboardAvoidingView 
        style={styles.container} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <View style={styles.headerRow}>
              <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
              </TouchableOpacity>
              <View style={styles.headerContent}>
                <Ionicons name="construct" size={32} color="#FFFFFF" />
                <Text style={styles.title}>Registrar Atividade</Text>
              </View>
              <View style={styles.placeholder} />
            </View>
          </View>

          <View style={styles.form}>
            {/* Machine Name Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nome *</Text>
              <TextInput
                style={[styles.input, errors.name && styles.inputError]}
                value={formData.name}
                onChangeText={(value) => handleInputChange('name', value)}
                placeholder="Digite o nome do procedimento"
                placeholderTextColor="#999"
                autoCapitalize="words"
              />
              {errors.name && <Text style={styles.errorMessage}>{errors.name}</Text>}
            </View>

            {/* Machine State Select */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Disponibilidade</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={formData.m_state}
                  onValueChange={(value) => handleInputChange('m_state', value)}
                  style={styles.picker}
                  dropdownIconColor="#FFFFFF"
                >
                  <Picker.Item label="Disponivel" value="active" color="#000000" />
                  <Picker.Item label="Em Analise" value="maintenance" color="#000000" />
                  <Picker.Item label="Indisponivel" value="inactive" color="#000000" />
                </Picker>
              </View>
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
                  <Text style={styles.submitButtonText}>Registrar Máquina</Text>
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
    backgroundColor: '#1a1a1a',
  },
  scrollContainer: {
    flex: 1,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    padding: 20,
  },
  errorText: {
    fontSize: 20,
    fontWeight: 'bold' as const,
    color: '#FFFFFF',
    marginTop: 16,
    textAlign: 'center' as const,
  },
  errorSubText: {
    fontSize: 16,
    color: '#999',
    marginTop: 8,
    textAlign: 'center' as const,
  },
  header: {
    padding: 20,
    paddingTop: 60,
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
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 12,
  },
  placeholder: {
    width: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold' as const,
    color: '#FFFFFF',
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
    color: '#FFFFFF',
  },
  input: {
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#444',
    color: '#FFFFFF',
    fontSize: 16,
  },
  inputError: {
    borderColor: rose_theme.rose_main,
  },
  errorMessage: {
    fontSize: 14,
    color: rose_theme.rose_main,
    marginTop: 4,
  },
  pickerContainer: {
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#444',
    overflow: 'hidden' as const,
  },
  picker: {
    color: '#FFFFFF',
    backgroundColor: '#2a2a2a',
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
    color: '#FFFFFF',
  },
};
