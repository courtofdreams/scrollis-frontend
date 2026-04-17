// App.tsx
import React from 'react'
import { NavigationContainer, DefaultTheme } from '@react-navigation/native'
import { TwitterAuthProvider } from './src/contexts/AppAuthContext'
import RootNavigator from './src/navigators/RootNavigator'


const MyTheme = {
  ...DefaultTheme,
  colors: {
    background: '#fff', // Your custom background color
  },
};

export default function App() {
  return (
    <TwitterAuthProvider>
      <NavigationContainer >
        <RootNavigator />
      </NavigationContainer>
    </TwitterAuthProvider>
  )
}
