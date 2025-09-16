import { PersonForm } from '@/components';
import { useAuth } from '@/contexts';

export default function PersonAdd() {
  const { isAdmin } = useAuth();
  
  return <PersonForm isAdmin={isAdmin} />;
}
