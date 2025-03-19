import React, { useState } from 'react'
import {
    View,
    Text,
    TextInput,
    Button,
    StyleSheet,
    Alert,
    TouchableOpacity,
} from 'react-native'
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
            const response = await fetch(
                'https://major-project-dmdw.onrender.com/auth/login',
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
                const { session_token, role, username } = data
                await AsyncStorage.setItem('token', session_token)
                await AsyncStorage.setItem('role', role)
                await AsyncStorage.setItem('username', username)

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
            <Text style={styles.title}>Login</Text>
            <TextInput
                placeholder='Email'
                value={email}
                onChangeText={setEmail}
                style={styles.input}
                placeholderTextColor='#aaa'
            />
            <TextInput
                placeholder='Password'
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                style={styles.input}
                placeholderTextColor='#aaa'
            />
            <TouchableOpacity style={styles.button} onPress={handleLogin}>
                <Text style={styles.buttonText}>Login</Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={styles.link}
                onPress={() => navigation.navigate('Register')}
            >
                <Text style={styles.linkText}>Register</Text>
            </TouchableOpacity>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 16,
        width: '100%',
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        marginBottom: 32,
        color: '#333',
        textAlign: 'center',
        textShadowColor: 'rgba(0, 0, 0, 0.75)',
        textShadowOffset: { width: -1, height: 1 },
        textShadowRadius: 10,
        position: 'absolute',
        top: '10%',
        left: '41%',
        textTransform: 'uppercase',
    },
    input: {
        height: 50,
        borderColor: 'rgba(255, 255, 255, 0.5)',
        borderWidth: 1,
        marginBottom: 16,
        paddingHorizontal: 16,
        backgroundColor: 'rgba(255, 255, 255, 0.4)',
        borderRadius: 25,
        fontSize: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 60,
        backdropFilter: 'blur(10px)',
    },
    button: {
        backgroundColor: 'rgba(0, 123, 255, 0.5)',
        paddingVertical: 15,
        borderRadius: 25,
        alignItems: 'center',
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 60,
        borderColor: 'rgba(255, 255, 255, 0.5)', // Semi-transparent border
        borderWidth: 1,
        backdropFilter: 'blur(10px)', // Blur effect
        width: '50%',
        alignSelf: 'center',
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    link: {
        alignItems: 'center',
    },
    linkText: {
        color: '#fff',
        fontSize: 16,
    },
})

export default LoginPage
