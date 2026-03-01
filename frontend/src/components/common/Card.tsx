import React from 'react';
import { TouchableOpacity, View, ViewStyle, StyleProp } from 'react-native';
import { useTheme } from '../../hooks/useTheme';

interface CardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  noPadding?: boolean;
}

const Card = ({ children, style, onPress, noPadding }: CardProps) => {
  const { colors, radius, shadow } = useTheme();

  const Container = onPress ? TouchableOpacity : View;

  return (
    <Container
      activeOpacity={0.8}
      onPress={onPress}
      style={[
        {
          backgroundColor: colors.cardBg,
          borderRadius: radius.md,
          borderWidth: 1,
          borderColor: colors.cardBorder,
          padding: noPadding ? 0 : 20,
          ...shadow.sm,
        },
        style,
      ]}
    >
      {children}
    </Container>
  );
};

export default Card;
