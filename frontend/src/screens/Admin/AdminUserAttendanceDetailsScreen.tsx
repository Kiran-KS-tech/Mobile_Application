import React, { useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { useAppSelector } from '../../hooks/useAppSelector';
import { fetchUserRecords } from '../../store/slices/attendanceSlice';
import Card from '../../components/common/Card';
import { Ionicons } from '@expo/vector-icons';
import { RouteProp, useRoute } from '@react-navigation/native';

type ParamList = {
  Details: { userId: string; userName: string };
};

const AdminUserAttendanceDetailsScreen = () => {
  const { colors, typography } = useTheme();
  const dispatch = useAppDispatch();
  const route = useRoute<RouteProp<ParamList, 'Details'>>();
  const { userId, userName } = route.params;
  const { userRecords, isLoading } = useAppSelector(state => state.attendance);

  useEffect(() => {
    dispatch(fetchUserRecords(userId));
  }, [dispatch, userId]);

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
        <View style={styles.dateInfo}>
          <Ionicons name="calendar-outline" size={18} color={colors.accent} />
          <Text style={[typography.h4, { color: colors.textPrimary, marginLeft: 8 }]}>
            {formatDate(item.checkInTime)}
          </Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: item.checkOutTime ? colors.success + '20' : colors.warning + '20' }]}>
          <Text style={[typography.bodySmall, { color: item.checkOutTime ? colors.success : colors.warning, fontWeight: '600' }]}>
            {item.checkOutTime ? 'COMPLETED' : 'ONGOING'}
          </Text>
        </View>
      </View>

      <View style={styles.timeRow}>
        <View style={styles.timeBlock}>
          <Ionicons name="enter-outline" size={16} color={colors.success} />
          <View style={{ marginLeft: 8 }}>
            <Text style={[typography.bodySmall, { color: colors.textTertiary, fontSize: 10 }]}>CHECK IN</Text>
            <Text style={[typography.body, { color: colors.textPrimary }]}>{formatTime(item.checkInTime)}</Text>
          </View>
        </View>

        <View style={styles.timeDivider} />

        <View style={styles.timeBlock}>
          <Ionicons name="exit-outline" size={16} color={colors.error} />
          <View style={{ marginLeft: 8 }}>
            <Text style={[typography.bodySmall, { color: colors.textTertiary, fontSize: 10 }]}>CHECK OUT</Text>
            <Text style={[typography.body, { color: colors.textPrimary }]}>{formatTime(item.checkOutTime)}</Text>
          </View>
        </View>
      </View>

      {item.duration > 0 && (
        <View style={styles.durationRow}>
          <Text style={[typography.bodySmall, { color: colors.textSecondary }]}>
            Duration: {Math.floor(item.duration / 60)}m {Math.floor(item.duration % 60)}s
          </Text>
        </View>
      )}
    </Card>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[typography.h1, { color: colors.textPrimary }]}>{userName}</Text>
        <Text style={[typography.body, { color: colors.textSecondary }]}>Detailed Attendance History</Text>
      </View>

      <FlatList
        data={userRecords}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={() => dispatch(fetchUserRecords(userId))} tintColor={colors.accent} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="time-outline" size={48} color={colors.textTertiary} />
            <Text style={[typography.body, { color: colors.textSecondary, marginTop: 16 }]}>
              No detailed records found
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
    marginBottom: 12,
  },
  recordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  dateInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  timeRow: {
    flexDirection: 'row',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 10,
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
    backgroundColor: '#dee2e6',
    marginHorizontal: 16,
  },
  durationRow: {
    marginTop: 8,
    alignItems: 'flex-end',
  },
  emptyContainer: {
    marginTop: 100,
    alignItems: 'center',
  },
});

export default AdminUserAttendanceDetailsScreen;
