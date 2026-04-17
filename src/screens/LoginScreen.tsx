// src/screens/LoginScreen.tsx
import React from 'react'
import { View, Text, Button } from 'react-native'
import { useTwitterAuth } from '../hooks/useTwitterAuth'
import TwitterButton from '../components/TwitterButton'
import RedditButton from '../components/RedditButton'
import PrimaryButton from '../components/PrimaryButton'
import { useRedditAuth } from '../hooks/useRedditAuth'

export default function LoginScreen() {
  const { signIn, loading, isTwitterAuthenticated } = useTwitterAuth()
  const { signIn: signInReddit, loading: loadingReddit, isRedditAuthenticated } = useRedditAuth()

  return (
    <View style={{ flex: 1, justifyContent: 'center', padding: 24 }}>
      <Text style={{ fontSize: 24, marginBottom: 16 }}>Connect to your social media accounts</Text>
      <TwitterButton
        // title={loading ? 'Signing in...' : 'Login with X'}
        onPress={() => signIn().catch(console.error)}
        isAuthenticated={isTwitterAuthenticated}
      />
      <RedditButton title={loading ? 'Signing in...' : 'Login with Reddit'} onPress={() => signInReddit().catch(console.error)} />
     <PrimaryButton title="Continue" onPress={() => {}} />   
    </View>
  )
}