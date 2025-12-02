import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import { personsService } from '@/services';
import { rose_theme } from '@constants/rose_theme';
import { PersonResponse, PersonData } from '@constants/types';
import { styles } from '@/components/PersonEditModal.styles';

interface PersonEditModalProps {
  visible: boolean;
  editingPerson: PersonResponse | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function PersonEditModal({
  visible,
  editingPerson,
  onClose,
  onSuccess,
}: PersonEditModalProps) {
  const [editFormData, setEditFormData] = useState<PersonData>({
    cpf: '',
    name: '',
    email: '',
    phone: '',
    dt_birth: '',
    state: 'active',
    p_type: 'customer',
    password: '',
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  React.useEffect(() => {
    if (editingPerson && visible) {
      setEditFormData({
        cpf: editingPerson.cpf,
        name: editingPerson.name,
        email: editingPerson.email,
        phone: editingPerson.phone,
        dt_birth: editingPerson.dt_birth,
        state: editingPerson.state as 'active' | 'inactive',
        p_type: editingPerson.p_type as 'customer' | 'trainer' | 'admin',
        password: '',
      });
      setAdminPassword('');
      setNewPassword('');
      setConfirmPassword('');
    }
  }, [visible, editingPerson]);

  const handleClose = () => {
    setEditFormData({
      cpf: '',
      name: '',
      email: '',
      phone: '',
      dt_birth: '',
      state: 'active',
      p_type: 'customer',
      password: '',
    });
    setAdminPassword('');
    setNewPassword('');
    setConfirmPassword('');
    onClose();
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (selectedDate) {
      const dateString = selectedDate.toISOString().split('T')[0];
      setEditFormData({ ...editFormData, dt_birth: dateString });
    }
    setShowDatePicker(false);
  };

  const formatDate = (dateString: string): string => {
    if (!dateString) return '';
    const [year, month, day] = dateString.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    return date.toLocaleDateString('pt-BR');
  };

  const handleUpdatePerson = async () => {
    if (!editingPerson) return;

    // Validate required fields
    if (!editFormData.name.trim() || !editFormData.email.trim() || !editFormData.phone.trim()) {
      Alert.alert('Erro', 'Nome, email e telefone são obrigatórios');
      return;
    }

    // If password is being changed, validate passwords
    if (newPassword || confirmPassword) {
      if (!adminPassword) {
        Alert.alert('Erro', 'Senha do administrador é obrigatória para alteração de senha do usuário');
        return;
      }
      if (newPassword !== confirmPassword) {
        Alert.alert('Erro', 'As novas senhas não coincidem');
        return;
      }
      if (newPassword.length < 6) {
        Alert.alert('Erro', 'A nova senha deve ter no mínimo 6 caracteres');
        return;
      }
    }

    setIsSubmitting(true);
    try {
      // Update person data
      await personsService.updatePerson(editingPerson.id, {
        ...editFormData,
        password: newPassword || editFormData.password,
      });

      Alert.alert('Sucesso', 'Pessoa atualizada com sucesso!', [
        {
          text: 'OK',
          onPress: () => {
            handleClose();
            onSuccess();
          },
        },
      ]);
    } catch (error: any) {
      Alert.alert(
        'Erro',
        error.response?.data?.message || 'Erro ao atualizar pessoa. Tente novamente.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={handleClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.editModalHeader}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleClose}
          >
            <Ionicons name="chevron-back" size={28} color={rose_theme.white} />
          </TouchableOpacity>
          <Text style={styles.editModalHeaderTitle}>Editar Cadastro</Text>
          <View style={styles.backButton} />
        </View>

        {editingPerson && (
          <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.keyboardAvoidingView}
          >
            <ScrollView style={styles.editFormScrollView} showsVerticalScrollIndicator={false}>
              {/* Name */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Nome *</Text>
                <TextInput
                  style={styles.input}
                  value={editFormData.name}
                  onChangeText={(text) => setEditFormData({ ...editFormData, name: text })}
                  placeholder="Digite o nome"
                  placeholderTextColor="#999"
                />
              </View>

              {/* CPF */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>CPF</Text>
                <TextInput
                  style={styles.input}
                  value={editFormData.cpf}
                  onChangeText={(text) => setEditFormData({ ...editFormData, cpf: text })}
                  placeholder="Digite o CPF"
                  placeholderTextColor="#999"
                />
              </View>

              {/* Email */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Email *</Text>
                <TextInput
                  style={styles.input}
                  value={editFormData.email}
                  onChangeText={(text) => setEditFormData({ ...editFormData, email: text })}
                  placeholder="Digite o email"
                  placeholderTextColor="#999"
                  keyboardType="email-address"
                />
              </View>

              {/* Phone */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Telefone *</Text>
                <TextInput
                  style={styles.input}
                  value={editFormData.phone}
                  onChangeText={(text) => setEditFormData({ ...editFormData, phone: text })}
                  placeholder="Digite o telefone"
                  placeholderTextColor="#999"
                />
              </View>

              {/* Birth Date */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Data de Nascimento</Text>
                <TouchableOpacity
                  style={styles.dateInput}
                  onPress={() => setShowDatePicker(true)}
                >
                  <Ionicons name="calendar" size={20} color={rose_theme.rose_main} />
                  <Text style={styles.dateInputText}>
                    {editFormData.dt_birth ? formatDate(editFormData.dt_birth) : 'Selecionar data'}
                  </Text>
                </TouchableOpacity>
              </View>

              {showDatePicker && (
                <DateTimePicker
                  value={editFormData.dt_birth ? new Date(editFormData.dt_birth) : new Date()}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={handleDateChange}
                />
              )}

              {/* Type */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Tipo</Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={editFormData.p_type}
                    onValueChange={(value) => setEditFormData({ ...editFormData, p_type: value as any })}
                    style={styles.picker}
                  >
                    <Picker.Item label="Cliente" value="customer" />
                    <Picker.Item label="Instrutor" value="trainer" />
                    <Picker.Item label="Administrador" value="admin" />
                  </Picker>
                </View>
              </View>

              {/* State */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Status</Text>
                <View style={styles.stateButtonsContainer}>
                  {['active', 'inactive'].map((state) => (
                    <TouchableOpacity
                      key={state}
                      style={[
                        styles.stateButton,
                        editFormData.state === state && styles.stateButtonActive,
                      ]}
                      onPress={() => setEditFormData({ ...editFormData, state: state as any })}
                    >
                      <Text
                        style={[
                          styles.stateButtonText,
                          editFormData.state === state && styles.stateButtonTextActive,
                        ]}
                      >
                        {state === 'active' ? 'Ativo' : 'Inativo'}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Password Section */}
              <View style={styles.passwordSection}>
                <Text style={styles.sectionTitle}>Alterar Senha</Text>
                <Text style={styles.sectionSubtitle}>Deixe em branco para não alterar</Text>

                {/* Admin Password (to confirm action) */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Sua Senha (Administrador) *</Text>
                  <TextInput
                    style={styles.input}
                    value={adminPassword}
                    onChangeText={setAdminPassword}
                    placeholder="Digite sua senha para confirmar"
                    placeholderTextColor="#999"
                    secureTextEntry
                  />
                </View>

                {/* New Password */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Nova Senha do Usuário</Text>
                  <TextInput
                    style={styles.input}
                    value={newPassword}
                    onChangeText={setNewPassword}
                    placeholder="Digite a nova senha"
                    placeholderTextColor="#999"
                    secureTextEntry
                  />
                </View>

                {/* Confirm Password */}
                <View style={[styles.inputGroup, styles.inputGroupLast]}>
                  <Text style={styles.label}>Confirmar Nova Senha</Text>
                  <TextInput
                    style={styles.input}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    placeholder="Confirme a nova senha"
                    placeholderTextColor="#999"
                    secureTextEntry
                  />
                </View>
              </View>
            </ScrollView>

            {/* Save Button - Outside ScrollView */}
            <TouchableOpacity
              style={[styles.saveButton, isSubmitting && styles.buttonDisabled]}
              onPress={handleUpdatePerson}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator color={rose_theme.white} size="small" />
              ) : (
                <>
                  <Ionicons name="checkmark" size={20} color={rose_theme.white} />
                  <Text style={styles.saveButtonText}>Salvar Alterações</Text>
                </>
              )}
            </TouchableOpacity>
          </KeyboardAvoidingView>
        )}
      </View>
    </Modal>
  );
}
