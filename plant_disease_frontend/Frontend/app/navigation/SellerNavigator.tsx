import React from 'react'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import AllProducts from '../screens/seller/AllProducts'
import AddProduct from '../screens/seller/AddProduct'
import LogoutButton from '@/components/LogoutButton'

const Tab = createBottomTabNavigator()

import { NavigationProp } from '@react-navigation/native'

const SellerNavigator = ({
    navigation,
}: {
    navigation: NavigationProp<any>
}) => {
    return (
        <Tab.Navigator>
            <Tab.Screen name='All Products' component={AllProducts} />
            <Tab.Screen name='Add Product' component={AddProduct} />
            <Tab.Screen
                name='Logout'
                component={() => <LogoutButton navigation={navigation} />}
            />
        </Tab.Navigator>
    )
}

export default SellerNavigator
