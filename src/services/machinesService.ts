import { apiService } from './apiService';
import { MachineResponse } from '@constants/types';

class MachinesService {
  async getMachines(): Promise<MachineResponse[]> {
    try {
      const response = await apiService.get<MachineResponse[]>('/machines');
      return response;
    } catch (error) {
      console.error('Error fetching machines:', error);
      throw error;
    }
  }

  async getMachineById(id: number): Promise<MachineResponse> {
    try {
      const response = await apiService.get<MachineResponse>(`/machines/${id}`);
      return response;
    } catch (error) {
      console.error('Error fetching machine:', error);
      throw error;
    }
  }
}

export const machinesService = new MachinesService();
