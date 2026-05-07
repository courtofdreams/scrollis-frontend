// App.tsx
import React, { useEffect, useState } from 'react'
import { NavigationContainer, DefaultTheme } from '@react-navigation/native'
import { TwitterAuthProvider } from './src/contexts/AppAuthContext'
import RootNavigator from './src/navigators/RootNavigator'
import { clearAllSessions } from './src/utils/TokenManager';
import { AnalysisProvider } from './src/contexts/AnalysisContext';
import ScrolisSplash, { useSplashTransition } from './src/screens/ScrolisSplash';
import { Animated, StyleSheet } from "react-native";


export default function App() {

  const [showAnimatedSplash, setShowAnimatedSplash] = useState(true);
  const { translateY, trigger } = useSplashTransition(() => {
    setShowAnimatedSplash(false);
  });

  useEffect(() => {
    clearAllSessions();
  }, []);

  return (
    <TwitterAuthProvider>
      <AnalysisProvider>
        <NavigationContainer >
          <RootNavigator />

          {showAnimatedSplash && (
            <Animated.View
              style={{
                ...StyleSheet.absoluteFillObject,
                 transform: [{ translateY }],
                zIndex: 999,
              }}
            >
              <ScrolisSplash onAnimDone={trigger} />
            </Animated.View>
          )}
        </NavigationContainer>
      </AnalysisProvider>
    </TwitterAuthProvider>

  )
}
