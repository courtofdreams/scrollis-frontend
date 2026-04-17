// src/navigation/FeedStackNavigator.tsx
import React from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import FeedScreen from '../screens/FeedScreen'
import TopicDetailScreen from '../screens/TopicDetailScreen'


export type FeedStackParamList = {
  FeedHome: undefined
  TopicDetail: {
    topicTitle: string
    summary: string
    postCount: number
    topicId?: string  
  }
}

const Stack = createNativeStackNavigator<FeedStackParamList>()


export default function FeedStackNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="FeedHome"
        component={FeedScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="TopicDetail"
        component={TopicDetailScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  )
}