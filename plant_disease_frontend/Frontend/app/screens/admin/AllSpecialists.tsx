import AsyncStorage from '@react-native-async-storage/async-storage'
import React, { useEffect, useState } from 'react'
import { View, Text, Button, StyleSheet, FlatList, Alert } from 'react-native'

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
                    'https://majorproject-production-af32.up.railway.app/admin/specialists',
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
                `https://majorproject-production-af32.up.railway.app/admin/assign_labeling_task/${specialistEmail}`,
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
            <Text>All Specialists</Text>
            <FlatList
                data={specialists}
                keyExtractor={(item) => item.email}
                renderItem={({ item }) => (
                    <View style={styles.specialist}>
                        <Text>{item.username}</Text>
                        <Text>{item.email}</Text>
                        <Text>{item.status}</Text>
                        <Text>
                            {taskAssigned
                                ? 'Task assigned'
                                : 'No task assigned'}
                        </Text>
                        <Button
                            title='Assign Task'
                            disabled={taskAssigned}
                            onPress={() => handleAssignTask(item.email)}
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
    specialist: {
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
    },
})

export default AllSpecialists
