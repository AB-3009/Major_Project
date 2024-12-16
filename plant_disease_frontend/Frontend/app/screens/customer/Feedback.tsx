import React, { useState } from 'react'
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'

const Feedback = () => {
    const [feedback, setFeedback] = useState('')

    const handleSubmitFeedback = async () => {
        try {
            const token = await AsyncStorage.getItem('token')
            const response = await fetch(
                'https://majorproject-production-af32.up.railway.app/feedback/submit_feedback',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({ feedback }),
                },
            )

            if (response.ok) {
                Alert.alert('Success', 'Feedback submitted')
                setFeedback('')
            } else {
                Alert.alert('Error', 'Failed to submit feedback')
            }
        } catch (error) {
            Alert.alert('Error', 'Something went wrong')
        }
    }

    return (
        <View style={styles.container}>
            <Text>Feedback</Text>
            <TextInput
                placeholder='Your feedback'
                value={feedback}
                onChangeText={setFeedback}
                style={styles.input}
            />
            <Button title='Submit Feedback' onPress={handleSubmitFeedback} />
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

export default Feedback
