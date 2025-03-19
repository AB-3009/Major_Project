import React from 'react'
import { ImageBackground, StyleSheet, View, ViewProps } from 'react-native'
import bg from '@/assets/images/bgTry.jpg'

interface ScreenWrapperProps extends ViewProps {
    children: React.ReactNode
}

const ScreenWrapper: React.FC<ScreenWrapperProps> = ({
    children,
    style,
    ...props
}) => {
    return (
        <View style={[styles.container, style]} {...props}>
            <ImageBackground
                source={bg}
                style={styles.image}
                resizeMode='cover'
            >
                {children}
            </ImageBackground>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    image: {
        flex: 1,
        justifyContent: 'center',
    },
})

export default ScreenWrapper
