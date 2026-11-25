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
  ScrollView,
} from 'react-native';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import { api, getApiErrorMessage } from '../services/api';
import { Project, Task, TaskStatus, User } from '../types';
import { getFirstZodError, taskSchema } from '../schemas/validation';
import { COLORS, commonStyles } from '../styles/common';

const STATUS_OPTIONS: Array<{ value: TaskStatus; label: string }> = [
  { value: 'PENDING', label: 'Pendente' },
  { value: 'IN_PROGRESS', label: 'Em andamento' },
  { value: 'COMPLETED', label: 'Concluída' },
];

export const TasksScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const filterProjectId: number | undefined = route.params?.projectId;
  const filterProjectTitle: string | undefined = route.params?.projectTitle;

  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<TaskStatus>('PENDING');
  const [projectId, setProjectId] = useState<number>(0);
  const [assignedTo, setAssignedTo] = useState<number | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const loadData = async () => {
    try {
      const [tasksRes, projectsRes, usersRes] = await Promise.all([
        api.get<Task[]>('/tasks'),
        api.get<Project[]>('/projects'),
        api.get<User[]>('/users'),
      ]);
      setTasks(tasksRes.data);
      setProjects(projectsRes.data);
      setUsers(usersRes.data);
    } catch (err) {
      Alert.alert('Erro', getApiErrorMessage(err, 'Erro ao carregar tarefas'));
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      void loadData();
    }, [])
  );

  const displayedTasks = filterProjectId
    ? tasks.filter((t) => t.project_id === filterProjectId)
    : tasks;

  const openCreateModal = () => {
    if (projects.length === 0) {
      Alert.alert('Atenção', 'Crie um projeto antes de cadastrar tarefas.');
      return;
    }
    setEditingTask(null);
    setTitle('');
    setDescription('');
    setStatus('PENDING');
    setProjectId(filterProjectId || projects[0].id);
    setAssignedTo(null);
    setFormError(null);
    setModalVisible(true);
  };

  const openEditModal = (task: Task) => {
    setEditingTask(task);
    setTitle(task.title);
    setDescription(task.description || '');
    setStatus(task.status);
    setProjectId(task.project_id);
    setAssignedTo(task.assigned_to);
    setFormError(null);
    setModalVisible(true);
  };

  const handleSave = async () => {
    setFormError(null);
    const parsed = taskSchema.safeParse({
      title: title.trim(),
      description: description.trim() || undefined,
      status,
      project_id: projectId,
      assigned_to: assignedTo,
    });

    if (!parsed.success) {
      setFormError(getFirstZodError(parsed.error));
      return;
    }

    setSaving(true);
    try {
      if (editingTask) {
        await api.put(`/tasks/${editingTask.id}`, parsed.data);
      } else {
        await api.post('/tasks', parsed.data);
      }
      setModalVisible(false);
      await loadData();
    } catch (err) {
      setFormError(getApiErrorMessage(err, 'Erro ao salvar tarefa'));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (task: Task) => {
    Alert.alert('Excluir Tarefa', `Deseja remover "${task.title}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          try {
            await api.delete(`/tasks/${task.id}`);
            await loadData();
          } catch (err) {
            Alert.alert('Erro', getApiErrorMessage(err, 'Erro ao excluir tarefa'));
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
      {filterProjectId && (
        <View style={[commonStyles.row, { marginTop: 0, marginBottom: 10, justifyContent: 'space-between' }]}>
          <Text style={commonStyles.subtitle}>Projeto: {filterProjectTitle}</Text>
          <TouchableOpacity onPress={() => navigation.setParams({ projectId: undefined, projectTitle: undefined })}>
            <Text style={{ color: COLORS.primary, fontWeight: '600' }}>Ver todas</Text>
          </TouchableOpacity>
        </View>
      )}

      <TouchableOpacity
        style={[commonStyles.button, { marginTop: 0, marginBottom: 14 }]}
        onPress={openCreateModal}
      >
        <Text style={commonStyles.buttonText}>+ Nova Tarefa</Text>
      </TouchableOpacity>

      <FlatList
        data={displayedTasks}
        keyExtractor={(item) => String(item.id)}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={loadData} />}
        ListEmptyComponent={
          <Text style={commonStyles.subtitle}>Nenhuma tarefa encontrada.</Text>
        }
        renderItem={({ item }) => (
          <View style={commonStyles.card}>
            <TouchableOpacity
              onPress={() => navigation.navigate('TaskDetail', { taskId: item.id })}
            >
              <Text style={commonStyles.cardTitle}>{item.title}</Text>
              <Text style={commonStyles.cardMeta}>
                Projeto: {item.project_title || `#${item.project_id}`} • Status: {item.status}
              </Text>
              <Text style={commonStyles.cardMeta}>
                Responsável: {item.assigned_user_name || 'Não atribuído'}
              </Text>
              <Text style={{ color: COLORS.primary, marginTop: 6, fontWeight: '600', fontSize: 13 }}>
                Toque para ver detalhes e comentários →
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
          <ScrollView contentContainerStyle={commonStyles.modalCard}>
            <Text style={commonStyles.title}>
              {editingTask ? 'Editar Tarefa' : 'Nova Tarefa'}
            </Text>

            <Text style={commonStyles.label}>Título</Text>
            <TextInput
              style={commonStyles.input}
              placeholder="Ex: Implementar login"
              value={title}
              onChangeText={setTitle}
            />

            <Text style={commonStyles.label}>Descrição</Text>
            <TextInput
              style={[commonStyles.input, { minHeight: 70, textAlignVertical: 'top' }]}
              placeholder="Descrição opcional"
              multiline
              value={description}
              onChangeText={setDescription}
            />

            <Text style={commonStyles.label}>Status</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
              {STATUS_OPTIONS.map((opt) => (
                <TouchableOpacity
                  key={opt.value}
                  style={[commonStyles.chip, status === opt.value && commonStyles.chipActive]}
                  onPress={() => setStatus(opt.value)}
                >
                  <Text
                    style={[
                      commonStyles.chipText,
                      status === opt.value && commonStyles.chipTextActive,
                    ]}
                  >
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={commonStyles.label}>Projeto</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
              {projects.map((p) => (
                <TouchableOpacity
                  key={p.id}
                  style={[commonStyles.chip, projectId === p.id && commonStyles.chipActive]}
                  onPress={() => setProjectId(p.id)}
                >
                  <Text
                    style={[
                      commonStyles.chipText,
                      projectId === p.id && commonStyles.chipTextActive,
                    ]}
                  >
                    {p.title}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={commonStyles.label}>Atribuir para</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
              <TouchableOpacity
                style={[commonStyles.chip, assignedTo === null && commonStyles.chipActive]}
                onPress={() => setAssignedTo(null)}
              >
                <Text
                  style={[
                    commonStyles.chipText,
                    assignedTo === null && commonStyles.chipTextActive,
                  ]}
                >
                  Ninguém
                </Text>
              </TouchableOpacity>
              {users.map((u) => (
                <TouchableOpacity
                  key={u.id}
                  style={[commonStyles.chip, assignedTo === u.id && commonStyles.chipActive]}
                  onPress={() => setAssignedTo(u.id)}
                >
                  <Text
                    style={[
                      commonStyles.chipText,
                      assignedTo === u.id && commonStyles.chipTextActive,
                    ]}
                  >
                    {u.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

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
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
};
