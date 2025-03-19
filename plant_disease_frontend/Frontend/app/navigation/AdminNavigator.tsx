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
import ScreenWrapper from '@/components/ScreenWrapper'
import Icon from 'react-native-vector-icons/MaterialIcons'
import WelcomePage from '../screens/WelcomePage'
import { StyleSheet } from 'react-native'

const Tab = createBottomTabNavigator()
const Stack = createStackNavigator()

const SellerStack = () => (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name='AllSellers'>
            {(props) => (
                <ScreenWrapper>
                    <AllSellers {...props} />
                </ScreenWrapper>
            )}
        </Stack.Screen>
        <Stack.Screen
            name='SellerDetails'
            component={() => (
                <ScreenWrapper>
                    <SellerDetails />
                </ScreenWrapper>
            )}
        />
    </Stack.Navigator>
)

const AdminNavigator = ({
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
                    } else if (route.name === 'Requests') {
                        iconName = 'person-add'
                    } else if (route.name === 'Sellers') {
                        iconName = 'store'
                    } else if (route.name === 'Specialists') {
                        iconName = 'medical-services'
                    } else if (route.name === 'Feedback') {
                        iconName = 'feedback'
                    } else if (route.name === 'Logout') {
                        iconName = 'logout'
                    }

                    return <Icon name={iconName} size={size} color={color} />
                },
                tabBarActiveTintColor: '#007BFF',
                tabBarInactiveTintColor: 'black',
                tabBarStyle: [styles.tabBarStyle],
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
                name='Requests'
                component={() => (
                    <ScreenWrapper>
                        <UserRequests />
                    </ScreenWrapper>
                )}
                options={{
                    headerShown: false,
                }}
            />
            <Tab.Screen
                name='Sellers'
                component={SellerStack}
                options={{
                    headerShown: false,
                }}
            />
            <Tab.Screen
                name='Specialists'
                component={() => (
                    <ScreenWrapper>
                        <AllSpecialists />
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
                        <AllFeedback />
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

const styles = StyleSheet.create({
    tabBarStyle: {
        backgroundColor: 'rgb(136, 236, 136)',
        borderTopWidth: 0,
        elevation: 0,
        position: 'absolute',
    },
})

export default AdminNavigator
