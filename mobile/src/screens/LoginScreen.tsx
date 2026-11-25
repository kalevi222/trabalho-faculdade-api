import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAuth } from '../contexts/AuthContext';
import { getApiErrorMessage } from '../services/api';
import { getFirstZodError, loginSchema } from '../schemas/validation';
import { COLORS, commonStyles } from '../styles/common';
import { AuthStackParamList } from '../navigation/AppNavigator';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

export const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleLogin = async () => {
    setError(null);
    const parsed = loginSchema.safeParse({ email: email.trim(), password });
    if (!parsed.success) {
      setError(getFirstZodError(parsed.error));
      return;
    }

    setSubmitting(true);
    try {
      await signIn(parsed.data.email, parsed.data.password);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Falha ao fazer login'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={commonStyles.centered}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={[commonStyles.card, { width: '100%', padding: 20 }]}>
        <Text style={commonStyles.title}>Gestão de Tarefas</Text>
        <Text style={commonStyles.subtitle}>Entre com sua conta para continuar</Text>

        <Text style={commonStyles.label}>E-mail</Text>
        <TextInput
          style={commonStyles.input}
          placeholder="seu@email.com"
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />

        <Text style={commonStyles.label}>Senha</Text>
        <TextInput
          style={commonStyles.input}
          placeholder="••••••"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        {error && <Text style={commonStyles.errorText}>{error}</Text>}

        <TouchableOpacity style={commonStyles.button} onPress={handleLogin} disabled={submitting}>
          {submitting ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={commonStyles.buttonText}>Entrar</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={{ marginTop: 16, alignItems: 'center' }}
          onPress={() => navigation.navigate('Register')}
        >
          <Text style={{ color: COLORS.primary, fontWeight: '600' }}>
            Não tem conta? Cadastre-se
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};
