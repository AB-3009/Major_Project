import AsyncStorage from '@react-native-async-storage/async-storage'
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
import DropDownPicker from 'react-native-dropdown-picker'

const UnknownImages = () => {
    const [images, setImages] = useState<string[]>([])
    const [selectedImages, setSelectedImages] = useState<string[]>([])
    const [disease, setDisease] = useState<string | null>(null)
    const [open, setOpen] = useState(false)
    const [diseaseOptions, setDiseaseOptions] = useState<
        Array<{ label: string; value: string }>
    >([])

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

    return (
        <View style={styles.container}>
            <Text>Unknown Images</Text>
            <FlatList
                data={images}
                keyExtractor={(item) => item}
                renderItem={({ item }) => (
                    <View style={styles.image}>
                        <Image
                            source={{
                                uri:
                                    'https://majorproject-production-af32.up.railway.app' +
                                    item,
                            }}
                            style={{ width: 100, height: 100 }}
                        />
                        <Text>{item}</Text>
                        <Button
                            title={
                                selectedImages.includes(item)
                                    ? 'Deselect'
                                    : 'Select'
                            }
                            onPress={() => {
                                setSelectedImages((prev) =>
                                    prev.includes(item)
                                        ? prev.filter((id) => id !== item)
                                        : [...prev, item],
                                )
                            }}
                        />
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
            <Button title='Label' onPress={handleLabel} />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
    image: {
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
    },
    dropdown: {
        marginVertical: 12,
        borderWidth: 1,
        borderColor: 'gray',
    },
    dropdownContainer: {
        borderColor: 'gray',
    },
})

export default UnknownImages
