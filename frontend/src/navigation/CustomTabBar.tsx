import React, { useState } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Text,
  Modal,
  TouchableWithoutFeedback,
  Dimensions,
  Platform,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useTheme } from '../hooks/useTheme';

const { width } = Dimensions.get('window');

const CustomTabBar = ({ state, descriptors, navigation }: BottomTabBarProps) => {
  const { colors, spacing, radius, shadow } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // We want to show 4 icons + 1 hamburger
  // Current tabs in state: Dashboard, Chat, Calendar, Tasks, Focus, Profile
  // We'll show the first 4: Dashboard, Chat, Calendar, Tasks
  const mainTabs = state.routes.filter(r => ['Dashboard', 'Chat', 'Calendar', 'Tasks'].includes(r.name));
  const menuTabs = state.routes.filter(r => !['Dashboard', 'Chat', 'Calendar', 'Tasks'].includes(r.name));

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const handleTabPress = (route: any) => {
    const isFocused = state.routes[state.index].name === route.name;
    const event = navigation.emit({
      type: 'tabPress',
      target: route.key,
      canPreventDefault: true,
    });

    if (!isFocused && !event.defaultPrevented) {
      if (route.name === 'Profile') {
        navigation.navigate('Profile', { screen: 'ProfileInternal' });
      } else {
        navigation.navigate(route.name);
      }
    }
    setIsMenuOpen(false);
  };

  const getIconName = (routeName: string, focused: boolean): keyof typeof MaterialCommunityIcons.glyphMap => {
    switch (routeName) {
      case 'Dashboard': return focused ? 'view-grid' : 'view-grid-outline' as any;
      case 'Chat':      return focused ? 'message-text' : 'message-text-outline' as any;
      case 'Calendar':  return focused ? 'calendar' : 'calendar-outline' as any;
      case 'Tasks':     return focused ? 'checkbox-marked-circle' : 'checkbox-blank-circle-outline' as any;
      case 'Focus':     return focused ? 'clock' : 'clock-outline' as any;
      case 'Profile':   return focused ? 'account' : 'account-outline' as any;
      default:          return 'circle';
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.tabBar, borderTopColor: colors.tabBarBorder }]}>
      {mainTabs.map((route) => {
        const isFocused = state.routes[state.index].name === route.name;

        return (
          <TouchableOpacity
            key={route.key}
            onPress={() => handleTabPress(route)}
            style={styles.tabItem}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons
              name={getIconName(route.name, isFocused)}
              size={28}
              color={isFocused ? colors.tabActive : colors.tabInactive}
            />
          </TouchableOpacity>
        );
      })}

      {/* Hamburger Menu Icon */}
      <TouchableOpacity
        onPress={toggleMenu}
        style={styles.tabItem}
        activeOpacity={0.7}
      >
        <MaterialCommunityIcons
          name="menu"
          size={28}
          color={isMenuOpen ? colors.tabActive : colors.tabInactive}
        />
      </TouchableOpacity>

      {/* Popup Menu */}
      <Modal
        visible={isMenuOpen}
        transparent
        animationType="fade"
        onRequestClose={toggleMenu}
      >
        <TouchableWithoutFeedback onPress={toggleMenu}>
          <View style={styles.modalOverlay}>
            <View 
              style={[
                styles.menuPopup, 
                { 
                  backgroundColor: '#000000', // Black background as requested
                  bottom: 80, // Positioned above the tab bar
                  padding: spacing.md,
                  borderRadius: radius.lg,
                  ...shadow.lg,
                }
              ]}
            >
                  {menuTabs.map((route) => {
                const isFocused = state.routes[state.index].name === route.name;
                return (
                  <TouchableOpacity
                    key={route.key}
                    style={styles.menuItem}
                    onPress={() => handleTabPress(route)}
                  >
                    <MaterialCommunityIcons
                      name={getIconName(route.name, isFocused)}
                      size={24}
                      color="#FFFFFF" // White icons on black background
                      style={styles.menuIcon}
                    />
                    <Text style={[styles.menuText, { color: '#FFFFFF' }]}>
                      {route.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
              {/* Additional HR items requested */}
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => {
                  navigation.navigate('Profile', { screen: 'Leaves' });
                  setIsMenuOpen(false);
                }}
              >
                <MaterialCommunityIcons
                  name="calendar-remove"
                  size={24}
                  color="#FFFFFF"
                  style={styles.menuIcon}
                />
                <Text style={[styles.menuText, { color: '#FFFFFF' }]}>
                  My Leave
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => {
                  navigation.navigate('Profile', { screen: 'Attendance' });
                  setIsMenuOpen(false);
                }}
              >
                <MaterialCommunityIcons
                  name="calendar-check"
                  size={24}
                  color="#FFFFFF"
                  style={styles.menuIcon}
                />
                <Text style={[styles.menuText, { color: '#FFFFFF' }]}>
                  My Attendance
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.menuItem, styles.lastMenuItem]}
                onPress={() => {
                  navigation.navigate('Profile', { screen: 'Holidays' });
                  setIsMenuOpen(false);
                }}
              >
                <MaterialCommunityIcons
                  name="calendar-star"
                  size={24}
                  color="#FFFFFF"
                  style={styles.menuIcon}
                />
                <Text style={[styles.menuText, { color: '#FFFFFF' }]}>
                  Company Holidays
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    height: 64,
    borderTopWidth: 1,
    paddingBottom: Platform.OS === 'ios' ? 20 : 8,
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  menuPopup: {
    width: width * 0.9,
    marginBottom: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  lastMenuItem: {
    borderBottomWidth: 0,
  },
  menuIcon: {
    marginRight: 16,
  },
  menuText: {
    fontSize: 16,
    fontWeight: '500',
  },
});

export default CustomTabBar;
