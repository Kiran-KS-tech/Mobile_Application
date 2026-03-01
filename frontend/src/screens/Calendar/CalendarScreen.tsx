import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
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
import { fetchEvents, createEventThunk, setSelectedDate } from '../../store/slices/calendarSlice';
import { getMonthMatrix } from '../../utils/dateUtils';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';

const CalendarScreen = () => {
  const { colors, typography, radius } = useTheme();
  const dispatch = useAppDispatch();
  const { events, selectedDate } = useAppSelector(state => state.calendar);

  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [isModalVisible, setIsModalVisible] = useState(false);

  // New event form state
  const [newTitle, setNewTitle] = useState('');
  const [newType] = useState<'task' | 'meeting' | 'other'>('task');
  const [newStartTime] = useState('09:00');
  const [newEndTime] = useState('10:00');

  useEffect(() => {
    const monthStr = currentMonth.toISOString().slice(0, 7);
    dispatch(fetchEvents(monthStr));
  }, [currentMonth, dispatch]);

  const monthMatrix = getMonthMatrix(currentMonth.getFullYear(), currentMonth.getMonth());
  const weekdays = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const handleAddEvent = () => {
    const startIso = `${selectedDate}T${newStartTime}:00Z`;
    const endIso = `${selectedDate}T${newEndTime}:00Z`;

    dispatch(createEventThunk({
      title: newTitle,
      type: newType as any,
      startTime: startIso,
      endTime: endIso,
      date: selectedDate,
    }));
    setIsModalVisible(false);
    setNewTitle('');
  };

  const selectedDateEvents = (events || []).filter(e => e.date === selectedDate);

  const renderMonthView = () => (
    <View style={styles.grid}>
      <View style={styles.weekdaysRow}>
        {weekdays.map(d => (
          <Text key={d} style={[typography.labelCaps, { color: colors.textTertiary, width: 44, textAlign: 'center' }]}>
            {d}
          </Text>
        ))}
      </View>
      {monthMatrix.map((week, i) => (
        <View key={i} style={styles.weekRow}>
          {week.map((date, j) => {
            if (!date) return <View key={j} style={styles.cell} />;
            
            const dateStr = date.toISOString().split('T')[0];
            const isSelected = selectedDate === dateStr;
            const isToday = new Date().toDateString() === date.toDateString();
            const dateEvents = (events || []).filter(e => e.date === dateStr);

            return (
              <TouchableOpacity
                key={j}
                style={[
                  styles.cell,
                  isSelected && { borderWidth: 2, borderColor: colors.accent, borderRadius: radius.md },
                  isToday && { backgroundColor: colors.accent, borderRadius: radius.md }
                ]}
                onPress={() => dispatch(setSelectedDate(dateStr))}
              >
                <Text style={[
                  typography.body,
                  { color: isToday ? colors.textInverse : colors.textPrimary },
                  isSelected && !isToday && { fontWeight: '800' }
                ]}>
                  {date.getDate()}
                </Text>
                <View style={styles.dotRow}>
                  {dateEvents.slice(0, 3).map(e => (
                    <View 
                      key={e._id} 
                      style={[styles.dot, { backgroundColor: (colors as any)[`event${e.type.charAt(0).toUpperCase() + e.type.slice(1)}`] || colors.accent }]} 
                    />
                  ))}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      ))}
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <View>
          <Text style={[typography.h2, { color: colors.textPrimary }]}>
            {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </Text>
        </View>
        <View style={styles.headerControls}>
          <TouchableOpacity onPress={handlePrevMonth} style={styles.iconBtn}>
            <MaterialCommunityIcons name="chevron-left" size={28} color={colors.textPrimary} />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleNextMonth} style={styles.iconBtn}>
            <MaterialCommunityIcons name="chevron-right" size={28} color={colors.textPrimary} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {renderMonthView()}

        <View style={styles.dayEventsHeader}>
          <Text style={[typography.labelCaps, { color: colors.textTertiary }]}>
            {selectedDate === new Date().toISOString().split('T')[0] ? 'TODAY' : selectedDate}
          </Text>
          <TouchableOpacity onPress={() => setIsModalVisible(true)}>
            <MaterialCommunityIcons name="plus" size={24} color={colors.accent} />
          </TouchableOpacity>
        </View>

        {selectedDateEvents.length > 0 ? (
          selectedDateEvents.map(event => (
            <Card key={event._id} style={styles.eventCard}>
              <View style={styles.eventInfo}>
                <Text style={[typography.h4, { color: colors.textPrimary }]}>{event.title}</Text>
                <Text style={[typography.bodySmall, { color: colors.textTertiary }]}>
                  {event.startTime.split('T')[1].slice(0, 5)} - {event.endTime.split('T')[1].slice(0, 5)}
                </Text>
              </View>
              <Badge label={event.type} type={event.type} />
            </Card>
          ))
        ) : (
          <Text style={[typography.body, { color: colors.textTertiary, textAlign: 'center', marginTop: 24 }]}>
            No events scheduled
          </Text>
        )}
      </ScrollView>

      {/* Add Event Modal */}
      <Modal visible={isModalVisible} animationType="slide" transparent>
        <View style={[styles.modalOverlay, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ width: '100%' }}
          >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
              <View style={[styles.modalContent, { backgroundColor: colors.background, borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl }]}>
                <Text style={[typography.h2, { marginBottom: 24 }]}>Add Event</Text>
                <Input label="TITLE" value={newTitle} onChangeText={setNewTitle} placeholder="Meeting title..." />
                
                <View style={styles.modalActions}>
                  <Button variant="ghost" label="Cancel" onPress={() => setIsModalVisible(false)} style={{ flex: 1 }} />
                  <View style={{ width: 12 }} />
                  <Button label="Save" onPress={handleAddEvent} style={{ flex: 1 }} />
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
  header: {
    padding: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerControls: { flexDirection: 'row', gap: 16 },
  iconBtn: { padding: 4 },
  scrollContent: { paddingHorizontal: 24, paddingBottom: 40 },
  grid: { width: '100%', marginBottom: 32 },
  weekdaysRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  weekRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  cell: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  dotRow: {
    position: 'absolute',
    bottom: 4,
    flexDirection: 'row',
    gap: 2,
  },
  dot: { width: 4, height: 4, borderRadius: 2 },
  dayEventsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  eventCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  eventInfo: { gap: 4 },
  modalOverlay: { flex: 1, justifyContent: 'flex-end' },
  modalContent: { padding: 32, paddingBottom: 48 },
  modalActions: { flexDirection: 'row', marginTop: 24 },
});

export default CalendarScreen;
