import React from 'react'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { NavigationProp } from '@react-navigation/native'
import Icon from 'react-native-vector-icons/MaterialIcons'
import ScreenWrapper from '@/components/ScreenWrapper'
import WelcomePage from '../screens/WelcomePage'
import AllProducts from '../screens/seller/AllProducts'
import AddProduct from '../screens/seller/AddProduct'
import LogoutButton from '../../components/LogoutButton'

const Tab = createBottomTabNavigator()

const SellerNavigator = ({
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
                    } else if (route.name === 'All Products') {
                        iconName = 'inventory'
                    } else if (route.name === 'Add Product') {
                        iconName = 'add-box'
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
                name='All Products'
                options={{
                    headerShown: false,
                }}
            >
                {(props) => (
                    <ScreenWrapper>
                        <AllProducts {...props} />
                    </ScreenWrapper>
                )}
            </Tab.Screen>
            <Tab.Screen
                name='Add Product'
                options={{
                    headerShown: false,
                }}
            >
                {(props) => (
                    <ScreenWrapper>
                        <AddProduct {...props} />
                    </ScreenWrapper>
                )}
            </Tab.Screen>
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

export default SellerNavigator
