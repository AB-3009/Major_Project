import AsyncStorage from '@react-native-async-storage/async-storage'
import React, { useEffect, useState } from 'react'
import { View, Text, StyleSheet, FlatList, Alert } from 'react-native'

interface Feedback {
    email: string
    feedback: string
    createdAt: string
}

const AllFeedback = () => {
    const [feedbacks, setFeedbacks] = useState<Feedback[]>([])

    useEffect(() => {
        // Fetch all feedbacks from API
        const fetchFeedbacks = async () => {
            try {
                const token = await AsyncStorage.getItem('token')
                const response = await fetch(
                    'https://majorproject-production-af32.up.railway.app/admin/feedback',
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    },
                )
                const data = await response.json()
                setFeedbacks(data)
            } catch (error) {
                Alert.alert('Error', 'Failed to fetch feedbacks')
            }
        }

        fetchFeedbacks()
    }, [])

    return (
        <View style={styles.container}>
            <Text>All Feedback</Text>
            <FlatList
                data={feedbacks}
                keyExtractor={(item) => item.email}
                renderItem={({ item }) => (
                    <View style={styles.feedback}>
                        <Text>{item.email}</Text>
                        <Text>{item.feedback}</Text>
                        <Text>{item.createdAt}</Text>
                    </View>
                )}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
    feedback: {
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
    },
})

export default AllFeedback
