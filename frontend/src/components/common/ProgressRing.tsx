import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { useTheme } from '../../hooks/useTheme';

interface ProgressRingProps {
  size: number;
  strokeWidth: number;
  progress: number; // 0–1
  color?: string;
  label?: string;
  sublabel?: string;
}

const ProgressRing = ({
  size,
  strokeWidth,
  progress,
  color,
  label,
  sublabel,
}: ProgressRingProps) => {
  const { colors, typography } = useTheme();
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - progress * circumference;

  return (
    <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
      <Svg width={size} height={size}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={colors.timerTrack}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color || colors.timerRing}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      <View style={styles.content}>
        {label && <Text style={[typography.monoLarge, { color: colors.timerText }]}>{label}</Text>}
        {sublabel && <Text style={[typography.labelCaps, { color: colors.textSecondary }]}>{sublabel}</Text>}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  content: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ProgressRing;
