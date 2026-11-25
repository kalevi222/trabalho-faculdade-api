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
import { getFirstZodError, registerSchema } from '../schemas/validation';
import { COLORS, commonStyles } from '../styles/common';
import { AuthStackParamList } from '../navigation/AppNavigator';

type Props = NativeStackScreenProps<AuthStackParamList, 'Register'>;

export const RegisterScreen: React.FC<Props> = ({ navigation }) => {
  const { signUp } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleRegister = async () => {
    setError(null);
    const parsed = registerSchema.safeParse({
      name: name.trim(),
      email: email.trim(),
      password,
    });
    if (!parsed.success) {
      setError(getFirstZodError(parsed.error));
      return;
    }

    setSubmitting(true);
    try {
      await signUp(parsed.data.name, parsed.data.email, parsed.data.password);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Falha ao cadastrar conta'));
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
        <Text style={commonStyles.title}>Criar Conta</Text>
        <Text style={commonStyles.subtitle}>Preencha seus dados para acessar o app</Text>

        <Text style={commonStyles.label}>Nome</Text>
        <TextInput
          style={commonStyles.input}
          placeholder="Seu nome completo"
          value={name}
          onChangeText={setName}
        />

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
          placeholder="Mínimo 6 caracteres"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        {error && <Text style={commonStyles.errorText}>{error}</Text>}

        <TouchableOpacity
          style={commonStyles.button}
          onPress={handleRegister}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={commonStyles.buttonText}>Cadastrar</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={{ marginTop: 16, alignItems: 'center' }}
          onPress={() => navigation.goBack()}
        >
          <Text style={{ color: COLORS.primary, fontWeight: '600' }}>Já tenho conta</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};
