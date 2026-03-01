import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Alert, TouchableOpacity, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../hooks/useTheme';
import { holidayApi, HolidayRecord } from '../../services/api/holiday.api';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';

const AdminHolidaysScreen = () => {
  const { colors, typography } = useTheme();
  const [holidays, setHolidays] = useState<HolidayRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [date, setDate] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const fetchHolidays = async () => {
    try {
      setLoading(true);
      const data = await holidayApi.getHolidays();
      setHolidays(data);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHolidays();
  }, []);

  const onDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setDate(selectedDate.toISOString().split('T')[0]);
    }
  };

  const formatDisplayDate = (dateStr: string) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString(undefined, {
      weekday: 'short',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const handleAddHoliday = async () => {
    if (!name || !date) {
      Alert.alert('Error', 'Please provide holiday name and select a date');
      return;
    }
    try {
      setSubmitting(true);
      await holidayApi.createHoliday(name, date);
      Alert.alert('Success', 'Holiday created!');
      setName('');
      setDate('');
      fetchHolidays();
    } catch (err: any) {
      Alert.alert('Error', err?.response?.data?.message || 'Failed to create');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    Alert.alert('Delete Holiday', 'Are you sure you want to delete this holiday?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await holidayApi.deleteHoliday(id);
            fetchHolidays();
          } catch (err) {
            console.log(err);
          }
        },
      },
    ]);
  };

  const getMonthIcon = (dateStr: string) => {
    const month = new Date(dateStr).getMonth();
    const icons: string[] = [
      'snowflake', 'heart', 'flower', 'leaf',
      'flower-tulip', 'white-balance-sunny', 'palm-tree', 'umbrella-beach',
      'leaf-maple', 'ghost', 'turkey', 'pine-tree',
    ];
    return icons[month] || 'calendar';
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Text style={[typography.h1, { color: colors.textPrimary }]}>Manage Holidays</Text>
        <Text style={[typography.bodySmall, { color: colors.textSecondary, marginTop: 4 }]}>
          {holidays.length} holidays scheduled
        </Text>
      </View>

      <Card style={styles.actionCard}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
          <View style={[styles.formIcon, { backgroundColor: '#FF6B6B' + '20' }]}>
            <MaterialCommunityIcons name="calendar-plus" size={22} color="#FF6B6B" />
          </View>
          <Text style={[typography.h4, { color: colors.textPrimary, marginLeft: 12 }]}>Add Holiday</Text>
        </View>

        <Input label="HOLIDAY NAME" placeholder="e.g. Christmas Day" value={name} onChangeText={setName} />

        {/* Date Picker */}
        <View style={{ marginBottom: 16 }}>
          <Text style={[typography.labelCaps, { color: colors.textSecondary, marginBottom: 6 }]}>DATE</Text>
          <TouchableOpacity
            onPress={() => setShowDatePicker(true)}
            activeOpacity={0.7}
            style={[
              styles.datePickerButton,
              {
                backgroundColor: colors.inputBg,
                borderColor: showDatePicker ? colors.inputFocusBorder : colors.inputBorder,
                borderWidth: showDatePicker ? 1.5 : 1,
              },
            ]}
          >
            <MaterialCommunityIcons
              name="calendar-month"
              size={20}
              color={date ? colors.accent : colors.inputPlaceholder}
            />
            <Text
              style={[
                typography.body,
                {
                  color: date ? colors.textPrimary : colors.inputPlaceholder,
                  marginLeft: 12,
                  flex: 1,
                },
              ]}
            >
              {date ? formatDisplayDate(date) : 'Select a date'}
            </Text>
            {date ? (
              <TouchableOpacity onPress={() => setDate('')} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <MaterialCommunityIcons name="close-circle" size={18} color={colors.textTertiary} />
              </TouchableOpacity>
            ) : (
              <MaterialCommunityIcons name="chevron-down" size={18} color={colors.textTertiary} />
            )}
          </TouchableOpacity>

          {showDatePicker && (
            <DateTimePicker
              value={date ? new Date(date) : new Date()}
              mode="date"
              display="default"
              onChange={onDateChange}
              minimumDate={new Date()}
            />
          )}
        </View>

        <Button label="Create Holiday" onPress={handleAddHoliday} isLoading={submitting} />
      </Card>

      <Text style={[typography.h3, { color: colors.textPrimary, paddingHorizontal: 20, marginVertical: 12 }]}>
        Upcoming Holidays
      </Text>

      <FlatList
        data={holidays}
        keyExtractor={item => item._id}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
        refreshing={loading}
        onRefresh={fetchHolidays}
        ListEmptyComponent={
          <View style={{ marginTop: 40, alignItems: 'center' }}>
            <MaterialCommunityIcons name="calendar-blank-outline" size={48} color={colors.textTertiary} />
            <Text style={[typography.body, { color: colors.textSecondary, marginTop: 12 }]}>
              No holidays scheduled yet
            </Text>
          </View>
        }
        renderItem={({ item }) => {
          const holidayDate = new Date(item.date);
          const isPast = holidayDate < new Date(new Date().toISOString().split('T')[0]);
          return (
            <Card style={[styles.holidayCard, isPast && { opacity: 0.5 }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                <View style={[styles.holidayIcon, { backgroundColor: isPast ? colors.surfaceElevated : '#4ECDC4' + '15' }]}>
                  <MaterialCommunityIcons
                    name={getMonthIcon(item.date) as any}
                    size={22}
                    color={isPast ? colors.textTertiary : '#4ECDC4'}
                  />
                </View>
                <View style={{ flex: 1, marginLeft: 14 }}>
                  <Text style={[typography.h4, { color: colors.textPrimary }]}>{item.name}</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                    <MaterialCommunityIcons name="calendar" size={13} color={colors.textTertiary} />
                    <Text style={[typography.bodySmall, { color: colors.textSecondary, marginLeft: 4 }]}>
                      {holidayDate.toLocaleDateString(undefined, {
                        weekday: 'short',
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </Text>
                  </View>
                  {isPast && (
                    <Text style={[typography.labelSmall, { color: colors.textTertiary, marginTop: 4 }]}>PAST</Text>
                  )}
                </View>
              </View>
              <TouchableOpacity
                onPress={() => handleDelete(item._id)}
                style={[styles.deleteButton, { backgroundColor: colors.errorBg }]}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <MaterialCommunityIcons name="trash-can-outline" size={18} color={colors.error} />
              </TouchableOpacity>
            </Card>
          );
        }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 20 },
  actionCard: { marginHorizontal: 20, marginBottom: 16 },
  formIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  datePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  holidayCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  holidayIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
});

export default AdminHolidaysScreen;
