import AsyncStorage from '@react-native-async-storage/async-storage'
import React, { useEffect, useState } from 'react'
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    FlatList,
    Alert,
} from 'react-native'

interface Request {
    _id: string
    username: string
    email: string
    role: string
    status: string
}

const UserRequests = () => {
    const [requests, setRequests] = useState<Request[]>([])

    useEffect(() => {
        // Fetch user requests from API
        const fetchRequests = async () => {
            try {
                const token = await AsyncStorage.getItem('token')
                const response = await fetch(
                    'https://majorproject-production-af32.up.railway.app/auth/pending-users',
                    {
                        headers: {
                            authorization: 'Bearer ' + token,
                        },
                    },
                )
                const data = await response.json()

                setRequests(data.pending_users)
            } catch (error) {
                Alert.alert('Error', 'Failed to fetch user requests')
            }
        }

        fetchRequests()
    }, [])

    const handleApprove = async ({
        userId,
        action,
    }: {
        userId: string
        action: string
    }) => {
        try {
            const token = await AsyncStorage.getItem('token')
            const response = await fetch(
                'https://majorproject-production-af32.up.railway.app/auth/approve-user',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        authorization: 'Bearer ' + token,
                    },
                    body: JSON.stringify({
                        user_id: userId,
                        action,
                    }),
                },
            )

            if (response.ok) {
                setRequests(
                    requests.filter((request) => request._id !== userId),
                )
                Alert.alert('Success', 'User approved')
            } else {
                Alert.alert('Error', 'Failed to approve user')
            }
        } catch (error) {
            Alert.alert('Error', 'Something went wrong')
        }
    }

    return (
        <View style={styles.container}>
            <Text style={styles.header}>User Requests</Text>

            <FlatList
                data={requests}
                keyExtractor={(item) => item._id.toString()}
                renderItem={({ item }) => (
                    <View style={styles.requestContainer}>
                        <Text style={styles.username}>{item.username}</Text>
                        <Text style={styles.email}>{item.email}</Text>
                        <Text style={styles.role}>{item.role}</Text>
                        <Text style={styles.status}>{item.status}</Text>
                        <View style={styles.buttonContainer}>
                            <TouchableOpacity
                                style={[styles.button, styles.approveButton]}
                                onPress={() =>
                                    handleApprove({
                                        userId: item._id,
                                        action: 'approve',
                                    })
                                }
                            >
                                <Text style={styles.buttonText}>Approve</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.button, styles.rejectButton]}
                                onPress={() =>
                                    handleApprove({
                                        userId: item._id,
                                        action: 'reject',
                                    })
                                }
                            >
                                <Text style={styles.buttonText}>Reject</Text>
                            </TouchableOpacity>
                        </View>
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
        // backgroundColor: '#f5f5f5',
    },
    header: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 16,
        textAlign: 'center',
        marginTop: 25,
    },
    requestContainer: {
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
    username: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    email: {
        fontSize: 16,
        color: '#666',
        marginBottom: 4,
    },
    role: {
        fontSize: 16,
        color: '#666',
        marginBottom: 4,
    },
    status: {
        fontSize: 16,
        color: '#666',
        marginBottom: 12,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    button: {
        flex: 1,
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 5,
        alignItems: 'center',
        marginHorizontal: 5,
    },
    approveButton: {
        backgroundColor: '#28a745',
    },
    rejectButton: {
        backgroundColor: '#dc3545',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
    },
})

export default UserRequests
