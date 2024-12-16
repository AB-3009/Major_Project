import React, { useState } from 'react'
import {
    View,
    Text,
    Button,
    StyleSheet,
    Image,
    Alert,
    ActivityIndicator,
    TouchableOpacity,
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
                'https://majorproject-production-af32.up.railway.app/predict/predict',
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
            {/* <Button title='Pick an Image' onPress={handlePickImage} /> */}
            <TouchableOpacity
                onPress={handlePickImage}
                style={{
                    padding: 10,
                    backgroundColor: '#4CAF50',
                    borderRadius: 5,
                    marginTop: 16,
                }}
            >
                <Text style={{ color: 'white' }}>Pick an Image</Text>
            </TouchableOpacity>
            {image && (
                <Image
                    source={{ uri: image.uri }}
                    style={{ width: 150, height: 150, marginVertical: 16 }}
                />
            )}
            <Button title='Predict' onPress={handlePredict} />
            {isLoading && <ActivityIndicator size='large' color='#4CAF50' />}
            {prediction && (
                <View style={styles.result}>
                    <Text style={styles.resultText}>
                        Prediction: {prediction.label}
                    </Text>
                    <Text style={styles.resultText}>
                        Confidence: {(prediction.confidence * 100).toFixed(2)}%
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
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
    },
    header: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    result: {
        marginTop: 16,
        padding: 10,
        backgroundColor: '#f0f0f0',
        borderRadius: 5,
    },
    resultText: {
        fontSize: 16,
        marginBottom: 4,
    },
})

export default Predict
