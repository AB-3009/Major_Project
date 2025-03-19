import React, { useEffect, useState } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'

const WelcomePage = () => {
    const [username, setUsername] = useState('')
    const [role, setRole] = useState('')

    useEffect(() => {
        const fetchUserData = async () => {
            const storedUsername = await AsyncStorage.getItem('username')
            const storedRole = await AsyncStorage.getItem('role')
            setUsername(storedUsername || '')
            setRole(storedRole || '')
        }

        fetchUserData()
    }, [])

    const capitalizeFirstLetter = (string: string) => {
        return string.charAt(0).toUpperCase() + string.slice(1)
    }

    return (
        <View style={styles.container}>
            <Text style={styles.welcomeText}>
                Welcome, {capitalizeFirstLetter(username)}!
            </Text>
            <Text style={styles.roleText}>
                Role:{' '}
                <Text style={styles.boldText}>
                    {capitalizeFirstLetter(role)}
                </Text>
            </Text>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
        // backgroundColor: '#f5f5f5',
    },
    welcomeText: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 16,
        position: 'absolute',
        top: '10%',
    },
    roleText: {
        fontSize: 18,
        marginBottom: 32,
        color: 'white',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        padding: 8,
        borderRadius: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 60,
        backdropFilter: 'blur(10px)',
        fontWeight: 'bold',
    },
    boldText: {
        fontWeight: 'normal',
    },
})

export default WelcomePage
