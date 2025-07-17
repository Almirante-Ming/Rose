import * as SecureStore from 'expo-secure-store';
import { JwtPayload, AuthUser, UserRole } from '@constants/types';

const TOKEN_KEY = 'jwt_token';
const USER_KEY = 'user_data';
const PERSIST_LOGIN_KEY = 'persist_login';

const getUserRoleFromLevel = (level: number): UserRole => {
    switch (level) {
        case 0:
            return {
                level: 0,
                name: 'user',
                permissions: ['view_schedules', 'book_classes']
            };
        case 1:
            return {
                level: 1,
                name: 'trainer',
                permissions: ['view_schedules', 'manage_classes', 'view_students']
            };
        case 2:
            return {
                level: 2,
                name: 'admin',
                permissions: ['view_schedules', 'manage_classes', 'view_students', 'manage_users', 'admin_panel']
            };
        default:
            return {
                level: 0,
                name: 'user',
                permissions: ['view_schedules', 'book_classes']
            };
    }
};

export const authService = {
    // Save JWT token to secure store
    async saveToken(token: string): Promise<void> {
        try {
            console.log('Saving token:', typeof token, token); // Debug log
            
            if (typeof token !== 'string') {
                throw new Error(`Token must be a string, received: ${typeof token}`);
            }
            
            await SecureStore.setItemAsync(TOKEN_KEY, token);
        } catch (error) {
            console.error('Error saving token:', error);
            throw error;
        }
    },

    // Get JWT token from secure store
    async getToken(): Promise<string | null> {
        try {
            return await SecureStore.getItemAsync(TOKEN_KEY);
        } catch (error) {
            console.error('Error getting token:', error);
            return null;
        }
    },

    // Save user data to secure store
    async saveUser(user: AuthUser): Promise<void> {
        try {
            await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));
        } catch (error) {
            console.error('Error saving user data:', error);
            throw error;
        }
    },

    // Get user data from secure store
    async getUser(): Promise<AuthUser | null> {
        try {
            const userData = await SecureStore.getItemAsync(USER_KEY);
            return userData ? JSON.parse(userData) : null;
        } catch (error) {
            console.error('Error getting user data:', error);
            return null;
        }
    },

    // Save persistent login preference
    async setPersistLogin(persist: boolean): Promise<void> {
        try {
            await SecureStore.setItemAsync(PERSIST_LOGIN_KEY, persist.toString());
        } catch (error) {
            console.error('Error saving persist login preference:', error);
            throw error;
        }
    },

    // Get persistent login preference
    async getPersistLogin(): Promise<boolean> {
        try {
            const persist = await SecureStore.getItemAsync(PERSIST_LOGIN_KEY);
            return persist === 'true';
        } catch (error) {
            console.error('Error getting persist login preference:', error);
            return false;
        }
    },

    // Parse JWT token to get user info
    parseJwtToken(token: string): JwtPayload | null {
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(
                atob(base64)
                    .split('')
                    .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                    .join('')
            );
            return JSON.parse(jsonPayload) as JwtPayload;
        } catch (error) {
            console.error('Error parsing JWT token:', error);
            return null;
        }
    },

    // Get user ID from stored token
    async getUserId(): Promise<number | null> {
        try {
            const token = await this.getToken();
            if (!token) return null;

            const decoded = this.parseJwtToken(token);
            console.log('Decoded JWT payload:', decoded); // Debug log
            const userId = decoded?.user_id;
            console.log('Extracted user ID:', userId, 'type:', typeof userId); // Debug log
            
            return userId !== undefined && userId !== null ? userId : null;
        } catch (error) {
            console.error('Error getting user ID from token:', error);
            return null;
        }
    },

    // Get user role from stored token
    async getUserRole(): Promise<UserRole | null> {
        try {
            const token = await this.getToken();
            if (!token) return null;

            const decoded = this.parseJwtToken(token);
            return decoded ? getUserRoleFromLevel(decoded.acc_level) : null;
        } catch (error) {
            console.error('Error getting user role from token:', error);
            return null;
        }
    },

    // Create AuthUser from JWT token
    async createUserFromToken(token: string): Promise<AuthUser | null> {
        try {
            const decoded = this.parseJwtToken(token);
            if (!decoded) return null;

            return {
                id: decoded.user_id,
                email: decoded.sub,
                role: getUserRoleFromLevel(decoded.acc_level)
            };
        } catch (error) {
            console.error('Error creating user from token:', error);
            return null;
        }
    },

    // Check if token is expired
    isTokenExpired(token: string): boolean {
        try {
            const decoded = this.parseJwtToken(token);
            if (!decoded) return true;

            const currentTime = Math.floor(Date.now() / 1000);
            return decoded.exp < currentTime;
        } catch (error) {
            console.error('Error checking token expiration:', error);
            return true;
        }
    },

    // Remove token and user data (logout)
    async logout(): Promise<void> {
        try {
            const persistLogin = await this.getPersistLogin();
            await SecureStore.deleteItemAsync(TOKEN_KEY);
            await SecureStore.deleteItemAsync(USER_KEY);
            
            // Only clear persist login if user explicitly logs out
            if (!persistLogin) {
                await SecureStore.deleteItemAsync(PERSIST_LOGIN_KEY);
            }
        } catch (error) {
            console.error('Error during logout:', error);
            throw error;
        }
    },

    // Check if user is authenticated
    async isAuthenticated(): Promise<boolean> {
        try {
            const token = await this.getToken();
            if (!token) return false;

            // Check if token is expired
            if (this.isTokenExpired(token)) {
                await this.logout();
                return false;
            }

            return true;
        } catch (error) {
            console.error('Error checking authentication:', error);
            return false;
        }
    }
};
