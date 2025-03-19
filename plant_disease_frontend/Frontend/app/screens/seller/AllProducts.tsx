import React, { useEffect, useState } from 'react'
import {
    View,
    Text,
    TouchableOpacity,
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
                'https://majorproject-production-ab17.up.railway.app/marketplace/my-products',
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
                `https://majorproject-production-ab17.up.railway.app/marketplace/delete/${productId}`,
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
                        <View style={styles.productContainer}>
                            <Image
                                source={{
                                    uri:
                                        'https://majorproject-production-ab17.up.railway.app/admin/preview/' +
                                        imageName,
                                }}
                                style={styles.productImage}
                            />
                            <View style={styles.productDetails}>
                                <Text style={styles.productName}>
                                    {item.name}
                                </Text>
                                <Text style={styles.productDescription}>
                                    {item.description}
                                </Text>
                                <Text style={styles.productPrice}>
                                    Price: {item.price}
                                </Text>
                                <Text style={styles.productQuantity}>
                                    Quantity: {item.quantity}
                                </Text>
                                <View style={styles.buttonContainer}>
                                    <TouchableOpacity
                                        style={styles.updateButton}
                                        onPress={() => {
                                            navigation.navigate('Add Product', {
                                                product: item,
                                            })
                                        }}
                                    >
                                        <Text style={styles.buttonText}>
                                            Update
                                        </Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={styles.deleteButton}
                                        onPress={() =>
                                            handleDeleteProduct(item._id)
                                        }
                                    >
                                        <Text style={styles.buttonText}>
                                            Delete
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
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
    productContainer: {
        flexDirection: 'row',
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
    productImage: {
        width: 100,
        height: 100,
        borderRadius: 8,
    },
    productDetails: {
        flex: 1,
        marginLeft: 16,
    },
    productName: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    productDescription: {
        fontSize: 16,
        color: '#666',
        marginBottom: 4,
    },
    productPrice: {
        fontSize: 16,
        color: '#333',
        marginBottom: 4,
    },
    productQuantity: {
        fontSize: 16,
        color: '#333',
        marginBottom: 12,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    updateButton: {
        backgroundColor: '#007BFF',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 5,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 8,
    },
    deleteButton: {
        backgroundColor: '#dc3545',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 5,
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
    },
})

export default AllProducts
