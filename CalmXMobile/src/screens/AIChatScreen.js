import React, { useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Send, User, Bot } from 'lucide-react-native';
import client from '../api/client';

export default function AIChatScreen() {
    const [messages, setMessages] = useState([
        { role: 'assistant', text: 'Hello! I am CalmX AI. How are you feeling in your workplace today?' }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const scrollViewRef = useRef();

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMessage = { role: 'user', text: input };
        setMessages([...messages, userMessage]);
        setInput('');
        setLoading(true);

        try {
            const { data } = await client.post('/ai/chat', {
                message: input,
                stressScore: 70 // Mock score for now, should come from latest log
            });

            setMessages(prev => [...prev, { role: 'assistant', text: data.reply }]);
        } catch (error) {
            setMessages(prev => [...prev, { role: 'assistant', text: "I'm having trouble connecting right now. Please try again later." }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View className="flex-1 bg-background">
            <View className="bg-white p-6 pt-12 items-center border-b border-gray-100">
                <Text className="text-xl font-bold text-gray-800">CalmX Advisor</Text>
                <Text className="text-secondary text-sm">Powered by DeepSeek LLM</Text>
            </View>

            <ScrollView
                className="flex-1 p-4"
                ref={scrollViewRef}
                onContentSizeChange={() => scrollViewRef.current.scrollToEnd({ animated: true })}
            >
                {messages.map((m, i) => (
                    <View key={i} className={`mb-6 flex-row ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        {m.role === 'assistant' && (
                            <View className="w-8 h-8 rounded-full bg-primary items-center justify-center mr-2">
                                <Bot size={18} color="white" />
                            </View>
                        )}
                        <View
                            className={`max-w-[80%] p-4 rounded-3xl ${m.role === 'user' ? 'bg-primary rounded-tr-none' : 'bg-white border border-gray-100 rounded-tl-none'
                                }`}
                        >
                            <Text className={m.role === 'user' ? 'text-white' : 'text-gray-700'}>{m.text}</Text>
                        </View>
                    </View>
                ))}
                {loading && <Text className="text-gray-400 italic mb-4 ml-10">AI is thinking...</Text>}
            </ScrollView>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                className="p-4 bg-white border-t border-gray-100"
            >
                <View className="flex-row items-center bg-gray-50 rounded-full px-4 border border-gray-100">
                    <TextInput
                        placeholder="Describe your situation..."
                        className="flex-1 h-12"
                        value={input}
                        onChangeText={setInput}
                    />
                    <TouchableOpacity onPress={handleSend} disabled={loading}>
                        <Send size={24} color={loading ? '#9CA3AF' : '#4F46E5'} />
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </View>
    );
}
