import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useTheme } from '../../hooks/useTheme';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { useAppSelector } from '../../hooks/useAppSelector';
import { fetchWellnessSummary } from '../../store/slices/wellnessSlice';
import { fetchMoodLogs } from '../../store/slices/moodSlice';
import { fetchEvents } from '../../store/slices/calendarSlice';
import { fetchMyRecords, checkInThunk, checkOutThunk } from '../../store/slices/attendanceSlice';
import { fetchMyLeaves } from '../../store/slices/leaveSlice';
import { MainTabParamList } from '../../types';

import BurnoutCard from '../../components/cards/BurnoutCard';
import WorkloadCard from '../../components/cards/WorkloadCard';
import MoodCard from '../../components/cards/MoodCard';
import FocusCard from '../../components/cards/FocusCard';
import EventCard from '../../components/cards/EventCard';
import HolidayCard from '../../components/cards/HolidayCard';
import EmptyState from '../../components/common/EmptyState';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { Ionicons } from '@expo/vector-icons';
import { holidayApi, HolidayRecord } from '../../services/api/holiday.api';

type NavigationProp = BottomTabNavigationProp<MainTabParamList, 'Dashboard'>;

const DashboardScreen = () => {
  const { colors, typography } = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const dispatch = useAppDispatch();
  
  const { user } = useAppSelector(state => state.auth);
  const { summary, isLoading: wellnessLoading } = useAppSelector(state => state.wellness);
  const { todayLog } = useAppSelector(state => state.mood);
  const { myRecords, isLoading: attendanceLoading } = useAppSelector(state => state.attendance);
  const { myLeaves, isLoading: leaveLoading } = useAppSelector(state => state.leave);

  const [currentTime, setCurrentTime] = useState(new Date());
  const [holidays, setHolidays] = useState<HolidayRecord[]>([]);
  const [holidaysLoading, setHolidaysLoading] = useState(false);

  const isLoading = wellnessLoading || attendanceLoading || leaveLoading || holidaysLoading;

  const fetchHolidays = useCallback(async () => {
    try {
      setHolidaysLoading(true);
      const data = await holidayApi.getHolidays();
      // Filter for upcoming holidays and sort by date ascending
      const todayDate = new Date();
      todayDate.setHours(0, 0, 0, 0);
      const upcoming = data
        .filter(h => new Date(h.date) >= todayDate)
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      setHolidays(upcoming);
    } catch (err) {
      console.log('Error fetching holidays on dashboard', err);
    } finally {
      setHolidaysLoading(false);
    }
  }, []);

  const loadData = useCallback(() => {
    dispatch(fetchWellnessSummary());
    dispatch(fetchMoodLogs());
    const currentMonth = new Date().toISOString().slice(0, 7);
    dispatch(fetchEvents(currentMonth));
    dispatch(fetchMyRecords());
    dispatch(fetchMyLeaves());
    fetchHolidays();
  }, [dispatch, fetchHolidays]);

  useEffect(() => {
    loadData();
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, [loadData]);

  const todayStr = currentTime.toLocaleDateString('en-US', { 
    weekday: 'short', 
    month: 'short', 
    day: 'numeric' 
  }).toUpperCase();

  const timeStr = currentTime.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });

  const todayDateString = currentTime.toISOString().split('T')[0];

  // All sessions for today
  const todayRecords = myRecords.filter(r => r.dateString === todayDateString);
  // The currently active (no checkout) session
  const activeRecord = todayRecords.find(r => !r.checkOutTime) || null;
  const isCheckedIn = !!activeRecord;
  // Sum of all fully completed sessions today (for continuity when re-checking in)
  const completedTodaySeconds = todayRecords
    .filter(r => r.checkOutTime)
    .reduce((sum, r) => sum + (r.duration || 0), 0);

  const [activeDuration, setActiveDuration] = useState('00:00:00');

  useEffect(() => {
    if (isCheckedIn && activeRecord?.checkInTime) {
      const interval = setInterval(() => {
        const start = new Date(activeRecord.checkInTime).getTime();
        const now = new Date().getTime();
        // Current session elapsed
        const currentElapsed = Math.max(0, now - start);
        // All previously completed sessions today
        const previousMs = completedTodaySeconds * 1000;
        const diff = currentElapsed + previousMs;

        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        setActiveDuration(
          `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
        );
      }, 1000);
      return () => clearInterval(interval);
    } else {
      // Checked out: show total completed time today
      const diff = completedTodaySeconds * 1000;
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      setActiveDuration(
        `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
      );
    }
  }, [isCheckedIn, activeRecord?.checkInTime, completedTodaySeconds, todayRecords, todayDateString]);

  const handleCheckInOut = () => {
    if (isCheckedIn) {
      dispatch(checkOutThunk()).then(() => dispatch(fetchMyRecords()));
    } else {
      dispatch(checkInThunk()).then(() => dispatch(fetchMyRecords()));
    }
  };

  const latestLeave = myLeaves.length > 0 ? myLeaves[0] : null;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'left', 'right']}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={loadData} tintColor={colors.accent} />
        }
      >
        {/* Header Section */}
        <View style={styles.header}>
          <View>
            <Text style={[typography.bodySmall, { color: colors.textSecondary }]}>
              {timeStr}
            </Text>
            <Text style={[typography.h1, { color: colors.textPrimary }]}>
              {user?.name.split(' ')[0]}
            </Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={[typography.labelCaps, { color: colors.textTertiary }]}>
              {todayStr}
            </Text>
            {user?.role === 'admin' && (
              <TouchableOpacity 
                style={[styles.adminBadge, { backgroundColor: colors.accent + '20' }]}
                onPress={() => navigation.navigate('Admin' as any)}
              >
                <Text style={[typography.labelSmall, { color: colors.accent }]}>ADMIN PANEL</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Attendance Card */}
        <Card style={styles.attendanceCard}>
          <View style={styles.cardHeader}>
            <View>
              <Text style={[typography.labelCaps, { color: colors.textSecondary }]}>ATTENDANCE</Text>
              <Text style={[typography.h3, { color: colors.textPrimary }]}>
                {isCheckedIn ? 'Currently Checked In' : 'Not Checked In'}
              </Text>
            </View>
            <Ionicons 
              name={isCheckedIn ? "enter" : "exit-outline"} 
              size={24} 
              color={isCheckedIn ? colors.success : colors.textTertiary} 
            />
          </View>
          
          {isCheckedIn && activeRecord && (
            <View style={{ marginBottom: 16 }}>
              <Text style={[typography.bodySmall, { color: colors.textSecondary }]}>
                Since: {new Date(activeRecord.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                {completedTodaySeconds > 0 && ` (+${Math.floor(completedTodaySeconds / 60)}m prev)`}
              </Text>
              <Text style={[typography.h2, { color: colors.accent, marginTop: 4 }]}>
                {activeDuration}
              </Text>
            </View>
          )}

          <Button 
            label={isCheckedIn ? "Check Out" : "Check In"} 
            onPress={handleCheckInOut}
            variant={isCheckedIn ? "ghost" : "primary"}
            isLoading={attendanceLoading}
            size="sm"
          />
        </Card>

        {/* Leave Section */}
        <View style={styles.sectionHeader}>
          <Text style={[typography.labelCaps, { color: colors.textTertiary }]}>
            LEAVE MANAGEMENT
          </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Profile' as any, { screen: 'Leaves' })}>
            <Text style={[typography.labelSmall, { color: colors.accent }]}>VIEW ALL</Text>
          </TouchableOpacity>
        </View>

        <Card style={styles.leaveCard}>
          <View style={styles.leaveContent}>
            <View style={{ flex: 1 }}>
              {latestLeave ? (
                <>
                  <Text style={[typography.bodySmall, { color: colors.textSecondary }]}>Last Request:</Text>
                  <Text style={[typography.body, { color: colors.textPrimary }]}>
                    {latestLeave.leaveType.toUpperCase()} - {latestLeave.status.toUpperCase()}
                  </Text>
                </>
              ) : (
                <Text style={[typography.body, { color: colors.textSecondary }]}>No recent leave requests</Text>
              )}
            </View>
            <Button 
              label="Apply" 
              onPress={() => navigation.navigate('Profile' as any, { screen: 'Leaves' })} 
              size="sm"
              style={{ width: 80 }}
            />
          </View>
        </Card>

        {/* Grid Row */}
        <View style={styles.gridRow}>
          <BurnoutCard riskScore={summary?.burnoutRisk ?? 0} />
          <View style={{ width: 12 }} />
          <WorkloadCard workloadScore={summary?.workloadScore ?? 0} />
        </View>

        <MoodCard 
          todayLog={todayLog} 
          onLogPress={() => navigation.navigate('Mood' as any)} 
        />
        
        <FocusCard 
          focusHours={summary?.focusHours ?? 0} 
          streak={summary?.streakDays ?? 0} 
        />

        {/* Upcoming Events */}
        <View style={styles.sectionHeader}>
          <Text style={[typography.labelCaps, { color: colors.textTertiary }]}>
            UPCOMING EVENTS
          </Text>
        </View>

        {summary?.upcomingEvents && summary.upcomingEvents.length > 0 ? (
          summary.upcomingEvents.map(event => (
            <EventCard key={event._id} event={event} />
          ))
        ) : (
          <EmptyState message="No upcoming events" icon="calendar-blank" />
        )}

        {/* Upcoming Holidays */}
        <View style={styles.sectionHeader}>
          <Text style={[typography.labelCaps, { color: colors.textTertiary }]}>
            UPCOMING HOLIDAYS
          </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Profile' as any, { screen: 'Holidays' })}>
            <Text style={[typography.labelSmall, { color: colors.accent }]}>VIEW ALL</Text>
          </TouchableOpacity>
        </View>

        {holidays && holidays.length > 0 ? (
          holidays.map(holiday => (
            <HolidayCard key={holiday._id} holiday={holiday} />
          ))
        ) : (
          <EmptyState message="No upcoming holidays" icon="party-popper" />
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  adminBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginTop: 4,
  },
  gridRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 12,
  },
  attendanceCard: {
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  leaveCard: {
    marginBottom: 16,
    paddingVertical: 12,
  },
  leaveContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});

export default DashboardScreen;
