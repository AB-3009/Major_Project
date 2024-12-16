import React from 'react'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import Feedback from '../screens/customer/Feedback'
import History from '../screens/customer/History'
import Predict from '../screens/customer/Predict'
// import LiveDetection from '../screens/customer/LiveDetection'
import Marketplace from '../screens/customer/Marketplace'
import LogoutButton from '@/components/LogoutButton'

const Tab = createBottomTabNavigator()

import { NavigationProp } from '@react-navigation/native'

const CustomerNavigator = ({
    navigation,
}: {
    navigation: NavigationProp<any>
}) => {
    return (
        <Tab.Navigator>
            <Tab.Screen name='Feedback' component={Feedback} />
            <Tab.Screen name='History' component={History} />
            <Tab.Screen name='Predict' component={Predict} />
            {/* <Tab.Screen name='Live Detection' component={LiveDetection} /> */}
            <Tab.Screen name='Marketplace' component={Marketplace} />
            <Tab.Screen
                name='Logout'
                component={() => <LogoutButton navigation={navigation} />}
            />
        </Tab.Navigator>
    )
}

export default CustomerNavigator
