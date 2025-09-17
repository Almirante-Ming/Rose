import { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, StatusBar, Modal } from 'react-native';
import { loginStyles } from '@/styles';
import { useAuth } from '@/contexts';
import { authUtils, configService } from '@/services';
import { rose_theme } from '@constants/rose_theme';

export default function LoginScreen() {
    const [emailOrPhone, setEmailOrPhone] = useState('');
    const [password, setPassword] = useState('');
    const [persistLogin, setPersistLogin] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [emailFocused, setEmailFocused] = useState(false);
    const [passwordFocused, setPasswordFocused] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [statusMessage, setStatusMessage] = useState('');
    const [statusType, setStatusType] = useState<'success' | 'error' | ''>('');
    const [showConfigModal, setShowConfigModal] = useState(false);
    const [tempTintoUrl, setTempTintoUrl] = useState('');
    const [configInputFocused, setConfigInputFocused] = useState(false);

    const { login } = useAuth();

    useEffect(() => {
        configService.loadConfig();
    }, []);

    const handleLogin = async () => {
        if (!emailOrPhone.trim() || !password.trim()) {
            Alert.alert('Erro', 'Por favor, preencha todos os campos');
            return;
        }

        setIsLoading(true);

        try {
            const result = await login(emailOrPhone.trim(), password.trim(), persistLogin);

            if (!result.success) {
                if (result.statusCode === 401 || result.error === 'UNAUTHORIZED_401') {
                    Alert.alert('Erro de Autenticação', 'Credenciais de acesso incorretas ou não autorizadas');
                    return;
                }
                
                Alert.alert('Erro', result.error || 'Erro no login');
                return;
            }

        } catch (error: any) {
            if (error.response?.status === 401) {
                Alert.alert('Erro de Autenticação', 'Credenciais de acesso incorretas ou não autorizadas');
                return;
            }
        
            Alert.alert('Erro', 'Erro de conexão. Tente novamente.');
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
            
            if (!result.success) {
                setStatusMessage(result.message);
                setStatusType('error');
                return;
            }
            
            setStatusMessage(result.message);
            setStatusType('success');
        } catch (error) {
            setStatusMessage('Falha ao conectar ao Tinto, contacte o suporte');
            setStatusType('error');
        }
    };

    const isValidInput = () => {
        if (!emailOrPhone.trim() || !password.trim()) {
            return false;
        }
        
        return true;
    };

    const openConfigModal = () => {
        setTempTintoUrl(configService.getTintoUrl());
        setShowConfigModal(true);
    };

    const closeConfigModal = () => {
        setShowConfigModal(false);
        setTempTintoUrl('');
    };

    const saveConfig = async () => {
        if (!tempTintoUrl.trim()) {
            Alert.alert('Erro', 'Por favor, insira uma URL válida');
            return;
        }

        const urlPattern = /^https?:\/\/.+/;
        if (!urlPattern.test(tempTintoUrl.trim())) {
            Alert.alert('Erro', 'Por favor, insira uma URL válida (deve começar com http:// ou https://)');
            return;
        }

        try {
            await configService.setTintoUrl(tempTintoUrl.trim());
            Alert.alert(
                'Configuração Salva',
                'Endereco do servidor foi atualizado',
                [{ text: 'OK', onPress: closeConfigModal }]
            );
        } catch (error) {
            Alert.alert('Erro', 'Falha ao salvar a configuração');
        }
    };

    const resetConfig = async () => {
        Alert.alert(
            'Restaurar Configuração Padrão',
            'Deseja restaurar ao endereco padrao do servidor ?',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Sim',
                    onPress: async () => {
                        try {
                            await configService.clearConfig();
                            setTempTintoUrl(configService.getTintoUrl());
                            Alert.alert('Sucesso', 'Configuração padrão restaurada!');
                        } catch (error) {
                            Alert.alert('Erro', 'Falha ao restaurar a configuração');
                        }
                    }
                }
            ]
        );
    };

    return (
        <>
            <StatusBar 
                barStyle="light-content" 
                backgroundColor="#121212"
                translucent={false}
            />
            <KeyboardAvoidingView 
                style={loginStyles.container}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
            <ScrollView 
                contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
                keyboardShouldPersistTaps="handled"
            >
                <View>
                    <Text style={loginStyles.logo}>Rosè</Text>
                    <Text style={loginStyles.subtitle}>Entre para acessar suas aulas</Text>

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
                            placeholderTextColor="#b3b3b3"
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
                                    { paddingRight: 60 }
                                ]}
                                value={password}
                                onChangeText={setPassword}
                                onFocus={() => setPasswordFocused(true)}
                                onBlur={() => setPasswordFocused(false)}
                                placeholder="Digite sua senha"
                                placeholderTextColor="#b3b3b3"
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

            <TouchableOpacity
                style={loginStyles.configButton}
                onPress={openConfigModal}
                activeOpacity={0.8}
            >
                <Text style={loginStyles.configButtonText}>⚙</Text>
            </TouchableOpacity>

            <Modal
                visible={showConfigModal}
                transparent={true}
                animationType="fade"
                onRequestClose={closeConfigModal}
            >
                <View style={loginStyles.modalOverlay}>
                    <View style={loginStyles.modalContainer}>
                        <Text style={loginStyles.modalTitle}>Configurar Servidor</Text>
                        
                        <View style={loginStyles.inputContainer}>
                            <Text style={loginStyles.label}>URL do Servidor Tinto</Text>
                            <TextInput
                                style={[
                                    loginStyles.input,
                                    configInputFocused && loginStyles.inputFocused
                                ]}
                                value={tempTintoUrl}
                                onChangeText={setTempTintoUrl}
                                onFocus={() => setConfigInputFocused(true)}
                                onBlur={() => setConfigInputFocused(false)}
                                placeholderTextColor="#b3b3b3"
                                keyboardType="url"
                                autoCapitalize="none"
                                autoCorrect={false}
                            />
                        </View>

                        <View style={loginStyles.modalButtonContainer}>
                            <TouchableOpacity
                                style={[loginStyles.modalButton, loginStyles.modalButtonCancel]}
                                onPress={closeConfigModal}
                                activeOpacity={0.8}
                            >
                                <Text style={loginStyles.modalButtonText}>Cancelar</Text>
                            </TouchableOpacity>
                            
                            <TouchableOpacity
                                style={[loginStyles.modalButton, { backgroundColor: '#ff6b35' }]}
                                onPress={resetConfig}
                                activeOpacity={0.8}
                            >
                                <Text style={loginStyles.modalButtonText}>Restaurar</Text>
                            </TouchableOpacity>
                            
                            <TouchableOpacity
                                style={[loginStyles.modalButton, loginStyles.modalButtonSave]}
                                onPress={saveConfig}
                                activeOpacity={0.8}
                            >
                                <Text style={loginStyles.modalButtonText}>Salvar</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </KeyboardAvoidingView>
        </>
    );
}
