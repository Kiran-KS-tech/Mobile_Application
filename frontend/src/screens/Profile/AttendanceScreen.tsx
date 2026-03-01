import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../hooks/useTheme';
import { attendanceApi, TimerRecord } from '../../services/api/attendance.api';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const AttendanceScreen = () => {
  const { colors, typography } = useTheme();
  const [records, setRecords] = useState<TimerRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeCheckIn, setActiveCheckIn] = useState<TimerRecord | null>(null);

  const fetchRecords = async () => {
    try {
      setLoading(true);
      const data = await attendanceApi.getMyRecords();
      setRecords(data);
      // Check if the most recent record has no checkout time
      if (data.length > 0 && !data[0].checkOutTime) {
        setActiveCheckIn(data[0]);
      } else {
        setActiveCheckIn(null);
      }
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  const handleCheckIn = async () => {
    try {
      await attendanceApi.checkIn();
      Alert.alert('Success', 'Checked in successfully!');
      fetchRecords();
    } catch (e: any) {
      Alert.alert('Error', e?.response?.data?.message || 'Failed to check in');
    }
  };

  const handleCheckOut = async () => {
    try {
      await attendanceApi.checkOut();
      Alert.alert('Success', 'Checked out successfully!');
      fetchRecords();
    } catch (e: any) {
      Alert.alert('Error', e?.response?.data?.message || 'Failed to check out');
    }
  };

  const formatTime = (isoString?: string) => {
    if (!isoString) return '--:--';
    return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Text style={[typography.h1, { color: colors.textPrimary }]}>Attendance</Text>
      </View>

      <Card style={styles.actionCard}>
        <View style={styles.statusRow}>
          <MaterialCommunityIcons 
            name={activeCheckIn ? "clock-check" : "clock-outline"} 
            size={32} 
            color={activeCheckIn ? colors.success : colors.textSecondary} 
          />
          <View style={{ marginLeft: 16 }}>
            <Text style={[typography.h3, { color: colors.textPrimary }]}>
              {activeCheckIn ? 'Status: Active' : 'Status: Inactive'}
            </Text>
            <Text style={[typography.body, { color: colors.textSecondary }]}>
              {activeCheckIn 
                ? `Checked in at ${formatTime(activeCheckIn.checkInTime)}`
                : 'You are not currently checked in'}
            </Text>
          </View>
        </View>

        <View style={styles.buttonRow}>
          <Button 
            label="Check In" 
            onPress={handleCheckIn} 
            disabled={!!activeCheckIn || loading} 
            style={{ flex: 1, marginRight: 8 }}
          />
          <Button 
            label="Check Out" 
            variant="ghost"
            onPress={handleCheckOut} 
            disabled={!activeCheckIn || loading} 
            style={{ flex: 1, marginLeft: 8, borderWidth: 1, borderColor: colors.border }}
          />
        </View>
      </Card>

      <Text style={[typography.h3, { color: colors.textPrimary, paddingHorizontal: 20, marginVertical: 16 }]}>
        Recent Records
      </Text>

      <FlatList
        data={records}
        keyExtractor={item => item._id}
        contentContainerStyle={{ paddingHorizontal: 20 }}
        refreshing={loading}
        onRefresh={fetchRecords}
        renderItem={({ item }) => (
          <View style={[styles.recordItem, { borderBottomColor: colors.border }]}>
            <View>
              <Text style={[typography.body, { color: colors.textPrimary, fontWeight: '600' }]}>{item.dateString}</Text>
              <Text style={[typography.bodySmall, { color: colors.textSecondary }]}>
                Duration: {item.duration ? `${Math.floor(item.duration / 3600)}h ${Math.floor((item.duration % 3600) / 60)}m` : 'Ongoing'}
              </Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={[typography.body, { color: colors.textPrimary }]}>In: {formatTime(item.checkInTime)}</Text>
              <Text style={[typography.body, { color: colors.textSecondary }]}>Out: {formatTime(item.checkOutTime)}</Text>
            </View>
          </View>
        )}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 20 },
  actionCard: { marginHorizontal: 20, marginBottom: 16 },
  statusRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-between' },
  recordItem: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1 }
});

export default AttendanceScreen;
