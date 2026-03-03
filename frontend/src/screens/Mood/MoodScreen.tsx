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
import MoodFeedback from '../../components/MoodFeedback';
import { moodApi } from '../../services/api/mood.api';

const MoodScreen = () => {
  const { colors, typography, spacing, radius } = useTheme();
  const dispatch = useAppDispatch();
  const { weeklyData, isSubmitting } = useAppSelector(state => state.mood);

  const [selectedMood, setSelectedMood] = useState<MoodType | null>(null);
  const [stressLevel, setStressLevel] = useState(5);
  const [energyLevel, setEnergyLevel] = useState(5);
  const [note, setNote] = useState('');
  const [feedbackVisible, setFeedbackVisible] = useState(false);
  const [aiFeedback, setAiFeedback] = useState('');

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

  const handleSubmit = async () => {
    if (selectedMood) {
      const moodScoreMap: Record<MoodType, number> = {
        great: 5, good: 4, okay: 3, low: 2, awful: 1
      };
      
      try {
        // Prepare data for backend (which expects 'score' vs 'moodScore')
        const apiData = {
          score: moodScoreMap[selectedMood] * 20, // Scale 1-5 to 1-100 for backend
          note,
          meetingDensity: stressLevel,
          energyLevel,
        };

        await dispatch(submitMoodLogThunk(apiData)).unwrap();
        
        // Fetch AI feedback after successful log
        const feedbackData = {
          mood: selectedMood,
          score: moodScoreMap[selectedMood], // 1-5 for AI context
          stressLevel,
          energyLevel,
          note
        };
        const { feedback } = await moodApi.getMoodFeedback(feedbackData);
        setAiFeedback(feedback);
        setFeedbackVisible(true);
        
        // Reset local state
        setSelectedMood(null);
        setNote('');
        // Refresh weekly data
        dispatch(fetchWeeklyMood());
      } catch (err) {
        console.error('Failed to log mood or get feedback:', err);
      }
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
            
            <MoodFeedback 
              visible={feedbackVisible} 
              feedback={aiFeedback} 
              onClose={() => setFeedbackVisible(false)} 
            />
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
