import React, { useState } from 'react'
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native'
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
                Alert.alert('Error', data.message)
            }
        } catch (error) {
            Alert.alert('Error', 'Something went wrong')
        }
    }

    return (
        <View style={styles.container}>
            <Text>Register</Text>
            <TextInput
                placeholder='Username'
                value={username}
                onChangeText={setUsername}
                style={styles.input}
            />
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
            <Picker
                selectedValue={role}
                onValueChange={setRole}
                style={styles.input}
            >
                <Picker.Item label='Admin' value='admin' />
                <Picker.Item label='Specialist' value='specialist' />
                <Picker.Item label='Seller' value='seller' />
                <Picker.Item label='Customer' value='customer' />
            </Picker>
            <Button title='Register' onPress={handleRegister} />
            <Button
                title='Login'
                onPress={() => navigation.navigate('Login')}
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

export default RegistrationPage
