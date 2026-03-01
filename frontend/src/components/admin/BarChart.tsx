import React from 'react';
import { View } from 'react-native';
import Svg, { Rect, Text as SvgText } from 'react-native-svg';
import { useTheme } from '../../hooks/useTheme';

interface BarChartProps {
  data: { label: string; value: number }[];
  height?: number;
  barColor?: string;
}

const BarChart = ({ data, height = 160, barColor }: BarChartProps) => {
  const { colors } = useTheme();
  const color = barColor || colors.accent;

  if (!data.length) return null;

  const maxValue = Math.max(...data.map(d => d.value), 1);
  const barCount = data.length;
  const chartWidth = 300;
  const barGap = 8;
  const barWidth = (chartWidth - barGap * (barCount + 1)) / barCount;
  const chartPadding = 4;

  return (
    <View style={{ alignItems: 'center' }}>
      <Svg width={chartWidth + chartPadding * 2} height={height + 40}>
        {data.map((item, i) => {
          const barH = maxValue > 0 ? (item.value / maxValue) * height : 0;
          const x = chartPadding + barGap + i * (barWidth + barGap);
          const y = height - barH;
          return (
            <React.Fragment key={i}>
              {/* Bar background */}
              <Rect
                x={x}
                y={0}
                width={barWidth}
                height={height}
                rx={6}
                fill={colors.surfaceElevated}
              />
              {/* Bar value */}
              <Rect
                x={x}
                y={y}
                width={barWidth}
                height={barH}
                rx={6}
                fill={color}
                opacity={0.85}
              />
              {/* Value label */}
              {item.value > 0 && (
                <SvgText
                  x={x + barWidth / 2}
                  y={y - 6}
                  fontSize={10}
                  fontWeight="600"
                  fill={colors.textSecondary}
                  textAnchor="middle"
                >
                  {item.value}
                </SvgText>
              )}
              {/* Day label */}
              <SvgText
                x={x + barWidth / 2}
                y={height + 18}
                fontSize={10}
                fontWeight="600"
                fill={colors.textTertiary}
                textAnchor="middle"
              >
                {item.label}
              </SvgText>
            </React.Fragment>
          );
        })}
      </Svg>
    </View>
  );
};

export default BarChart;
