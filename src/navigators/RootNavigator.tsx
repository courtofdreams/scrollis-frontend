// src/navigation/RootNavigator.tsx
import React from 'react'
import { createNativeStackNavigator, NativeStackNavigationProp } from '@react-navigation/native-stack'
import { useTwitterAuth } from '../hooks/useTwitterAuth'
import LoginScreen from '../screens/LoginScreen'
import MainScreen from '../screens/MainTabs'
import StartingScreen from '../screens/StartingScreen'
import CreateAccountScreen from '../screens/CreateAccountScreen'
import { TransitionPresets } from '@react-navigation/stack'

export type RootStackParamList = {
  Login: undefined
  Main: undefined
  Starting: undefined
  CreateAccount: undefined
}


export type RootStackNavigationProp = NativeStackNavigationProp<
  RootStackParamList
>


const Stack = createNativeStackNavigator<RootStackParamList>()

export default function RootNavigator() {
  const { isAuthenticated } = useTwitterAuth()

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isAuthenticated ? (
        <Stack.Screen name="Main" component={MainScreen} />
      ) : (
        <Stack.Group>
          <Stack.Screen name="Starting" component={LoginScreen} options={{animation: 'slide_from_left',}} />
          {/* <Stack.Screen name="CreateAccount" component={CreateAccountScreen} options={{animation: 'slide_from_right',}}/> */}
        </Stack.Group>
      )}
    </Stack.Navigator>
  )
}