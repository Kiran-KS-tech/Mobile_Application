import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Svg, { Rect, G, Text as SvgText } from 'react-native-svg';
import { useTheme } from '../../hooks/useTheme';
import { WeeklyMoodPoint } from '../../types';

interface WeeklyMoodChartProps {
  data: WeeklyMoodPoint[];
}

const WeeklyMoodChart = ({ data }: WeeklyMoodChartProps) => {
  const { colors, typography, spacing } = useTheme();
  const screenWidth = Dimensions.get('window').width - 64; // Horizontal padding
  const chartHeight = 200;
  const barWidth = 32;
  const gap = (screenWidth - data.length * barWidth) / (data.length - 1);

  const maxMood = 5;
  const barScale = chartHeight / maxMood;

  return (
    <View style={styles.container}>
      <Text style={[typography.labelCaps, { color: colors.textSecondary, marginBottom: spacing.lg }]}>
        WEEKLY MOOD TREND
      </Text>
      <View style={{ height: chartHeight + 40 }}>
        <Svg width={screenWidth} height={chartHeight + 40}>
          <G y={chartHeight}>
            {data.map((point, index) => {
              const barHeight = point.moodScore * barScale;
              const x = index * (barWidth + gap);
              const isToday = index === data.length - 1;

              return (
                <G key={point.date}>
                  <Rect
                    x={x}
                    y={-barHeight}
                    width={barWidth}
                    height={barHeight}
                    fill={colors.accent}
                    opacity={isToday ? 1 : 0.4}
                    rx={4}
                  />
                  <SvgText
                    x={x + barWidth / 2}
                    y={24}
                    fontSize="10"
                    fill={colors.textTertiary}
                    textAnchor="middle"
                    fontWeight="700"
                  >
                    {point.day.toUpperCase()}
                  </SvgText>
                </G>
              );
            })}
          </G>
        </Svg>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 24,
    width: '100%',
  },
});

export default WeeklyMoodChart;
