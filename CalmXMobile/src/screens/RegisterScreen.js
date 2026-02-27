import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ScrollView } from 'react-native';
import client from '../api/client';

export default function RegisterScreen({ navigation }) {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleRegister = async () => {
        try {
            await client.post('/auth/register', { name, email, password });
            Alert.alert('Success', 'Account created! Please log in.', [
                { text: 'OK', onPress: () => navigation.navigate('Login') }
            ]);
        } catch (error) {
            Alert.alert('Registration Failed', error.response?.data?.message || 'Something went wrong');
        }
    };

    return (
        <ScrollView className="flex-1 bg-white p-8">
            <View className="mt-20 mb-10">
                <Text className="text-3xl font-bold text-gray-800">Join CalmX</Text>
                <Text className="text-gray-500 mt-2">Start your journey to a toxicity-free corporate life.</Text>
            </View>

            <Text className="text-lg font-semibold text-gray-700 mb-2">Full Name</Text>
            <TextInput
                placeholder="John Doe"
                className="bg-gray-50 p-4 rounded-xl border border-gray-100 mb-6"
                value={name}
                onChangeText={setName}
            />

            <Text className="text-lg font-semibold text-gray-700 mb-2">Email</Text>
            <TextInput
                placeholder="your@email.com"
                className="bg-gray-50 p-4 rounded-xl border border-gray-100 mb-6"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
            />

            <Text className="text-lg font-semibold text-gray-700 mb-2">Password</Text>
            <TextInput
                placeholder="••••••••"
                className="bg-gray-50 p-4 rounded-xl border border-gray-100 mb-10"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
            />

            <TouchableOpacity
                onPress={handleRegister}
                className="bg-primary p-4 rounded-2xl items-center shadow-lg"
            >
                <Text className="text-white text-lg font-bold">Create Account</Text>
            </TouchableOpacity>

            <TouchableOpacity
                onPress={() => navigation.goBack()}
                className="mt-6 mb-10 items-center"
            >
                <Text className="text-gray-500">Already have an account? <Text className="text-primary font-bold">Login</Text></Text>
            </TouchableOpacity>
        </ScrollView>
    );
}
