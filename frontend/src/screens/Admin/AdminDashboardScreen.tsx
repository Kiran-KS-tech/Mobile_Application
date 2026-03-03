import React, { useEffect, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Dimensions } from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useTheme } from '../../hooks/useTheme';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { useAppSelector } from '../../hooks/useAppSelector';
import { logoutThunk, fetchAllUsersThunk } from '../../store/slices/authSlice';
import { fetchAllRecords } from '../../store/slices/attendanceSlice';
import { fetchPendingLeaves } from '../../store/slices/leaveSlice';
import { fetchBurnoutRisks } from '../../store/slices/adminSlice';
import { AdminTabParamList } from '../../types';
import Card from '../../components/common/Card';
import BarChart from '../../components/admin/BarChart';
import DonutChart from '../../components/admin/DonutChart';

type NavigationProp = BottomTabNavigationProp<AdminTabParamList, 'AdminDashboard'>;

const screenWidth = Dimensions.get('window').width;

const AdminDashboardScreen = () => {
  const { colors, typography } = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const dispatch = useAppDispatch();

  const { user, users, isLoading: authLoading } = useAppSelector(state => state.auth);
  const { allRecords, isLoading: attendanceLoading } = useAppSelector(state => state.attendance);
  const { pendingLeaves, isLoading: leaveLoading } = useAppSelector(state => state.leave);
  const { burnoutRisks, isLoading: adminLoading, error: adminError } = useAppSelector(state => state.admin);

  const isLoading = authLoading || attendanceLoading || leaveLoading || adminLoading;

  const loadData = useCallback(() => {
    dispatch(fetchAllRecords());
    dispatch(fetchPendingLeaves());
    dispatch(fetchAllUsersThunk());
    dispatch(fetchBurnoutRisks());
  }, [dispatch]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleLogout = () => {
    dispatch(logoutThunk());
  };

  const todayDateString = new Date().toISOString().split('T')[0];
  const todayAttendance = allRecords.filter(r => r.dateString === todayDateString).length;
  const pendingLeavesCount = pendingLeaves.length;

  // ────── Weekly Attendance Data ──────
  const weeklyAttendanceData = useMemo(() => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const result: { label: string; value: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const count = allRecords.filter(r => r.dateString === dateStr).length;
      result.push({ label: days[d.getDay()], value: count });
    }
    return result;
  }, [allRecords]);

  // ────── Leave Type Distribution ──────
  const leaveDistribution = useMemo(() => {
    const medical = pendingLeaves.filter(l => l.leaveType === 'medical').length;
    const casual = pendingLeaves.filter(l => l.leaveType === 'casual').length;
    const unpaid = pendingLeaves.filter(l => l.leaveType === 'unpaid').length;
    return [
      { label: 'Medical', value: medical, color: '#FF6B6B' },
      { label: 'Casual', value: casual, color: '#4ECDC4' },
      { label: 'Unpaid', value: unpaid, color: '#FFD93D' },
    ];
  }, [pendingLeaves]);

  // ────── Attendance Distribution ──────
  const attendanceDistribution = useMemo(() => {
    const present = todayAttendance;
    const absent = Math.max(0, users.length - present);
    return [
      { label: 'Present', value: present, color: '#4ECDC4' },
      { label: 'Absent', value: absent, color: colors.surfaceElevated },
    ];
  }, [todayAttendance, users.length, colors.surfaceElevated]);

  // ────── Burnout Risk Distribution ──────
  const burnoutDistribution = useMemo(() => {
    const high = burnoutRisks.filter(r => r.riskLevel === 'High').length;
    const medium = burnoutRisks.filter(r => r.riskLevel === 'Medium').length;
    const low = burnoutRisks.filter(r => r.riskLevel === 'Low').length;
    const stable = Math.max(0, users.length - (high + medium + low));
    
    return [
      { label: 'High Risk', value: high, color: colors.error },
      { label: 'Moderate', value: medium, color: colors.warning },
      { label: 'Stable', value: stable, color: '#4ECDC4' },
    ];
  }, [burnoutRisks, users.length, colors.error, colors.warning]);

  // ────── Leave Balance Aggregate ──────
  const leaveBalanceData = useMemo(() => {
    const totalMedical = users.reduce((sum, u) => sum + (u.medicalLeaves ?? 0), 0);
    const totalCasual = users.reduce((sum, u) => sum + (u.casualLeaves ?? 0), 0);
    const maxMedical = users.length * 12;
    const maxCasual = users.length * 12;
    return { totalMedical, totalCasual, maxMedical, maxCasual };
  }, [users]);

  // ────── Active Today vs Total ──────
  const ongoingCount = allRecords.filter(r => r.dateString === todayDateString && r.isOngoing).length;

  const QuickAction = ({ icon, title, subtitle, color, onPress, badge }: any) => (
    <TouchableOpacity 
      style={[styles.quickAction, { backgroundColor: colors.surface }]} 
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.qIconContainer, { backgroundColor: color + '20' }]}>
        <MaterialCommunityIcons name={icon} size={28} color={color} />
      </View>
      <View style={styles.actionInfo}>
        <Text style={[typography.h4, { color: colors.textPrimary }]}>{title}</Text>
        <Text style={[typography.bodySmall, { color: colors.textSecondary }]}>{subtitle}</Text>
      </View>
      {badge != null && badge > 0 && (
        <View style={[styles.badge, { backgroundColor: color }]}>
          <Text style={{ color: '#fff', fontSize: 11, fontWeight: '700' }}>{badge}</Text>
        </View>
      )}
      <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
    </TouchableOpacity>
  );

  const ProgressBar = ({ label, current, max, color }: { label: string; current: number; max: number; color: string }) => {
    const pct = max > 0 ? Math.min((current / max) * 100, 100) : 0;
    return (
      <View style={{ marginBottom: 14 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
          <Text style={[typography.label, { color: colors.textSecondary }]}>{label}</Text>
          <Text style={[typography.label, { color: colors.textPrimary }]}>{current} / {max}</Text>
        </View>
        <View style={{ height: 8, borderRadius: 4, backgroundColor: colors.surfaceElevated, overflow: 'hidden' }}>
          <View style={{ height: '100%', width: `${pct}%`, borderRadius: 4, backgroundColor: color }} />
        </View>
      </View>
    );
  };

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: colors.background }]}
      refreshControl={
        <RefreshControl refreshing={isLoading} onRefresh={loadData} tintColor={colors.accent} />
      }
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={[typography.bodySmall, { color: colors.textSecondary }]}>Welcome back,</Text>
          <Text style={[typography.h1, { color: colors.textPrimary }]}>{user?.name || 'Admin'}</Text>
        </View>
        <TouchableOpacity 
          style={[styles.logoutButton, { borderColor: colors.error + '40' }]} 
          onPress={handleLogout}
        >
          <MaterialCommunityIcons name="logout" size={22} color={colors.error} />
        </TouchableOpacity>
      </View>

      {/* Top Stats Grid */}
      <View style={styles.statsGrid}>
        <Card style={styles.statsCard} onPress={() => navigation.navigate('AdminAttendance')}>
          <View style={[styles.statsIconWrap, { backgroundColor: '#4ECDC4' + '20' }]}>
            <MaterialCommunityIcons name="account-check-outline" size={22} color="#4ECDC4" />
          </View>
          <Text style={[typography.h2, { color: colors.textPrimary, marginTop: 8 }]}>{todayAttendance}</Text>
          <Text style={[typography.labelSmall, { color: colors.textSecondary }]}>Checked In</Text>
        </Card>

        <Card style={styles.statsCard} onPress={() => navigation.navigate('AdminUsers')}>
          <View style={[styles.statsIconWrap, { backgroundColor: '#6C5CE7' + '20' }]}>
            <MaterialCommunityIcons name="account-group-outline" size={22} color="#6C5CE7" />
          </View>
          <Text style={[typography.h2, { color: colors.textPrimary, marginTop: 8 }]}>{users.length}</Text>
          <Text style={[typography.labelSmall, { color: colors.textSecondary }]}>Total Users</Text>
        </Card>

        <Card style={styles.statsCard} onPress={() => navigation.navigate('AdminLeaves')}>
          <View style={[styles.statsIconWrap, { backgroundColor: '#FFD93D' + '20' }]}>
            <MaterialCommunityIcons name="calendar-clock-outline" size={22} color="#FFD93D" />
          </View>
          <Text style={[typography.h2, { color: colors.textPrimary, marginTop: 8 }]}>{pendingLeavesCount}</Text>
          <Text style={[typography.labelSmall, { color: colors.textSecondary }]}>Pending Leaves</Text>
        </Card>

        <Card style={styles.statsCard}>
          <View style={[styles.statsIconWrap, { backgroundColor: '#FF6B6B' + '20' }]}>
            <MaterialCommunityIcons name="clock-check-outline" size={22} color="#FF6B6B" />
          </View>
          <Text style={[typography.h2, { color: colors.textPrimary, marginTop: 8 }]}>{ongoingCount}</Text>
          <Text style={[typography.labelSmall, { color: colors.textSecondary }]}>Active Now</Text>
        </Card>
      </View>

      {/* Burnout Risk Alerts */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <MaterialCommunityIcons name="robot" size={20} color={colors.accent} style={{ marginRight: 8 }} />
            <Text style={[typography.h3, { color: colors.textPrimary }]}>AI Burnout Analytics</Text>
          </View>
          {adminLoading && <Text style={[typography.labelSmall, { color: colors.accent }]}>Analyzing...</Text>}
        </View>

        {adminError ? (
          <Card style={[styles.errorCard, { borderColor: colors.error + '40' }]}>
            <MaterialCommunityIcons name="alert-circle-outline" size={24} color={colors.error} />
            <Text style={[typography.bodySmall, { color: colors.textSecondary, marginLeft: 12, flex: 1 }]}>
              {adminError}
            </Text>
            <TouchableOpacity onPress={() => dispatch(fetchBurnoutRisks())}>
              <Text style={[typography.label, { color: colors.accent }]}>RETRY</Text>
            </TouchableOpacity>
          </Card>
        ) : burnoutRisks.length > 0 ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.riskScroll}>
            {burnoutRisks.map((risk, index) => (
              <Card key={index} style={[styles.riskCard, { borderLeftColor: risk.riskLevel === 'High' ? colors.error : colors.warning }]}>
                <View style={styles.riskHeader}>
                  <Text style={[typography.h4, { color: colors.textPrimary }]}>{risk.name}</Text>
                  <View style={[styles.riskBadge, { backgroundColor: (risk.riskLevel === 'High' ? colors.error : colors.warning) + '20' }]}>
                    <Text style={[styles.riskBadgeText, { color: risk.riskLevel === 'High' ? colors.error : colors.warning }]}>
                      {risk.riskLevel} Risk
                    </Text>
                  </View>
                </View>
                <Text style={[typography.bodySmall, { color: colors.textSecondary, marginBottom: 8 }]} numberOfLines={2}>
                  {risk.reason}
                </Text>
                <View style={[styles.tipContainer, { backgroundColor: colors.surfaceElevated }]}>
                  <MaterialCommunityIcons name="lightbulb-on-outline" size={14} color={colors.accent} />
                  <Text style={[styles.tipText, { color: colors.textPrimary }]} numberOfLines={2}>
                    {risk.recommendation}
                  </Text>
                </View>
              </Card>
            ))}
          </ScrollView>
        ) : !adminLoading && (
          <Card style={styles.emptyRiskCard}>
            <MaterialCommunityIcons name="check-decagram-outline" size={24} color="#4ECDC4" />
            <Text style={[typography.bodySmall, { color: colors.textSecondary, marginLeft: 12 }]}>
              No high-risk fatigue patterns detected this week.
            </Text>
          </Card>
        )}
      </View>

      {/* Weekly Attendance Chart */}
      <View style={styles.section}>
        <Card style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <View>
              <Text style={[typography.h4, { color: colors.textPrimary }]}>Weekly Attendance</Text>
              <Text style={[typography.bodySmall, { color: colors.textTertiary, marginTop: 2 }]}>Last 7 days check-in trend</Text>
            </View>
            <View style={[styles.trendBadge, { backgroundColor: '#4ECDC4' + '15' }]}>
              <MaterialCommunityIcons name="trending-up" size={16} color="#4ECDC4" />
            </View>
          </View>
          <BarChart data={weeklyAttendanceData} height={130} barColor="#4ECDC4" />
        </Card>
      </View>

      {/* Attendance Summary Donut */}
      <View style={styles.section}>
        <Card style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <View>
              <Text style={[typography.h4, { color: colors.textPrimary }]}>Attendance Summary</Text>
              <Text style={[typography.bodySmall, { color: colors.textTertiary, marginTop: 2 }]}>Today&apos;s presence vs total users</Text>
            </View>
            <View style={[styles.trendBadge, { backgroundColor: '#4ECDC4' + '15' }]}>
              <MaterialCommunityIcons name="account-group" size={16} color="#4ECDC4" />
            </View>
          </View>
          <DonutChart 
            data={attendanceDistribution} 
            size={130} 
            strokeWidth={20} 
            centerLabel={`${Math.round((todayAttendance / (users.length || 1)) * 100)}%`}
          />
        </Card>
      </View>

      {/* Burnout Risk Distribution Donut */}
      <View style={styles.section}>
        <Card style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <View>
              <Text style={[typography.h4, { color: colors.textPrimary }]}>Employee Wellness</Text>
              <Text style={[typography.bodySmall, { color: colors.textTertiary, marginTop: 2 }]}>Burnout risk levels across team</Text>
            </View>
            <View style={[styles.trendBadge, { backgroundColor: colors.accent + '15' }]}>
              <MaterialCommunityIcons name="heart-pulse" size={16} color={colors.accent} />
            </View>
          </View>
          <DonutChart 
            data={burnoutDistribution} 
            size={130} 
            strokeWidth={20}
          />
        </Card>
      </View>

      {/* Leave Distribution Chart */}
      <View style={styles.section}>
        <Card style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <View>
              <Text style={[typography.h4, { color: colors.textPrimary }]}>Leave Requests</Text>
              <Text style={[typography.bodySmall, { color: colors.textTertiary, marginTop: 2 }]}>Pending by type</Text>
            </View>
            <TouchableOpacity onPress={() => navigation.navigate('AdminLeaves')}>
              <Text style={[typography.label, { color: colors.accent }]}>VIEW ALL</Text>
            </TouchableOpacity>
          </View>
          {pendingLeavesCount > 0 ? (
            <DonutChart data={leaveDistribution} size={130} strokeWidth={20} />
          ) : (
            <View style={{ alignItems: 'center', paddingVertical: 30 }}>
              <MaterialCommunityIcons name="check-circle-outline" size={40} color={colors.textTertiary} />
              <Text style={[typography.body, { color: colors.textSecondary, marginTop: 8 }]}>No pending requests</Text>
            </View>
          )}
        </Card>
      </View>

      {/* Leave Balance Overview */}
      <View style={styles.section}>
        <Card style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <View>
              <Text style={[typography.h4, { color: colors.textPrimary }]}>Leave Balance Overview</Text>
              <Text style={[typography.bodySmall, { color: colors.textTertiary, marginTop: 2 }]}>Remaining across all employees</Text>
            </View>
          </View>
          <ProgressBar 
            label="Medical Leaves" 
            current={leaveBalanceData.totalMedical} 
            max={leaveBalanceData.maxMedical} 
            color="#FF6B6B" 
          />
          <ProgressBar 
            label="Casual Leaves" 
            current={leaveBalanceData.totalCasual} 
            max={leaveBalanceData.maxCasual} 
            color="#4ECDC4" 
          />
        </Card>
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={[typography.h3, { color: colors.textPrimary, marginBottom: 16 }]}>Management</Text>
        
        <QuickAction 
          icon="clipboard-account-outline" 
          title="Attendance" 
          subtitle="View employee attendance records"
          color="#4ECDC4"
          onPress={() => navigation.navigate('AdminAttendance')}
        />
        
        <QuickAction 
          icon="calendar-clock-outline" 
          title="Leave Requests" 
          subtitle="Approve or reject applications"
          color="#FFD93D"
          badge={pendingLeavesCount}
          onPress={() => navigation.navigate('AdminLeaves')}
        />
        
        <QuickAction 
          icon="calendar-star" 
          title="Holidays" 
          subtitle="Update company holiday calendar"
          color="#FF6B6B"
          onPress={() => navigation.navigate('AdminHolidays')}
        />

        <QuickAction 
          icon="account-group-outline" 
          title="Users" 
          subtitle="Manage employee profiles and roles"
          color="#6C5CE7"
          onPress={() => navigation.navigate('AdminUsers')}
        />
      </View>

      <View style={styles.footer}>
        <Text style={[typography.bodySmall, { color: colors.textTertiary, textAlign: 'center' }]}>
          Admin Dashboard v1.0.0
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
  },
  logoutButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 14,
    justifyContent: 'space-between',
  },
  statsCard: {
    width: (screenWidth - 44) / 2,
    alignItems: 'center',
    paddingVertical: 18,
    marginBottom: 12,
  },
  statsIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
    paddingHorizontal: 20,
    marginTop: 4,
  },
  chartCard: {
    marginBottom: 16,
    paddingVertical: 18,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  trendBadge: {
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickAction: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  qIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  actionInfo: {
    flex: 1,
  },
  badge: {
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
    marginRight: 8,
  },
  footer: {
    padding: 40,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 10,
  },
  aiBadge: {
    backgroundColor: '#6C5CE7' + '20',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  aiBadgeText: {
    color: '#6C5CE7',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  riskScroll: {
    paddingRight: 20,
    paddingBottom: 8,
  },
  riskCard: {
    width: screenWidth * 0.75,
    marginRight: 12,
    borderLeftWidth: 4,
    padding: 16,
  },
  riskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  riskBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  riskBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  tipContainer: {
    flexDirection: 'row',
    padding: 8,
    borderRadius: 8,
    alignItems: 'flex-start',
  },
  tipText: {
    fontSize: 11,
    marginLeft: 6,
    flex: 1,
    lineHeight: 16,
  },
  errorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderWidth: 1,
    marginBottom: 10,
  },
  emptyRiskCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginBottom: 10,
    backgroundColor: '#4ECDC410',
  },
});

export default AdminDashboardScreen;
