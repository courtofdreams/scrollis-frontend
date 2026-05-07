// src/navigation/RootNavigator.tsx
import React, { useEffect, useState } from 'react'
import { createNativeStackNavigator, NativeStackNavigationProp } from '@react-navigation/native-stack'
import { useTwitterAuth } from '../hooks/useTwitterAuth'
import LoginScreen from '../screens/LoginScreen'
import MainScreen from '../screens/MainTabs'
import StartingScreen from '../screens/StartingScreen'
import CreateAccountScreen from '../screens/CreateAccountScreen'
import { TransitionPresets } from '@react-navigation/stack'
import { useAppAuthContext } from '../contexts/AppAuthContext'
import SocialMediaSyncScreen from '../screens/SocialMediaSyncScreen'
import BuildingDigestScreen from '../screens/BuildingDigestScreen'
import TopicsReadyScreen from '../screens/TopicReadyScreen'
import OnboardingScreen from '../screens/OnboardingScreen'
import ErrorScreen from '../screens/ErrorScreen'
import FeedSkeletonScreen from '../screens/FeedSkeletonScreen'

export type RootStackParamList = {
  Login: undefined
  Main: undefined
  Starting: undefined
  CreateAccount: undefined
  SocialMediaSync: undefined
  BuildingDigest: undefined
  TopicReady: undefined
  Onboarding: {
    currentIndex?: number
  }
  Error: undefined
  FeedSkeletonScreen: undefined
}


export type RootStackNavigationProp = NativeStackNavigationProp<
  RootStackParamList
>

const Stack = createNativeStackNavigator<RootStackParamList>()

export default function RootNavigator() {
  const { isAuthenticated, needToConnectedSocial, isAuthHydrated, hasPersistedSession } = useAppAuthContext()
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    return null
  }

  if (!isAuthHydrated) {
    return null
  }

  const needSession = isAuthenticated && !needToConnectedSocial && hasPersistedSession

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!needSession ? (
        <>
          <Stack.Screen name="Starting" component={StartingScreen} options={{ animation: 'slide_from_right' }} />
          <Stack.Screen name="Onboarding" component={OnboardingScreen} options={{ animation: 'slide_from_right' }} />
          <Stack.Screen name="Login" component={LoginScreen} options={{ animation: 'slide_from_right' }} />
          <Stack.Screen name="CreateAccount" component={CreateAccountScreen} options={{ animation: 'none' }} />
          <Stack.Screen name="SocialMediaSync" component={SocialMediaSyncScreen} options={{ animation: 'slide_from_right' }} />
          <Stack.Screen name="BuildingDigest" component={BuildingDigestScreen} options={{ animation: 'slide_from_right' }} />
          <Stack.Screen name="TopicReady" component={TopicsReadyScreen} options={{ animation: 'slide_from_right' }} />
          <Stack.Screen name="Error" component={ErrorScreen} options={{ animation: 'none' }} />
          <Stack.Screen name="Main" component={MainScreen} options={{ animation: 'none' }} />
          <Stack.Screen name="FeedSkeletonScreen" component={FeedSkeletonScreen} options={{ animation: 'none' }} />
        </>
      ) : (
        <>
          <Stack.Screen name="FeedSkeletonScreen" component={FeedSkeletonScreen} options={{ animation: 'none' }} />
          <Stack.Screen name="Error" component={ErrorScreen} options={{ animation: 'none' }} />
          <Stack.Screen name="Main" component={MainScreen} options={{ animation: 'none' }} />
        </>
      )}
    </Stack.Navigator>
  )
}