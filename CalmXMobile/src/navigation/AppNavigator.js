import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import useStore from '../store/useStore';

// Screens (to be created)
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import DashboardScreen from '../screens/DashboardScreen';
import MoodLogScreen from '../screens/MoodLogScreen';
import AIChatScreen from '../screens/AIChatScreen';

const Stack = createStackNavigator();

export default function AppNavigator() {
    const user = useStore((state) => state.user);

    return (
        <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                {!user ? (
                    <>
                        <Stack.Screen name="Login" component={LoginScreen} />
                        <Stack.Screen name="Register" component={RegisterScreen} />
                    </>
                ) : (
                    <>
                        <Stack.Screen name="Dashboard" component={DashboardScreen} />
                        <Stack.Screen name="MoodLog" component={MoodLogScreen} />
                        <Stack.Screen name="AIChat" component={AIChatScreen} />
                    </>
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
}
