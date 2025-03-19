import React, { useState } from 'react'
import {
    View,
    Text,
    StyleSheet,
    Image,
    Alert,
    ActivityIndicator,
    TouchableOpacity,
    ScrollView,
} from 'react-native'
import * as ImagePicker from 'expo-image-picker'
import * as FileSystem from 'expo-file-system'
import AsyncStorage from '@react-native-async-storage/async-storage'

type PredictItem = {
    image_path: string
    label: string
    confidence: number
    description: string
    remedies: string[]
    next_steps: string[]
}

const Predict = () => {
    const [image, setImage] = useState<{
        uri: string
        name: string
        type: string
        data: string
    } | null>(null)
    const [prediction, setPrediction] = useState<PredictItem>()
    const [isLoading, setIsLoading] = useState(false)

    // Pick an image from the library
    const handlePickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        })

        if (!result.canceled) {
            const { uri } = result.assets[0]

            // Read the file as base64 to embed in the form
            const fileInfo = await FileSystem.readAsStringAsync(uri, {
                encoding: FileSystem.EncodingType.Base64,
            })

            const fileName = uri.split('/').pop()
            const fileType = uri.split('.').pop()

            // Store file details in state
            setImage({
                uri: uri,
                name: fileName || '',
                type: `image/${fileType}`,
                data: fileInfo, // Base64 encoded image data
            })
        }
    }

    // Handle prediction API call
    const handlePredict = async () => {
        if (!image) {
            Alert.alert('Error', 'Please select an image first')
            return
        }

        setIsLoading(true)
        try {
            const formData = new FormData()
            formData.append('image', {
                uri: image.uri,
                name: image.name,
                type: image.type,
                data: image.data,
            } as any)

            const token = await AsyncStorage.getItem('token')
            const response = await fetch(
                'https://majorproject-production-ab17.up.railway.app/predict/predict',
                {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    body: formData,
                },
            )

            const data = await response.json()

            if (response.ok) {
                setPrediction(data)
            } else {
                Alert.alert('Error', data.message || 'Prediction failed')
            }
        } catch (error) {
            Alert.alert('Error', 'Something went wrong')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Predict</Text>
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
            <ScrollView contentContainerStyle={{ alignItems: 'center' }}>
                <TouchableOpacity
                    onPress={handlePickImage}
                    style={styles.pickImageButton}
                >
                    <Text style={styles.pickImageButtonText}>
                        Pick an Image
                    </Text>
                </TouchableOpacity>
                {image && (
                    <Image source={{ uri: image.uri }} style={styles.image} />
                )}
                <TouchableOpacity
                    onPress={handlePredict}
                    style={styles.predictButton}
                >
                    <Text style={styles.predictButtonText}>Predict</Text>
                </TouchableOpacity>
                {isLoading && (
                    <ActivityIndicator size='large' color='#4CAF50' />
                )}
                {prediction && (
                    <View style={styles.result}>
                        <Text style={styles.resultText}>
                            Prediction: {prediction.label}
                        </Text>
                        <Text style={styles.resultText}>
                            Confidence:{' '}
                            {(prediction.confidence * 100).toFixed(2)}%
                        </Text>
                        <Text style={styles.resultText}>
                            Description: {prediction.description}
                        </Text>
                        <Text style={styles.resultText}>
                            Remedies:{' '}
                            {prediction.remedies?.join(', ') ||
                                'No remedies provided.'}
                        </Text>
                        <Text style={styles.resultText}>
                            Next Steps:{' '}
                            {prediction.next_steps?.join(', ') ||
                                'No next steps provided.'}
                        </Text>
                    </View>
                )}
            </ScrollView>
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
        marginTop: '10%',
    },
    pickImageButton: {
        backgroundColor: 'rgba(0, 123, 255, 0.5)',
        paddingVertical: 15,
        borderRadius: 5,
        alignItems: 'center',
        marginTop: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 60,
        borderColor: 'rgba(255, 255, 255, 0.5)', // Semi-transparent border
        borderWidth: 1,
        backdropFilter: 'blur(10px)', // Blur effect
        width: '50%',
        alignSelf: 'center',
    },
    pickImageButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    image: {
        width: 150,
        height: 150,
        marginVertical: 16,
        borderRadius: 8,
    },
    predictButton: {
        backgroundColor: 'rgba(40, 167, 69, 0.5)',
        paddingVertical: 15,
        borderRadius: 5,
        alignItems: 'center',
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 60,
        borderColor: 'rgba(255, 255, 255, 0.5)', // Semi-transparent border
        borderWidth: 1,
        backdropFilter: 'blur(10px)', // Blur effect
        width: '50%',
        alignSelf: 'center',
    },
    predictButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    result: {
        marginTop: 16,
        padding: 16,
        backgroundColor: '#fff',
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
        width: '100%',
        marginBottom: 46,
    },
    resultText: {
        fontSize: 16,
        marginBottom: 4,
        color: '#333',
    },
})

export default Predict
