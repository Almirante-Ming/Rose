import { authService } from './authService';
import { apiService } from './apiService';

export interface LoginCredentials {
    emailOrPhone: string;
    password: string;
    persistLogin?: boolean;
}

export interface LoginResponse {
    token?: string | any;
    message?: string;
    [key: string]: any;
}

export interface ApiStatusResponse {
    sucess: boolean;
    message: string;
}

export const authUtils = {
    async login(credentials: LoginCredentials): Promise<{ success: boolean; error?: string; statusCode?: number }> {
        try {
            const response = await apiService.postForm<LoginResponse>('/login', {
                username: credentials.emailOrPhone,
                password: credentials.password
            });
            
            let token: string | null = null;
            
            if (typeof response === 'string') {
                token = response;
            } else if (response && typeof response === 'object') {
                token = response.token || response.access_token || response.jwt || response.authToken;
            }
            
            if (token !== null && token !== undefined) {
                token = String(token);
            }
            
            if (!token || token === 'undefined' || token === 'null') {
                console.error('No valid token found in response:', response);
                throw new Error('No valid token received from server');
            }
            
            await authService.saveToken(token);

            const user = await authService.createUserFromToken(token);
            if (user) {
                await authService.saveUser(user);
            }
            
            if (credentials.persistLogin !== undefined) {
                await authService.setPersistLogin(credentials.persistLogin);
            }
            
            return { success: true };
        } catch (error: any) {
            if (error.response?.status === 401) {
                return { success: false, error: 'UNAUTHORIZED_401', statusCode: 401 };
            }
            
            const errorMessage = error.response?.data?.message || error.message || 'Login failed. Please try again.';
            return { success: false, error: errorMessage };
        }
    },

    async autoLogin(): Promise<boolean> {
        try {
            const persistLogin = await authService.getPersistLogin();
            if (!persistLogin) return false;

            return await authService.isAuthenticated();
        } catch (error) {
            console.error('Auto login failed:', error);
            return false;
        }
    },

    async logout(): Promise<void> {
        try {
            await authService.logout();
        } catch (error) {
            console.error('Logout failed:', error);
            throw error;
        }
    },

    async isAuthenticated(): Promise<boolean> {
        return await authService.isAuthenticated();
    },

    async getCurrentUser() {
        return await authService.getUser();
    },

    async getCurrentUserId(): Promise<number | null> {
        return await authService.getUserId();
    },

    async getCurrentUserRole() {
        return await authService.getUserRole();
    },

    async hasPermission(permission: string): Promise<boolean> {
        try {
            const role = await authService.getUserRole();
            return role?.permissions.includes(permission) || false;
        } catch (error) {
            console.error('Error checking permission:', error);
            return false;
        }
    },

    async isAdmin(): Promise<boolean> {
        try {
            const role = await authService.getUserRole();
            return role?.level === 2 || false;
        } catch (error) {
            console.error('Error checking admin status:', error);
            return false;
        }
    },

    async isTrainer(): Promise<boolean> {
        try {
            const role = await authService.getUserRole();
            return role ? role.level >= 1 : false;
        } catch (error) {
            console.error('Error checking trainer status:', error);
            return false;
        }
    },

    async checkApiStatus(): Promise<{ success: boolean; message: string }> {
        try {
            const response = await apiService.get<ApiStatusResponse>('/');
            
            if (response.sucess) {
                return { success: true, message: 'Servidores em funcionamento' };
            } else {
                return { success: false, message: 'Servidores em manutencao, tente novamente mais tarde' };
            }
        } catch (error) {
            console.error('API status check failed:', error);
            return { success: false, message: 'Falha ao conectar ao Tinto, contacte o suporte' };
        }
    }
};
