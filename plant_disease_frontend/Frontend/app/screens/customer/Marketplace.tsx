import AsyncStorage from '@react-native-async-storage/async-storage'
import React, { useEffect, useState } from 'react'
import {
    View,
    Text,
    Button,
    StyleSheet,
    FlatList,
    Alert,
    TouchableOpacity,
    Modal,
    TextInput,
    Image,
} from 'react-native'

type Product = {
    _id: string
    name: string
    image: string
    description: string
    price: number
    quantity: number
}

const Marketplace = () => {
    const [products, setProducts] = useState<Product[]>([])
    const [selectedProduct, setSelectedProduct] = useState<Product>()
    const [modalVisible, setModalVisible] = useState(false)
    const [quantity, setQuantity] = useState<string>('')

    useEffect(() => {
        // Fetch all sellers' products from API
        const fetchProducts = async () => {
            try {
                const token = await AsyncStorage.getItem('token')
                const response = await fetch(
                    'https://majorproject-production-af32.up.railway.app/marketplace/all',
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    },
                )
                const data = await response.json()
                setProducts(data.products)
            } catch (error) {
                Alert.alert('Error', 'Failed to fetch products')
            }
        }

        fetchProducts()
    }, [])

    const handleViewProduct = async (productId: string) => {
        try {
            const token = await AsyncStorage.getItem('token')
            const response = await fetch(
                `https://majorproject-production-af32.up.railway.app/marketplace/product/${productId}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                },
            )
            const data = await response.json()
            setSelectedProduct(data.product)
            setModalVisible(true)
        } catch (error) {
            Alert.alert('Error', 'Failed to fetch product details')
        }
    }

    const handlePurchase = async () => {
        try {
            const token = await AsyncStorage.getItem('token')
            const response = await fetch(
                `https://majorproject-production-af32.up.railway.app/marketplace/purchase/${selectedProduct?._id}`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({ quantity: Number(quantity) }),
                },
            )

            if (response.ok) {
                Alert.alert('Success', 'Product purchased successfully')
                setModalVisible(false)
                setQuantity('')
            } else {
                Alert.alert('Error', 'Failed to purchase product')
            }
        } catch (error) {
            Alert.alert('Error', 'Something went wrong')
        }
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Marketplace</Text>
            <FlatList
                data={products}
                keyExtractor={(item) => item._id.toString()}
                renderItem={({ item }) => {
                    const imageName = item.image.replace(
                        './product_images/',
                        '',
                    )
                    return (
                        <TouchableOpacity
                            style={styles.product}
                            onPress={() => handleViewProduct(item._id)}
                        >
                            <Image
                                source={{
                                    uri:
                                        'https://majorproject-production-af32.up.railway.app/admin/preview/' +
                                        imageName,
                                }}
                                style={{ width: 100, height: 100 }}
                            />
                            <Text style={styles.productName}>{item.name}</Text>
                            <Text style={styles.productPrice}>
                                {item.price} rs
                            </Text>
                        </TouchableOpacity>
                    )
                }}
            />
            {selectedProduct && (
                <Modal
                    animationType='slide'
                    transparent={true}
                    visible={modalVisible}
                    onRequestClose={() => {
                        setModalVisible(!modalVisible)
                    }}
                >
                    <View style={styles.modalView}>
                        <Image
                            source={{
                                uri:
                                    'https://majorproject-production-af32.up.railway.app/admin/preview/' +
                                    selectedProduct.image.replace(
                                        './product_images/',
                                        '',
                                    ),
                            }}
                            style={{ width: 100, height: 100 }}
                        />
                        <Text style={styles.modalTitle}>
                            {selectedProduct.name}
                        </Text>
                        <Text style={styles.modalDescription}>
                            {selectedProduct.description}
                        </Text>
                        <Text style={styles.modalPrice}>
                            ${selectedProduct.price}
                        </Text>
                        <Text style={styles.modalQuantity}>
                            {selectedProduct.quantity}
                        </Text>
                        <TextInput
                            placeholder='Quantity'
                            value={quantity}
                            onChangeText={setQuantity}
                            style={styles.input}
                            keyboardType='numeric'
                        />
                        <Button title='Purchase' onPress={handlePurchase} />
                        <Button
                            title='Close'
                            onPress={() => setModalVisible(false)}
                        />
                    </View>
                </Modal>
            )}
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#f5f5f5',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    product: {
        padding: 16,
        backgroundColor: '#fff',
        marginBottom: 8,
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 2,
    },
    productName: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    productPrice: {
        fontSize: 16,
        color: '#888',
    },
    modalView: {
        margin: 20,
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 35,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    modalTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    modalDescription: {
        fontSize: 16,
        marginBottom: 16,
    },
    modalPrice: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    modalQuantity: {
        fontSize: 16,
        marginBottom: 16,
    },
    input: {
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        marginBottom: 12,
        paddingHorizontal: 8,
        width: '100%',
    },
})

export default Marketplace
