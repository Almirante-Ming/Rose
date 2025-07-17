import { apiService } from './apiService';
import { authService } from './authService';
import { NotesData, Note } from '@constants/types';

export interface ScheduleResponse extends Array<Note> {}

export const schedulesService = {
    // Fetch schedules for the authenticated user
    async getUserSchedules(): Promise<NotesData> {
        try {
            const userId = await authService.getUserId();
            
            if (userId === null || userId === undefined) {
                throw new Error('User not authenticated or user ID not found');
            }

            console.log('Fetching schedules for user ID:', userId); // Debug log
            const schedules: ScheduleResponse = await apiService.get(`/schedule/${userId}`);
            
            // Convert array response to date-grouped object
            const groupedSchedules: NotesData = {};
            schedules.forEach(schedule => {
                const date = schedule.dt_init;
                if (!groupedSchedules[date]) {
                    groupedSchedules[date] = [];
                }
                groupedSchedules[date].push(schedule);
            });
            
            return groupedSchedules;
        } catch (error) {
            console.error('Error fetching user schedules:', error);
            throw error;
        }
    },

    // Fetch schedules for a specific date range (optional enhancement)
    async getUserSchedulesByDateRange(startDate: string, endDate: string): Promise<NotesData> {
        try {
            const userId = await authService.getUserId();
            
            if (userId === null || userId === undefined) {
                throw new Error('User not authenticated or user ID not found');
            }

            const schedules: ScheduleResponse = await apiService.get(
                `/schedules/${userId}?startDate=${startDate}&endDate=${endDate}`
            );
            
            // Convert array response to date-grouped object
            const groupedSchedules: NotesData = {};
            schedules.forEach(schedule => {
                const date = schedule.dt_init;
                if (!groupedSchedules[date]) {
                    groupedSchedules[date] = [];
                }
                groupedSchedules[date].push(schedule);
            });
            
            return groupedSchedules;
        } catch (error) {
            console.error('Error fetching user schedules by date range:', error);
            throw error;
        }
    },

    // Create a new schedule entry
    async createSchedule(schedule: Note): Promise<Note> {
        try {
            const userId = await authService.getUserId();
            
            if (userId === null || userId === undefined) {
                throw new Error('User not authenticated or user ID not found');
            }

            const newSchedule = await apiService.post<Note>(`/schedules/${userId}`, schedule);
            return newSchedule;
        } catch (error) {
            console.error('Error creating schedule:', error);
            throw error;
        }
    },

    // Update an existing schedule entry
    async updateSchedule(scheduleId: string, note: Partial<Note>): Promise<Note> {
        try {
            const userId = await authService.getUserId();
            
            if (userId === null || userId === undefined) {
                throw new Error('User not authenticated or user ID not found');
            }

            const updatedSchedule = await apiService.put<Note>(`/schedules/${userId}/${scheduleId}`, note);
            return updatedSchedule;
        } catch (error) {
            console.error('Error updating schedule:', error);
            throw error;
        }
    },

    // Delete a schedule entry
    async deleteSchedule(scheduleId: string): Promise<void> {
        try {
            const userId = await authService.getUserId();
            
            if (userId === null || userId === undefined) {
                throw new Error('User not authenticated or user ID not found');
            }

            await apiService.delete(`/schedules/${userId}/${scheduleId}`);
        } catch (error) {
            console.error('Error deleting schedule:', error);
            throw error;
        }
    }
};
