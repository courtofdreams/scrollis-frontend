// App.tsx
import React, { useEffect, useState } from 'react'
import { NavigationContainer, DefaultTheme } from '@react-navigation/native'
import { TwitterAuthProvider } from './src/contexts/AppAuthContext'
import RootNavigator from './src/navigators/RootNavigator'
import { clearAllSessions } from './src/utils/TokenManager';
import { AnalysisProvider } from './src/contexts/AnalysisContext';
import * as SplashScreen from 'expo-splash-screen';
import ScrolisSplash from './src/screens/ScrolisSplash';

SplashScreen.preventAutoHideAsync();

export default function App() {

  const [showAnimatedSplash, setShowAnimatedSplash] = useState(true);

  useEffect(() => {
    async function prepare() {
      // fonts/api preload etc
      await SplashScreen.hideAsync(); // hide native splash only when ready
    }

    clearAllSessions();
    prepare();
  }, []);

  return (
    <TwitterAuthProvider>
      <AnalysisProvider>
        <NavigationContainer >
          <RootNavigator />
        </NavigationContainer>
      </AnalysisProvider>
    </TwitterAuthProvider>
  )
}
