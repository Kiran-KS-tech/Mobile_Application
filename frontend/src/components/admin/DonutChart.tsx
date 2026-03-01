import React from 'react';
import { View, Text } from 'react-native';
import Svg, { Circle, Text as SvgText } from 'react-native-svg';
import { useTheme } from '../../hooks/useTheme';

interface DonutSegment {
  label: string;
  value: number;
  color: string;
}

interface DonutChartProps {
  data: DonutSegment[];
  size?: number;
  strokeWidth?: number;
}

const DonutChart = ({ data, size = 140, strokeWidth = 22 }: DonutChartProps) => {
  const { colors } = useTheme();

  const total = data.reduce((sum, s) => sum + s.value, 0);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const cx = size / 2;
  const cy = size / 2;

  let cumulativeOffset = 0;

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <Svg width={size} height={size}>
        {/* Background ring */}
        <Circle
          cx={cx}
          cy={cy}
          r={radius}
          stroke={colors.surfaceElevated}
          strokeWidth={strokeWidth}
          fill="none"
        />
        {total > 0 && data.map((segment, i) => {
          const segmentLength = (segment.value / total) * circumference;
          const dashOffset = -cumulativeOffset;
          cumulativeOffset += segmentLength;
          return (
            <Circle
              key={i}
              cx={cx}
              cy={cy}
              r={radius}
              stroke={segment.color}
              strokeWidth={strokeWidth}
              fill="none"
              strokeDasharray={`${segmentLength} ${circumference - segmentLength}`}
              strokeDashoffset={dashOffset}
              strokeLinecap="round"
              rotation={-90}
              origin={`${cx}, ${cy}`}
            />
          );
        })}
        {/* Center label */}
        <SvgText
          x={cx}
          y={cy - 6}
          fontSize={22}
          fontWeight="700"
          fill={colors.textPrimary}
          textAnchor="middle"
        >
          {total}
        </SvgText>
        <SvgText
          x={cx}
          y={cy + 12}
          fontSize={10}
          fontWeight="600"
          fill={colors.textTertiary}
          textAnchor="middle"
        >
          TOTAL
        </SvgText>
      </Svg>

      {/* Legend */}
      <View style={{ marginLeft: 20, flex: 1 }}>
        {data.map((segment, i) => (
          <View key={i} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
            <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: segment.color, marginRight: 8 }} />
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 12, fontWeight: '600', color: colors.textSecondary }}>
                {segment.label}
              </Text>
            </View>
            <Text style={{ fontSize: 14, fontWeight: '700', color: colors.textPrimary }}>
              {segment.value}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
};

export default DonutChart;
