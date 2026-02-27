import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import client from '../api/client';
import useStore from '../store/useStore';

export default function LoginScreen({ navigation }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const setUser = useStore((state) => state.setUser);
    const setToken = useStore((state) => state.setToken);

    const handleLogin = async () => {
        try {
            const { data } = await client.post('/auth/login', { email, password });
            setUser(data);
            setToken(data.token);
        } catch (error) {
            Alert.alert('Login Failed', error.response?.data?.message || 'Something went wrong');
        }
    };

    return (
        <View className="flex-1 bg-white p-8 justify-center">
            <View className="mb-10 items-center">
                <Text className="text-4xl font-bold text-primary">CalmX</Text>
                <Text className="text-gray-500 mt-2">Personal Resource Management</Text>
            </View>

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
                onPress={handleLogin}
                className="bg-primary p-4 rounded-2xl items-center shadow-lg"
            >
                <Text className="text-white text-lg font-bold">Sign In</Text>
            </TouchableOpacity>

            <TouchableOpacity
                onPress={() => navigation.navigate('Register')}
                className="mt-6 items-center"
            >
                <Text className="text-gray-500">Don't have an account? <Text className="text-primary font-bold">Register</Text></Text>
            </TouchableOpacity>
        </View>
    );
}
