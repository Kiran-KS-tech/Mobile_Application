import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../hooks/useTheme';
import { holidayApi, HolidayRecord } from '../../services/api/holiday.api';
import Card from '../../components/common/Card';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const HolidaysScreen = () => {
  const { colors, typography } = useTheme();
  const [holidays, setHolidays] = useState<HolidayRecord[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchHolidays = async () => {
    try {
      setLoading(true);
      const data = await holidayApi.getHolidays();
      setHolidays(data);
    } catch (err) {
      console.log('Error fetching holidays', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHolidays();
  }, []);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Text style={[typography.h1, { color: colors.textPrimary }]}>Company Holidays</Text>
        <Text style={[typography.body, { color: colors.textSecondary, marginTop: 4 }]}>
          Official holidays for the current year
        </Text>
      </View>

      {loading && holidays.length === 0 ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
           <ActivityIndicator size="large" color={colors.accent} />
        </View>
      ) : (
        <FlatList
          data={holidays}
          keyExtractor={item => item._id}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
          refreshing={loading}
          onRefresh={fetchHolidays}
          renderItem={({ item }) => {
            const d = new Date(item.date);
            return (
              <Card style={styles.holidayCard}>
                <View style={styles.dateBox}>
                   <Text style={[typography.h2, { color: colors.accent }]}>{d.getDate()}</Text>
                   <Text style={[typography.labelCaps, { color: colors.textSecondary }]}>
                     {d.toLocaleString('default', { month: 'short' }).toUpperCase()}
                   </Text>
                </View>
                <View style={styles.infoBox}>
                  <Text style={[typography.body, { color: colors.textPrimary, fontSize: 18, fontWeight: '600' }]}>
                    {item.name}
                  </Text>
                  <Text style={[typography.bodySmall, { color: colors.textSecondary, marginTop: 4 }]}>
                    {d.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  </Text>
                </View>
                <MaterialCommunityIcons name="party-popper" size={24} color={colors.warning} style={{ opacity: 0.6 }} />
              </Card>
            );
          }}
          ListEmptyComponent={
            <Text style={[typography.body, { color: colors.textSecondary, textAlign: 'center', marginTop: 40 }]}>
              No upcoming holidays.
            </Text>
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 20, marginBottom: 8 },
  holidayCard: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: 12,
    padding: 16
  },
  dateBox: {
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    width: 50,
  },
  infoBox: {
    flex: 1,
  }
});

export default HolidaysScreen;
