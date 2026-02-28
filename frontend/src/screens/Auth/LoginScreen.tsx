import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Animated,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Keyboard,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useTheme } from '../../hooks/useTheme';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { useAppSelector } from '../../hooks/useAppSelector';
import { loginThunk, clearError } from '../../store/slices/authSlice';
import { AuthStackParamList } from '../../types';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';

type NavigationProp = StackNavigationProp<AuthStackParamList, 'Login'>;

const LoginScreen = () => {
  const { colors, typography, spacing, radius } = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const dispatch = useAppDispatch();
  const { isLoading, error } = useAppSelector(state => state.auth);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

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

  const handleLogin = () => {
    if (email && password) {
      dispatch(loginThunk({ email, password }));
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
                  Sign in.
                </Text>

                <Input
                  label="EMAIL"
                  value={email}
                  onChangeText={setEmail}
                  placeholder="name@example.com"
                  keyboardType="email-address"
                />

                <View style={styles.passwordContainer}>
                  <Input
                    label="PASSWORD"
                    value={password}
                    onChangeText={setPassword}
                    placeholder="••••••••"
                    secureTextEntry={!showPassword}
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    style={styles.toggle}
                  >
                    <Text style={[typography.label, { color: colors.textTertiary }]}>
                      {showPassword ? 'HIDE' : 'SHOW'}
                    </Text>
                  </TouchableOpacity>
                </View>

                {error && (
                  <Text style={[typography.bodySmall, { color: colors.error, marginBottom: spacing.md }]}>
                    {error}
                  </Text>
                )}

                <Button
                  label="Continue"
                  onPress={handleLogin}
                  isLoading={isLoading}
                  style={{ marginTop: spacing.md }}
                />

                <TouchableOpacity
                  onPress={() => navigation.navigate('Register')}
                  style={styles.link}
                >
                  <Text style={[typography.body, { color: colors.textSecondary }]}>
                    Don&apos;t have an account? <Text style={{ color: colors.textPrimary, fontWeight: '700' }}>Create one</Text>
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
    height: '40%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    flex: 1,
    padding: 32,
    paddingTop: 48,
  },
  passwordContainer: {
    position: 'relative',
    width: '100%',
  },
  toggle: {
    position: 'absolute',
    right: 16,
    top: 36, // Adjust based on label height
  },
  link: {
    marginTop: 24,
    alignItems: 'center',
  },
});

export default LoginScreen;
