import { StyleSheet } from 'react-native';
import { rose_theme } from '@constants/rose_theme';

export const styles = StyleSheet.create({
  // Modal Container
  modalContainer: {
    flex: 1,
    backgroundColor: rose_theme.dark_bg,
  },

  // Header
  editModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: rose_theme.rose_dark,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a2a',
  },

  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },

  editModalHeaderTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },

  // Keyboard and ScrollView
  keyboardAvoidingView: {
    flex: 1,
    flexDirection: 'column',
  },

  editFormScrollView: {
    flex: 1,
    padding: 20,
  },

  // Input Groups and Labels
  inputGroup: {
    marginBottom: 20,
  },

  inputGroupLast: {
    marginBottom: 30,
  },

  label: {
    fontSize: 14,
    fontWeight: '600',
    color: rose_theme.text_light,
    marginBottom: 8,
  },

  input: {
    borderWidth: 1,
    borderColor: '#3a3a3a',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 14,
    color: '#FFFFFF',
    backgroundColor: rose_theme.dark_surface,
  },

  // Date Input
  dateInput: {
    borderWidth: 1,
    borderColor: '#3a3a3a',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: rose_theme.dark_surface,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  dateInputText: {
    fontSize: 14,
    color: '#FFFFFF',
  },

  // Picker
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#3a3a3a',
    borderRadius: 8,
    backgroundColor: rose_theme.dark_surface,
    overflow: 'hidden',
  },

  picker: {
    color: '#FFFFFF',
    backgroundColor: rose_theme.dark_surface,
  },

  // State Buttons
  stateButtonsContainer: {
    flexDirection: 'row',
    gap: 10,
  },

  stateButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#3a3a3a',
    borderRadius: 8,
    backgroundColor: rose_theme.dark_surface,
    alignItems: 'center',
  },

  stateButtonActive: {
    backgroundColor: rose_theme.rose_main,
    borderColor: rose_theme.rose_main,
  },

  stateButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },

  stateButtonTextActive: {
    color: '#FFFFFF',
  },

  // Password Section
  passwordSection: {
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: rose_theme.rose_main,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },

  sectionSubtitle: {
    fontSize: 12,
    color: '#999',
    marginBottom: 16,
  },

  // Save Button
  saveButton: {
    flexDirection: 'row',
    backgroundColor: '#4CAF50',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    margin: 20,
    marginTop: 10,
  },

  saveButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },

  buttonDisabled: {
    opacity: 0.6,
  },
});
