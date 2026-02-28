import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useTheme } from '../../hooks/useTheme';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { useAppSelector } from '../../hooks/useAppSelector';
import { fetchWellnessSummary } from '../../store/slices/wellnessSlice';
import { fetchMoodLogs } from '../../store/slices/moodSlice';
import { fetchEvents } from '../../store/slices/calendarSlice';
import { MainTabParamList } from '../../types';

import BurnoutCard from '../../components/cards/BurnoutCard';
import WorkloadCard from '../../components/cards/WorkloadCard';
import MoodCard from '../../components/cards/MoodCard';
import FocusCard from '../../components/cards/FocusCard';
import EventCard from '../../components/cards/EventCard';
import EmptyState from '../../components/common/EmptyState';

type NavigationProp = BottomTabNavigationProp<MainTabParamList, 'Dashboard'>;

const DashboardScreen = () => {
  const { colors, typography, spacing } = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const dispatch = useAppDispatch();
  
  const { user } = useAppSelector(state => state.auth);
  const { summary, isLoading } = useAppSelector(state => state.wellness);
  const { todayLog } = useAppSelector(state => state.mood);

  const loadData = () => {
    dispatch(fetchWellnessSummary());
    dispatch(fetchMoodLogs());
    const currentMonth = new Date().toISOString().slice(0, 7);
    dispatch(fetchEvents(currentMonth));
  };

  useEffect(() => {
    loadData();
  }, []);

  const todayStr = new Date().toLocaleDateString('en-US', { 
    weekday: 'short', 
    month: 'short', 
    day: 'numeric' 
  }).toUpperCase();

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
              Good morning,
            </Text>
            <Text style={[typography.h1, { color: colors.textPrimary }]}>
              {user?.name.split(' ')[0]}
            </Text>
          </View>
          <Text style={[typography.labelCaps, { color: colors.textTertiary }]}>
            {todayStr}
          </Text>
        </View>

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
            UPCOMING
          </Text>
        </View>

        {summary?.upcomingEvents && summary.upcomingEvents.length > 0 ? (
          summary.upcomingEvents.map(event => (
            <EventCard key={event.id} event={event} />
          ))
        ) : (
          <EmptyState message="No upcoming events" icon="calendar-blank" />
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
    marginBottom: 32,
  },
  gridRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  sectionHeader: {
    marginTop: 24,
    marginBottom: 16,
  },
});

export default DashboardScreen;
