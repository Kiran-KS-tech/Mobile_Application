import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../hooks/useTheme';

const Divider = () => {
  const { colors } = useTheme();
  return <View style={[styles.divider, { backgroundColor: colors.divider }]} />;
};

const styles = StyleSheet.create({
  divider: {
    height: 1,
    width: '100%',
    marginVertical: 16,
  },
});

export default Divider;
