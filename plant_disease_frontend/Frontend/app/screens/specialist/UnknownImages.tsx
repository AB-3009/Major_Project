import AsyncStorage from '@react-native-async-storage/async-storage'
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
import DropDownPicker from 'react-native-dropdown-picker'

const UnknownImages = () => {
    const [images, setImages] = useState<string[]>([])
    const [selectedImages, setSelectedImages] = useState<string[]>([])
    const [disease, setDisease] = useState<string | null>(null)
    const [open, setOpen] = useState(false)
    const [diseaseOptions, setDiseaseOptions] = useState<
        Array<{ label: string; value: string }>
    >([])
    const [classificationResult, setClassificationResult] = useState<any>(null)

    const diseases = [
        'Apple___Apple_scab',
        'Apple___Black_rot',
        'Apple___Cedar_apple_rust',
        'Apple___healthy',
        'Blueberry___healthy',
        'Cherry_(including_sour)___healthy',
        'Cherry_(including_sour)___Powdery_mildew',
        'Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot',
        'Corn_(maize)___Common_rust',
        'Corn_(maize)___healthy',
        'Corn_(maize)___Northern_Leaf_Blight',
        'Grape___Black_rot',
        'Grape___Esca_(Black_Measles)',
        'Grape___healthy',
        'Grape___Leaf_blight_(Isariopsis_Leaf_Spot)',
        'Orange___Haunglongbing_(Citrus_greening)',
        'Peach___Bacterial_spot',
        'Peach___healthy',
        'Pepper_bell___Bacterial_spot',
        'Pepper_bell___healthy',
        'Potato___Early_blight',
        'Potato___healthy',
        'Potato___Late_blight',
        'Raspberry___healthy',
        'Soybean___healthy',
        'Squash___Powdery_mildew',
        'Strawberry___healthy',
        'Strawberry___Leaf_scorch',
        'Tomato___Bacterial_spot',
        'Tomato___Early_blight',
        'Tomato___healthy',
        'Tomato___Late_blight',
        'Tomato___Leaf_Mold',
        'Tomato___Septoria_leaf_spot',
        'Tomato___Spider_mites Two-spotted_spider_mite',
        'Tomato___Target_Spot',
        'Tomato___Tomato_mosaic_virus',
        'Tomato___Tomato_Yellow_Leaf_Curl_Virus',
    ]

    useEffect(() => {
        // Fetch unknown images from API
        const fetchImages = async () => {
            try {
                const token = await AsyncStorage.getItem('token')
                const response = await fetch(
                    'https://majorproject-production-af32.up.railway.app/specialist/unknown_images',
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    },
                )
                const data = await response.json()
                setImages(data.images)
            } catch (error) {
                Alert.alert('Error', 'Failed to fetch images')
            }
        }

        // Populate dropdown options
        const options = diseases.map((disease) => ({
            label: disease.replace(/_/g, ' '), // Format label for readability
            value: disease,
        }))
        setDiseaseOptions(options)

        fetchImages()
    }, [])

    const handleLabel = async () => {
        if (!disease) {
            Alert.alert('Error', 'Please select a disease to label the images.')
            return
        }

        try {
            const token = await AsyncStorage.getItem('token')
            const response = await fetch(
                'https://majorproject-production-af32.up.railway.app/specialist/label_images',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({ images: selectedImages, disease }),
                },
            )

            if (response.ok) {
                setImages(
                    images.filter((image) => !selectedImages.includes(image)),
                )
                setSelectedImages([])
                setDisease(null) // Reset selected disease
                Alert.alert('Success', 'Images labeled')
            } else {
                Alert.alert('Error', 'Failed to label images')
            }
        } catch (error) {
            Alert.alert('Error', 'Something went wrong')
        }
    }

    const handleAskAI = async (image: string) => {
        try {
            const token = await AsyncStorage.getItem('token')
            const formData = new FormData()
            console.log('image: ', image)
            console.log('image.split: ', image.split('/').pop())
            const demoUri =
                'https://majorproject-production-af32.up.railway.app' + image
            console.log('demoUri: ', demoUri)
            formData.append('image', {
                uri:
                    'https://majorproject-production-af32.up.railway.app' +
                    image,
                name: image.split('/').pop(),
                type: 'image/jpeg',
            } as any)
            console.log('formData: ', formData)

            const response = await fetch(
                'https://majorproject-production-af32.up.railway.app/specialist/classify_disease',
                {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    body: formData,
                },
            )
            console.log('response: ', response)
            const data = await response.json()
            console.log('data: ', data)
            if (response.ok) {
                setClassificationResult(data)
                Alert.alert('AI Classification Result', JSON.stringify(data))
            } else {
                Alert.alert('Error', data.error || 'Classification failed')
            }
        } catch (error) {
            Alert.alert('Error', 'Something went wrong')
        }
    }

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Unknown Images</Text>
            <FlatList
                data={images}
                keyExtractor={(item) => item}
                renderItem={({ item }) => (
                    <View style={styles.imageContainer}>
                        <Image
                            source={{
                                uri:
                                    'https://majorproject-production-af32.up.railway.app' +
                                    item,
                            }}
                            style={styles.image}
                        />
                        <Text style={styles.imageText}>{item}</Text>
                        <TouchableOpacity
                            style={[
                                styles.button,
                                selectedImages.includes(item)
                                    ? styles.deselectButton
                                    : styles.selectButton,
                            ]}
                            onPress={() => {
                                setSelectedImages((prev) =>
                                    prev.includes(item)
                                        ? prev.filter((id) => id !== item)
                                        : [...prev, item],
                                )
                            }}
                        >
                            <Text style={styles.buttonText}>
                                {selectedImages.includes(item)
                                    ? 'Deselect'
                                    : 'Select'}
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.askAIButton}
                            onPress={() => handleAskAI(item)}
                        >
                            <Text style={styles.buttonText}>Ask AI</Text>
                        </TouchableOpacity>
                    </View>
                )}
            />
            <DropDownPicker
                open={open}
                value={disease}
                items={diseaseOptions}
                setOpen={setOpen}
                setValue={setDisease}
                setItems={setDiseaseOptions}
                placeholder='Select a disease'
                style={styles.dropdown}
                dropDownContainerStyle={styles.dropdownContainer}
            />
            <TouchableOpacity style={styles.labelButton} onPress={handleLabel}>
                <Text style={styles.labelButtonText}>Label</Text>
            </TouchableOpacity>
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
    imageContainer: {
        backgroundColor: '#fff',
        padding: 16,
        marginVertical: 8,
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
        alignItems: 'center',
    },
    image: {
        width: 100,
        height: 100,
        borderRadius: 8,
    },
    imageText: {
        fontSize: 14,
        color: '#333',
        marginVertical: 8,
    },
    button: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 5,
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: 5,
    },
    selectButton: {
        backgroundColor: '#007BFF',
    },
    deselectButton: {
        backgroundColor: '#dc3545',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
    },
    askAIButton: {
        backgroundColor: '#28a745',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 5,
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: 5,
    },
    dropdown: {
        marginVertical: 12,
        borderWidth: 1,
        borderColor: 'gray',
    },
    dropdownContainer: {
        borderColor: 'gray',
    },
    labelButton: {
        backgroundColor: '#28a745',
        paddingVertical: 12,
        paddingHorizontal: 32,
        borderRadius: 5,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 8,
        marginBottom: 40,
    },
    labelButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
})

export default UnknownImages
