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

interface Specialist {
    email: string
    status: string
    username: string
}

const AllSpecialists = () => {
    const [specialists, setSpecialists] = useState<Specialist[]>([])
    const [taskAssigned, setTaskAssigned] = useState(false)

    useEffect(() => {
        // Fetch all specialists from API
        const fetchSpecialists = async () => {
            try {
                const token = await AsyncStorage.getItem('token')
                const response = await fetch(
                    'https://major-project-dmdw.onrender.com/admin/specialists',
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    },
                )
                const data = await response.json()

                setSpecialists(data)
            } catch (error) {
                Alert.alert('Error', 'Failed to fetch specialists')
            }
        }

        fetchSpecialists()
    }, [])

    const handleAssignTask = async (specialistEmail: string) => {
        try {
            const token = await AsyncStorage.getItem('token')
            const response = await fetch(
                `https://major-project-dmdw.onrender.com/admin/assign_labeling_task/${specialistEmail}`,
                {
                    method: 'POST',
                    headers: {
                        authorization: 'Bearer ' + token,
                    },
                },
            )

            if (response.ok) {
                Alert.alert('Success', 'Task assigned')
                // Update the task status in the state
                setTaskAssigned(true)
            } else {
                Alert.alert('Error', 'Failed to assign task')
            }
        } catch (error) {
            Alert.alert('Error', 'Something went wrong')
        }
    }

    return (
        <View style={styles.container}>
            <Text style={styles.header}>All Specialists</Text>
            <FlatList
                data={specialists}
                keyExtractor={(item) => item.email}
                renderItem={({ item }) => (
                    <View style={styles.specialistContainer}>
                        <Text style={styles.username}>{item.username}</Text>
                        <Text style={styles.email}>{item.email}</Text>
                        <Text style={styles.status}>{item.status}</Text>
                        {item.status === 'Approved' ? (
                            <>
                                <Text
                                    style={[
                                        styles.taskStatus,
                                        taskAssigned
                                            ? { color: '#28a745' }
                                            : { color: '#dc3545' },
                                    ]}
                                >
                                    {taskAssigned
                                        ? 'Task assigned'
                                        : 'No task assigned'}
                                </Text>
                                <TouchableOpacity
                                    style={[
                                        styles.button,
                                        taskAssigned
                                            ? styles.disabledButton
                                            : styles.assignButton,
                                    ]}
                                    disabled={taskAssigned}
                                    onPress={() => handleAssignTask(item.email)}
                                >
                                    <Text style={styles.buttonText}>
                                        Assign Task
                                    </Text>
                                </TouchableOpacity>
                            </>
                        ) : (
                            <Text style={styles.taskStatus}>
                                User not Approved yet to assign task.
                            </Text>
                        )}
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
    specialistContainer: {
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
    status: {
        fontSize: 16,
        color: '#666',
        marginBottom: 4,
    },
    taskStatus: {
        fontSize: 16,
        marginBottom: 12,
    },
    button: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 5,
        alignItems: 'center',
    },
    assignButton: {
        backgroundColor: '#007BFF',
    },
    disabledButton: {
        backgroundColor: '#ccc',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
    },
})

export default AllSpecialists
