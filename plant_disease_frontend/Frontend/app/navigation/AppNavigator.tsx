import React, { useEffect, useState } from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createStackNavigator } from '@react-navigation/stack'
import LoginPage from '../screens/LoginPage'
import RegistrationPage from '../screens/RegistrationPage'
import AdminNavigator from './AdminNavigator'
import SpecialistNavigator from './SpecialistNavigator'
import SellerNavigator from './SellerNavigator'
import CustomerNavigator from './CustomerNavigator'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { ActivityIndicator, View } from 'react-native'
import ScreenWrapper from '../../components/ScreenWrapper'

const Stack = createStackNavigator()

const AppNavigator = () => {
    const [initialRoute, setInitialRoute] = useState('Login') // Default route
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const checkAuth = async () => {
            try {
                // Retrieve the token and role from storage
                const token = await AsyncStorage.getItem('token')
                const role = await AsyncStorage.getItem('role')

                // Set the initial route based on the token and role
                if (token) {
                    switch (role) {
                        case 'admin':
                            setInitialRoute('Admin')
                            break
                        case 'specialist':
                            setInitialRoute('Specialist')
                            break
                        case 'seller':
                            setInitialRoute('Seller')
                            break
                        case 'customer':
                            setInitialRoute('Customer')
                            break
                        default:
                            setInitialRoute('Login')
                            break
                    }
                }
            } catch (error) {
                console.error('Error checking authentication:', error)
                setInitialRoute('Login')
            } finally {
                setIsLoading(false) // Stop loading
            }
        }

        checkAuth()
    }, [])

    // Show a loader while checking authentication
    if (isLoading) {
        return (
            <View
                style={{
                    flex: 1,
                    justifyContent: 'center',
                    alignItems: 'center',
                }}
            >
                <ActivityIndicator size='large' color='#0000ff' />
            </View>
        )
    }

    return (
        // <NavigationContainer>
        <Stack.Navigator initialRouteName={initialRoute}>
            <Stack.Screen name='Login' options={{ headerShown: false }}>
                {(props) => (
                    <ScreenWrapper>
                        <LoginPage {...props} />
                    </ScreenWrapper>
                )}
            </Stack.Screen>
            <Stack.Screen name='Register' options={{ headerShown: false }}>
                {(props) => (
                    <ScreenWrapper>
                        <RegistrationPage {...props} />
                    </ScreenWrapper>
                )}
            </Stack.Screen>
            <Stack.Screen
                name='Admin'
                component={AdminNavigator}
                options={{
                    headerShown: false,
                }}
            />
            <Stack.Screen
                name='Specialist'
                component={SpecialistNavigator}
                options={{
                    headerShown: false,
                }}
            />
            <Stack.Screen
                name='Seller'
                component={SellerNavigator}
                options={{
                    headerShown: false,
                }}
            />
            <Stack.Screen
                name='Customer'
                component={CustomerNavigator}
                options={{
                    headerShown: false,
                }}
            />
        </Stack.Navigator>
        // </NavigationContainer>
    )
}

export default AppNavigator
