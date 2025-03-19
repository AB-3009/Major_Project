import React, { useEffect, useState } from 'react'
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    FlatList,
    Alert,
} from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useNavigation } from '@react-navigation/native'

interface Product {
    description: string
    image: string
    name: string
    price: string
    product_id: string
    quantity: string
}

interface Seller {
    username: string
    email: string
    products: Product[]
}

const AllSellers = ({ navigation }: { navigation: any }) => {
    const [sellers, setSellers] = useState<Seller[]>([])

    useEffect(() => {
        const fetchSellers = async () => {
            try {
                const token = await AsyncStorage.getItem('token')
                const response = await fetch(
                    'https://major-project-dmdw.onrender.com/admin/sellers',
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    },
                )
                const data = await response.json()
                setSellers(data)
            } catch (error) {
                Alert.alert('Error', 'Failed to fetch sellers')
            }
        }

        fetchSellers()
    }, [])

    const handleDeleteSeller = async (sellerEmail: string) => {
        try {
            const token = await AsyncStorage.getItem('token')
            const response = await fetch(
                `https://major-project-dmdw.onrender.com/admin/delete_seller/${sellerEmail}`,
                {
                    method: 'DELETE',
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                },
            )

            if (response.ok) {
                setSellers(
                    sellers.filter((seller) => seller.email !== sellerEmail),
                )
                Alert.alert('Success', 'Seller deleted')
            } else {
                Alert.alert('Error', 'Failed to delete seller')
            }
        } catch (error) {
            Alert.alert('Error', 'Something went wrong')
        }
    }

    return (
        <View style={styles.container}>
            <Text style={styles.header}>All Sellers</Text>
            <FlatList
                data={sellers}
                keyExtractor={(item) => item.email}
                renderItem={({ item }) => (
                    <View style={styles.sellerContainer}>
                        <Text style={styles.username}>{item.username}</Text>
                        <Text style={styles.email}>{item.email}</Text>
                        <View style={styles.buttonContainer}>
                            <TouchableOpacity
                                style={[styles.button, styles.viewButton]}
                                onPress={() =>
                                    navigation.navigate('SellerDetails', {
                                        seller: item,
                                    })
                                }
                            >
                                <Text style={styles.buttonText}>View More</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.button, styles.deleteButton]}
                                onPress={() => handleDeleteSeller(item.email)}
                            >
                                <Text style={styles.buttonText}>Delete</Text>
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
    sellerContainer: {
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
    viewButton: {
        backgroundColor: '#007BFF',
    },
    deleteButton: {
        backgroundColor: '#dc3545',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
    },
})

export default AllSellers
