import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    ScrollView
} from 'react-native';
import { router } from 'expo-router';
import { loginStyles } from '@/styles';
import { useAuth } from '@/contexts';
import { authUtils } from '@/services';
import { rose_theme } from '@constants/rose_theme';

export default function LoginScreen() {
    const [emailOrPhone, setEmailOrPhone] = useState('');
    const [password, setPassword] = useState('');
    const [persistLogin, setPersistLogin] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [emailFocused, setEmailFocused] = useState(false);
    const [passwordFocused, setPasswordFocused] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [statusMessage, setStatusMessage] = useState('');
    const [statusType, setStatusType] = useState<'success' | 'error' | ''>('');

    const { login } = useAuth();

    const handleLogin = async () => {
        if (!emailOrPhone.trim() || !password.trim()) {
            setError('Por favor, preencha todos os campos');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            const result = await login(emailOrPhone.trim(), password.trim(), persistLogin);

            if (result.success) {
                // Navigation is handled by AuthNavigator
            } else {
                setError(result.error || 'Erro no login');
            }
        } catch (error) {
            console.error('Login error:', error);
            setError('Erro de conexão. Tente novamente.');
        } finally {
            setIsLoading(false);
        }
    };

    const togglePersistLogin = () => {
        setPersistLogin(!persistLogin);
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const checkApiStatus = async () => {
        setStatusMessage('');
        setStatusType('');
        
        try {
            const result = await authUtils.checkApiStatus();
            setStatusMessage(result.message);
            setStatusType(result.success ? 'success' : 'error');
        } catch (error) {
            setStatusMessage('Falha ao conectar ao Tinto, contacte o suporte');
            setStatusType('error');
        }
    };

    const isValidInput = () => {
        return emailOrPhone.trim().length > 0 && password.trim().length > 0;
    };

    return (
        <KeyboardAvoidingView 
            style={loginStyles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView 
                contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
                keyboardShouldPersistTaps="handled"
            >
                <View>
                    <Text style={loginStyles.logo}>Rose Gym</Text>
                    <Text style={loginStyles.subtitle}>Entre para acessar seus agendamentos</Text>

                    {error ? <Text style={loginStyles.errorText}>{error}</Text> : null}

                    <View style={loginStyles.inputContainer}>
                        <Text style={loginStyles.label}>Email ou Telefone</Text>
                        <TextInput
                            style={[
                                loginStyles.input,
                                emailFocused && loginStyles.inputFocused
                            ]}
                            value={emailOrPhone}
                            onChangeText={setEmailOrPhone}
                            onFocus={() => setEmailFocused(true)}
                            onBlur={() => setEmailFocused(false)}
                            placeholder="Digite seu email ou telefone"
                            keyboardType="email-address"
                            autoCapitalize="none"
                            autoCorrect={false}
                        />
                    </View>

                    <View style={loginStyles.inputContainer}>
                        <Text style={loginStyles.label}>Senha</Text>
                        <View style={loginStyles.passwordContainer}>
                            <TextInput
                                style={[
                                    loginStyles.input,
                                    passwordFocused && loginStyles.inputFocused,
                                    { paddingRight: 60 } // Space for toggle button
                                ]}
                                value={password}
                                onChangeText={setPassword}
                                onFocus={() => setPasswordFocused(true)}
                                onBlur={() => setPasswordFocused(false)}
                                placeholder="Digite sua senha"
                                secureTextEntry={!showPassword}
                            />
                            <TouchableOpacity
                                style={loginStyles.passwordToggle}
                                onPress={togglePasswordVisibility}
                            >
                                <Text style={loginStyles.passwordToggleText}>
                                    {showPassword ? 'Ocultar' : 'Mostrar'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    <TouchableOpacity 
                        style={loginStyles.checkboxContainer}
                        onPress={togglePersistLogin}
                        activeOpacity={0.7}
                    >
                        <View style={[
                            loginStyles.checkbox,
                            persistLogin && loginStyles.checkboxChecked
                        ]}>
                            {persistLogin && <Text style={loginStyles.checkboxIcon}>✓</Text>}
                        </View>
                        <Text style={loginStyles.checkboxLabel}>
                            Manter-me conectado
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[
                            loginStyles.loginButton,
                            (!isValidInput() || isLoading) && loginStyles.loginButtonDisabled
                        ]}
                        onPress={handleLogin}
                        disabled={!isValidInput() || isLoading}
                        activeOpacity={0.8}
                    >
                        <Text style={loginStyles.loginButtonText}>
                            {isLoading ? 'Entrando...' : 'Entrar'}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={loginStyles.statusButton}
                        onPress={checkApiStatus}
                        activeOpacity={0.8}
                    >
                        <Text style={loginStyles.statusButtonText}>
                            Verificar Status do Servidor
                        </Text>
                    </TouchableOpacity>

                    {statusMessage ? (
                        <Text style={[
                            loginStyles.statusMessage,
                            statusType === 'success' ? loginStyles.statusSuccess : loginStyles.statusError
                        ]}>
                            {statusMessage}
                        </Text>
                    ) : null}

                    <TouchableOpacity onPress={() => Alert.alert('Recuperar Senha', 'Funcionalidade em desenvolvimento')}>
                        <Text style={loginStyles.forgotPassword}>
                            Esqueci minha senha
                        </Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>

            {isLoading && (
                <View style={loginStyles.loadingOverlay}>
                    <View style={loginStyles.loadingContainer}>
                        <ActivityIndicator size="large" color={rose_theme.rose_main} />
                        <Text style={loginStyles.loadingText}>Fazendo login...</Text>
                    </View>
                </View>
            )}
        </KeyboardAvoidingView>
    );
}
