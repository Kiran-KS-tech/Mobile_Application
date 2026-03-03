import React, { useEffect, useState, useRef, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  ScrollView,
  Dimensions,
  Animated as RNAnimated,
} from 'react-native';

import * as Haptics from 'expo-haptics';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { useAppSelector } from '../../hooks/useAppSelector';
import { fetchChatHistory, sendMessageThunk, addOptimisticMessage } from '../../store/slices/chatSlice';
import { fetchBurnoutRisk } from '../../store/slices/wellnessSlice';
import { useHeaderHeight } from '@react-navigation/elements';
import { Message } from '../../types';
import { RootState } from '../../store';
import CustomTypingIndicator from '../../components/CustomTypingIndicator';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const DRAWER_WIDTH = SCREEN_WIDTH * 0.75;

// Helper to format date strings consistently for grouping
const formatDateGroup = (isoString: string) => {
  const d = new Date(isoString);
  const now = new Date();
  
  const isToday = d.getDate() === now.getDate() && 
                  d.getMonth() === now.getMonth() && 
                  d.getFullYear() === now.getFullYear();
                  
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday = d.getDate() === yesterday.getDate() && 
                      d.getMonth() === yesterday.getMonth() && 
                      d.getFullYear() === yesterday.getFullYear();

  if (isToday) return 'Today';
  if (isYesterday) return 'Yesterday';
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
};

