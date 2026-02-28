import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import Card from '../common/Card';

interface FocusCardProps {
  focusHours: number;
  streak: number;
}

const FocusCard = ({ focusHours, streak }: FocusCardProps) => {
  const { colors, typography, spacing } = useTheme();

  return (
    <Card style={styles.card}>
      <Text style={[typography.labelCaps, { color: colors.textSecondary, marginBottom: spacing.md }]}>
        FOCUS SESSIONS
      </Text>
      <View style={styles.content}>
        <View style={styles.metric}>
          <Text style={[typography.monoLarge, { color: colors.textPrimary }]}>{focusHours}</Text>
          <Text style={[typography.label, { color: colors.textSecondary }]}>hrs today</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.metric}>
          <Text style={[typography.monoLarge, { color: colors.textPrimary }]}>{streak}</Text>
          <Text style={[typography.label, { color: colors.textSecondary }]}>day streak</Text>
        </View>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    width: '100%',
    marginBottom: 16,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  metric: {
    alignItems: 'center',
  },
  divider: {
    width: 1,
    height: 40,
    backgroundColor: '#E8E8E8',
  },
});

export default FocusCard;
