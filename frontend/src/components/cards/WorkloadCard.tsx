import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import Card from '../common/Card';

interface WorkloadCardProps {
  workloadScore: number; // 0–100
}

const WorkloadCard = ({ workloadScore }: WorkloadCardProps) => {
  const { colors, typography, spacing } = useTheme();

  return (
    <Card style={styles.card}>
      <Text style={[typography.labelCaps, { color: colors.textSecondary, marginBottom: spacing.md }]}>
        WORKLOAD
      </Text>
      <View style={styles.content}>
        <Text style={[typography.monoLarge, { color: colors.textPrimary }]}>
          {workloadScore}
        </Text>
        <View style={[styles.track, { backgroundColor: colors.surfaceElevated, marginTop: spacing.md }]}>
          <View style={[styles.bar, { backgroundColor: colors.accent, width: `${workloadScore}%` }]} />
        </View>
        <Text style={[typography.label, { color: colors.textSecondary, marginTop: spacing.sm }]}>
          Current capacity
        </Text>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    marginBottom: 16,
  },
  content: {
    alignItems: 'flex-start',
  },
  track: {
    width: '100%',
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  bar: {
    height: '100%',
  },
});

export default WorkloadCard;
