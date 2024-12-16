import { ImageBackground, StyleSheet, Text, View } from 'react-native'
import React from 'react'
// Import the image using require
import bg from '@/assets/images/bg1.jpg'
import AppNavigator from '../navigation/AppNavigator'

const App = () => {
    return (
        <View style={styles.container}>
            <ImageBackground
                source={bg}
                resizeMode='cover'
                style={styles.image}
            >
                <AppNavigator />
            </ImageBackground>
        </View>
    )
}

export default App

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column',
    },
    image: {
        width: '100%',
        height: '100%',
        flex: 1,
        resizeMode: 'cover',
        justifyContent: 'center',
    },
    text: {
        color: 'white',
        fontSize: 42,
        fontWeight: 'bold',
        textAlign: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
})
