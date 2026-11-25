import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { api, getApiErrorMessage } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { Comment, Task } from '../types';
import { commentSchema, getFirstZodError } from '../schemas/validation';
import { COLORS, commonStyles } from '../styles/common';
import { RootStackParamList } from '../navigation/AppNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'TaskDetail'>;

export const TaskDetailScreen: React.FC<Props> = ({ route }) => {
  const { taskId } = route.params;
  const { user } = useAuth();
  const [task, setTask] = useState<Task | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [newContent, setNewContent] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [editingComment, setEditingComment] = useState<Comment | null>(null);
  const [editContent, setEditContent] = useState('');

  const loadData = async () => {
    try {
      const [taskRes, commentsRes] = await Promise.all([
        api.get<Task>(`/tasks/${taskId}`),
        api.get<Comment[]>('/comments', { params: { task_id: taskId } }),
      ]);
      setTask(taskRes.data);
      setComments(commentsRes.data);
    } catch (err) {
      Alert.alert('Erro', getApiErrorMessage(err, 'Erro ao carregar detalhes da tarefa'));
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      void loadData();
    }, [taskId])
  );

  const handleAddComment = async () => {
    setError(null);
    const parsed = commentSchema.safeParse({
      content: newContent.trim(),
      task_id: taskId,
    });
    if (!parsed.success) {
      setError(getFirstZodError(parsed.error));
      return;
    }

    setSubmitting(true);
    try {
      await api.post('/comments', parsed.data);
      setNewContent('');
      await loadData();
    } catch (err) {
      setError(getApiErrorMessage(err, 'Erro ao enviar comentário'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateComment = async () => {
    if (!editingComment) return;
    const parsed = commentSchema.safeParse({
      content: editContent.trim(),
      task_id: taskId,
    });
    if (!parsed.success) {
      Alert.alert('Validação', getFirstZodError(parsed.error));
      return;
    }

    try {
      await api.put(`/comments/${editingComment.id}`, { content: parsed.data.content });
      setEditingComment(null);
      await loadData();
    } catch (err) {
      Alert.alert('Erro', getApiErrorMessage(err, 'Erro ao editar comentário'));
    }
  };

  const handleDeleteComment = (comment: Comment) => {
    Alert.alert('Excluir Comentário', 'Deseja remover este comentário?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          try {
            await api.delete(`/comments/${comment.id}`);
            await loadData();
          } catch (err) {
            Alert.alert('Erro', getApiErrorMessage(err, 'Erro ao excluir comentário'));
          }
        },
      },
    ]);
  };

  if (loading || !task) {
    return (
      <View style={commonStyles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={commonStyles.container}>
      <View style={commonStyles.card}>
        <Text style={commonStyles.title}>{task.title}</Text>
        {!!task.description && <Text style={commonStyles.cardMeta}>{task.description}</Text>}
        <Text style={commonStyles.cardMeta}>
          Projeto: {task.project_title || `#${task.project_id}`} • Status: {task.status}
        </Text>
        <Text style={commonStyles.cardMeta}>
          Responsável: {task.assigned_user_name || 'Não atribuído'}
        </Text>
      </View>

      <View style={commonStyles.card}>
        <Text style={commonStyles.cardTitle}>Novo Comentário</Text>
        <TextInput
          style={[commonStyles.input, { marginTop: 8 }]}
          placeholder="Escreva um comentário..."
          value={newContent}
          onChangeText={setNewContent}
        />
        {error && <Text style={commonStyles.errorText}>{error}</Text>}
        <TouchableOpacity
          style={commonStyles.button}
          onPress={handleAddComment}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={commonStyles.buttonText}>Comentar</Text>
          )}
        </TouchableOpacity>
      </View>

      <Text style={[commonStyles.label, { marginBottom: 8 }]}>
        Comentários ({comments.length})
      </Text>

      <FlatList
        data={comments}
        keyExtractor={(item) => String(item.id)}
        ListEmptyComponent={
          <Text style={commonStyles.subtitle}>Nenhum comentário nesta tarefa ainda.</Text>
        }
        renderItem={({ item }) => {
          const canManage = user?.id === item.user_id || user?.role === 'ADMIN';
          return (
            <View style={commonStyles.card}>
              <Text style={{ fontWeight: '700', color: COLORS.text }}>
                {item.author_name || `Usuário #${item.user_id}`}
              </Text>
              <Text style={{ marginTop: 4, color: COLORS.text }}>{item.content}</Text>
              {canManage && (
                <View style={commonStyles.row}>
                  <TouchableOpacity
                    style={[
                      commonStyles.button,
                      commonStyles.buttonSecondary,
                      { flex: 1, marginTop: 0 },
                    ]}
                    onPress={() => {
                      setEditingComment(item);
                      setEditContent(item.content);
                    }}
                  >
                    <Text style={commonStyles.buttonTextSecondary}>Editar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      commonStyles.button,
                      commonStyles.buttonDanger,
                      { flex: 1, marginTop: 0 },
                    ]}
                    onPress={() => handleDeleteComment(item)}
                  >
                    <Text style={commonStyles.buttonText}>Excluir</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          );
        }}
      />

      <Modal visible={!!editingComment} transparent animationType="fade">
        <View style={commonStyles.modalOverlay}>
          <View style={commonStyles.modalCard}>
            <Text style={commonStyles.title}>Editar Comentário</Text>
            <TextInput
              style={[commonStyles.input, { marginTop: 10, minHeight: 80, textAlignVertical: 'top' }]}
              multiline
              value={editContent}
              onChangeText={setEditContent}
            />
            <View style={commonStyles.row}>
              <TouchableOpacity
                style={[commonStyles.button, commonStyles.buttonSecondary, { flex: 1 }]}
                onPress={() => setEditingComment(null)}
              >
                <Text style={commonStyles.buttonTextSecondary}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[commonStyles.button, { flex: 1 }]}
                onPress={handleUpdateComment}
              >
                <Text style={commonStyles.buttonText}>Salvar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};