const ChatScreen = () => {
  const { colors, typography, radius } = useTheme();
  const dispatch = useAppDispatch();
  const messages = useAppSelector((state: RootState) => state.chat.messages);
  const isTyping = useAppSelector((state: RootState) => state.chat.isTyping);
  const isSending = useAppSelector((state: RootState) => state.chat.isSending);
  const quickReplies = useAppSelector((state: RootState) => state.chat.quickReplies);
  const burnoutRisk = useAppSelector((state: RootState) => state.wellness.burnoutRisk);
  const headerHeight = useHeaderHeight();
  const insets = useSafeAreaInsets();
  
  const [inputText, setInputText] = useState('');
  const [selectedDateGroup, setSelectedDateGroup] = useState<string>('Today');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  
  const drawerAnim = useRef(new RNAnimated.Value(-DRAWER_WIDTH)).current;
  const overlayAnim = useRef(new RNAnimated.Value(0)).current;

  useEffect(() => {
    dispatch(fetchChatHistory());
    dispatch(fetchBurnoutRisk());
  }, [dispatch]);

  // Haptic feedback when AI message arrives
  useEffect(() => {
    if (messages.length > 0 && messages[messages.length - 1].role === 'assistant') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  }, [messages.length, messages]);

  const toggleDrawer = () => {
    const willOpen = !isDrawerOpen;
    setIsDrawerOpen(willOpen);
    
    RNAnimated.parallel([
      RNAnimated.timing(drawerAnim, {
        toValue: willOpen ? 0 : -DRAWER_WIDTH,
        duration: 300,
        useNativeDriver: true,
      }),
      RNAnimated.timing(overlayAnim, {
        toValue: willOpen ? 1 : 0,
        duration: 300,
        useNativeDriver: true,
      })
    ]).start();
  };

  // Group messages by date
  const groupedMessages = useMemo(() => {
    const groups: Record<string, Message[]> = {};
    messages.forEach(msg => {
      const groupKey = formatDateGroup(msg.timestamp);
      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(msg);
    });
    return groups;
  }, [messages]);

  // Derive dates array for the sidebar
  const dateGroups = useMemo(() => {
    const keys = Object.keys(groupedMessages);
    // Ensure "Today" always exists
    if (!keys.includes('Today')) {
      keys.unshift('Today');
    } else {
      // Move "Today" to top and "Yesterday" second
      keys.sort((a, b) => {
        if (a === 'Today') return -1;
        if (b === 'Today') return 1;
        if (a === 'Yesterday') return -1;
        if (b === 'Yesterday') return 1;
        // Sort others reverse chronologically
        return new Date(b).getTime() - new Date(a).getTime();
      });
    }
    return keys;
  }, [groupedMessages]);

  const currentDayMessages = groupedMessages[selectedDateGroup] || [];
  const isViewingToday = selectedDateGroup === 'Today';

  // Scroll to bottom when keyboard opens
  useEffect(() => {
    const showSubscription = Keyboard.addListener('keyboardDidShow', () => {
      if (isViewingToday && currentDayMessages.length > 0) {
        // Short delay to ensure layout has adjusted
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
      }
    });
    return () => {
      showSubscription.remove();
    };
  }, [isViewingToday, currentDayMessages.length]);

  const handleSend = () => {
    if (inputText.trim()) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      const text = inputText.trim();
      
      // If we're viewing an older date, switch back to today first
      if (!isViewingToday) {
        setSelectedDateGroup('Today');
      }
      
      dispatch(addOptimisticMessage(text));
      setInputText('');
      dispatch(sendMessageThunk(text));
    }
  };

  const handleSelectDate = (dateGroup: string) => {
    setSelectedDateGroup(dateGroup);
    if (isDrawerOpen) {
      toggleDrawer();
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const renderMessage = ({ item, index }: { item: Message, index: number }) => {
    const isUser = item.role === 'user';
    const timestamp = new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    return (
      <View 
        style={[styles.messageContainer, isUser ? styles.userContainer : styles.aiContainer]}
      >
        <View
          style={[
            styles.bubble,
            {
              backgroundColor: isUser ? colors.bubbleUser : colors.bubbleAI,
              borderBottomRightRadius: isUser ? radius.xs : radius.lg,
              borderBottomLeftRadius: isUser ? radius.lg : radius.xs,
              borderRadius: radius.lg,
            },
          ]}
        >
          <Text style={[typography.body, { color: isUser ? colors.bubbleUserText : colors.bubbleAIText }]}>
            {item.content}
          </Text>
        </View>
        <Text style={[typography.bodySmall, { color: colors.textTertiary, marginTop: 4 }]}>
          {timestamp}
        </Text>
      </View>
    );
  };

  const handleContentSizeChange = () => {
    if (isViewingToday && currentDayMessages.length > 0) {
      flatListRef.current?.scrollToEnd({ animated: true });
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'left', 'right']}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border, borderBottomWidth: 1 }]}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={toggleDrawer} style={styles.menuButton}>
            <MaterialCommunityIcons name="menu" size={28} color={colors.textPrimary} />
          </TouchableOpacity>
          <View>
            <Text style={[typography.h3, { color: colors.textPrimary }]}>AI Companion</Text>
            <Text style={[typography.bodySmall, { color: colors.textSecondary }]}>
              {isViewingToday ? 'Your mental wellness assistant' : `History: ${selectedDateGroup}`}
            </Text>
          </View>
        </View>
        <TouchableOpacity style={[styles.riskBadge, { backgroundColor: (burnoutRisk?.riskLevel === 'High' ? colors.error : colors.accent) + '20' }]}>
          <MaterialCommunityIcons 
            name={burnoutRisk?.riskLevel === 'High' ? "alert-circle-outline" : "shield-check-outline"} 
            size={16} 
            color={burnoutRisk?.riskLevel === 'High' ? colors.error : colors.accent} 
          />
          <Text style={[typography.bodySmall, { color: burnoutRisk?.riskLevel === 'High' ? colors.error : colors.accent, fontWeight: '600', marginLeft: 4 }]}>
            {burnoutRisk?.riskLevel || 'Low'} Risk
          </Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
        keyboardVerticalOffset={headerHeight}
      >
        <View style={{ flex: 1, flexDirection: 'row' }}>
          {/* Main Chat Area */}
          <View style={{ flex: 1 }}>
            <View style={{ flex: 1 }}>
              {currentDayMessages.length === 0 ? (
              <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View style={styles.emptyStateContainer}>
                  <MaterialCommunityIcons name="message-outline" size={48} color={colors.textTertiary} />
                  <Text style={[typography.body, { color: colors.textSecondary, marginTop: 12 }]}>
                    No messages for this day.
                  </Text>
                </View>
              </TouchableWithoutFeedback>
            ) : (
              <FlatList
                ref={flatListRef}
                data={currentDayMessages}
                renderItem={renderMessage}
                keyExtractor={(item, index) => item._id || `msg-${index}`}
                contentContainerStyle={styles.listContent}
                onContentSizeChange={handleContentSizeChange}
                onLayout={handleContentSizeChange}
                keyboardDismissMode="on-drag"
                keyboardShouldPersistTaps="handled"
                ListFooterComponent={
                  <View>
                    {isTyping && isViewingToday && (
                      <View style={[styles.aiContainer, { marginBottom: 16 }]}>
                        <View style={[styles.bubble, { backgroundColor: colors.bubbleAI, borderRadius: radius.lg, paddingVertical: 12 }]}>
                          <CustomTypingIndicator />
                        </View>
                      </View>
                    )}
                    {!isTyping && isViewingToday && quickReplies && quickReplies.length > 0 && (
                      <View style={styles.quickReplyContainer}>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }} keyboardShouldPersistTaps="handled">
                          {quickReplies.map((reply: string, idx: number) => (
                            <TouchableOpacity
                              key={idx}
                              style={[styles.quickReplyChip, { borderColor: colors.accent, backgroundColor: colors.background }]}
                              onPress={() => {
                                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                dispatch(addOptimisticMessage(reply));
                                dispatch(sendMessageThunk(reply));
                              }}
                            >
                              <Text style={[typography.bodySmall, { color: colors.accent }]}>{reply}</Text>
                            </TouchableOpacity>
                          ))}
                        </ScrollView>
                      </View>
                    )}
                  </View>
                }
              />
            )}
          </View>

            <View style={[
              styles.inputRow, 
              { 
                borderTopColor: colors.border, 
                borderTopWidth: 1,
                paddingBottom: Math.max(insets.bottom, 16)
              }
            ]}>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.inputBg,
                    borderColor: colors.border,
                    borderRadius: radius.full,
                    color: colors.textPrimary,
                  },
                ]}
                placeholder="Talk to me..."
                placeholderTextColor={colors.inputPlaceholder}
                value={inputText}
                onChangeText={setInputText}
                multiline
              />
              <TouchableOpacity
                onPress={handleSend}
                disabled={!inputText.trim() || isSending}
                style={[
                  styles.sendButton,
                  { backgroundColor: colors.accent, borderRadius: radius.full },
                  (!inputText.trim() || isSending) && { opacity: 0.5 },
                ]}
              >
                <MaterialCommunityIcons name="arrow-up" size={24} color={colors.textInverse} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Overlay Overlay when drawer is open */}
          <TouchableWithoutFeedback onPress={isDrawerOpen ? toggleDrawer : undefined}>
            <RNAnimated.View 
              pointerEvents={isDrawerOpen ? 'auto' : 'none'}
              style={[
                styles.overlay, 
                { opacity: overlayAnim, backgroundColor: 'rgba(0,0,0,0.4)' }
              ]} 
            />
          </TouchableWithoutFeedback>

          {/* Sidebar / Drawer */}
          <RNAnimated.View
            style={[
              styles.drawer,
              {
                backgroundColor: colors.surface,
                transform: [{ translateX: drawerAnim }],
                borderRightColor: colors.border,
              }
            ]}
          >
            <View style={[styles.drawerHeader, { borderBottomColor: colors.border }]}>
              <Text style={[typography.h3, { color: colors.textPrimary }]}>Chat History</Text>
              <TouchableOpacity onPress={toggleDrawer} style={{ padding: 8 }} hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}>
                <MaterialCommunityIcons name="close" size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
            <ScrollView 
              contentContainerStyle={[
                styles.drawerContent, 
                { paddingBottom: insets.bottom + 20 }
              ]}
            >
              {dateGroups.map((dateGroup, index) => {
                const isSelected = selectedDateGroup === dateGroup;
                return (
                  <TouchableOpacity
                    key={index}
                    onPress={() => handleSelectDate(dateGroup)}
                    style={[
                      styles.historyItem,
                      isSelected && { backgroundColor: `${colors.accent}15`, borderRadius: radius.md }
                    ]}
                  >
                    <MaterialCommunityIcons 
                      name={dateGroup === 'Today' ? "calendar-today" : "calendar-blank"} 
                      size={20} 
                      color={isSelected ? colors.accent : colors.textSecondary} 
                    />
                    <Text 
                      style={[
                        typography.body, 
                        { 
                          marginLeft: 12, 
                          color: isSelected ? colors.accent : colors.textPrimary,
                          fontWeight: isSelected ? '600' : '400'
                        }
                      ]}
                    >
                      {dateGroup}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </RNAnimated.View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuButton: {
    marginRight: 16,
    padding: 4,
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 24,
    paddingTop: 16,
    flexGrow: 1,
  },
  messageContainer: {
    marginBottom: 20,
    maxWidth: '80%',
  },
  userContainer: {
    alignSelf: 'flex-end',
    alignItems: 'flex-end',
  },
  aiContainer: {
    alignSelf: 'flex-start',
    alignItems: 'flex-start',
  },
  bubble: {
    padding: 16,
  },
  inputRow: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 12,
  },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 120,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderWidth: 1,
  },
  sendButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  riskBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  quickReplyContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
    paddingHorizontal: 24,
  },
  quickReplyChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  // Sidebar styles
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 10,
  },
  drawer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    width: DRAWER_WIDTH,
    zIndex: 20,
    borderRightWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  drawerHeader: {
    padding: 20,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  drawerContent: {
    padding: 16,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 12,
    marginBottom: 4,
  },
});

export default ChatScreen;

