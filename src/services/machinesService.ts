import { apiService } from './apiService';
import { MachineResponse, MachineData } from '@constants/types';

class MachinesService {
  async getMachines(): Promise<MachineResponse[]> {
    try {
      const response = await apiService.get<MachineResponse[]>('/machines/');
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

  async createMachine(machineData: MachineData): Promise<MachineResponse> {
    try {
      const response = await apiService.post<MachineResponse>('/machines/', machineData);
      return response;
    } catch (error) {
      console.error('Error creating machine:', error);
      throw error;
    }
  }
}

export const machinesService = new MachinesService();
