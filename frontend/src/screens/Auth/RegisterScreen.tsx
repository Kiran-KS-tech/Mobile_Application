import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Animated,
  TouchableOpacity,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useTheme } from '../../hooks/useTheme';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { useAppSelector } from '../../hooks/useAppSelector';
import { registerThunk, clearError } from '../../store/slices/authSlice';
import { AuthStackParamList } from '../../types';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';

type NavigationProp = StackNavigationProp<AuthStackParamList, 'Register'>;

const RegisterScreen = () => {
  const { colors, typography, spacing, radius } = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const dispatch = useAppDispatch();
  const { isLoading, error } = useAppSelector(state => state.auth);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const slideAnim = useRef(new Animated.Value(600)).current;

  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: 0,
      tension: 20,
      friction: 7,
      useNativeDriver: true,
    }).start();

    return () => {
      dispatch(clearError());
    };
  }, [dispatch, slideAnim]);

  const handleRegister = () => {
    if (name && email && password && confirmPassword) {
      if (password !== confirmPassword) {
        // Simple error handling for now
        return;
      }
      dispatch(registerThunk({ name, email, password }));
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: '#000000' }]} edges={['top', 'left', 'right']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView 
          contentContainerStyle={{ flexGrow: 1 }} 
          bounces={false} 
          showsVerticalScrollIndicator={false}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={{ flex: 1 }}>
              <View style={styles.topSpace}>
                <Text style={[typography.display, { color: '#FFFFFF' }]}>CalmX</Text>
              </View>

              <Animated.View
                style={[
                  styles.card,
                  {
                    backgroundColor: colors.background,
                    borderTopLeftRadius: radius.xxl,
                    borderTopRightRadius: radius.xxl,
                    transform: [{ translateY: slideAnim }],
                  },
                ]}
              >
                <Text style={[typography.h1, { color: colors.textPrimary, marginBottom: spacing.xl }]}>
                  Create account.
                </Text>

                <Input
                  label="FULL NAME"
                  value={name}
                  onChangeText={setName}
                  placeholder="John Doe"
                />

                <Input
                  label="EMAIL"
                  value={email}
                  onChangeText={setEmail}
                  placeholder="name@example.com"
                  keyboardType="email-address"
                />

                <Input
                  label="PASSWORD"
                  value={password}
                  onChangeText={setPassword}
                  placeholder="••••••••"
                  secureTextEntry
                />

                <Input
                  label="CONFIRM PASSWORD"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="••••••••"
                  secureTextEntry
                />

                {error && (
                  <Text style={[typography.bodySmall, { color: colors.error, marginBottom: spacing.md }]}>
                    {error}
                  </Text>
                )}

                <Button
                  label="Continue"
                  onPress={handleRegister}
                  isLoading={isLoading}
                  style={{ marginTop: spacing.md }}
                />

                <TouchableOpacity
                  onPress={() => navigation.navigate('Login')}
                  style={styles.link}
                >
                  <Text style={[typography.body, { color: colors.textSecondary }]}>
                    Already have an account? <Text style={{ color: colors.textPrimary, fontWeight: '700' }}>Sign in</Text>
                  </Text>
                </TouchableOpacity>
              </Animated.View>
            </View>
          </TouchableWithoutFeedback>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topSpace: {
    height: '25%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    flex: 1,
    padding: 32,
    paddingTop: 48,
  },
  link: {
    marginTop: 24,
    marginBottom: 40,
    alignItems: 'center',
  },
});

export default RegisterScreen;
