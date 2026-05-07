import React from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import ProfileScreen from '../screens/ProfileScreen'
import ArchivesScreen from '../screens/ArchivesScreen'

export type ProfileStackParamList = {
  ProfileHome: undefined
  Archives: undefined
}

const Stack = createNativeStackNavigator<ProfileStackParamList>()

export default function ProfileStackNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="ProfileHome"
        component={ProfileScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Archives"
        component={ArchivesScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  )
}
