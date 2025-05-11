import React from 'react'
import { TouchableOpacity, Text, Alert, StyleSheet } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { NavigationProp } from '@react-navigation/native'

const LogoutButton = ({ navigation }: { navigation: NavigationProp<any> }) => {
    const handleLogout = async () => {
        try {
            const token = await AsyncStorage.getItem('token')
            const response = await fetch(
                'https://majorproject-production-af32.up.railway.app/auth/logout',
                {
                    method: 'POST',
                    headers: {
                        Authorization: `${token}`,
                    },
                },
            )

            if (response.ok) {
                await AsyncStorage.removeItem('token')
                await AsyncStorage.removeItem('role')
                await AsyncStorage.removeItem('username')
                navigation.navigate('Login')
            } else {
                Alert.alert('Error', 'Failed to logout')
            }
        } catch (error) {
            Alert.alert('Error', 'Something went wrong')
        }
    }

    return (
        <TouchableOpacity style={styles.button} onPress={handleLogout}>
            <Text style={styles.buttonText}>Logout</Text>
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    button: {
        backgroundColor: 'rgba(220, 53, 69, 0.9)',
        paddingVertical: 12,
        paddingHorizontal: 32,
        borderRadius: 5,
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: 10,
        width: '50%',
        alignSelf: 'center',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
})

export default LogoutButton
