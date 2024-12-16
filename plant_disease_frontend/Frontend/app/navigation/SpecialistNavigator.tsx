import React from 'react'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import UnknownImages from '../screens/specialist/UnknownImages'
import LogoutButton from '@/components/LogoutButton'

const Tab = createBottomTabNavigator()

import { NavigationProp } from '@react-navigation/native'

const SpecialistNavigator = ({
    navigation,
}: {
    navigation: NavigationProp<any>
}) => {
    return (
        <Tab.Navigator>
            <Tab.Screen name='Unknown Images' component={UnknownImages} />
            <Tab.Screen
                name='Logout'
                component={() => <LogoutButton navigation={navigation} />}
            />
        </Tab.Navigator>
    )
}

export default SpecialistNavigator
