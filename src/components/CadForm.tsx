import { useState, ReactNode } from 'react';
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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { router, Stack } from 'expo-router';
import { rose_theme } from '@constants/rose_theme';

export interface FormField {
  key: string;
  type: 'text' | 'email' | 'phone' | 'cpf' | 'password' | 'date' | 'picker';
  label: string;
  placeholder?: string;
  required?: boolean;
  validation?: (value: string) => string | undefined;
  pickerOptions?: { label: string; value: string }[];
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  maxLength?: number;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  secureTextEntry?: boolean;
}

export interface CadFormConfig {
  title: string;
  icon: string;
  submitButtonText: string;
  successMessage: string;
  fields: FormField[];
  onSubmit: (data: any) => Promise<void>;
  requiresAdmin?: boolean;
  showBackButton?: boolean;
}

interface CadFormProps {
  config: CadFormConfig;
  isAdmin?: () => boolean;
}

export default function CadForm({ config, isAdmin }: CadFormProps) {
  const insets = useSafeAreaInsets();
  const [isLoading, setIsLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [formData, setFormData] = useState<Record<string, any>>(() => {
    const initialData: Record<string, any> = {};
    config.fields.forEach(field => {
      if (field.type === 'picker' && field.pickerOptions?.length) {
        initialData[field.key] = field.pickerOptions[0].value;
      } else {
        initialData[field.key] = '';
      }
    });
    return initialData;
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Check admin access if required
  if (config.requiresAdmin && isAdmin && !isAdmin()) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={[styles.container, { paddingTop: insets.top }]}>
          <View style={styles.errorContainer}>
            <Ionicons name="warning" size={48} color={rose_theme.rose_main} />
            <Text style={styles.errorText}>Acesso negado</Text>
            <Text style={styles.errorSubText}>Apenas administradores podem acessar esta página</Text>
          </View>
        </View>
      </>
    );
  }

  // Check admin access if required
  if (config.requiresAdmin && isAdmin && !isAdmin()) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={[styles.container, { paddingTop: insets.top }]}>
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
    const newErrors: Record<string, string> = {};

    config.fields.forEach(field => {
      const value = formData[field.key];
      
      if (field.required && !value?.trim()) {
        newErrors[field.key] = `${field.label} é obrigatório`;
        return;
      }

      if (field.validation) {
        const validationError = field.validation(value);
        if (validationError) {
          newErrors[field.key] = validationError;
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const formatValue = (field: FormField, value: string): string => {
    switch (field.type) {
      case 'cpf':
        const numbers = value.replace(/\D/g, '');
        return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
      case 'phone':
        const phoneNumbers = value.replace(/\D/g, '');
        if (phoneNumbers.length <= 10) {
          return phoneNumbers.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
        }
        return phoneNumbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
      default:
        return value;
    }
  };

  const handleInputChange = (field: FormField, value: string) => {
    const formattedValue = formatValue(field, value);
    
    setFormData(prev => ({ ...prev, [field.key]: formattedValue }));
    
    if (errors[field.key]) {
      setErrors(prev => ({ ...prev, [field.key]: '' }));
    }
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    const dateField = config.fields.find(f => f.type === 'date');
    if (!dateField) return;

    if (event.type === 'dismissed') {
      setShowDatePicker(false);
      return;
    }
    
    if (selectedDate) {
      const year = selectedDate.getFullYear();
      const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const day = String(selectedDate.getDate()).padStart(2, '0');
      const formattedDate = `${year}-${month}-${day}`;
      
      setFormData(prev => ({ ...prev, [dateField.key]: formattedDate }));
      
      if (errors[dateField.key]) {
        setErrors(prev => ({ ...prev, [dateField.key]: '' }));
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
      // Clean data for submission
      const cleanedData = { ...formData };
      config.fields.forEach(field => {
        if (field.type === 'cpf' || field.type === 'phone') {
          cleanedData[field.key] = cleanedData[field.key].replace(/\D/g, '');
        }
      });

      await config.onSubmit(cleanedData);
      
      Alert.alert(
        'Sucesso',
        config.successMessage,
        [
          {
            text: 'OK',
            onPress: () => {
              if (config.showBackButton) {
                router.back();
              } else {
                // Reset form
                const resetData: Record<string, any> = {};
                config.fields.forEach(field => {
                  if (field.type === 'picker' && field.pickerOptions?.length) {
                    resetData[field.key] = field.pickerOptions[0].value;
                  } else {
                    resetData[field.key] = '';
                  }
                });
                setFormData(resetData);
                setErrors({});
              }
            }
          }
        ]
      );
    } catch (error: any) {
      Alert.alert(
        'Erro',
        error.response?.data?.message || 'Erro ao processar formulário. Tente novamente.'
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

  const getCurrentDate = (): Date => {
    const dateField = config.fields.find(f => f.type === 'date');
    if (!dateField || !formData[dateField.key]) return new Date();
    
    const [year, month, day] = formData[dateField.key].split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    return isNaN(date.getTime()) ? new Date() : date;
  };

  const renderField = (field: FormField) => {
    const value = formData[field.key];
    const error = errors[field.key];

    switch (field.type) {
      case 'date':
        return (
          <View key={field.key} style={styles.inputContainer}>
            <Text style={styles.label}>
              {field.label} {field.required && '*'}
            </Text>
            <TouchableOpacity
              style={[styles.input, styles.dateInput, error && styles.inputError]}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={[styles.dateText, !value && styles.placeholderText]}>
                {value ? formatDateForDisplay(value) : field.placeholder || 'Selecionar data'}
              </Text>
              <Ionicons name="calendar" size={20} color={rose_theme.rose_main} />
            </TouchableOpacity>
            {error && <Text style={styles.errorText}>{error}</Text>}
          </View>
        );

      case 'picker':
        return (
          <View key={field.key} style={styles.inputContainer}>
            <Text style={styles.label}>
              {field.label} {field.required && '*'}
            </Text>
            <View style={[styles.pickerContainer, error && styles.inputError]}>
              <Picker
                selectedValue={value}
                onValueChange={(itemValue) => handleInputChange(field, itemValue)}
                style={styles.picker}
                dropdownIconColor="#999"
              >
                {field.pickerOptions?.map(option => (
                  <Picker.Item 
                    key={option.value} 
                    label={option.label} 
                    value={option.value} 
                    color="#333"
                  />
                ))}
              </Picker>
            </View>
            {error && <Text style={styles.errorText}>{error}</Text>}
          </View>
        );

      default:
        return (
          <View key={field.key} style={styles.inputContainer}>
            <Text style={styles.label}>
              {field.label} {field.required && '*'}
            </Text>
            <TextInput
              style={[styles.input, error && styles.inputError]}
              value={value}
              onChangeText={(val) => handleInputChange(field, val)}
              placeholder={field.placeholder}
              placeholderTextColor="#999"
              keyboardType={field.keyboardType || 'default'}
              maxLength={field.maxLength}
              autoCapitalize={field.autoCapitalize || 'sentences'}
              secureTextEntry={field.secureTextEntry}
            />
            {error && <Text style={styles.errorText}>{error}</Text>}
          </View>
        );
    }
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <KeyboardAvoidingView 
        style={[styles.container, { paddingTop: insets.top }]} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <View style={styles.headerRow}>
              {config.showBackButton && (
                <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                  <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
                </TouchableOpacity>
              )}
              <View style={styles.headerContent}>
                <Ionicons name={config.icon as any} size={32} color="#FFFFFF" />
                <Text style={styles.title}>{config.title}</Text>
              </View>
              {config.showBackButton && <View style={styles.placeholder} />}
            </View>
          </View>

          <View style={styles.form}>
            {config.fields.map(renderField)}

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
                  <Text style={styles.submitButtonText}>{config.submitButtonText}</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>

        {showDatePicker && (
          <DateTimePicker
            testID="dateTimePicker"
            value={getCurrentDate()}
            mode="date"
            is24Hour={true}
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={handleDateChange}
            maximumDate={new Date()}
          />
        )}
      </KeyboardAvoidingView>
    </>
  );
}

const styles = {
  container: {
    flex: 1,
    backgroundColor: rose_theme.dark_bg,
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
    color: rose_theme.text_light,
    marginTop: 10,
    textAlign: 'center' as const,
  },
  form: {
    backgroundColor: rose_theme.dark_surface,
    borderRadius: 15,
    padding: 20,
    borderWidth: 2,
    borderColor: rose_theme.rose_main,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 40,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: rose_theme.text_light,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: rose_theme.gray_light,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: rose_theme.light_surface,
    color: rose_theme.text_dark,
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
    color: rose_theme.text_dark,
  },
  placeholderText: {
    color: rose_theme.text_secondary,
  },
  pickerContainer: {
    backgroundColor: rose_theme.light_surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: rose_theme.gray_light,
    overflow: 'hidden' as const,
  },
  picker: {
    color: rose_theme.text_dark,
    backgroundColor: rose_theme.light_surface,
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
    backgroundColor: rose_theme.gray_light,
  },
  submitButtonText: {
    color: rose_theme.text_light,
    fontSize: 18,
    fontWeight: 'bold' as const,
    marginLeft: 8,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    padding: 40,
    backgroundColor: rose_theme.dark_bg,
  },
  errorText: {
    fontSize: 12,
    color: rose_theme.rose_main,
    marginTop: 4,
  },
  errorSubText: {
    fontSize: 16,
    color: rose_theme.text_secondary,
    textAlign: 'center' as const,
    marginTop: 10,
  },
};