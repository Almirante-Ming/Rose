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
    borderBottomColor: rose_theme.dark_border,
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
    color: rose_theme.white,
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
    borderColor: rose_theme.dark_border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 14,
    color: rose_theme.white,
    backgroundColor: rose_theme.dark_surface,
  },

  // Date Input
  dateInput: {
    borderWidth: 1,
    borderColor: rose_theme.dark_border,
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
    color: rose_theme.white,
  },

  // Picker
  pickerContainer: {
    borderWidth: 1,
    borderColor: rose_theme.dark_border,
    borderRadius: 8,
    backgroundColor: rose_theme.dark_surface,
    overflow: 'hidden',
  },

  picker: {
    color: rose_theme.white,
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
    borderColor: rose_theme.dark_border,
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
    color: rose_theme.white,
  },

  stateButtonTextActive: {
    color: rose_theme.white,
  },

  // Password Section
  passwordSection: {
    backgroundColor: rose_theme.dark_section_bg,
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: rose_theme.rose_main,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: rose_theme.white,
    marginBottom: 4,
  },

  sectionSubtitle: {
    fontSize: 12,
    color: rose_theme.dark_subtitle,
    marginBottom: 16,
  },

  // Save Button
  saveButton: {
    flexDirection: 'row',
    backgroundColor: rose_theme.success,
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
    color: rose_theme.white,
  },

  buttonDisabled: {
    opacity: 0.6,
  },
});
