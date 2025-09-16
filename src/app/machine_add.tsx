import { MachineForm } from '@/components';
import { useAuth } from '@/contexts';

export default function MachineAdd() {
  const { isAdmin } = useAuth();
  
  return <MachineForm isAdmin={isAdmin} showBackButton={true} />;
}
