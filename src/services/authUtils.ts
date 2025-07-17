import { authService, apiService } from '@/services';

export interface LoginCredentials {
    emailOrPhone: string;
    password: string;
    persistLogin?: boolean;
}

export interface LoginResponse {
    token?: string | any; // Make token more flexible to handle different response formats
    message?: string;
    [key: string]: any; // Allow additional properties
}

export interface ApiStatusResponse {
    sucess: boolean; // Note: keeping original typo from your spec
    message: string;
}

export const authUtils = {
    // Login function
    async login(credentials: LoginCredentials): Promise<{ success: boolean; error?: string }> {
        try {
            const response = await apiService.postForm<LoginResponse>('/login', {
                username: credentials.emailOrPhone, // Backend expects username field
                password: credentials.password
            });
            
            console.log('Login response:', response); // Debug log
            
            // Try to extract token from different possible response structures
            let token: string | null = null;
            
            if (typeof response === 'string') {
                token = response;
            } else if (response && typeof response === 'object') {
                // Try different possible token field names
                token = response.token || response.access_token || response.jwt || response.authToken;
            }
            
            // Ensure token is a string
            if (token !== null && token !== undefined) {
                token = String(token);
            }
            
            if (!token || token === 'undefined' || token === 'null') {
                console.error('No valid token found in response:', response);
                throw new Error('No valid token received from server');
            }
            
            // Save token
            await authService.saveToken(token);
            
            // Create user from token and save
            const user = await authService.createUserFromToken(token);
            if (user) {
                await authService.saveUser(user);
            }
            
            // Save persistent login preference
            if (credentials.persistLogin !== undefined) {
                await authService.setPersistLogin(credentials.persistLogin);
            }
            
            return { success: true };
        } catch (error: any) {
            console.error('Login failed:', error);
            const errorMessage = error.response?.data?.message || error.message || 'Login failed. Please try again.';
            return { success: false, error: errorMessage };
        }
    },

    // Auto login for persistent users
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

    // Logout function
    async logout(): Promise<void> {
        try {
            await authService.logout();
        } catch (error) {
            console.error('Logout failed:', error);
            throw error;
        }
    },

    // Check authentication status
    async isAuthenticated(): Promise<boolean> {
        return await authService.isAuthenticated();
    },

    // Get current user
    async getCurrentUser() {
        return await authService.getUser();
    },

    // Get current user ID
    async getCurrentUserId(): Promise<number | null> {
        return await authService.getUserId();
    },

    // Get current user role
    async getCurrentUserRole() {
        return await authService.getUserRole();
    },

    // Check if user has specific permission
    async hasPermission(permission: string): Promise<boolean> {
        try {
            const role = await authService.getUserRole();
            return role?.permissions.includes(permission) || false;
        } catch (error) {
            console.error('Error checking permission:', error);
            return false;
        }
    },

    // Check if user is admin
    async isAdmin(): Promise<boolean> {
        try {
            const role = await authService.getUserRole();
            return role?.level === 2 || false;
        } catch (error) {
            console.error('Error checking admin status:', error);
            return false;
        }
    },

    // Check if user is trainer
    async isTrainer(): Promise<boolean> {
        try {
            const role = await authService.getUserRole();
            return role ? role.level >= 1 : false;
        } catch (error) {
            console.error('Error checking trainer status:', error);
            return false;
        }
    },

    // Check API status
    async checkApiStatus(): Promise<{ success: boolean; message: string }> {
        try {
            const response = await apiService.get<ApiStatusResponse>('/');
            
            if (response.sucess) {
                return { success: true, message: 'Servidores em funcionamento' };
            } else {
                return { success: false, message: 'Falha ao conectar ao Tinto, contacte o suporte' };
            }
        } catch (error) {
            console.error('API status check failed:', error);
            return { success: false, message: 'Falha ao conectar ao Tinto, contacte o suporte' };
        }
    }
};
