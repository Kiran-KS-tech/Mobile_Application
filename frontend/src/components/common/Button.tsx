import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../../hooks/useTheme';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'ghost' | 'danger';
  isLoading?: boolean;
  disabled?: boolean;
  size?: 'lg' | 'md' | 'sm';
  style?: ViewStyle;
}

const Button = ({
  label,
  onPress,
  variant = 'primary',
  isLoading,
  disabled,
  size = 'lg',
  style,
}: ButtonProps) => {
  const { colors, radius, typography } = useTheme();

  const getVariantStyles = () => {
    switch (variant) {
      case 'ghost':
        return {
          container: {
            backgroundColor: 'transparent',
            borderWidth: 1.5,
            borderColor: colors.accent,
          },
          text: { color: colors.textPrimary },
        };
      case 'danger':
        return {
          container: {
            backgroundColor: colors.errorBg,
            borderWidth: 1,
            borderColor: colors.errorBorder,
          },
          text: { color: colors.error },
        };
      default:
        return {
          container: { backgroundColor: colors.accent },
          text: { color: colors.textInverse },
        };
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm': return { height: 40, paddingHorizontal: 16 };
      case 'md': return { height: 48, paddingHorizontal: 24 };
      default:   return { height: 56, paddingHorizontal: 24 };
    }
  };

  const vStyles = getVariantStyles();
  const sStyles = getSizeStyles();

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      disabled={disabled || isLoading}
      style={[
        styles.base,
        vStyles.container,
        sStyles,
        { borderRadius: radius.md },
        disabled && styles.disabled,
        style,
      ]}
    >
      {isLoading ? (
        <ActivityIndicator color={vStyles.text.color} />
      ) : (
        <Text style={[typography.button, vStyles.text]}>{label}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabled: {
    opacity: 0.5,
  },
});

export default Button;
