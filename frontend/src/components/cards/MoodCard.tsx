import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import Card from '../common/Card';
import Button from '../common/Button';
import { MoodLog } from '../../types';

interface MoodCardProps {
  todayLog: MoodLog | null;
  onLogPress: () => void;
}

const MoodCard = ({ todayLog, onLogPress }: MoodCardProps) => {
  const { colors, typography, spacing } = useTheme();

  const moodEmojis: Record<string, string> = {
    great: '😄',
    good: '😊',
    okay: '😐',
    low: '😕',
    awful: '😔',
  };

  if (!todayLog) {
    return (
      <Card style={styles.card}>
        <Text style={[typography.h3, { color: colors.textPrimary, marginBottom: spacing.sm }]}>
          How are you feeling?
        </Text>
        <Text style={[typography.body, { color: colors.textSecondary, marginBottom: spacing.md }]}>
          You haven't logged your mood today.
        </Text>
        <Button label="Log mood" onPress={onLogPress} size="sm" />
      </Card>
    );
  }

  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <Text style={[typography.labelCaps, { color: colors.textSecondary }]}>TODAY'S MOOD</Text>
        <Text style={styles.emoji}>{moodEmojis[todayLog.mood]}</Text>
      </View>
      <View style={styles.metrics}>
        <View style={styles.metricRow}>
          <Text style={[typography.label, { color: colors.textSecondary }]}>STRESS</Text>
          <View style={[styles.track, { backgroundColor: colors.surfaceElevated }]}>
            <View style={[styles.bar, { backgroundColor: colors.accent, width: `${todayLog.stressLevel * 10}%` }]} />
          </View>
        </View>
        <View style={styles.metricRow}>
          <Text style={[typography.label, { color: colors.textSecondary }]}>ENERGY</Text>
          <View style={[styles.track, { backgroundColor: colors.surfaceElevated }]}>
            <View style={[styles.bar, { backgroundColor: colors.accent, width: `${todayLog.energyLevel * 10}%` }]} />
          </View>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  emoji: {
    fontSize: 32,
  },
  metrics: {
    gap: 12,
  },
  metricRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  track: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  bar: {
    height: '100%',
  },
});

export default MoodCard;
