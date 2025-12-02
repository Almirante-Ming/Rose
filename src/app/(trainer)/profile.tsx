import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { useState, useEffect } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/contexts';
import { personsService, authService } from '@/services';
import { PersonResponse, PersonData } from '@constants/types';
import { rose_theme } from '@constants/rose_theme';

const styles = {
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    marginBottom: 24,
  },
  headerIcon: {
    marginRight: 12,
  },
  headerText: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: '#ffffff',
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#ffffff',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    color: '#ffffff',
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#404040',
  },
  inputDisabled: {
    opacity: 0.6,
  },
  picker: {
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#404040',
    color: '#ffffff',
  },
  dateButton: {
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#404040',
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
  },
  dateButtonText: {
    color: '#ffffff',
    fontSize: 14,
  },
  buttonContainer: {
    flexDirection: 'row' as const,
    gap: 12,
    marginTop: 24,
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  updateButton: {
    backgroundColor: rose_theme.rose_main,
  },
  cancelButton: {
    backgroundColor: '#404040',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#ffffff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    backgroundColor: '#121212',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    backgroundColor: '#121212',
    paddingHorizontal: 16,
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: rose_theme.rose_main,
    marginTop: 16,
  },
  errorSubText: {
    fontSize: 14,
    color: '#888888',
    marginTop: 8,
    textAlign: 'center' as const,
  },
};

