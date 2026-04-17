// src/navigation/ExploreStackNavigator.tsx
import React from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import ExploreScreen from '../screens/ExploreScreen'

const Stack = createNativeStackNavigator()

export default function ExploreStackNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="ExploreHome"
        component={ExploreScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  )
}