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
import { RouteProp, useRoute } from '@react-navigation/native'

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

const SellerDetails = () => {
    const route = useRoute<RouteProp<any, 'SellerDetails'>>()
    const { seller } = route.params as { seller: Seller }
    const [products, setProducts] = useState<Product[]>(seller.products)

    const handleDeleteProduct = async (productId: string) => {
        try {
            const token = await AsyncStorage.getItem('token')
            const response = await fetch(
                `https://majorproject-production-ab17.up.railway.app/admin/delete_product/${productId}`,
                {
                    method: 'DELETE',
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                },
            )

            if (response.ok) {
                setProducts(
                    products.filter(
                        (product) => product.product_id !== productId,
                    ),
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
            <Text style={styles.header}>Products for {seller.username}</Text>
            <FlatList
                data={products}
                keyExtractor={(item) => item.product_id}
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
                                {/* <Text style={styles.productText}>
                                    Image Name: {imageName}
                                </Text> */}
                                <Text style={styles.productText}>
                                    Price: {item.price}
                                </Text>
                                <Text style={styles.productText}>
                                    Description: {item.description}
                                </Text>
                                <Text style={styles.productText}>
                                    Quantity: {item.quantity}
                                </Text>
                                <TouchableOpacity
                                    style={styles.deleteButton}
                                    onPress={() =>
                                        handleDeleteProduct(item.product_id)
                                    }
                                >
                                    <Text style={styles.buttonText}>
                                        Delete Product
                                    </Text>
                                </TouchableOpacity>
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
    productText: {
        fontSize: 16,
        color: '#666',
        marginBottom: 4,
    },
    deleteButton: {
        marginTop: 8,
        paddingVertical: 10,
        paddingHorizontal: 20,
        backgroundColor: '#dc3545',
        borderRadius: 5,
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
    },
})

export default SellerDetails
