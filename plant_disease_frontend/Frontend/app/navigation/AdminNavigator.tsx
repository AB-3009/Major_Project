import React from 'react'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import UserRequests from '../screens/admin/UserRequests'
import AllSellers from '../screens/admin/AllSellers'
import SellerDetails from '../screens/admin/SellerDetails'
import AllSpecialists from '../screens/admin/AllSpecialists'
import AllFeedback from '../screens/admin/AllFeedback'
import LogoutButton from '../../components/LogoutButton'
import { NavigationProp } from '@react-navigation/native'
import { createStackNavigator } from '@react-navigation/stack'

const Tab = createBottomTabNavigator()
const Stack = createStackNavigator()

const SellerStack = () => (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name='AllSellers' component={AllSellers} />
        <Stack.Screen name='SellerDetails' component={SellerDetails} />
    </Stack.Navigator>
)

const AdminNavigator = ({
    navigation,
}: {
    navigation: NavigationProp<any>
}) => {
    return (
        <Tab.Navigator>
            <Tab.Screen name='User Requests' component={UserRequests} />
            <Tab.Screen name='Sellers' component={SellerStack} />
            <Tab.Screen name='All Specialists' component={AllSpecialists} />
            <Tab.Screen name='All Feedback' component={AllFeedback} />
            <Tab.Screen
                name='Logout'
                component={() => <LogoutButton navigation={navigation} />}
            />
        </Tab.Navigator>
    )
}

export default AdminNavigator
