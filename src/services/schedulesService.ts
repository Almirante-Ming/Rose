import { apiService } from './apiService';
import { authService } from './authService';
import { NotesData, Note, ScheduleData, ScheduleResponse } from '@constants/types';

export interface ScheduleListResponse extends Array<Note> {}

export const schedulesService = {
    async getUserSchedules(): Promise<NotesData> {
        try {
            const userId = await authService.getUserId();
            
            if (userId === null || userId === undefined) {
                throw new Error('User not authenticated or user ID not found');
            }
            const schedules: ScheduleListResponse = await apiService.get(`/schedule/${userId}`);
            
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

    async getUserSchedulesByDateRange(startDate: string, endDate: string): Promise<NotesData> {
        try {
            const userId = await authService.getUserId();
            
            if (userId === null || userId === undefined) {
                throw new Error('User not authenticated or user ID not found');
            }

            const schedules: ScheduleListResponse = await apiService.get(
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

    async createSchedule(scheduleData: ScheduleData): Promise<ScheduleResponse> {
        try {
            const response = await apiService.post<ScheduleResponse>('/schedules/', scheduleData);
            return response;
        } catch (error) {
            console.error('Error creating schedule:', error);
            throw error;
        }
    },

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
    },

    async cancelSchedule(scheduleId: number, data: Partial<ScheduleData>): Promise<Note> {
        try {
            const response = await apiService.put<Note>(`/schedules/${scheduleId}`, {
                ...data,
                c_status: 'cancelled'
            });
            return response;
        } catch (error) {
            console.error('Error canceling schedule:', error);
            throw error;
        }
    }
};
