import { apiService } from './apiService';
import { PersonData, PersonResponse } from '@constants/types';

class PersonsService {
  async createPerson(personData: PersonData): Promise<PersonResponse> {
    try {
      const response = await apiService.post<PersonResponse>('/persons', personData);
      return response;
    } catch (error) {
      console.error('Error creating person:', error);
      throw error;
    }
  }

  async getPersons(): Promise<PersonResponse[]> {
    try {
      const response = await apiService.get<PersonResponse[]>('/persons');
      return response;
    } catch (error) {
      console.error('Error fetching persons:', error);
      throw error;
    }
  }

  async getPersonById(id: number): Promise<PersonResponse> {
    try {
      const response = await apiService.get<PersonResponse>(`/persons/${id}`);
      return response;
    } catch (error) {
      console.error('Error fetching person:', error);
      throw error;
    }
  }

  async updatePerson(id: number, personData: Partial<PersonData>): Promise<PersonResponse> {
    try {
      const response = await apiService.put<PersonResponse>(`/persons/${id}`, personData);
      return response;
    } catch (error) {
      console.error('Error updating person:', error);
      throw error;
    }
  }

  async deletePerson(id: number): Promise<void> {
    try {
      await apiService.delete(`/persons/${id}`);
    } catch (error) {
      console.error('Error deleting person:', error);
      throw error;
    }
  }
}

export const personsService = new PersonsService();
