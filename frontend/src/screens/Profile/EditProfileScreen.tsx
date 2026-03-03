import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../hooks/useTheme';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { useAppSelector } from '../../hooks/useAppSelector';
import { updateProfileThunk } from '../../store/slices/authSlice';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';

const EditProfileScreen = () => {
  const { colors, typography } = useTheme();
  const navigation = useNavigation<any>();
  const dispatch = useAppDispatch();
  const { user, isLoading } = useAppSelector(state => state.auth);

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [password, setPassword] = useState('');

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Name is required.');
      return;
    }

    const updates: any = { name };
    if (password) {
      updates.password = password;
    }

    try {
      await dispatch(updateProfileThunk(updates)).unwrap();
      Alert.alert('Success', 'Profile updated successfully!');
      navigation.goBack();
    } catch (error: any) {
      Alert.alert('Update Failed', error || 'Failed to update profile.');
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Button variant="ghost" label="Back" onPress={() => navigation.goBack()} size="sm" style={{ width: 80 }} />
        <Text style={[typography.h3, { color: colors.textPrimary }]}>Edit Profile</Text>
        <View style={{ width: 80 }} />
      </View>
      <KeyboardAvoidingView 
        style={styles.keyboardView} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <View style={styles.formContainer}>
            <Input
              label="FULL NAME"
              value={name}
              onChangeText={setName}
              placeholder="e.g. John Doe"
            />

            <Input
              label="EMAIL ADDRESS (UNEDITABLE)"
              value={email}
              editable={false}
              onChangeText={setEmail}
              placeholder="e.g. john@example.com"
              keyboardType="email-address"
            />

            <Input
              label="NEW PASSWORD (OPTIONAL)"
              value={password}
              onChangeText={setPassword}
              placeholder="Leave blank to keep current"
              secureTextEntry
            />

            <Button
              label={isLoading ? "Saving..." : "Save Changes"}
              onPress={handleSave}
              disabled={isLoading || !name.trim()}
              style={{ marginTop: 40 }}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  keyboardView: { flex: 1 },
  scrollContent: { padding: 24, paddingBottom: 60 },
  formContainer: { marginTop: 16 },
});

export default EditProfileScreen;
