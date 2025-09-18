import CadForm, { CadFormConfig, FormField } from './CadForm';
import { machinesService } from '@/services';
import { MachineData } from '@constants/types';

const machineFormFields: FormField[] = [
  {
    key: 'name',
    type: 'text',
    label: 'Nome',
    placeholder: 'procedimento/atividade',
    required: true,
    autoCapitalize: 'words',
    validation: (value: string) => {
      if (!value.trim()) return 'Nome é obrigatório';
      if (value.trim().length < 2) return 'Nome deve ter pelo menos 2 caracteres';
      return undefined;
    }
  },
  {
    key: 'm_state',
    type: 'picker',
    label: 'Disponibilidade',
    required: true,
    pickerOptions: [
      { label: 'Disponivel', value: 'active' },
      { label: 'Em Analise', value: 'maintenance' },
      { label: 'Indisponivel', value: 'inactive' }
    ]
  }
];

interface MachineFormProps {
  isAdmin?: () => boolean;
  showBackButton?: boolean;
}

export default function MachineForm({ isAdmin, showBackButton = false }: MachineFormProps) {
  const handleSubmit = async (data: MachineData) => {
    await machinesService.createMachine(data);
  };

  const config: CadFormConfig = {
    title: 'Registrar Atividade',
    icon: 'construct',
    submitButtonText: 'Registrar Atividade',
    successMessage: 'Atividade registrada com sucesso!',
    fields: machineFormFields,
    onSubmit: handleSubmit,
    requiresAdmin: true,
    showBackButton: showBackButton
  };

  return <CadForm config={config} isAdmin={isAdmin} />;
}