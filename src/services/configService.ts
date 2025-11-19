import AsyncStorage from '@react-native-async-storage/async-storage';
import { tinto } from '@/constants/api_keys';

const CONFIG_KEYS = {
    TINTO_URL: 'tinto_url',
};

class ConfigService {
    private static instance: ConfigService;
    private tintoUrl: string = tinto;

    private constructor() {}

    public static getInstance(): ConfigService {
        if (!ConfigService.instance) {
            ConfigService.instance = new ConfigService();
        }
        return ConfigService.instance;
    }

    async loadConfig(): Promise<void> {
        try {
            const savedUrl = await AsyncStorage.getItem(CONFIG_KEYS.TINTO_URL);
            if (savedUrl) {
                this.tintoUrl = savedUrl;
                
                // Update apiService base URL
                const { apiService } = await import('./apiService');
                apiService.updateBaseUrl(savedUrl);
            }
        } catch (error) {
            console.error('Error loading config:', error);
        }
    }

    async setTintoUrl(url: string): Promise<void> {
        try {
            await AsyncStorage.setItem(CONFIG_KEYS.TINTO_URL, url);
            this.tintoUrl = url;
            
            // Update apiService base URL
            const { apiService } = await import('./apiService');
            apiService.updateBaseUrl(url);
        } catch (error) {
            console.error('Error saving tinto URL:', error);
            throw error;
        }
    }

    getTintoUrl(): string {
        return this.tintoUrl;
    }

    async clearConfig(): Promise<void> {
        try {
            await AsyncStorage.removeItem(CONFIG_KEYS.TINTO_URL);
            this.tintoUrl = 'https://tinto.com.br'; // Reset to default
            
            // Update apiService base URL to default
            const { apiService } = await import('./apiService');
            apiService.updateBaseUrl(this.tintoUrl);
        } catch (error) {
            console.error('Error clearing config:', error);
        }
    }
}

export const configService = ConfigService.getInstance();
