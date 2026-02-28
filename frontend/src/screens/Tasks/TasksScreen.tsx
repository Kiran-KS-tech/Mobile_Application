import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { useAppSelector } from '../../hooks/useAppSelector';
import { fetchTasks, createTaskThunk, toggleTaskThunk, deleteTaskThunk, setFilter } from '../../store/slices/taskSlice';
import { Task, Priority } from '../../types';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';

const TasksScreen = () => {
  const { colors, typography, spacing, radius, shadow } = useTheme();
  const dispatch = useAppDispatch();
  const { tasks, filter } = useAppSelector(state => state.tasks);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newPriority, setNewPriority] = useState<Priority>('medium');

  useEffect(() => {
    dispatch(fetchTasks());
  }, [dispatch]);

  const filteredTasks = tasks.filter(t => {
    if (filter === 'active') return !t.completed;
    if (filter === 'completed') return t.completed;
    return true;
  });

  const handleCreateTask = () => {
    if (newTitle.trim()) {
      dispatch(createTaskThunk({
        title: newTitle,
        priority: newPriority,
      }));
      setNewTitle('');
      setIsModalVisible(false);
    }
  };

  const renderTask = ({ item }: { item: Task }) => (
    <Card style={styles.taskCard}>
      <TouchableOpacity 
        style={styles.checkbox} 
        onPress={() => dispatch(toggleTaskThunk(item.id))}
      >
        <MaterialCommunityIcons 
          name={item.completed ? 'checkbox-marked' : 'checkbox-blank-outline'} 
          size={24} 
          color={item.completed ? colors.accent : colors.textTertiary} 
        />
      </TouchableOpacity>
      
      <View style={styles.taskInfo}>
        <Text style={[
          typography.body, 
          { color: colors.textPrimary },
          item.completed && { textDecorationLine: 'line-through', color: colors.textTertiary }
        ]}>
          {item.title}
        </Text>
      </View>
 
      <Badge label={item.priority.toUpperCase()} type={item.priority} />

      <TouchableOpacity onPress={() => dispatch(deleteTaskThunk(item.id))} style={{ marginLeft: 12 }}>
        <MaterialCommunityIcons name="delete-outline" size={20} color={colors.error} />
      </TouchableOpacity>
    </Card>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Text style={[typography.h1, { color: colors.textPrimary }]}>Tasks</Text>
        <View style={[styles.badge, { backgroundColor: colors.accent }]}>
          <Text style={[typography.label, { color: colors.textInverse }]}>{tasks.length}</Text>
        </View>
      </View>

      <View style={styles.filterBar}>
        {(['all', 'active', 'completed'] as const).map(f => (
          <TouchableOpacity
            key={f}
            onPress={() => dispatch(setFilter(f))}
            style={[
              styles.filterTab,
              filter === f && { backgroundColor: colors.accent, borderRadius: radius.sm }
            ]}
          >
            <Text style={[
              typography.labelCaps,
              { color: filter === f ? colors.textInverse : colors.textSecondary }
            ]}>
              {f}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filteredTasks}
        renderItem={renderTask}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <Text style={[typography.body, { color: colors.textTertiary, textAlign: 'center', marginTop: 40 }]}>
            No tasks found
          </Text>
        }
      />

      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.accent, ...shadow.md }]}
        onPress={() => setIsModalVisible(true)}
      >
        <MaterialCommunityIcons name="plus" size={32} color={colors.textInverse} />
      </TouchableOpacity>

      <Modal visible={isModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ width: '100%' }}
          >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
              <View style={[styles.modalContent, { backgroundColor: colors.background, borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl }]}>
                <Text style={[typography.h2, { marginBottom: 24 }]}>New Task</Text>
                <Input label="TASK NAME" value={newTitle} onChangeText={setNewTitle} placeholder="What needs to be done?" />
                
                <Text style={[typography.labelCaps, { color: colors.textSecondary, marginBottom: 12 }]}>PRIORITY</Text>
                <View style={styles.priorityRow}>
                  {(['low', 'medium', 'high'] as const).map(p => (
                    <TouchableOpacity
                      key={p}
                      onPress={() => setNewPriority(p)}
                      style={[
                        styles.priorityBtn,
                        { borderColor: colors.border, borderWidth: 1, borderRadius: radius.md },
                        newPriority === p && { backgroundColor: colors.accent, borderColor: colors.accent }
                      ]}
                    >
                      <Text style={[typography.labelCaps, { color: newPriority === p ? colors.textInverse : colors.textPrimary }]}>
                        {p}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <View style={styles.modalActions}>
                  <Button variant="ghost" label="Cancel" onPress={() => setIsModalVisible(false)} style={{ flex: 1 }} />
                  <View style={{ width: 12 }} />
                  <Button label="Create" onPress={handleCreateTask} style={{ flex: 1 }} />
                </View>
              </View>
            </TouchableWithoutFeedback>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 24, flexDirection: 'row', alignItems: 'center', gap: 12 },
  badge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12 },
  filterBar: { flexDirection: 'row', paddingHorizontal: 24, marginBottom: 16, gap: 8 },
  filterTab: { paddingHorizontal: 16, paddingVertical: 8 },
  listContent: { padding: 24, paddingBottom: 100 },
  taskCard: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  checkbox: { marginRight: 16 },
  taskInfo: { flex: 1 },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { padding: 32, paddingBottom: 48 },
  priorityRow: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  priorityBtn: { flex: 1, paddingVertical: 12, alignItems: 'center' },
  modalActions: { flexDirection: 'row' },
});

export default TasksScreen;
