import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../hooks/useTheme';

interface BadgeProps {
  label: string;
  type?: 'high' | 'medium' | 'low' | 'meeting' | 'task' | 'focus' | 'break';
}

const Badge = ({ label, type = 'medium' }: BadgeProps) => {
  const { colors, typography, radius } = useTheme();

  const getBadgeStyles = () => {
    switch (type) {
      case 'high': return { bg: colors.priorityHighBg, text: colors.priorityHigh };
      case 'medium': return { bg: colors.priorityMedBg, text: colors.priorityMed };
      case 'low': return { bg: colors.priorityLowBg, text: colors.priorityLow };
      case 'meeting': return { bg: colors.eventMeetingBg, text: colors.eventMeeting };
      case 'task': return { bg: colors.eventTaskBg, text: colors.eventTask };
      case 'focus': return { bg: colors.eventFocusBg, text: colors.eventFocus };
      case 'break': return { bg: colors.eventBreakBg, text: colors.eventBreak };
      default: return { bg: colors.priorityMedBg, text: colors.priorityMed };
    }
  };

  const bStyles = getBadgeStyles();

  return (
    <View style={[styles.badge, { backgroundColor: bStyles.bg, borderRadius: radius.full }]}>
      <Text style={[typography.labelCaps, { color: bStyles.text, fontSize: 10 }]}>
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignSelf: 'flex-start',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default Badge;
