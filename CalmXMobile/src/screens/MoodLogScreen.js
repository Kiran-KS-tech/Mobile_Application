import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, Alert, ScrollView } from 'react-native';
import client from '../api/client';
import { Smile, Frown, Meh, Angry, HelpCircle } from 'lucide-react-native';

export default function MoodLogScreen({ navigation }) {
    const [score, setScore] = useState(50);
    const [note, setNote] = useState('');

    const submitMood = async () => {
        try {
            await client.post('/mood/log', { score, note });
            Alert.alert('Success', 'Mood logged successfully', [
                { text: 'OK', onPress: () => navigation.goBack() }
            ]);
        } catch (error) {
            Alert.alert('Error', 'Failed to log mood');
        }
    };

    const getEmoji = (val) => {
        if (val < 20) return <Angry size={50} color="#EF4444" />;
        if (val < 40) return <Frown size={50} color="#F97316" />;
        if (val < 60) return <Meh size={50} color="#EAB308" />;
        if (val < 80) return <Smile size={50} color="#10B981" />;
        return <Smile size={50} color="#059669" />;
    };

    return (
        <ScrollView className="flex-1 bg-white p-8">
            <Text className="text-3xl font-bold text-gray-800 mt-10">How are you today?</Text>
            <Text className="text-gray-500 mt-2">Log your stress level and take control.</Text>

            <View className="items-center my-12">
                {getEmoji(score)}
                <Text className="text-5xl font-bold mt-4 text-primary">{score}</Text>
                <Text className="text-gray-400">Stress Score</Text>
            </View>

            <View className="flex-row justify-between mb-10">
                {[0, 25, 50, 75, 100].map(val => (
                    <TouchableOpacity
                        key={val}
                        onPress={() => setScore(val)}
                        className={`w-12 h-12 rounded-full items-center justify-center border ${score === val ? 'bg-primary border-primary' : 'border-gray-200'}`}
                    >
                        <Text className={score === val ? 'text-white font-bold' : 'text-gray-400'}>{val}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            <Text className="text-lg font-semibold text-gray-700 mb-2">Notes (Optional)</Text>
            <TextInput
                placeholder="What's bothering you? Context helps the AI."
                className="bg-gray-50 p-4 rounded-xl border border-gray-100 mb-10 h-32"
                multiline
                value={note}
                onChangeText={setNote}
            />

            <TouchableOpacity
                onPress={submitMood}
                className="bg-primary p-4 rounded-2xl items-center shadow-lg"
            >
                <Text className="text-white text-lg font-bold">Log Status</Text>
            </TouchableOpacity>
        </ScrollView>
    );
}
