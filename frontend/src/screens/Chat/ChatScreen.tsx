import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { useAppSelector } from '../../hooks/useAppSelector';
import { fetchChatHistory, sendMessageThunk, addOptimisticMessage } from '../../store/slices/chatSlice';
import { Message } from '../../types';

const ChatScreen = () => {
  const { colors, typography, radius } = useTheme();
  const dispatch = useAppDispatch();
  const { messages, isSending, isTyping } = useAppSelector(state => state.chat);
  const [inputText, setInputText] = useState('');
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    dispatch(fetchChatHistory());
  }, [dispatch]);

  const handleSend = () => {
    if (inputText.trim()) {
      const text = inputText.trim();
      dispatch(addOptimisticMessage(text));
      setInputText('');
      dispatch(sendMessageThunk(text));
    }
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isUser = item.role === 'user';
    const timestamp = new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    return (
      <View style={[styles.messageContainer, isUser ? styles.userContainer : styles.aiContainer]}>
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

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'left', 'right']}>
      <View style={[styles.header, { borderBottomColor: colors.border, borderBottomWidth: 1 }]}>
        <Text style={[typography.h3, { color: colors.textPrimary }]}>AI Companion</Text>
        <Text style={[typography.bodySmall, { color: colors.textSecondary }]}>Your mental wellness assistant</Text>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={{ flex: 1 }}>
            <FlatList
              ref={flatListRef}
              data={messages}
              renderItem={renderMessage}
              keyExtractor={item => item.id}
              contentContainerStyle={styles.listContent}
              onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
              onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
            />

            {isTyping && (
              <View style={[styles.aiContainer, { paddingHorizontal: 24, marginBottom: 16 }]}>
                <View style={[styles.bubble, { backgroundColor: colors.bubbleAI, borderRadius: radius.lg, paddingVertical: 12 }]}>
                  <ActivityIndicator size="small" color={colors.accent} />
                </View>
              </View>
            )}
          </View>
        </TouchableWithoutFeedback>

        <View style={[styles.inputRow, { borderTopColor: colors.border, borderTopWidth: 1 }]}>
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
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 24,
    paddingBottom: 16,
  },
  listContent: {
    padding: 24,
    paddingTop: 16,
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
});

export default ChatScreen;
