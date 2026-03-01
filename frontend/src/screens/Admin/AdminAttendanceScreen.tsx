import React, { useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { useAppSelector } from '../../hooks/useAppSelector';
import { fetchAllRecords } from '../../store/slices/attendanceSlice';
import Card from '../../components/common/Card';
import { Ionicons } from '@expo/vector-icons';

const AdminAttendanceScreen = () => {
  const { colors, typography } = useTheme();
  const dispatch = useAppDispatch();
  const { allRecords, isLoading } = useAppSelector(state => state.attendance);

  useEffect(() => {
    dispatch(fetchAllRecords());
  }, [dispatch]);

  const formatTime = (isoString: string | null) => {
    if (!isoString) return '--:--';
    return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  const formatDate = (isoString: string) => {
    return new Date(isoString).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const renderItem = ({ item }: { item: any }) => (
    <Card style={styles.recordCard}>
      <View style={styles.recordHeader}>
        <View style={styles.userInfo}>
          <View style={[styles.avatarPlaceholder, { backgroundColor: colors.accent + '20' }]}>
            <Text style={[typography.label, { color: colors.accent }]}>
              {item.userId?.name?.charAt(0) || 'U'}
            </Text>
          </View>
          <View>
            <Text style={[typography.h4, { color: colors.textPrimary }]}>
              {item.userId?.name || 'Unknown User'}
            </Text>
            <Text style={[typography.bodySmall, { color: colors.textSecondary }]}>
              {formatDate(item.checkInTime)}
            </Text>
          </View>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: item.isOngoing ? colors.warning + '20' : colors.success + '20' }]}>
          <Text style={[typography.label, { color: item.isOngoing ? colors.warning : colors.success }]}>
            {item.isOngoing ? 'ONGOING' : 'COMPLETED'}
          </Text>
        </View>
      </View>

      <View style={[styles.timeRow, { backgroundColor: colors.surfaceElevated }]}>
        <View style={styles.timeBlock}>
          <Ionicons name="enter-outline" size={16} color={colors.success} />
          <View style={{ marginLeft: 8 }}>
            <Text style={[typography.label, { color: colors.textTertiary }]}>FIRST IN</Text>
            <Text style={[typography.body, { color: colors.textPrimary }]}>{formatTime(item.firstCheckIn)}</Text>
          </View>
        </View>

        <View style={[styles.timeDivider, { backgroundColor: colors.border }]} />

        <View style={styles.timeBlock}>
          <Ionicons name="exit-outline" size={16} color={colors.error} />
          <View style={{ marginLeft: 8 }}>
            <Text style={[typography.label, { color: colors.textTertiary }]}>LAST OUT</Text>
            <Text style={[typography.body, { color: colors.textPrimary }]}>{formatTime(item.lastCheckOut)}</Text>
          </View>
        </View>
      </View>

      {item.totalDuration > 0 && (
        <View style={styles.durationRow}>
          <Text style={[typography.bodySmall, { color: colors.textSecondary }]}>
            Daily Total: {Math.floor(item.totalDuration / 3600)}h {Math.floor((item.totalDuration % 3600) / 60)}m
          </Text>
        </View>
      )}
    </Card>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[typography.h1, { color: colors.textPrimary }]}>Employee Attendance</Text>
        <Text style={[typography.body, { color: colors.textSecondary }]}>Monitor check-in/out records</Text>
      </View>

      <FlatList
        data={allRecords}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={() => dispatch(fetchAllRecords())} tintColor={colors.accent} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="calendar-outline" size={48} color={colors.textTertiary} />
            <Text style={[typography.body, { color: colors.textSecondary, marginTop: 16 }]}>
              No attendance records found
            </Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: 60,
  },
  listContent: {
    padding: 16,
    paddingBottom: 40,
  },
  recordCard: {
    marginBottom: 16,
  },
  recordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  timeRow: {
    flexDirection: 'row',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  timeBlock: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeDivider: {
    width: 1,
    height: 30,
    marginHorizontal: 16,
  },
  durationRow: {
    marginTop: 12,
    alignItems: 'flex-end',
  },
  emptyContainer: {
    marginTop: 100,
    alignItems: 'center',
  },
});

export default AdminAttendanceScreen;
