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
                `https://majorproject-production-af32.up.railway.app/admin/delete_product/${productId}`,
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
            <Text>Products for {seller.username}</Text>
            <FlatList
                data={products}
                keyExtractor={(item) => item.product_id}
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
                            <Text>Image Name: {imageName}</Text>
                            <Text>Price: {item.price}</Text>
                            <Text>Description: {item.description}</Text>
                            <Text>Quantity: {item.quantity}</Text>
                            <Button
                                title='Delete Product'
                                onPress={() =>
                                    handleDeleteProduct(item.product_id)
                                }
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
    product: {
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
    },
})

export default SellerDetails
