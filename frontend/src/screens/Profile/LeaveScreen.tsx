import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Alert, TouchableOpacity, Platform, KeyboardAvoidingView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../hooks/useTheme';
import { leaveApi, LeaveRecord } from '../../services/api/leave.api';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAppSelector } from '../../hooks/useAppSelector';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';

const LeaveScreen = () => {
  const { colors, typography } = useTheme();
  const user = useAppSelector(state => state.auth.user);
  
  const [leaves, setLeaves] = useState<LeaveRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [applying, setApplying] = useState(false);

  // Form State
  const [leaveType, setLeaveType] = useState('casual');
  const [reason, setReason] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  const onStartChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    setShowStartPicker(Platform.OS === 'ios');
    if (selectedDate) {
      setStartDate(selectedDate.toISOString().split('T')[0]);
    }
  };

  const onEndChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    setShowEndPicker(Platform.OS === 'ios');
    if (selectedDate) {
      setEndDate(selectedDate.toISOString().split('T')[0]);
    }
  };

  const fetchLeaves = async () => {
    try {
      setLoading(true);
      const data = await leaveApi.getMyLeaves();
      setLeaves(data);
    } catch (err) {
      console.log('Error fetching leaves', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  const handleApply = async () => {
    if (!reason || !startDate || !endDate) {
      Alert.alert('Error', 'Please fill all fields.');
      return;
    }
    try {
      setApplying(true);
      await leaveApi.applyLeave({ leaveType, reason, startDate, endDate });
      Alert.alert('Success', 'Leave application submitted.');
      setReason('');
      setStartDate('');
      setEndDate('');
      fetchLeaves();
    } catch (e: any) {
      Alert.alert('Error', e?.response?.data?.message || 'Failed to apply');
    } finally {
      setApplying(false);
    }
  };

  const getStatusColor = (status: string) => {
    if (status === 'approved') return colors.success;
    if (status === 'rejected') return colors.error;
    return colors.warning;
  };

  const getLeaveIcon = (type: string) => {
    switch (type) {
      case 'medical': return 'medical-bag';
      case 'casual': return 'palm-tree';
      case 'unpaid': return 'cash-off';
      default: return 'calendar-blank';
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'left', 'right']}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={{ flex: 1 }}
      >
        <FlatList
          data={leaves}
          keyExtractor={item => item._id}
          ListHeaderComponent={
            <>
              <View style={styles.header}>
                <Text style={[typography.h1, { color: colors.textPrimary }]}>Leaves</Text>
              </View>

              <View style={styles.statsContainer}>
                <Card style={styles.statCard}>
                  <Text style={[typography.labelSmall, { color: colors.textSecondary }]}>MEDICAL</Text>
                  <Text style={[typography.h2, { color: colors.accent }]}>{user?.medicalLeaves ?? 12}</Text>
                </Card>
                <Card style={styles.statCard}>
                  <Text style={[typography.labelSmall, { color: colors.textSecondary }]}>CASUAL</Text>
                  <Text style={[typography.h2, { color: colors.accent }]}>{user?.casualLeaves ?? 12}</Text>
                </Card>
              </View>

              <Card style={styles.actionCard}>
                <Text style={[typography.h3, { color: colors.textPrimary, marginBottom: 12 }]}>Apply for Leave</Text>
                
                <View style={styles.typeSelector}>
                  {(['casual', 'medical', 'unpaid'] as const).map(type => (
                    <TouchableOpacity
                      key={type}
                      style={[
                        styles.typeButton,
                        { 
                          backgroundColor: leaveType === type ? colors.accent : colors.surfaceElevated,
                          borderColor: leaveType === type ? colors.accent : colors.border
                        }
                      ]}
                      onPress={() => setLeaveType(type)}
                    >
                      <MaterialCommunityIcons 
                        name={getLeaveIcon(type)} 
                        size={20} 
                        color={leaveType === type ? colors.textInverse : colors.textSecondary} 
                      />
                      <Text style={[
                        typography.labelSmall, 
                        { 
                          color: leaveType === type ? colors.textInverse : colors.textSecondary,
                          marginTop: 4,
                          textTransform: 'capitalize'
                        }
                      ]}>
                        {type}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <View style={{ marginBottom: 12 }}>
                  <TouchableOpacity onPress={() => setShowStartPicker(true)}>
                    <View pointerEvents="none">
                      <Input 
                        label="START DATE"
                        placeholder="Select Start Date" 
                        value={startDate} 
                        onChangeText={setStartDate} 
                      />
                    </View>
                  </TouchableOpacity>
                  {showStartPicker && (
                    <DateTimePicker
                      value={startDate ? new Date(startDate) : new Date()}
                      mode="date"
                      display="default"
                      onChange={onStartChange}
                    />
                  )}
                </View>
                <View style={{ marginBottom: 12 }}>
                  <TouchableOpacity onPress={() => setShowEndPicker(true)}>
                    <View pointerEvents="none">
                      <Input 
                        label="END DATE"
                        placeholder="Select End Date" 
                        value={endDate} 
                        onChangeText={setEndDate} 
                      />
                    </View>
                  </TouchableOpacity>
                  {showEndPicker && (
                    <DateTimePicker
                      value={endDate ? new Date(endDate) : new Date()}
                      mode="date"
                      display="default"
                      onChange={onEndChange}
                    />
                  )}
                </View>
                <View style={{ marginBottom: 16 }}>
                  <Input 
                    label="REASON"
                    placeholder="Describe your reason for leave" 
                    value={reason} 
                    onChangeText={setReason} 
                    multiline
                  />
                </View>
                
                <Button label="Submit Application" onPress={handleApply} isLoading={applying} />
              </Card>

              <Text style={[typography.h3, { color: colors.textPrimary, paddingHorizontal: 20, marginVertical: 16 }]}>
                Leave History
              </Text>
            </>
          }
          contentContainerStyle={{ paddingBottom: 40 }}
          refreshing={loading}
          onRefresh={fetchLeaves}
          renderItem={({ item }) => (
            <View style={[styles.recordItem, { borderBottomColor: colors.border, marginHorizontal: 20 }]}>
              <View style={[styles.iconContainer, { backgroundColor: colors.surfaceElevated }]}>
                <MaterialCommunityIcons 
                  name={getLeaveIcon(item.leaveType)} 
                  size={24} 
                  color={colors.accent} 
                />
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                  <Text style={[typography.body, { color: colors.textPrimary, textTransform: 'capitalize', fontWeight: '600' }]}>
                    {item.leaveType} Leave
                  </Text>
                </View>
                <Text style={[typography.bodySmall, { color: colors.textSecondary }]}>
                  {new Date(item.startDate).toLocaleDateString()} - {new Date(item.endDate).toLocaleDateString()}
                </Text>
                <Text style={[typography.bodySmall, { color: colors.textSecondary, marginTop: 4 }]}>
                  {item.reason}
                </Text>
              </View>
              <View style={{ alignItems: 'flex-end', justifyContent: 'center' }}>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
                  <Text style={[typography.labelSmall, { color: getStatusColor(item.status), textTransform: 'uppercase' }]}>
                    {item.status}
                  </Text>
                </View>
              </View>
            </View>
          )}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 10 },
  statsContainer: { flexDirection: 'row', paddingHorizontal: 20, marginBottom: 16 },
  statCard: { flex: 1, marginHorizontal: 4, alignItems: 'center', paddingVertical: 12 },
  actionCard: { marginHorizontal: 20, marginBottom: 16 },
  typeSelector: { flexDirection: 'row', marginBottom: 16, marginHorizontal: -4 },
  typeButton: {
    flex: 1,
    marginHorizontal: 4,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recordItem: { flexDirection: 'row', paddingVertical: 16, borderBottomWidth: 1, alignItems: 'center' },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  }
});

export default LeaveScreen;
