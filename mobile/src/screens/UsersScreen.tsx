import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { api, getApiErrorMessage } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { User, UserRole } from '../types';
import {
  adminCreateUserSchema,
  getFirstZodError,
  updateProfileSchema,
} from '../schemas/validation';
import { COLORS, commonStyles } from '../styles/common';

export const UsersScreen: React.FC = () => {
  const { user, signOut, refreshProfile } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [profileModalVisible, setProfileModalVisible] = useState(false);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('MEMBER');
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const loadUsers = async () => {
    try {
      const response = await api.get<User[]>('/users');
      setUsers(response.data);
    } catch (err) {
      Alert.alert('Erro', getApiErrorMessage(err, 'Erro ao carregar usuários'));
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      void loadUsers();
    }, [])
  );

  const openProfileModal = () => {
    if (!user) return;
    setName(user.name);
    setEmail(user.email);
    setPassword('');
    setFormError(null);
    setProfileModalVisible(true);
  };

  const openCreateModal = () => {
    setName('');
    setEmail('');
    setPassword('');
    setRole('MEMBER');
    setFormError(null);
    setCreateModalVisible(true);
  };

  const handleUpdateProfile = async () => {
    if (!user) return;
    setFormError(null);
    const parsed = updateProfileSchema.safeParse({
      name: name.trim(),
      email: email.trim(),
      password: password || undefined,
    });

    if (!parsed.success) {
      setFormError(getFirstZodError(parsed.error));
      return;
    }

    setSaving(true);
    try {
      await api.put(`/users/${user.id}`, {
        name: parsed.data.name,
        email: parsed.data.email,
        ...(parsed.data.password ? { password: parsed.data.password } : {}),
      });
      await refreshProfile();
      await loadUsers();
      setProfileModalVisible(false);
    } catch (err) {
      setFormError(getApiErrorMessage(err, 'Erro ao atualizar perfil'));
    } finally {
      setSaving(false);
    }
  };

  const handleAdminCreateUser = async () => {
    setFormError(null);
    const parsed = adminCreateUserSchema.safeParse({
      name: name.trim(),
      email: email.trim(),
      password,
      role,
    });

    if (!parsed.success) {
      setFormError(getFirstZodError(parsed.error));
      return;
    }

    setSaving(true);
    try {
      await api.post('/users', parsed.data);
      setCreateModalVisible(false);
      await loadUsers();
    } catch (err) {
      setFormError(getApiErrorMessage(err, 'Erro ao criar usuário'));
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteUser = (target: User) => {
    Alert.alert('Excluir Usuário', `Deseja remover "${target.name}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          try {
            await api.delete(`/users/${target.id}`);
            await loadUsers();
          } catch (err) {
            Alert.alert('Erro', getApiErrorMessage(err, 'Erro ao excluir usuário'));
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={commonStyles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={commonStyles.container}>
      <View style={commonStyles.card}>
        <Text style={commonStyles.cardTitle}>Meu Perfil ({user?.role})</Text>
        <Text style={commonStyles.cardMeta}>{user?.name}</Text>
        <Text style={commonStyles.cardMeta}>{user?.email}</Text>
        <View style={commonStyles.row}>
          <TouchableOpacity
            style={[commonStyles.button, { flex: 1, marginTop: 0 }]}
            onPress={openProfileModal}
          >
            <Text style={commonStyles.buttonText}>Editar Meu Perfil</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[commonStyles.button, commonStyles.buttonDanger, { flex: 1, marginTop: 0 }]}
            onPress={signOut}
          >
            <Text style={commonStyles.buttonText}>Sair</Text>
          </TouchableOpacity>
        </View>
      </View>

      {isAdmin && (
        <TouchableOpacity
          style={[commonStyles.button, { marginTop: 0, marginBottom: 14 }]}
          onPress={openCreateModal}
        >
          <Text style={commonStyles.buttonText}>+ Novo Usuário (Admin)</Text>
        </TouchableOpacity>
      )}

      <Text style={[commonStyles.label, { marginBottom: 8 }]}>Usuários Cadastrados</Text>

      <FlatList
        data={users}
        keyExtractor={(item) => String(item.id)}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={loadUsers} />}
        renderItem={({ item }) => (
          <View style={commonStyles.card}>
            <Text style={commonStyles.cardTitle}>
              {item.name} {item.id === user?.id ? '(Você)' : ''}
            </Text>
            <Text style={commonStyles.cardMeta}>
              {item.email} • {item.role}
            </Text>

            {isAdmin && item.id !== user?.id && (
              <TouchableOpacity
                style={[commonStyles.button, commonStyles.buttonDanger]}
                onPress={() => handleDeleteUser(item)}
              >
                <Text style={commonStyles.buttonText}>Excluir Usuário</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      />

      <Modal visible={profileModalVisible} transparent animationType="fade">
        <View style={commonStyles.modalOverlay}>
          <View style={commonStyles.modalCard}>
            <Text style={commonStyles.title}>Editar Meu Perfil</Text>

            <Text style={commonStyles.label}>Nome</Text>
            <TextInput style={commonStyles.input} value={name} onChangeText={setName} />

            <Text style={commonStyles.label}>E-mail</Text>
            <TextInput
              style={commonStyles.input}
              autoCapitalize="none"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
            />

            <Text style={commonStyles.label}>Nova Senha (opcional)</Text>
            <TextInput
              style={commonStyles.input}
              placeholder="Deixe vazio para manter"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />

            {formError && <Text style={commonStyles.errorText}>{formError}</Text>}

            <View style={commonStyles.row}>
              <TouchableOpacity
                style={[commonStyles.button, commonStyles.buttonSecondary, { flex: 1 }]}
                onPress={() => setProfileModalVisible(false)}
              >
                <Text style={commonStyles.buttonTextSecondary}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[commonStyles.button, { flex: 1 }]}
                onPress={handleUpdateProfile}
                disabled={saving}
              >
                <Text style={commonStyles.buttonText}>Salvar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={createModalVisible} transparent animationType="fade">
        <View style={commonStyles.modalOverlay}>
          <View style={commonStyles.modalCard}>
            <Text style={commonStyles.title}>Novo Usuário (Admin)</Text>

            <Text style={commonStyles.label}>Nome</Text>
            <TextInput style={commonStyles.input} value={name} onChangeText={setName} />

            <Text style={commonStyles.label}>E-mail</Text>
            <TextInput
              style={commonStyles.input}
              autoCapitalize="none"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
            />

            <Text style={commonStyles.label}>Senha</Text>
            <TextInput
              style={commonStyles.input}
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />

            <Text style={commonStyles.label}>Papel (Role)</Text>
            <View style={{ flexDirection: 'row' }}>
              {(['MEMBER', 'ADMIN'] as UserRole[]).map((r) => (
                <TouchableOpacity
                  key={r}
                  style={[commonStyles.chip, role === r && commonStyles.chipActive]}
                  onPress={() => setRole(r)}
                >
                  <Text style={[commonStyles.chipText, role === r && commonStyles.chipTextActive]}>
                    {r}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {formError && <Text style={commonStyles.errorText}>{formError}</Text>}

            <View style={commonStyles.row}>
              <TouchableOpacity
                style={[commonStyles.button, commonStyles.buttonSecondary, { flex: 1 }]}
                onPress={() => setCreateModalVisible(false)}
              >
                <Text style={commonStyles.buttonTextSecondary}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[commonStyles.button, { flex: 1 }]}
                onPress={handleAdminCreateUser}
                disabled={saving}
              >
                <Text style={commonStyles.buttonText}>Criar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};
