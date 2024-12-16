import React, { useState } from 'react'
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'

import { NavigationProp } from '@react-navigation/native'

interface LoginPageProps {
    navigation: NavigationProp<any>
}

const LoginPage = ({ navigation }: LoginPageProps) => {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')

    const handleLogin = async () => {
        try {
            // Replace with your API call
            const response = await fetch(
                'https://majorproject-production-af32.up.railway.app/auth/login',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ email, password }),
                },
            )

            const data = await response.json()

            if (response.ok) {
                const { session_token, role } = data
                await AsyncStorage.setItem('token', session_token)
                await AsyncStorage.setItem('role', role)

                switch (role) {
                    case 'admin':
                        navigation.navigate('Admin')
                        break
                    case 'specialist':
                        navigation.navigate('Specialist')
                        break
                    case 'seller':
                        navigation.navigate('Seller')
                        break
                    case 'customer':
                        navigation.navigate('Customer')
                        break
                    default:
                        Alert.alert('Error', 'Invalid role')
                }
            } else {
                Alert.alert('Error', data.message)
            }
        } catch (error) {
            Alert.alert('Error', 'Something went wrong')
        }
    }

    return (
        <View style={styles.container}>
            <Text>Login</Text>
            <TextInput
                placeholder='Email'
                value={email}
                onChangeText={setEmail}
                style={styles.input}
            />
            <TextInput
                placeholder='Password'
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                style={styles.input}
            />
            <Button title='Login' onPress={handleLogin} />
            <Button
                title='Register'
                onPress={() => navigation.navigate('Register')}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 16,
    },
    input: {
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        marginBottom: 12,
        paddingHorizontal: 8,
    },
})

export default LoginPage
