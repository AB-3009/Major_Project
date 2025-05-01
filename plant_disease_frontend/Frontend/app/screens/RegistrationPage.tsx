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
import { Picker } from '@react-native-picker/picker'
import { NavigationProp } from '@react-navigation/native'

interface Props {
    navigation: NavigationProp<any>
}

const RegistrationPage: React.FC<Props> = ({ navigation }) => {
    const [username, setUsername] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [role, setRole] = useState('customer')

    const handleRegister = async () => {
        try {
            // Replace with your API call
            const response = await fetch(
                'https://majorproject-production-af32.up.railway.app/auth/register',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ username, email, password, role }),
                },
            )

            const data = await response.json()
            console.log('Response:', data)
            console.log('Response status:', response.status)
            console.log('Response ok:', response.ok)

            if (response.ok) {
                if (role === 'customer') {
                    Alert.alert('Registration successful', 'You can now login')
                } else {
                    Alert.alert(
                        'Registration successful',
                        'Awaiting admin approval',
                    )
                }
                navigation.navigate('Login')
            } else {
                Alert.alert(
                    'Error',
                    data.message || data.error || 'registration failed',
                )
            }
        } catch (error) {
            Alert.alert('Error', 'Something went wrong')
        }
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Register</Text>
            <TextInput
                placeholder='Username'
                value={username}
                onChangeText={setUsername}
                style={styles.input}
                placeholderTextColor='#aaa'
            />
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
            <View style={styles.pickerWrapper}>
                <Picker
                    selectedValue={role}
                    onValueChange={(itemValue) => setRole(itemValue)}
                    style={styles.picker}
                >
                    <Picker.Item label='Admin' value='admin' />
                    <Picker.Item label='Specialist' value='specialist' />
                    <Picker.Item label='Seller' value='seller' />
                    <Picker.Item label='Customer' value='customer' />
                </Picker>
            </View>

            <TouchableOpacity style={styles.button} onPress={handleRegister}>
                <Text style={styles.buttonText}>Register</Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={styles.link}
                onPress={() => navigation.navigate('Login')}
            >
                <Text style={styles.linkText}>Login</Text>
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
        left: '33%',
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
    picker: {
        height: 50,
        marginBottom: 16,
        backgroundColor: 'rgba(255, 255, 255, 0.5)',
        borderRadius: 25,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 2,
        color: '#aaa',
    },
    pickerWrapper: {
        borderRadius: 30,
        overflow: 'hidden',
        marginBottom: 16,
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

export default RegistrationPage
