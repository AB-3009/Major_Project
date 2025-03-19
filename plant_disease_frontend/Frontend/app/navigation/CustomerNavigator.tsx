import React from 'react'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { NavigationProp } from '@react-navigation/native'
import Icon from 'react-native-vector-icons/MaterialIcons'
import ScreenWrapper from '@/components/ScreenWrapper'
import WelcomePage from '../screens/WelcomePage'
import Feedback from '../screens/customer/Feedback'
import History from '../screens/customer/History'
import Predict from '../screens/customer/Predict'
import LiveDetection from '../screens/customer/LiveDetection'
import Marketplace from '../screens/customer/Marketplace'
import LogoutButton from '@/components/LogoutButton'

const Tab = createBottomTabNavigator()

const CustomerNavigator = ({
    navigation,
}: {
    navigation: NavigationProp<any>
}) => {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                tabBarIcon: ({ color, size }) => {
                    let iconName = ''

                    if (route.name === 'Welcome') {
                        iconName = 'home'
                    } else if (route.name === 'Feedback') {
                        iconName = 'feedback'
                    } else if (route.name === 'History') {
                        iconName = 'history'
                    } else if (route.name === 'Predict') {
                        iconName = 'search'
                    } else if (route.name === 'Live Detection') {
                        iconName = 'camera'
                    } else if (route.name === 'Marketplace') {
                        iconName = 'store'
                    } else if (route.name === 'Logout') {
                        iconName = 'logout'
                    }

                    return <Icon name={iconName} size={size} color={color} />
                },
                tabBarActiveTintColor: '#007BFF',
                tabBarInactiveTintColor: 'black',
                tabBarStyle: {
                    backgroundColor: 'rgb(136, 236, 136)', // Cream color
                    borderTopWidth: 0,
                    elevation: 0,
                    position: 'absolute',
                },
            })}
        >
            <Tab.Screen
                name='Welcome'
                component={() => (
                    <ScreenWrapper>
                        <WelcomePage />
                    </ScreenWrapper>
                )}
                options={{
                    headerShown: false,
                }}
            />
            <Tab.Screen
                name='Feedback'
                component={() => (
                    <ScreenWrapper>
                        <Feedback />
                    </ScreenWrapper>
                )}
                options={{
                    headerShown: false,
                }}
            />
            <Tab.Screen
                name='History'
                component={() => (
                    <ScreenWrapper>
                        <History />
                    </ScreenWrapper>
                )}
                options={{
                    headerShown: false,
                }}
            />
            <Tab.Screen
                name='Predict'
                component={() => (
                    <ScreenWrapper>
                        <Predict />
                    </ScreenWrapper>
                )}
                options={{
                    headerShown: false,
                }}
            />
            <Tab.Screen
                name='Live Detection'
                component={() => (
                    <ScreenWrapper>
                        <LiveDetection />
                    </ScreenWrapper>
                )}
                options={{
                    headerShown: false,
                }}
            />
            <Tab.Screen
                name='Marketplace'
                component={() => (
                    <ScreenWrapper>
                        <Marketplace />
                    </ScreenWrapper>
                )}
                options={{
                    headerShown: false,
                }}
            />
            <Tab.Screen
                name='Logout'
                component={() => (
                    <ScreenWrapper>
                        <LogoutButton navigation={navigation} />
                    </ScreenWrapper>
                )}
                options={{
                    headerShown: false,
                }}
            />
        </Tab.Navigator>
    )
}

export default CustomerNavigator
