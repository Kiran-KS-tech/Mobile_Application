import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { HolidayRecord } from '../../services/api/holiday.api';
import Card from '../common/Card';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface HolidayCardProps {
  holiday: HolidayRecord;
}

const HolidayCard = ({ holiday }: HolidayCardProps) => {
  const { colors, typography } = useTheme();
  const d = new Date(holiday.date);

  return (
    <Card style={styles.card}>
      <View style={styles.container}>
        <View style={styles.dateBox}>
          <Text style={[typography.h2, { color: colors.accent }]}>{d.getDate()}</Text>
          <Text style={[typography.labelCaps, { color: colors.textSecondary }]}>
            {d.toLocaleString('default', { month: 'short' }).toUpperCase()}
          </Text>
        </View>
        <View style={styles.infoBox}>
          <Text style={[typography.body, { color: colors.textPrimary, fontSize: 18, fontWeight: '600' }]} numberOfLines={1}>
            {holiday.name}
          </Text>
          <Text style={[typography.bodySmall, { color: colors.textSecondary, marginTop: 4 }]} numberOfLines={1}>
            {d.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </Text>
        </View>
        <MaterialCommunityIcons name="party-popper" size={24} color={colors.warning} style={{ opacity: 0.6 }} />
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 12,
    padding: 16,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateBox: {
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    width: 50,
  },
  infoBox: {
    flex: 1,
  },
});

export default HolidayCard;
