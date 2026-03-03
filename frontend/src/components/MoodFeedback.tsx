import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';

interface MoodFeedbackProps {
  visible: boolean;
  onClose: () => void;
  feedback: string;
}

const MoodFeedback: React.FC<MoodFeedbackProps> = ({ visible, onClose, feedback }) => {
  const { colors, typography, radius, spacing } = useTheme();

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={[styles.content, { backgroundColor: colors.background, borderRadius: radius.lg, padding: spacing.xl }]}>
          <View style={[styles.iconContainer, { backgroundColor: colors.accent + '20' }]}>
            <MaterialCommunityIcons name="star" size={32} color={colors.accent} />
          </View>
          
          <Text style={[typography.h3, { color: colors.textPrimary, textAlign: 'center', marginBottom: spacing.md }]}>
            AI Wellness Tip
          </Text>
          
          <Text style={[typography.body, { color: colors.textSecondary, textAlign: 'center', lineHeight: 24, marginBottom: spacing.xl }]}>
            {feedback || "Thinking of something supportive for you..."}
          </Text>
          
          <TouchableOpacity 
            style={[styles.button, { backgroundColor: colors.accent, borderRadius: radius.full }]}
            onPress={onClose}
          >
            <Text style={[typography.body, { color: colors.textInverse, fontWeight: '600' }]}>Got it, thanks!</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  content: {
    width: '100%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  button: {
    width: '100%',
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default MoodFeedback;
