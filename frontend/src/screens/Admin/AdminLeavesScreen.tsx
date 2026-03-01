import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../hooks/useTheme';
import { leaveApi, LeaveRecord } from '../../services/api/leave.api';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const AdminLeavesScreen = () => {
  const { colors, typography } = useTheme();
  const [leaves, setLeaves] = useState<LeaveRecord[]>([]);
  const [loading, setLoading] = useState(false);

  const getLeaveIcon = (type: string) => {
    switch (type) {
      case 'medical': return 'medical-bag';
      case 'casual': return 'palm-tree';
      case 'unpaid': return 'cash-off';
      default: return 'calendar-blank';
    }
  };
  const fetchPendingLeaves = async () => {
    try {
      setLoading(true);
      const data = await leaveApi.getPendingLeaves();
      setLeaves(data);
    } catch (err) {
      console.log('Error fetching pending leaves', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingLeaves();
  }, []);

  const handleAction = async (id: string, status: 'approved' | 'rejected') => {
    try {
      await leaveApi.updateLeaveStatus(id, status);
      Alert.alert('Success', `Leave ${status} successfully`);
      fetchPendingLeaves();
    } catch (err) {
      console.log(err);
      Alert.alert('Error', 'Failed to update leave request');
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Text style={[typography.h1, { color: colors.textPrimary }]}>Leave Approvals</Text>
      </View>

      <FlatList
        data={leaves}
        keyExtractor={item => item._id}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
        refreshing={loading}
        onRefresh={fetchPendingLeaves}
        ListEmptyComponent={
          <View style={{ marginTop: 40, alignItems: 'center' }}>
             <Text style={[typography.body, { color: colors.textSecondary }]}>No pending leave requests.</Text>
          </View>
        }
        renderItem={({ item }) => (
          <Card style={{ marginBottom: 12 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12, alignItems: 'center' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={[styles.iconContainer, { backgroundColor: colors.surfaceElevated, marginRight: 12 }]}>
                  <MaterialCommunityIcons name={getLeaveIcon(item.leaveType)} size={24} color={colors.accent} />
                </View>
                <View>
                  <Text style={[typography.body, { color: colors.textPrimary, fontWeight: '600' }]}>{item.userId?.name || 'Unknown User'}</Text>
                  <Text style={[typography.labelSmall, { color: colors.textSecondary, textTransform: 'capitalize' }]}>{item.leaveType} Leave</Text>
                </View>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: colors.warning + '20' }]}>
                <Text style={[typography.labelSmall, { color: colors.warning }]}>PENDING</Text>
              </View>
            </View>
            
            <View style={[styles.detailsContainer, { backgroundColor: colors.surfaceElevated }]}>
              <View style={styles.detailRow}>
                <MaterialCommunityIcons name="calendar-range" size={16} color={colors.textTertiary} />
                <Text style={[typography.bodySmall, { color: colors.textSecondary, marginLeft: 8 }]}>
                  {new Date(item.startDate).toLocaleDateString()} - {new Date(item.endDate).toLocaleDateString()}
                </Text>
              </View>
              <View style={{ marginTop: 10 }}>
                <Text style={[typography.labelSmall, { color: colors.textTertiary, marginBottom: 4, letterSpacing: 0.5 }]}>REASON</Text>
                <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                  <MaterialCommunityIcons name="format-quote-open" size={16} color={colors.textTertiary} style={{ marginTop: 2 }} />
                  <Text style={[typography.body, { color: colors.textPrimary, marginLeft: 6, flex: 1, lineHeight: 20 }]}>
                    {item.reason}
                  </Text>
                </View>
              </View>
            </View>

            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 16 }}>
              <Button label="Reject" variant="danger" onPress={() => handleAction(item._id, 'rejected')} size="sm" style={{ marginRight: 8, width: 'auto', paddingHorizontal: 20 }} />
              <Button label="Approve" onPress={() => handleAction(item._id, 'approved')} size="sm" style={{ backgroundColor: colors.success, width: 'auto', paddingHorizontal: 20 }} />
            </View>
          </Card>
        )}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 20 },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  detailsContainer: {
    padding: 12,
    borderRadius: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  }
});

export default AdminLeavesScreen;
