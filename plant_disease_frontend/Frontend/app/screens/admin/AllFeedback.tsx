import { Collapsible } from '@/components/Collapsible'
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

    // Group feedbacks by email
    const groupedFeedbacks = feedbacks.reduce(
        (acc: { [key: string]: Feedback[] }, feedback) => {
            if (!acc[feedback.email]) {
                acc[feedback.email] = []
            }
            acc[feedback.email].push(feedback)
            return acc
        },
        {},
    )

    return (
        <View style={styles.container}>
            <Text style={styles.header}>All Feedback</Text>
            <FlatList
                data={Object.keys(groupedFeedbacks)}
                keyExtractor={(email) => email}
                renderItem={({ item: email }) => (
                    <Collapsible title={email}>
                        {groupedFeedbacks[email].map((feedback, index) => (
                            <View key={index} style={styles.feedbackContainer}>
                                <Text style={styles.feedbackText}>
                                    {feedback.feedback}
                                </Text>
                                <Text style={styles.dateText}>
                                    {new Date(
                                        feedback.createdAt,
                                    ).toLocaleDateString()}
                                </Text>
                            </View>
                        ))}
                    </Collapsible>
                )}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        // backgroundColor: '#f5f5f5',
    },
    header: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 16,
        textAlign: 'center',
        marginTop: 25,
    },
    feedbackContainer: {
        backgroundColor: '#fff',
        padding: 16,
        marginVertical: 8,
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    feedbackText: {
        fontSize: 16,
        color: '#333',
        marginBottom: 8,
    },
    dateText: {
        fontSize: 14,
        color: '#666',
    },
})

export default AllFeedback
