import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface EmptyStateProps {
  message: string;
  icon?: keyof typeof MaterialCommunityIcons.glyphMap;
}

const EmptyState = ({ message, icon = 'alert-circle-outline' }: EmptyStateProps) => {
  const { colors, typography, spacing } = useTheme();

  return (
    <View style={styles.container}>
      <MaterialCommunityIcons name={icon} size={48} color={colors.textTertiary} />
      <Text style={[typography.body, { color: colors.textSecondary, marginTop: spacing.md, textAlign: 'center' }]}>
        {message}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 40,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
});

export default EmptyState;
