import React, { useState } from 'react'
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
} from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'

const Feedback = () => {
    const [feedback, setFeedback] = useState('')

    const handleSubmitFeedback = async () => {
        try {
            const token = await AsyncStorage.getItem('token')
            const response = await fetch(
                'https://major-project-dmdw.onrender.com/feedback/submit_feedback',
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
            <Text style={styles.header}>Feedback</Text>
            {/* <Text
                style={{
                    fontSize: 32,
                    fontWeight: 'bold',
                    textAlign: 'center',
                    position: 'absolute',
                    top: '85%',
                    left: '30%',
                }}
            >
                Coming Soon...
            </Text> */}
            <TextInput
                placeholder='Your feedback'
                value={feedback}
                onChangeText={setFeedback}
                style={styles.input}
                multiline
            />
            <TouchableOpacity
                style={styles.submitButton}
                onPress={handleSubmitFeedback}
            >
                <Text style={styles.submitButtonText}>Submit Feedback</Text>
            </TouchableOpacity>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 16,
        // backgroundColor: '#f5f5f5',
    },
    header: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 16,
        textAlign: 'center',
        position: 'absolute',
        top: '10%',
        left: '40%',
        // marginTop: -50,
    },
    input: {
        height: 200,
        borderColor: 'rgba(255, 255, 255, 0.5)',
        borderWidth: 1,
        marginBottom: 16,
        paddingHorizontal: 16,
        backgroundColor: 'rgba(255, 255, 255, 0.4)',
        borderRadius: 5,
        fontSize: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 160,
        backdropFilter: 'blur(10px)',
    },
    submitButton: {
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
    submitButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
})

export default Feedback
