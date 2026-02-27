import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Activity, MessageSquare, Plus, TrendingUp } from 'lucide-react-native';
import useStore from '../store/useStore';

export default function DashboardScreen({ navigation }) {
    const user = useStore((state) => state.user);

    return (
        <ScrollView className="flex-1 bg-background p-6">
            <View className="mt-10 mb-8">
                <Text className="text-3xl font-bold text-gray-800">Hello, {user?.name || 'User'}</Text>
                <Text className="text-gray-500 mt-1">Ready to combat workplace toxicity?</Text>
            </View>

            <View className="bg-white p-6 rounded-3xl shadow-sm mb-6 border border-gray-100">
                <View className="flex-row items-center mb-4">
                    <Activity size={24} color="#4F46E5" />
                    <Text className="ml-2 text-lg font-semibold text-gray-700">Daily Stress Analysis</Text>
                </View>
                <Text className="text-gray-600 mb-4">Your current risk factor is <Text className="text-secondary font-bold">Low</Text>.</Text>
                <View className="h-2 bg-gray-100 rounded-full">
                    <View className="h-2 bg-secondary rounded-full w-1/4" />
                </View>
            </View>

            <View className="flex-row flex-wrap justify-between">
                <TouchableOpacity
                    onPress={() => navigation.navigate('MoodLog')}
                    className="bg-primary w-[48%] p-6 rounded-3xl items-center mb-4"
                >
                    <Plus size={32} color="white" />
                    <Text className="mt-2 text-white font-semibold">Log Mood</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => navigation.navigate('AIChat')}
                    className="bg-white w-[48%] p-6 rounded-3xl items-center mb-4 border border-gray-100"
                >
                    <MessageSquare size={32} color="#4F46E5" />
                    <Text className="mt-2 text-primary font-semibold">AI Support</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    className="bg-white w-[100%] p-6 rounded-3xl flex-row items-center justify-between mb-4 border border-gray-100"
                >
                    <View className="flex-row items-center">
                        <TrendingUp size={24} color="#10B981" />
                        <Text className="ml-3 font-semibold text-gray-700">View Weekly Report</Text>
                    </View>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}
