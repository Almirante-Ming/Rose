import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { tinto } from '@constants/api_keys';
import { authService } from './authService';

class ApiService {
    private api: AxiosInstance;

    constructor() {
        this.api = axios.create({
            baseURL: tinto,
            timeout: 10000,
            headers: {
                'Content-Type': 'application/json',
                'ngrok-skip-browser-warning': 'true', // Skip ngrok browser warning
            },
        });

        // Add request interceptor to include JWT token
        this.api.interceptors.request.use(
            async (config) => {
                const token = await authService.getToken();
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
                return config;
            },
            (error) => {
                return Promise.reject(error);
            }
        );

        // Add response interceptor to handle errors
        this.api.interceptors.response.use(
            (response) => response,
            async (error) => {
                if (error.response?.status === 401) {
                    // Token expired or invalid, logout user
                    await authService.logout();
                    // You might want to redirect to login screen here
                }
                return Promise.reject(error);
            }
        );
    }

    // Generic GET request
    async get<T>(endpoint: string): Promise<T> {
        try {
            const response: AxiosResponse<T> = await this.api.get(endpoint);
            return response.data;
        } catch (error) {
            console.error(`GET ${endpoint} failed:`, error);
            throw error;
        }
    }

    // Generic POST request
    async post<T>(endpoint: string, data?: any): Promise<T> {
        try {
            const response: AxiosResponse<T> = await this.api.post(endpoint, data);
            return response.data;
        } catch (error) {
            console.error(`POST ${endpoint} failed:`, error);
            throw error;
        }
    }

    // POST request with form-urlencoded data (for login)
    async postForm<T>(endpoint: string, data?: any): Promise<T> {
        try {
            const formData = new URLSearchParams();
            if (data) {
                Object.keys(data).forEach(key => {
                    formData.append(key, data[key]);
                });
            }

            const response: AxiosResponse<T> = await this.api.post(endpoint, formData.toString(), {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                }
            });
            return response.data;
        } catch (error) {
            console.error(`POST ${endpoint} (form) failed:`, error);
            throw error;
        }
    }

    // Generic PUT request
    async put<T>(endpoint: string, data?: any): Promise<T> {
        try {
            const response: AxiosResponse<T> = await this.api.put(endpoint, data);
            return response.data;
        } catch (error) {
            console.error(`PUT ${endpoint} failed:`, error);
            throw error;
        }
    }

    // Generic DELETE request
    async delete<T>(endpoint: string): Promise<T> {
        try {
            const response: AxiosResponse<T> = await this.api.delete(endpoint);
            return response.data;
        } catch (error) {
            console.error(`DELETE ${endpoint} failed:`, error);
            throw error;
        }
    }
}

export const apiService = new ApiService();
