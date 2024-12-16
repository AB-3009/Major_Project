import React from 'react'
import { Button, Alert } from 'react-native'
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
                navigation.navigate('Login')
            } else {
                Alert.alert('Error', 'Failed to logout')
            }
        } catch (error) {
            Alert.alert('Error', 'Something went wrong')
        }
    }

    return <Button title='Logout' onPress={handleLogout} />
}

export default LogoutButton
