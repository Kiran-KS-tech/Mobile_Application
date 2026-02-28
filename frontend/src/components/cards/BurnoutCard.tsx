import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import Card from '../common/Card';
import ProgressRing from '../common/ProgressRing';

interface BurnoutCardProps {
  riskScore: number; // 0–100
}

const BurnoutCard = ({ riskScore }: BurnoutCardProps) => {
  const { colors, typography, spacing } = useTheme();

  const getRiskLabel = (score: number) => {
    if (score <= 30) return 'Low';
    if (score <= 60) return 'Moderate';
    if (score <= 80) return 'High';
    return 'Critical';
  };

  const riskLabel = getRiskLabel(riskScore);

  return (
    <Card style={styles.card}>
      <Text style={[typography.labelCaps, { color: colors.textSecondary, marginBottom: spacing.md }]}>
        BURNOUT RISK
      </Text>
      <View style={styles.content}>
        <ProgressRing
          size={120}
          strokeWidth={8}
          progress={riskScore / 100}
          label={`${riskScore}%`}
        />
        <Text style={[typography.h2, { color: colors.textPrimary, marginTop: spacing.md }]}>
          {riskLabel}
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
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default BurnoutCard;
