import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';
import { AdminTabParamList } from '../types';

import AdminDashboardScreen from '../screens/Admin/AdminDashboardScreen';
import AdminAttendanceScreen from '../screens/Admin/AdminAttendanceScreen';
import AdminHolidaysScreen from '../screens/Admin/AdminHolidaysScreen';
import AdminLeavesScreen from '../screens/Admin/AdminLeavesScreen';
import AdminUsersScreen from '../screens/Admin/AdminUsersScreen';
import AdminUserAttendanceDetailsScreen from '../screens/Admin/AdminUserAttendanceDetailsScreen';

const Tab = createBottomTabNavigator<AdminTabParamList>();
const Stack = createStackNavigator();

const ScreenWrapper = ({ component, name }: { component: React.ComponentType<any>, name: string }) => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name={`${name}Internal`} component={component} />
  </Stack.Navigator>
);

const DashboardStack  = () => <ScreenWrapper component={AdminDashboardScreen} name="AdminDashboard" />;
const AttendanceStack = () => <ScreenWrapper component={AdminAttendanceScreen} name="AdminAttendance" />;
const HolidaysStack   = () => <ScreenWrapper component={AdminHolidaysScreen} name="AdminHolidays" />;
const LeavesStack     = () => <ScreenWrapper component={AdminLeavesScreen} name="AdminLeaves" />;
const UsersStack      = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="AdminUsersInternal" component={AdminUsersScreen} />
    <Stack.Screen 
      name="AdminUserAttendanceDetails" 
      component={AdminUserAttendanceDetailsScreen} 
      options={{ headerShown: true, title: 'Attendance Details' }}
    />
  </Stack.Navigator>
);

const AdminNavigator = () => {
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
        tabBarShowLabel: true,
        tabBarActiveTintColor: colors.tabActive,
        tabBarInactiveTintColor: colors.tabInactive,
        tabBarIcon: ({ color, focused }) => {
          let iconName: keyof typeof MaterialCommunityIcons.glyphMap;
          switch (route.name) {
            case 'AdminDashboard':  iconName = focused ? 'view-dashboard' : 'view-dashboard-outline' as any; break;
            case 'AdminAttendance': iconName = focused ? 'clipboard-account' : 'clipboard-account-outline' as any; break;
            case 'AdminHolidays':   iconName = focused ? 'calendar-star' : 'calendar-star' as any; break;
            case 'AdminLeaves':     iconName = focused ? 'calendar-clock' : 'calendar-clock-outline' as any; break;
            case 'AdminUsers':      iconName = focused ? 'account-group' : 'account-group-outline' as any; break;
            default:                iconName = 'circle';
          }
          return <MaterialCommunityIcons name={iconName} size={28} color={color} />;
        },
      })}
    >
      <Tab.Screen name="AdminDashboard" component={DashboardStack} options={{ title: 'Admin' }} />
      <Tab.Screen name="AdminAttendance" component={AttendanceStack} options={{ title: 'Attendance' }} />
      <Tab.Screen name="AdminHolidays" component={HolidaysStack} options={{ title: 'Holidays' }} />
      <Tab.Screen name="AdminLeaves" component={LeavesStack} options={{ title: 'Leaves' }} />
      <Tab.Screen name="AdminUsers" component={UsersStack} options={{ title: 'Users' }} />
    </Tab.Navigator>
  );
};

export default AdminNavigator;
