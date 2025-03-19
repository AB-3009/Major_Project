import AsyncStorage from '@react-native-async-storage/async-storage'
import React, { useEffect, useState } from 'react'
import {
    View,
    Text,
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
                    'https://majorproject-production-ab17.up.railway.app/marketplace/all',
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
                `https://majorproject-production-ab17.up.railway.app/marketplace/product/${productId}`,
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
                `https://majorproject-production-ab17.up.railway.app/marketplace/purchase/${selectedProduct?._id}`,
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
            {/* <Text
                style={{
                    fontSize: 32,
                    fontWeight: 'bold',
                    textAlign: 'center',
                    position: 'absolute',
                    top: '85%',
                    left: '30%',
                }}
            >
                Coming Soon...
            </Text> */}
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
                                        'https://majorproject-production-ab17.up.railway.app/admin/preview/' +
                                        imageName,
                                }}
                                style={styles.productImage}
                            />
                            <View style={styles.productDetails}>
                                <Text style={styles.productName}>
                                    {item.name}
                                </Text>
                                <Text style={styles.productPrice}>
                                    {item.price} rs
                                </Text>
                            </View>
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
                                    'https://majorproject-production-ab17.up.railway.app/admin/preview/' +
                                    selectedProduct.image.replace(
                                        './product_images/',
                                        '',
                                    ),
                            }}
                            style={styles.modalImage}
                        />
                        <Text style={styles.modalTitle}>
                            {selectedProduct.name}
                        </Text>
                        <Text style={styles.modalDescription}>
                            {selectedProduct.description}
                        </Text>
                        <Text style={styles.modalPrice}>
                            ₹{selectedProduct.price}
                        </Text>
                        <Text style={styles.modalQuantity}>
                            Available: {selectedProduct.quantity}
                        </Text>
                        <TextInput
                            placeholder='Quantity'
                            value={quantity}
                            onChangeText={setQuantity}
                            style={styles.input}
                            keyboardType='numeric'
                        />
                        <Text style={styles.totalPrice}>
                            Total: ₹{Number(quantity) * selectedProduct.price}
                        </Text>
                        <TouchableOpacity
                            style={styles.purchaseButton}
                            onPress={handlePurchase}
                        >
                            <Text style={styles.purchaseButtonText}>
                                Purchase
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.closeButton}
                            onPress={() => setModalVisible(false)}
                        >
                            <Text style={styles.closeButtonText}>Close</Text>
                        </TouchableOpacity>
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
        // backgroundColor: '#f5f5f5',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 16,
        textAlign: 'center',
        marginTop: 25,
    },
    product: {
        flexDirection: 'row',
        padding: 16,
        backgroundColor: '#fff',
        marginBottom: 8,
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 2,
        alignItems: 'center',
    },
    productImage: {
        width: 100,
        height: 100,
        borderRadius: 8,
    },
    productDetails: {
        marginLeft: 16,
        flex: 1,
    },
    productName: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 4,
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
    modalImage: {
        width: 150,
        height: 150,
        borderRadius: 8,
        marginBottom: 16,
    },
    modalTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    modalDescription: {
        fontSize: 16,
        marginBottom: 16,
        textAlign: 'center',
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
        borderRadius: 5,
    },
    totalPrice: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    purchaseButton: {
        backgroundColor: '#28a745',
        padding: 12,
        borderRadius: 5,
        alignItems: 'center',
        marginBottom: 16,
        width: '100%',
    },
    purchaseButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    closeButton: {
        backgroundColor: '#dc3545',
        padding: 12,
        borderRadius: 5,
        alignItems: 'center',
        width: '100%',
    },
    closeButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
})

export default Marketplace
