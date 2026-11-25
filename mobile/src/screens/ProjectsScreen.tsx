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
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { api, getApiErrorMessage } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { Project } from '../types';
import { getFirstZodError, projectSchema } from '../schemas/validation';
import { COLORS, commonStyles } from '../styles/common';

export const ProjectsScreen: React.FC = () => {
  const { user } = useAuth();
  const navigation = useNavigation<any>();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const loadProjects = async () => {
    try {
      const response = await api.get<Project[]>('/projects');
      setProjects(response.data);
    } catch (err) {
      Alert.alert('Erro', getApiErrorMessage(err, 'Não foi possível carregar os projetos'));
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      void loadProjects();
    }, [])
  );

  const openCreateModal = () => {
    setEditingProject(null);
    setTitle('');
    setDescription('');
    setFormError(null);
    setModalVisible(true);
  };

  const openEditModal = (project: Project) => {
    setEditingProject(project);
    setTitle(project.title);
    setDescription(project.description || '');
    setFormError(null);
    setModalVisible(true);
  };

  const handleSave = async () => {
    setFormError(null);
    const ownerId = editingProject?.owner_id ?? user?.id ?? 0;
    const parsed = projectSchema.safeParse({
      title: title.trim(),
      description: description.trim() || undefined,
      owner_id: ownerId,
    });

    if (!parsed.success) {
      setFormError(getFirstZodError(parsed.error));
      return;
    }

    setSaving(true);
    try {
      if (editingProject) {
        await api.put(`/projects/${editingProject.id}`, parsed.data);
      } else {
        await api.post('/projects', parsed.data);
      }
      setModalVisible(false);
      await loadProjects();
    } catch (err) {
      setFormError(getApiErrorMessage(err, 'Erro ao salvar projeto'));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (project: Project) => {
    Alert.alert('Excluir Projeto', `Deseja remover "${project.title}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          try {
            await api.delete(`/projects/${project.id}`);
            await loadProjects();
          } catch (err) {
            Alert.alert('Erro', getApiErrorMessage(err, 'Erro ao excluir projeto'));
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
      <TouchableOpacity
        style={[commonStyles.button, { marginTop: 0, marginBottom: 14 }]}
        onPress={openCreateModal}
      >
        <Text style={commonStyles.buttonText}>+ Novo Projeto</Text>
      </TouchableOpacity>

      <FlatList
        data={projects}
        keyExtractor={(item) => String(item.id)}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={loadProjects} />}
        ListEmptyComponent={
          <Text style={commonStyles.subtitle}>Nenhum projeto cadastrado ainda.</Text>
        }
        renderItem={({ item }) => (
          <View style={commonStyles.card}>
            <TouchableOpacity
              onPress={() =>
                navigation.navigate('Tarefas', {
                  projectId: item.id,
                  projectTitle: item.title,
                })
              }
            >
              <Text style={commonStyles.cardTitle}>{item.title}</Text>
              {!!item.description && <Text style={commonStyles.cardMeta}>{item.description}</Text>}
              <Text style={commonStyles.cardMeta}>
                Responsável: {item.owner_name || `Usuário #${item.owner_id}`}
              </Text>
            </TouchableOpacity>

            <View style={commonStyles.row}>
              <TouchableOpacity
                style={[commonStyles.button, commonStyles.buttonSecondary, { flex: 1, marginTop: 0 }]}
                onPress={() => openEditModal(item)}
              >
                <Text style={commonStyles.buttonTextSecondary}>Editar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[commonStyles.button, commonStyles.buttonDanger, { flex: 1, marginTop: 0 }]}
                onPress={() => handleDelete(item)}
              >
                <Text style={commonStyles.buttonText}>Excluir</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={commonStyles.modalOverlay}>
          <View style={commonStyles.modalCard}>
            <Text style={commonStyles.title}>
              {editingProject ? 'Editar Projeto' : 'Novo Projeto'}
            </Text>

            <Text style={commonStyles.label}>Título</Text>
            <TextInput
              style={commonStyles.input}
              placeholder="Ex: Sistema de Gestão"
              value={title}
              onChangeText={setTitle}
            />

            <Text style={commonStyles.label}>Descrição</Text>
            <TextInput
              style={[commonStyles.input, { minHeight: 80, textAlignVertical: 'top' }]}
              placeholder="Descrição opcional"
              multiline
              value={description}
              onChangeText={setDescription}
            />

            {formError && <Text style={commonStyles.errorText}>{formError}</Text>}

            <View style={commonStyles.row}>
              <TouchableOpacity
                style={[commonStyles.button, commonStyles.buttonSecondary, { flex: 1 }]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={commonStyles.buttonTextSecondary}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[commonStyles.button, { flex: 1 }]}
                onPress={handleSave}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <Text style={commonStyles.buttonText}>Salvar</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};
