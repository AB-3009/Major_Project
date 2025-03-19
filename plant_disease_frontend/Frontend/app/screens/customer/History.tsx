import AsyncStorage from '@react-native-async-storage/async-storage'
import React, { useEffect, useState } from 'react'
import { View, Text, StyleSheet, FlatList, Image, Alert } from 'react-native'

type HistoryItem = {
    image_path: string
    predicted_disease: string
    confidence: number
    description: string
    remedies: string[]
    next_steps: string[]
}

const History = () => {
    const [history, setHistory] = useState<HistoryItem[]>([])

    useEffect(() => {
        // Fetch prediction history from API
        const fetchHistory = async () => {
            try {
                const token = await AsyncStorage.getItem('token')
                const response = await fetch(
                    'https://majorproject-production-ab17.up.railway.app/history/history',
                    {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${token}`,
                        },
                    },
                )
                if (response.ok) {
                    const data = await response.json()
                    setHistory(data)
                } else {
                    Alert.alert('Error', 'Failed to fetch history')
                }
            } catch (error) {
                Alert.alert(
                    'Error',
                    'Something went wrong while fetching history',
                )
            }
        }

        fetchHistory()
    }, [])

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Prediction History</Text>
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
            <FlatList
                data={history}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item }) => {
                    const extractNameWithExtension = (imagePath: string) => {
                        // Remove the './uploads/' prefix
                        const nameWithExtension = imagePath.replace(
                            './uploads/',
                            '',
                        )
                        return nameWithExtension
                    }
                    const imageName = extractNameWithExtension(item.image_path)

                    return (
                        <View style={styles.historyItem}>
                            {item.image_path ? (
                                <Image
                                    source={{
                                        uri:
                                            'https://majorproject-production-ab17.up.railway.app/predict/preview/' +
                                            imageName,
                                    }}
                                    style={styles.image}
                                />
                            ) : (
                                <Text style={styles.noImageText}>
                                    No Image Available
                                </Text>
                            )}

                            <Text style={styles.predictedDisease}>
                                Disease: {item.predicted_disease || 'N/A'}
                            </Text>
                            <Text style={styles.confidence}>
                                Confidence: {(item.confidence * 100).toFixed(2)}
                                %
                            </Text>
                            <Text style={styles.description}>
                                Description: {item.description}
                            </Text>
                            <Text style={styles.remedies}>
                                Remedies:{' '}
                                {item.remedies?.join(', ') ||
                                    'No remedies provided.'}
                            </Text>
                            <Text style={styles.nextSteps}>
                                Next Steps:{' '}
                                {item.next_steps?.join(', ') ||
                                    'No next steps provided.'}
                            </Text>
                        </View>
                    )
                }}
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
    historyItem: {
        backgroundColor: '#fff',
        padding: 16,
        marginBottom: 12,
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    image: {
        width: '100%',
        height: 200,
        marginBottom: 12,
        borderRadius: 8,
    },
    noImageText: {
        textAlign: 'center',
        fontSize: 14,
        color: '#999',
        marginBottom: 12,
    },
    predictedDisease: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    confidence: {
        fontSize: 16,
        marginBottom: 4,
        color: '#555',
    },
    description: {
        fontSize: 16,
        marginBottom: 4,
        color: '#555',
    },
    remedies: {
        fontSize: 16,
        marginBottom: 4,
        color: '#555',
    },
    nextSteps: {
        fontSize: 16,
        color: '#555',
    },
})

export default History
