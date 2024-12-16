import AsyncStorage from '@react-native-async-storage/async-storage'
import React, { useEffect, useState } from 'react'
import { View, Text, Button, StyleSheet, FlatList, Alert } from 'react-native'

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
            <Text>User Requests</Text>

            <FlatList
                data={requests}
                keyExtractor={(item) => item._id.toString()}
                renderItem={({ item }) => (
                    <View style={styles.request}>
                        <Text>username: {item.username}</Text>
                        <Text>email: {item.email}</Text>
                        <Text>role: {item.role}</Text>
                        <Text>status: {item.status}</Text>
                        <Button
                            title='Approve'
                            onPress={() =>
                                handleApprove({
                                    userId: item._id,
                                    action: 'approve',
                                })
                            }
                        />
                        <Button
                            title='Reject'
                            onPress={() =>
                                handleApprove({
                                    userId: item._id,
                                    action: 'reject',
                                })
                            }
                        />
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
    request: {
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
    },
})

export default UserRequests
