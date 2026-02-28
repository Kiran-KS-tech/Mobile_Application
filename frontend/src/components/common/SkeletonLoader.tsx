import React, { useEffect } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { useTheme } from '../../hooks/useTheme';

interface SkeletonLoaderProps {
  width: number | string;
  height: number;
  borderRadius?: number;
}

const SkeletonLoader = ({ width, height, borderRadius }: SkeletonLoaderProps) => {
  const { colors, radius } = useTheme();
  const animatedValue = new Animated.Value(0);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <Animated.View
      style={[
        {
          width: width as any,
          height,
          backgroundColor: colors.surfaceElevated,
          borderRadius: borderRadius ?? radius.sm,
          opacity,
        },
      ]}
    />
  );
};

export default SkeletonLoader;
