import React from 'react';
import { createBottomTabNavigator, BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';
import { MainTabParamList } from '../types';
import CustomTabBar from './CustomTabBar';

import DashboardScreen from '../screens/Dashboard/DashboardScreen';
import ChatScreen from '../screens/Chat/ChatScreen';
import CalendarScreen from '../screens/Calendar/CalendarScreen';
import TasksScreen from '../screens/Tasks/TasksScreen';
import FocusScreen from '../screens/Focus/FocusScreen';
import ProfileScreen from '../screens/Profile/ProfileScreen';
import AttendanceScreen from '../screens/Profile/AttendanceScreen';
import LeaveScreen from '../screens/Profile/LeaveScreen';
import HolidaysScreen from '../screens/Profile/HolidaysScreen';

const Tab = createBottomTabNavigator<MainTabParamList>();
const Stack = createStackNavigator();

const ScreenWrapper = ({ component, name }: { component: React.ComponentType<any>, name: string }) => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name={`${name}Internal`} component={component} />
  </Stack.Navigator>
);

const DashboardStack = () => <ScreenWrapper component={DashboardScreen} name="Dashboard" />;
const ChatStack      = () => <ScreenWrapper component={ChatScreen} name="Chat" />;
const CalendarStack  = () => <ScreenWrapper component={CalendarScreen} name="Calendar" />;
const TasksStack     = () => <ScreenWrapper component={TasksScreen} name="Tasks" />;
const FocusStack     = () => <ScreenWrapper component={FocusScreen} name="Focus" />;

const ProfileStackComponent = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="ProfileInternal" component={ProfileScreen} />
    <Stack.Screen name="Attendance" component={AttendanceScreen} />
    <Stack.Screen name="Leaves" component={LeaveScreen} />
    <Stack.Screen name="Holidays" component={HolidaysScreen} />
  </Stack.Navigator>
);

const MainTabNavigator = () => {
  const { colors } = useTheme();

  return (
    <Tab.Navigator
      tabBar={(props: BottomTabBarProps) => <CustomTabBar {...props} />}
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: false,
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardStack} />
      <Tab.Screen name="Chat" component={ChatStack} />
      <Tab.Screen name="Calendar" component={CalendarStack} />
      <Tab.Screen name="Tasks" component={TasksStack} />
      <Tab.Screen name="Focus" component={FocusStack} />
      <Tab.Screen name="Profile" component={ProfileStackComponent} />
    </Tab.Navigator>
  );
};

export default MainTabNavigator;
