import {
    CameraView,
    CameraType,
    useCameraPermissions,
    Camera,
} from 'expo-camera'
import { useState, useRef } from 'react'
import { Button, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import * as FileSystem from 'expo-file-system'
import AsyncStorage from '@react-native-async-storage/async-storage'

export default function LiveDetection() {
    const [facing, setFacing] = useState<CameraType>('back')
    const [permission, requestPermission] = useCameraPermissions()
    const [isCameraActive, setIsCameraActive] = useState(false)
    const [result, setResult] = useState<{
        class: string
        confidence: number
    } | null>(null)
    const cameraRef = useRef<any>(null)

    if (!permission) {
        // Camera permissions are still loading.
        return <View />
    }

    if (!permission.granted) {
        // Camera permissions are not granted yet.
        return (
            <View style={styles.container}>
                {/* <Text
                    style={{
                        fontSize: 32,
                        fontWeight: 'bold',
                        textAlign: 'center',
                        position: 'absolute',
                        top: '50%',
                        left: '30%',
                    }}
                >
                    Coming Soon...
                </Text> */}
                <Text style={styles.message}>
                    We need your permission to show the camera
                </Text>
                <Button onPress={requestPermission} title='grant permission' />
            </View>
        )
    }

    function toggleCameraFacing() {
        setFacing((current) => (current === 'back' ? 'front' : 'back'))
    }

    function startCamera() {
        setIsCameraActive(true)
    }

    function stopCamera() {
        setIsCameraActive(false)
    }

    const captureAndProcessFrame = async () => {
        if (cameraRef.current) {
            try {
                const photo = await cameraRef.current.takePictureAsync({
                    base64: true,
                })

                const token = await AsyncStorage.getItem('token')
                console.log('Captured photo:', photo)

                const response = await fetch(
                    'https://major-project-dmdw.onrender.com/predict/process_frame',
                    {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${token}`,
                        },
                        body: JSON.stringify({
                            frame: `data:image/jpeg;base64,${photo.base64}`,
                        }),
                    },
                )
                // console.log('Response:', response)

                const data = await response.json()
                console.log('Data:', data)
                setResult(data)
            } catch (error) {
                console.error('Error capturing or processing frame:', error)
            }
        }
    }

    return (
        <View style={styles.container}>
            {isCameraActive && (
                <CameraView
                    style={styles.camera}
                    facing={facing}
                    ref={cameraRef}
                >
                    <View style={styles.cameraButtonContainer}>
                        <TouchableOpacity
                            style={styles.cameraButton}
                            onPress={toggleCameraFacing}
                        >
                            <Text style={styles.cameraButtonText}>
                                Flip Camera
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.cameraButton}
                            onPress={captureAndProcessFrame}
                        >
                            <Text style={styles.cameraButtonText}>Capture</Text>
                        </TouchableOpacity>
                    </View>
                    {result && (
                        <View style={styles.resultContainer}>
                            <Text style={styles.resultText}>
                                Predicted Class: {result.class}
                            </Text>
                            <Text style={styles.resultText}>
                                Confidence:{' '}
                                {(result.confidence * 100).toFixed(2)}%
                            </Text>
                        </View>
                    )}
                </CameraView>
            )}

            <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.button} onPress={startCamera}>
                    <Text style={styles.buttonText}>Start Camera</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.button} onPress={stopCamera}>
                    <Text style={styles.buttonText}>Stop Camera</Text>
                </TouchableOpacity>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
        // backgroundColor: '#f5f5f5',
    },
    message: {
        textAlign: 'center',
        paddingBottom: 10,
        fontSize: 16,
        color: '#333',
    },
    camera: {
        flex: 1,
        width: '100%',
        justifyContent: 'flex-end',
    },
    cameraButtonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 20,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    cameraButton: {
        padding: 10,
        backgroundColor: '#007AFF',
        borderRadius: 5,
        marginHorizontal: 10,
    },
    cameraButtonText: {
        color: 'white',
        fontWeight: 'bold',
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20,
        marginBottom: 40,
    },
    button: {
        padding: 12,
        backgroundColor: '#007AFF',
        borderRadius: 5,
        marginHorizontal: 10,
        alignItems: 'center',
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
    resultContainer: {
        padding: 20,
        // backgroundColor: '#fff',
        borderRadius: 10,
        marginTop: 20,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
        width: '100%',
    },
    resultText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#eee',
    },
})
