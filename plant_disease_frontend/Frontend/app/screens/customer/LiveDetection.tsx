import React, { useState, useEffect } from 'react'
import { View, Text, StyleSheet, Alert } from 'react-native'
import { RNCamera } from 'react-native-camera'

const LiveDetection = () => {
    const [detectionResult, setDetectionResult] = useState(null)

    const handleDetect = async (imageUri) => {
        try {
            // Replace with your API call for detection
            const response = await fetch('https://your-api-url.com/detect', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ imageUri }),
            })

            const data = await response.json()

            if (response.ok) {
                setDetectionResult(data)
            } else {
                Alert.alert('Error', data.message)
            }
        } catch (error) {
            Alert.alert('Error', 'Something went wrong')
        }
    }

    const handleCapture = async (camera) => {
        try {
            const options = { quality: 0.5, base64: true }
            const data = await camera.takePictureAsync(options)
            handleDetect(data.uri)
        } catch (error) {
            Alert.alert('Error', 'Failed to capture image')
        }
    }

    return (
        <View style={styles.container}>
            <RNCamera
                style={styles.preview}
                type={RNCamera.Constants.Type.back}
                flashMode={RNCamera.Constants.FlashMode.on}
                captureAudio={false}
            >
                {({ camera, status }) => {
                    if (status !== 'READY') return <Text>Loading...</Text>
                    return (
                        <View style={styles.captureContainer}>
                            <Text
                                style={styles.capture}
                                onPress={() => handleCapture(camera)}
                            >
                                CAPTURE
                            </Text>
                        </View>
                    )
                }}
            </RNCamera>
            {detectionResult && (
                <View style={styles.resultContainer}>
                    <Text style={styles.resultText}>
                        Disease: {detectionResult.disease}
                    </Text>
                    <Text style={styles.resultText}>
                        Confidence: {detectionResult.confidence}
                    </Text>
                </View>
            )}
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column',
        backgroundColor: 'black',
    },
    preview: {
        flex: 1,
        justifyContent: 'flex-end',
        alignItems: 'center',
    },
    captureContainer: {
        flex: 0,
        flexDirection: 'row',
        justifyContent: 'center',
    },
    capture: {
        flex: 0,
        backgroundColor: '#fff',
        borderRadius: 5,
        padding: 15,
        paddingHorizontal: 20,
        alignSelf: 'center',
        margin: 20,
    },
    resultContainer: {
        padding: 20,
        backgroundColor: '#fff',
    },
    resultText: {
        fontSize: 18,
        color: '#000',
    },
})

export default LiveDetection
