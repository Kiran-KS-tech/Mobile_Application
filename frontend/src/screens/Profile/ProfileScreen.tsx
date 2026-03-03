import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { useAppSelector } from '../../hooks/useAppSelector';
import { logoutThunk, updateProfileThunk } from '../../store/slices/authSlice';
import { fetchTasks } from '../../store/slices/taskSlice';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Divider from '../../components/common/Divider';
import { useNavigation } from '@react-navigation/native';

const ProfileScreen = () => {
  const { colors, typography } = useTheme();
  const dispatch = useAppDispatch();
  const navigation = useNavigation<any>();
  const { user } = useAppSelector(state => state.auth);
  const { summary } = useAppSelector(state => state.wellness);
  const { tasks } = useAppSelector(state => state.tasks);

  const [shareData, setShareData] = useState(user?.preferences?.shareData ?? true);
  const [aiAnalytics, setAiAnalytics] = useState(user?.preferences?.aiAnalytics ?? true);
  const [pushNotifs, setPushNotifs] = useState(user?.preferences?.pushNotifs ?? false);

  useEffect(() => {
    if (user?.preferences) {
      setShareData(user.preferences.shareData ?? true);
      setAiAnalytics(user.preferences.aiAnalytics ?? true);
      setPushNotifs(user.preferences.pushNotifs ?? false);
    }
  }, [user?.preferences]);

  const handleTogglePreference = (preference: 'shareData' | 'aiAnalytics' | 'pushNotifs', value: boolean) => {
    if (preference === 'shareData') setShareData(value);
    if (preference === 'aiAnalytics') setAiAnalytics(value);
    if (preference === 'pushNotifs') setPushNotifs(value);

    dispatch(updateProfileThunk({
      preferences: {
        shareData: preference === 'shareData' ? value : shareData,
        aiAnalytics: preference === 'aiAnalytics' ? value : aiAnalytics,
        pushNotifs: preference === 'pushNotifs' ? value : pushNotifs,
      }
    }));
  };

  useEffect(() => {
    dispatch(fetchTasks());
  }, [dispatch]);

  const completedTasksCount = tasks.filter(t => t.completed).length;

  const handleLogout = () => {
    Alert.alert(
      'Sign out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign out', style: 'destructive', onPress: () => dispatch(logoutThunk()) },
      ]
    );
  };

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase()
    : 'UX';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header Section */}
        <View style={styles.header}>
          <View style={[styles.avatar, { backgroundColor: colors.accent }]}>
            <Text style={[typography.h2, { color: colors.textInverse }]}>{initials}</Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={[typography.h2, { color: colors.textPrimary }]}>{user?.name}</Text>
            <Text style={[typography.body, { color: colors.textSecondary }]}>{user?.email}</Text>
          </View>
          <Button variant="ghost" label="Edit Profile" onPress={() => navigation.navigate('EditProfile')} size="sm" style={{ width: 'auto', marginTop: 16 }} />
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={[typography.monoLarge, { color: colors.textPrimary }]}>{summary?.streakDays ?? 0}</Text>
            <Text style={[typography.label, { color: colors.textSecondary }]}>Streak</Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: colors.divider }]} />
          <View style={styles.statItem}>
            <Text style={[typography.monoLarge, { color: colors.textPrimary }]}>{summary?.focusHours ?? 0}</Text>
            <Text style={[typography.label, { color: colors.textSecondary }]}>Mood Logs</Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: colors.divider }]} />
          <View style={styles.statItem}>
            <Text style={[typography.monoLarge, { color: colors.textPrimary }]}>{completedTasksCount}</Text>
            <Text style={[typography.label, { color: colors.textSecondary }]}>Tasks Done</Text>
          </View>
        </View>

        {/* Stress Insights Card */}
        <Card style={styles.insightCard}>
          <Text style={[typography.labelCaps, { color: colors.textSecondary, marginBottom: 16 }]}>
            STRESS INSIGHTS
          </Text>
          <Text style={[typography.h3, { color: colors.textPrimary, marginBottom: 8 }]}>
            Burnout Risk: {summary?.burnoutRisk ?? 0}%
          </Text>
          <Text style={[typography.body, { color: colors.textSecondary }]}>
            Based on your activity, your burnout risk is {summary?.burnoutRisk && summary.burnoutRisk > 60 ? 'elevated' : 'stable'}. 
            Try to schedule more focus breaks.
          </Text>
          <Divider />
          <View style={styles.insightTip}>
            <MaterialCommunityIcons name="lightbulb-outline" size={20} color={colors.accent} />
            <Text style={[typography.bodySmall, { color: colors.textPrimary, flex: 1, marginLeft: 12 }]}>
              Users with consistent mood logs report 30% higher productivity levels.
            </Text>
          </View>
        </Card>

        {/* Leave Balance Card */}
        <Card style={[styles.insightCard, { marginBottom: 32 }]}>
          <Text style={[typography.labelCaps, { color: colors.textSecondary, marginBottom: 16 }]}>
            LEAVE BALANCES
          </Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', marginBottom: 8 }}>
             <View style={{ alignItems: 'center' }}>
               <Text style={[typography.h2, { color: colors.accent }]}>{user?.casualLeaves ?? 0}</Text>
               <Text style={[typography.body, { color: colors.textSecondary }]}>Casual Leaves</Text>
             </View>
             <View style={[styles.statDivider, { backgroundColor: colors.divider }]} />
             <View style={{ alignItems: 'center' }}>
               <Text style={[typography.h2, { color: colors.accent }]}>{user?.medicalLeaves ?? 0}</Text>
               <Text style={[typography.body, { color: colors.textSecondary }]}>Medical Leaves</Text>
             </View>
          </View>
        </Card>

        {/* HR Tools */}
        <View style={styles.sectionHeader}>
          <Text style={[typography.labelCaps, { color: colors.textTertiary }]}>HR TOOLS</Text>
        </View>

        <View style={styles.settingRow}>
          <Text style={[typography.body, { color: colors.textPrimary }]}>My Attendance</Text>
          <Button variant="ghost" label="View" onPress={() => navigation.navigate('Attendance')} size="sm" style={{ width: 80 }} />
        </View>
        <View style={styles.settingRow}>
          <Text style={[typography.body, { color: colors.textPrimary }]}>My Leaves</Text>
          <Button variant="ghost" label="View" onPress={() => navigation.navigate('Leaves')} size="sm" style={{ width: 80 }} />
        </View>
        <View style={styles.settingRow}>
          <Text style={[typography.body, { color: colors.textPrimary }]}>Company Holidays</Text>
          <Button variant="ghost" label="View" onPress={() => navigation.navigate('Holidays')} size="sm" style={{ width: 80 }} />
        </View>

        {/* Privacy Settings */}
        <View style={[styles.sectionHeader, { marginTop: 24 }]}>
          <Text style={[typography.labelCaps, { color: colors.textTertiary }]}>SETTINGS</Text>
        </View>

        <View style={styles.settingRow}>
          <Text style={[typography.body, { color: colors.textPrimary }]}>Share mood data</Text>
          <Switch value={shareData} onValueChange={(val) => handleTogglePreference('shareData', val)} trackColor={{ true: colors.accent, false: colors.border }} />
        </View>
        <View style={styles.settingRow}>
          <Text style={[typography.body, { color: colors.textPrimary }]}>AI Analytics</Text>
          <Switch value={aiAnalytics} onValueChange={(val) => handleTogglePreference('aiAnalytics', val)} trackColor={{ true: colors.accent, false: colors.border }} />
        </View>
        <View style={styles.settingRow}>
          <Text style={[typography.body, { color: colors.textPrimary }]}>Push Notifications</Text>
          <Switch value={pushNotifs} onValueChange={(val) => handleTogglePreference('pushNotifs', val)} trackColor={{ true: colors.accent, false: colors.border }} />
        </View>

        <Button
          variant="danger"
          label="Sign out"
          onPress={handleLogout}
          style={{ marginTop: 40, marginBottom: 60 }}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 24 },
  header: { alignItems: 'center', marginBottom: 40 },
  avatar: { width: 80, height: 80, borderRadius: 40, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  userInfo: { alignItems: 'center' },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 },
  statItem: { flex: 1, alignItems: 'center' },
  statDivider: { width: 1, height: 32 },
  insightCard: { marginBottom: 32 },
  insightTip: { flexDirection: 'row', alignItems: 'center' },
  sectionHeader: { marginBottom: 16 },
  settingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
});

export default ProfileScreen;
