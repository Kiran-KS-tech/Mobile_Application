import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';
import { MainTabParamList } from '../types';

import DashboardScreen from '../screens/Dashboard/DashboardScreen';
import ChatScreen from '../screens/Chat/ChatScreen';
import CalendarScreen from '../screens/Calendar/CalendarScreen';
import TasksScreen from '../screens/Tasks/TasksScreen';
import FocusScreen from '../screens/Focus/FocusScreen';
import ProfileScreen from '../screens/Profile/ProfileScreen';

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
const ProfileStack   = () => <ScreenWrapper component={ProfileScreen} name="Profile" />;

const MainTabNavigator = () => {
  const { colors } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.tabBar,
          borderTopColor: colors.tabBarBorder,
          borderTopWidth: 1,
          height: 64,
          paddingBottom: 8,
        },
        tabBarShowLabel: false,
        tabBarActiveTintColor: colors.tabActive,
        tabBarInactiveTintColor: colors.tabInactive,
        tabBarIcon: ({ color, focused }) => {
          let iconName: keyof typeof MaterialCommunityIcons.glyphMap;

          switch (route.name) {
            case 'Dashboard': iconName = focused ? 'view-grid' : 'view-grid-outline' as any; break;
            case 'Chat':      iconName = focused ? 'message-text' : 'message-text-outline' as any; break;
            case 'Calendar':  iconName = focused ? 'calendar' : 'calendar-outline' as any; break;
            case 'Tasks':     iconName = focused ? 'checkbox-marked-circle' : 'checkbox-blank-circle-outline' as any; break;
            case 'Focus':     iconName = focused ? 'clock' : 'clock-outline' as any; break;
            case 'Profile':   iconName = focused ? 'account' : 'account-outline' as any; break;
            default:          iconName = 'circle';
          }

          return <MaterialCommunityIcons name={iconName} size={28} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardStack} />
      <Tab.Screen name="Chat" component={ChatStack} />
      <Tab.Screen name="Calendar" component={CalendarStack} />
      <Tab.Screen name="Tasks" component={TasksStack} />
      <Tab.Screen name="Focus" component={FocusStack} />
      <Tab.Screen name="Profile" component={ProfileStack} />
    </Tab.Navigator>
  );
};

export default MainTabNavigator;
