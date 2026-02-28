import { useColorScheme } from 'react-native';
import { Colors, Typography, Spacing, Radius, Shadow } from '../theme';
export const useTheme = () => {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  return { colors: isDark ? Colors.dark : Colors.light, typography: Typography, spacing: Spacing, radius: Radius, shadow: Shadow, isDark };
};