export default function Profile() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [profileData, setProfileData] = useState<PersonResponse | null>(null);
  const [formData, setFormData] = useState<Partial<PersonResponse>>({});
  const [isEdited, setIsEdited] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [datePickerField, setDatePickerField] = useState<'dt_birth' | null>(null);
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [storedPassword, setStoredPassword] = useState<string | null>(null);

  useEffect(() => {
    fetchProfileData();
    loadStoredPassword();
  }, []);

  const fetchProfileData = async () => {
    if (!user?.id) {
      Alert.alert('Erro', 'Usuário não identificado');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const data = await personsService.getPersonById(user.id);
      setProfileData(data);
      setFormData(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
      Alert.alert('Erro', 'Não foi possível carregar o perfil');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFieldChange = (key: keyof PersonResponse, value: any) => {
    setFormData(prev => ({
      ...prev,
      [key]: value,
    }));
    
    const hasChanges = JSON.stringify(profileData) !== JSON.stringify({ ...formData, [key]: value });
    setIsEdited(hasChanges);
  };

  const handleDateChange = (event: any, selectedDate: Date | undefined) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }

    if (selectedDate && datePickerField) {
      const year = selectedDate.getFullYear();
      const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const day = String(selectedDate.getDate()).padStart(2, '0');
      const formattedDate = `${year}-${month}-${day}`;
      handleFieldChange(datePickerField, formattedDate);
    }
  };

  const handleCancel = () => {
    setFormData(profileData || {});
    setIsEdited(false);
  };

  const handleUpdate = async () => {
    if (!user?.id || !profileData) return;

    try {
      setIsSaving(true);
      
      const changedData: Partial<PersonData> = {};
      Object.keys(formData).forEach(key => {
        if (profileData[key as keyof PersonResponse] !== formData[key as keyof PersonResponse]) {
          const value = formData[key as keyof PersonResponse];
          if (key === 'state') {
            if (value === 'active' || value === 'inactive') {
              (changedData as any)[key] = value;
            }
          } else {
            (changedData as any)[key] = value;
          }
        }
      });

      if (Object.keys(changedData).length === 0) {
        Alert.alert('Aviso', 'Nenhuma alteração detectada');
        return;
      }

      await personsService.updatePerson(user.id, changedData);
      
      setProfileData(formData as PersonResponse);
      setIsEdited(false);
      Alert.alert('Sucesso', 'Perfil atualizado com sucesso!');
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Erro', 'Não foi possível atualizar o perfil');
    } finally {
      setIsSaving(false);
    }
  };

  const loadStoredPassword = async () => {
    try {
      const password = await authService.getPassword();
      setStoredPassword(password);
    } catch (error) {
      console.error('Error loading stored password:', error);
    }
  };

  const handleChangePassword = async () => {
    if (!storedPassword) {
      Alert.alert('Erro', 'Não foi possível recuperar a senha armazenada');
      return;
    }
    if (currentPassword !== storedPassword) {
      Alert.alert('Erro', 'Senha atual incorreta');
      return;
    }
    if (!newPassword.trim()) {
      Alert.alert('Erro', 'Digite a nova senha');
      return;
    }
    if (newPassword.length < 6) {
      Alert.alert('Erro', 'A nova senha deve ter pelo menos 6 caracteres');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Erro', 'As senhas não coincidem');
      return;
    }

    try {
      setIsSaving(true);
      if (!user?.id) return;

      await personsService.updatePerson(user.id, { password: newPassword });
      await authService.savePassword(newPassword);

      Alert.alert('Sucesso', 'Senha alterada com sucesso!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setShowPasswordSection(false);
      setStoredPassword(newPassword);
    } catch (error) {
      console.error('Error changing password:', error);
      Alert.alert('Erro', 'Não foi possível alterar a senha');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelPassword = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setShowPasswordSection(false);
  };

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color={rose_theme.rose_main} />
        <Text style={{ color: '#888888', marginTop: 12 }}>Carregando perfil...</Text>
      </View>
    );
  }

  if (!profileData) {
    return (
      <View style={[styles.errorContainer, { paddingTop: insets.top }]}>
        <Ionicons name="warning" size={48} color={rose_theme.rose_main} />
        <Text style={styles.errorText}>Erro ao carregar perfil</Text>
        <Text style={styles.errorSubText}>Não foi possível recuperar os dados do usuário</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView 
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Ionicons 
            name="person-circle" 
            size={40} 
            color={rose_theme.rose_main}
            style={styles.headerIcon}
          />
          <Text style={styles.headerText}>Perfil</Text>
        </View>

        {/* Name */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Nome</Text>
          <TextInput
            style={[styles.input]}
            value={formData.name || ''}
            onChangeText={(value) => handleFieldChange('name', value)}
            placeholder="Nome completo"
            placeholderTextColor="#666666"
          />
        </View>

        {/* Email */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={[styles.input]}
            value={formData.email || ''}
            onChangeText={(value) => handleFieldChange('email', value)}
            placeholder="email@exemplo.com"
            placeholderTextColor="#666666"
            keyboardType="email-address"
          />
        </View>

        {/* Phone */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Telefone</Text>
          <TextInput
            style={[styles.input]}
            value={formData.phone || ''}
            onChangeText={(value) => handleFieldChange('phone', value)}
            placeholder="(00) 00000-0000"
            placeholderTextColor="#666666"
            keyboardType="phone-pad"
          />
        </View>

        {/* CPF */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>CPF</Text>
          <TextInput
            style={[styles.input, styles.inputDisabled]}
            value={formData.cpf || ''}
            editable={false}
            placeholder="000.000.000-00"
            placeholderTextColor="#666666"
          />
        </View>

        {/* Date of Birth */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Data de Nascimento</Text>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => {
              setDatePickerField('dt_birth');
              setShowDatePicker(true);
            }}
          >
            <Text style={styles.dateButtonText}>
              {formData.dt_birth ? (() => {
                const [year, month, day] = formData.dt_birth!.split('-');
                return `${day}/${month}/${year}`;
              })() : 'Selecionar data'}
            </Text>
            <Ionicons name="calendar" size={20} color={rose_theme.rose_main} />
          </TouchableOpacity>
        </View>

        {/* Type */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Tipo de Pessoa</Text>
          <Text style={[styles.input, { paddingVertical: 16, color: '#aaaaaa' }]}>
            {formData.p_type === 'customer' ? 'Cliente' : formData.p_type === 'trainer' ? 'Instrutor' : 'Administrador'}
          </Text>
        </View>

        {/* State */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Status</Text>
          <Text style={[styles.input, { paddingVertical: 16, color: '#aaaaaa' }]}>
            {formData.state === 'active' ? 'Ativo' : 'Inativo'}
          </Text>
        </View>

        {/* Created At */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Data de Criação</Text>
          <TextInput
            style={[styles.input, styles.inputDisabled]}
            value={profileData.dt_create ? new Date(profileData.dt_create).toLocaleDateString('pt-BR') : ''}
            editable={false}
            placeholderTextColor="#666666"
          />
        </View>

        {/* Updated At */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Última Atualização</Text>
          <TextInput
            style={[styles.input, styles.inputDisabled]}
            value={profileData.dt_update ? new Date(profileData.dt_update).toLocaleDateString('pt-BR') : ''}
            editable={false}
            placeholderTextColor="#666666"
          />
        </View>

        {/* Change Password Section */}
        <TouchableOpacity
          style={{
            marginTop: 24,
            paddingVertical: 12,
            paddingHorizontal: 16,
            backgroundColor: rose_theme.rose_main,
            borderRadius: 8,
            flexDirection: 'row' as const,
            alignItems: 'center' as const,
            justifyContent: 'space-between' as const,
          }}
          onPress={() => setShowPasswordSection(!showPasswordSection)}
        >
          <Text style={{ color: '#ffffff', fontSize: 16, fontWeight: '600' as const }}>Alterar Senha</Text>
          <Ionicons name={showPasswordSection ? 'chevron-up' : 'chevron-down'} size={20} color="#ffffff" />
        </TouchableOpacity>

        {showPasswordSection && (
          <View style={{ marginTop: 16, paddingBottom: 16 }}>
            {/* Current Password */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Senha Atual</Text>
              <View style={{ flexDirection: 'row' as const, alignItems: 'center' as const }}>
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  value={currentPassword}
                  onChangeText={setCurrentPassword}
                  placeholder="Digite sua senha atual"
                  placeholderTextColor="#666666"
                  secureTextEntry={!showCurrentPassword}
                />
                <TouchableOpacity
                  onPress={() => setShowCurrentPassword(!showCurrentPassword)}
                  style={{ position: 'absolute' as const, right: 12 }}
                >
                  <Ionicons
                    name={showCurrentPassword ? 'eye-off' : 'eye'}
                    size={20}
                    color={rose_theme.rose_main}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* New Password */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Nova Senha</Text>
              <View style={{ flexDirection: 'row' as const, alignItems: 'center' as const }}>
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  value={newPassword}
                  onChangeText={setNewPassword}
                  placeholder="Digite a nova senha"
                  placeholderTextColor="#666666"
                  secureTextEntry={!showNewPassword}
                />
                <TouchableOpacity
                  onPress={() => setShowNewPassword(!showNewPassword)}
                  style={{ position: 'absolute' as const, right: 12 }}
                >
                  <Ionicons
                    name={showNewPassword ? 'eye-off' : 'eye'}
                    size={20}
                    color={rose_theme.rose_main}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Confirm Password */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Confirmar Senha</Text>
              <View style={{ flexDirection: 'row' as const, alignItems: 'center' as const }}>
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="Confirme a nova senha"
                  placeholderTextColor="#666666"
                  secureTextEntry={!showConfirmPassword}
                />
                <TouchableOpacity
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={{ position: 'absolute' as const, right: 12 }}
                >
                  <Ionicons
                    name={showConfirmPassword ? 'eye-off' : 'eye'}
                    size={20}
                    color={rose_theme.rose_main}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Password Action Buttons */}
            <View style={{ flexDirection: 'row' as const, gap: 12, marginTop: 12 }}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={handleCancelPassword}
                disabled={isSaving}
              >
                <Text style={styles.buttonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.updateButton]}
                onPress={handleChangePassword}
                disabled={isSaving}
              >
                {isSaving ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <Text style={styles.buttonText}>Alterar</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Action Buttons - Only show if edited */}
      {isEdited && (
        <View style={[styles.buttonContainer, { paddingBottom: 24 + insets.bottom }]}>
          <TouchableOpacity
            style={[styles.button, styles.cancelButton]}
            onPress={handleCancel}
            disabled={isSaving}
          >
            <Text style={styles.buttonText}>Cancelar</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.updateButton]}
            onPress={handleUpdate}
            disabled={isSaving}
          >
            {isSaving ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.buttonText}>Atualizar</Text>
            )}
          </TouchableOpacity>
        </View>
      )}

      {/* Date Picker */}
      {showDatePicker && (
        <DateTimePicker
          value={formData.dt_birth ? new Date(formData.dt_birth) : new Date()}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleDateChange}
        />
      )}
    </KeyboardAvoidingView>
  );
}
