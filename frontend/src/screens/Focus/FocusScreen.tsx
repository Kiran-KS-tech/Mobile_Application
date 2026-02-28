import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { useAppSelector } from '../../hooks/useAppSelector';
import {
  fetchFocusSessions,
  startTimer,
  pauseTimer,
  resetTimer,
  tick,
  sessionComplete,
  logSessionThunk,
} from '../../store/slices/focusSlice';
import ProgressRing from '../../components/common/ProgressRing';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import { formatTime } from '../../utils/dateUtils';

const FocusScreen = () => {
  const { colors, typography, radius } = useTheme();
  const dispatch = useAppDispatch();
  const {
    status,
    timeRemaining,
    currentRound,
    streak,
    totalFocusToday,
    sessions,
    focusDuration,
  } = useAppSelector(state => state.focus);

  const timerRef = useRef<any>(null);

  useEffect(() => {
    dispatch(fetchFocusSessions());
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [dispatch]);

  useEffect(() => {
    if (status === 'running') {
      timerRef.current = setInterval(() => {
        dispatch(tick());
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [status, dispatch]);

  useEffect(() => {
    if (timeRemaining === 0) {
      const type = status === 'running' ? 'focus' : 'short_break'; // Simplified
      dispatch(sessionComplete(type));
      if (type === 'focus') {
        dispatch(logSessionThunk({
          duration: focusDuration,
          type: 'focus',
          completedAt: new Date().toISOString(),
        }));
      }
    }
  }, [timeRemaining, status, focusDuration, dispatch]);

  const toggleTimer = () => {
    if (status === 'running') {
      dispatch(pauseTimer());
    } else {
      dispatch(startTimer());
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.topInfo}>
          <Text style={[typography.labelCaps, { color: colors.textSecondary }]}>
            ROUND {currentRound}/4
          </Text>
          <Text style={[typography.labelCaps, { color: colors.textSecondary }]}>
            {status === 'break' ? 'BREAK' : 'FOCUS'}
          </Text>
        </View>

        <View style={styles.timerContainer}>
          <ProgressRing
            size={280}
            strokeWidth={8}
            progress={timeRemaining / focusDuration}
            label={formatTime(timeRemaining)}
            sublabel={status === 'break' ? 'TIME TO REST' : 'STAY FOCUSED'}
          />
        </View>

        <View style={styles.controls}>
          <TouchableOpacity 
            style={[styles.ghostBtn, { borderColor: colors.border, borderRadius: radius.md }]} 
            onPress={() => dispatch(resetTimer())}
          >
            <MaterialCommunityIcons name="refresh" size={24} color={colors.textPrimary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.mainBtn, { backgroundColor: colors.accent, borderRadius: radius.full }]}
            onPress={toggleTimer}
          >
            <MaterialCommunityIcons
              name={status === 'running' ? 'pause' : 'play'}
              size={40}
              color={colors.textInverse}
            />
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.ghostBtn, { borderColor: colors.border, borderRadius: radius.md }]}
            onPress={() => Alert.alert('Settings', 'Settings screen coming soon!')}
          >
            <MaterialCommunityIcons name="cog-outline" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
        </View>

        <View style={styles.statsRow}>
          <Card style={styles.statCard}>
            <Text style={[typography.monoLarge, { color: colors.textPrimary }]}>{streak}</Text>
            <Text style={[typography.label, { color: colors.textSecondary }]}>day streak</Text>
          </Card>
          <View style={{ width: 12 }} />
          <Card style={styles.statCard}>
            <Text style={[typography.monoLarge, { color: colors.textPrimary }]}>{totalFocusToday}</Text>
            <Text style={[typography.label, { color: colors.textSecondary }]}>min today</Text>
          </Card>
        </View>

        <View style={styles.historyHeader}>
          <Text style={[typography.labelCaps, { color: colors.textTertiary }]}>RECENT SESSIONS</Text>
        </View>

        {sessions.slice(0, 5).map(session => (
          <Card key={session.id} style={styles.sessionItem}>
            <Badge label={session.type.toUpperCase()} type="focus" />
            <Text style={[typography.mono, { color: colors.textPrimary }]}>
              {Math.round(session.duration / 60)} min
            </Text>
            <Text style={[typography.bodySmall, { color: colors.textTertiary }]}>
              {new Date(session.completedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </Card>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 24, alignItems: 'center' },
  topInfo: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginBottom: 40 },
  timerContainer: { marginBottom: 48 },
  controls: { flexDirection: 'row', alignItems: 'center', gap: 32, marginBottom: 48 },
  ghostBtn: { width: 56, height: 56, borderWidth: 1, justifyContent: 'center', alignItems: 'center' },
  mainBtn: { width: 80, height: 80, justifyContent: 'center', alignItems: 'center' },
  statsRow: { flexDirection: 'row', width: '100%', marginBottom: 32 },
  statCard: { flex: 1, alignItems: 'center', padding: 16 },
  historyHeader: { alignSelf: 'flex-start', marginBottom: 16 },
  sessionItem: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    paddingVertical: 12,
  },
});

export default FocusScreen;
