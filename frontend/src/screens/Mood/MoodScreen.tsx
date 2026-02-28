import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Slider from '@react-native-community/slider';
import { useTheme } from '../../hooks/useTheme';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { useAppSelector } from '../../hooks/useAppSelector';
import { fetchMoodLogs, fetchWeeklyMood, submitMoodLogThunk } from '../../store/slices/moodSlice';
import { MoodType } from '../../types';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import WeeklyMoodChart from '../../components/charts/WeeklyMoodChart';

const MoodScreen = () => {
  const { colors, typography, spacing, radius } = useTheme();
  const dispatch = useAppDispatch();
  const { weeklyData, isSubmitting } = useAppSelector(state => state.mood);

  const [selectedMood, setSelectedMood] = useState<MoodType | null>(null);
  const [stressLevel, setStressLevel] = useState(5);
  const [energyLevel, setEnergyLevel] = useState(5);
  const [note, setNote] = useState('');

  useEffect(() => {
    dispatch(fetchMoodLogs());
    dispatch(fetchWeeklyMood());
  }, [dispatch]);

  const moods: { type: MoodType; emoji: string }[] = [
    { type: 'awful', emoji: '😔' },
    { type: 'low', emoji: '😕' },
    { type: 'okay', emoji: '😐' },
    { type: 'good', emoji: '😊' },
    { type: 'great', emoji: '😄' },
  ];

  const handleSubmit = () => {
    if (selectedMood) {
      const moodScoreMap: Record<MoodType, number> = {
        great: 5, good: 4, okay: 3, low: 2, awful: 1
      };
      
      dispatch(submitMoodLogThunk({
        mood: selectedMood,
        moodScore: moodScoreMap[selectedMood] as any,
        stressLevel,
        energyLevel,
        note,
      }));
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'left', 'right']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <Text style={[typography.h1, { color: colors.textPrimary, marginBottom: spacing.xl }]}>
              Mood Check-in
            </Text>

            {/* Mood Selector */}
            <Text style={[typography.labelCaps, { color: colors.textSecondary, marginBottom: spacing.md }]}>
              HOW ARE YOU FEELING?
            </Text>
            <View style={styles.moodRow}>
              {moods.map((m) => (
                <TouchableOpacity
                  key={m.type}
                  onPress={() => setSelectedMood(m.type)}
                  style={[
                    styles.moodCircle,
                    { backgroundColor: selectedMood === m.type ? colors.accent : colors.surfaceElevated, borderRadius: radius.full }
                  ]}
                >
                  <Text style={[styles.emoji, selectedMood === m.type && { color: colors.textInverse }]}>
                    {m.emoji}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Stress Slider */}
            <View style={styles.sliderSection}>
              <View style={styles.sliderHeader}>
                <Text style={[typography.labelCaps, { color: colors.textSecondary }]}>STRESS LEVEL</Text>
                <Text style={[typography.mono, { color: colors.textPrimary }]}>{stressLevel}</Text>
              </View>
              <Slider
                style={styles.slider}
                minimumValue={0}
                maximumValue={10}
                step={1}
                value={stressLevel}
                onValueChange={setStressLevel}
                minimumTrackTintColor={colors.accent}
                maximumTrackTintColor={colors.timerTrack}
                thumbTintColor={colors.background}
              />
            </View>

            {/* Energy Slider */}
            <View style={styles.sliderSection}>
              <View style={styles.sliderHeader}>
                <Text style={[typography.labelCaps, { color: colors.textSecondary }]}>ENERGY LEVEL</Text>
                <Text style={[typography.mono, { color: colors.textPrimary }]}>{energyLevel}</Text>
              </View>
              <Slider
                style={styles.slider}
                minimumValue={0}
                maximumValue={10}
                step={1}
                value={energyLevel}
                onValueChange={setEnergyLevel}
                minimumTrackTintColor={colors.accent}
                maximumTrackTintColor={colors.timerTrack}
                thumbTintColor={colors.background}
              />
            </View>

            <Input
              label="NOTE (OPTIONAL)"
              value={note}
              onChangeText={setNote}
              placeholder="How are you feeling?..."
              multiline
            />

            <Button
              label="Log Today's Mood"
              onPress={handleSubmit}
              disabled={!selectedMood}
              isLoading={isSubmitting}
              style={{ marginTop: spacing.lg }}
            />

            <WeeklyMoodChart data={weeklyData} />
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
  },
  moodRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  moodCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emoji: {
    fontSize: 24,
  },
  sliderSection: {
    marginBottom: 24,
  },
  sliderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  slider: {
    width: '100%',
    height: 40,
  },
});

export default MoodScreen;
