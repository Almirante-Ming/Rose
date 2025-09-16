import CadForm, { CadFormConfig, FormField } from './CadForm';
import { personsService } from '@/services';
import { PersonData } from '@constants/types';

const personFormFields: FormField[] = [
  {
    key: 'name',
    type: 'text',
    label: 'Nome',
    placeholder: 'Nome completo',
    required: true,
    autoCapitalize: 'words',
    validation: (value: string) => {
      if (!value.trim()) return 'Nome é obrigatório';
      return undefined;
    }
  },
  {
    key: 'phone',
    type: 'phone',
    label: 'Telefone',
    placeholder: '(00) 00000-0000',
    required: true,
    keyboardType: 'phone-pad',
    maxLength: 15,
    validation: (value: string) => {
      if (!value.trim()) return 'Telefone é obrigatório';
      return undefined;
    }
  },
  {
    key: 'cpf',
    type: 'cpf',
    label: 'CPF',
    placeholder: '000.000.000-00',
    required: true,
    keyboardType: 'numeric',
    maxLength: 14,
    validation: (value: string) => {
      if (!value.trim()) return 'CPF é obrigatório';
      if (!/^\d{11}$/.test(value.replace(/\D/g, ''))) return 'CPF deve ter 11 dígitos';
      return undefined;
    }
  },
  {
    key: 'dt_birth',
    type: 'date',
    label: 'Data de Nascimento',
    placeholder: 'Selecionar data',
    required: true,
    validation: (value: string) => {
      if (!value.trim()) return 'Data de nascimento é obrigatória';
      return undefined;
    }
  },
  {
    key: 'p_type',
    type: 'picker',
    label: 'Tipo de Pessoa',
    required: true,
    pickerOptions: [
      { label: 'Cliente', value: 'customer' },
      { label: 'Instrutor', value: 'trainer' },
      { label: 'Administrador', value: 'admin' }
    ]
  },
  {
    key: 'email',
    type: 'email',
    label: 'Email',
    placeholder: 'email@exemplo.com',
    required: true,
    keyboardType: 'email-address',
    autoCapitalize: 'none',
    validation: (value: string) => {
      if (!value.trim()) return 'Email é obrigatório';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Email inválido';
      return undefined;
    }
  },
  {
    key: 'password',
    type: 'password',
    label: 'Senha',
    placeholder: 'Senha (mínimo 6 caracteres)',
    required: true,
    secureTextEntry: true,
    validation: (value: string) => {
      if (!value.trim()) return 'Senha é obrigatória';
      if (value.length < 6) return 'Senha deve ter pelo menos 6 caracteres';
      return undefined;
    }
  }
];

interface PersonFormProps {
  isAdmin?: () => boolean;
}

export default function PersonForm({ isAdmin }: PersonFormProps) {
  const handleSubmit = async (data: PersonData) => {
    // Set default state for person
    const personData = {
      ...data,
      state: 'active' as const,
      p_type: data.p_type || 'customer'
    };
    
    await personsService.createPerson(personData);
  };

  const config: CadFormConfig = {
    title: 'Adicionar Nova Pessoa',
    icon: 'person-add',
    submitButtonText: 'Adicionar Pessoa',
    successMessage: 'Pessoa adicionada com sucesso!',
    fields: personFormFields,
    onSubmit: handleSubmit,
    requiresAdmin: true,
    showBackButton: true
  };

  return <CadForm config={config} isAdmin={isAdmin} />;
}