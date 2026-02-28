import React, { useState } from 'react';
import { View, Text, TextInput as RNTextInput, StyleSheet, KeyboardTypeOptions } from 'react-native';
import { useTheme } from '../../hooks/useTheme';

interface InputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  error?: string | null;
  hint?: string;
  keyboardType?: KeyboardTypeOptions;
  multiline?: boolean;
}

const Input = ({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  error,
  hint,
  keyboardType,
  multiline,
}: InputProps) => {
  const { colors, typography, radius, spacing } = useTheme();
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={styles.container}>
      <Text style={[typography.labelCaps, { color: colors.textSecondary, marginBottom: spacing.xs }]}>
        {label}
      </Text>
      <View
        style={[
          styles.inputWrapper,
          {
            backgroundColor: colors.inputBg,
            borderColor: error ? colors.error : (isFocused ? colors.inputFocusBorder : colors.inputBorder),
            borderWidth: isFocused || error ? 1.5 : 1,
            borderRadius: radius.sm,
          },
          multiline && { height: 120, alignItems: 'flex-start', paddingVertical: 12 },
        ]}
      >
        <RNTextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.inputPlaceholder}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          multiline={multiline}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          style={[
            typography.body,
            { color: colors.textPrimary, flex: 1, paddingHorizontal: 16 },
          ]}
        />
      </View>
      {error && (
        <Text style={[typography.bodySmall, { color: colors.error, marginTop: spacing.xxs }]}>
          {error}
        </Text>
      )}
      {hint && !error && (
        <Text style={[typography.bodySmall, { color: colors.textTertiary, marginTop: spacing.xxs }]}>
          {hint}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: 16,
  },
  inputWrapper: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
  },
});

export default Input;
