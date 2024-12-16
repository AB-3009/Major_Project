import React, { useEffect, useState } from 'react'
import {
    View,
    Text,
    Button,
    StyleSheet,
    FlatList,
    Alert,
    Image,
} from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useFocusEffect } from '@react-navigation/native'

interface Product {
    _id: string
    description: string
    image: string
    name: string
    price: string
    quantity: string
    seller_id: string
}

const AllProducts = ({ navigation }: { navigation: any }) => {
    const [products, setProducts] = useState<Product[]>([])

    // Fetch products from the API
    const fetchProducts = async () => {
        try {
            const token = await AsyncStorage.getItem('token')
            const response = await fetch(
                'https://majorproject-production-af32.up.railway.app/marketplace/my-products',
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                },
            )
            const data = await response.json()
            setProducts(data.products || [])
        } catch (error) {
            Alert.alert('Error', 'Failed to fetch products')
        }
    }

    // Use useFocusEffect to reload the product list when the screen is focused
    useFocusEffect(
        React.useCallback(() => {
            fetchProducts()
        }, []),
    )

    const handleDeleteProduct = async (productId: string) => {
        try {
            const token = await AsyncStorage.getItem('token')
            const response = await fetch(
                `https://majorproject-production-af32.up.railway.app/marketplace/delete/${productId}`,
                {
                    method: 'DELETE',
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                },
            )

            if (response.ok) {
                setProducts(
                    products.filter((product) => product._id !== productId),
                )
                Alert.alert('Success', 'Product deleted')
            } else {
                Alert.alert('Error', 'Failed to delete product')
            }
        } catch (error) {
            Alert.alert('Error', 'Something went wrong')
        }
    }

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Your Products</Text>
            <FlatList
                data={products}
                keyExtractor={(item) => item._id}
                renderItem={({ item }) => {
                    // Extract the image name
                    const imageName = item.image.split('/').pop()
                    return (
                        <View style={styles.product}>
                            <Image
                                source={{
                                    uri:
                                        'https://majorproject-production-af32.up.railway.app/admin/preview/' +
                                        imageName,
                                }}
                                style={{ width: 100, height: 100 }}
                            />
                            <Text>{item.name}</Text>
                            <Text>{item.description}</Text>
                            <Text>{item.price}</Text>
                            <Text>{item.quantity}</Text>
                            <Button
                                title='Update'
                                onPress={() =>
                                    navigation.navigate('Add Product', {
                                        product: item,
                                    })
                                }
                            />
                            <Button
                                title='Delete'
                                color='red'
                                onPress={() => handleDeleteProduct(item._id)}
                            />
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
    },
    header: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    product: {
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
    },
})

export default AllProducts
