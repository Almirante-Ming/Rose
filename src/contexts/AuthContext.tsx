import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { authUtils, configService } from '@/services';
import { AuthUser, UserRole } from '@constants/types';

interface AuthContextType {
    isAuthenticated: boolean;
    isLoading: boolean;
    user: AuthUser | null;
    userRole: UserRole | null;
    login: (emailOrPhone: string, password: string, persistLogin?: boolean) => Promise<{ success: boolean; error?: string }>;
    logout: () => Promise<void>;
    checkAuth: () => Promise<void>;
    hasPermission: (permission: string) => boolean;
    isAdmin: () => boolean;
    isTrainer: () => boolean;
}

export type { AuthContextType };

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
    children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [user, setUser] = useState<AuthUser | null>(null);
    const [userRole, setUserRole] = useState<UserRole | null>(null);

    const checkAuth = async () => {
        try {
            setIsLoading(true);
            
            // Load config first
            await configService.loadConfig();
            
            const autoLoginSuccess = await authUtils.autoLogin();
            
            if (autoLoginSuccess) {
                const authenticated = await authUtils.isAuthenticated();
                setIsAuthenticated(authenticated);
                
                if (authenticated) {
                    const currentUser = await authUtils.getCurrentUser();
                    const currentUserRole = await authUtils.getCurrentUserRole();
                    setUser(currentUser);
                    setUserRole(currentUserRole);
                }
            } else {
                setIsAuthenticated(false);
                setUser(null);
                setUserRole(null);
            }
        } catch (error) {
            console.error('Auth check failed:', error);
            setIsAuthenticated(false);
            setUser(null);
            setUserRole(null);
        } finally {
            setIsLoading(false);
        }
    };

    const login = async (emailOrPhone: string, password: string, persistLogin = false) => {
        const result = await authUtils.login({ emailOrPhone, password, persistLogin });
        
        if (result.success) {
            setIsAuthenticated(true);
            const currentUser = await authUtils.getCurrentUser();
            const currentUserRole = await authUtils.getCurrentUserRole();
            setUser(currentUser);
            setUserRole(currentUserRole);
        }
        
        return result;
    };

    const logout = async () => {
        try {
            await authUtils.logout();
            setIsAuthenticated(false);
            setUser(null);
            setUserRole(null);
        } catch (error) {
            console.error('Logout failed:', error);
            throw error;
        }
    };

    const hasPermission = (permission: string): boolean => {
        return userRole?.permissions.includes(permission) || false;
    };

    const isAdmin = (): boolean => {
        return userRole?.level === 2 || false;
    };

    const isTrainer = (): boolean => {
        return userRole ? userRole.level >= 1 : false;
    };

    useEffect(() => {
        checkAuth();
    }, []);

    const value: AuthContextType = {
        isAuthenticated,
        isLoading,
        user,
        userRole,
        login,
        logout,
        checkAuth,
        hasPermission,
        isAdmin,
        isTrainer,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
