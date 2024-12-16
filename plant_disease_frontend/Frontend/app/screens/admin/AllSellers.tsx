import React, { useEffect, useState } from 'react'
import { View, Text, Button, StyleSheet, FlatList, Alert } from 'react-native'
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
                    'https://majorproject-production-af32.up.railway.app/admin/sellers',
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
                `https://majorproject-production-af32.up.railway.app/admin/delete_seller/${sellerEmail}`,
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
            <Text>All Sellers</Text>
            <FlatList
                data={sellers}
                keyExtractor={(item) => item.email}
                renderItem={({ item }) => (
                    <View style={styles.seller}>
                        <Text>{item.username}</Text>
                        <Text>{item.email}</Text>
                        <Button
                            title='View More'
                            onPress={() =>
                                navigation.navigate('SellerDetails', {
                                    seller: item,
                                })
                            }
                        />
                        <Button
                            title='Delete'
                            onPress={() => handleDeleteSeller(item.email)}
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
    seller: {
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
    },
})

export default AllSellers
