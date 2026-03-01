import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { useAppDispatch } from '../hooks/useAppDispatch';
import { useAppSelector } from '../hooks/useAppSelector';
import { restoreSessionThunk } from '../store/slices/authSlice';
import AuthNavigator from './AuthNavigator';
import MainTabNavigator from './MainTabNavigator';
import AdminNavigator from './AdminNavigator';
import { RootStackParamList } from '../types';
import { useTheme } from '../hooks/useTheme';

const Stack = createStackNavigator<RootStackParamList>();

const RootNavigator = () => {
  const dispatch = useAppDispatch();
  const { token, user, isRestoring } = useAppSelector(state => state.auth);
  const { typography } = useTheme();

  useEffect(() => {
    dispatch(restoreSessionThunk());
  }, [dispatch]);

  if (isRestoring) {
    return (
      <View style={[styles.splash, { backgroundColor: '#000000' }]}>
        <Text style={[typography.display, { color: '#FFFFFF' }]}>CalmX</Text>
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {token ? (
        user?.role === 'admin' ? (
          <Stack.Screen name="Admin" component={AdminNavigator} />
        ) : (
           <Stack.Screen name="Main" component={MainTabNavigator} />
        )
      ) : (
        <Stack.Screen name="Auth" component={AuthNavigator} />
      )}
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default RootNavigator;
