

import React, { useState } from 'react';

import { Alert, Image, ImageProps, StyleSheet } from 'react-native';
import { clearAllSessions } from '../utils/TokenManager';

export default function LogoIcon() {

    const [tapCount, setTapCount] = useState(0);

  const handleLogoPress = async (_imageProps: ImageProps) => {
    const newCount = tapCount + 1;

    if (newCount >= 10) {
      setTapCount(0); // reset
      clearAllSessions();
      Alert.alert('Developer Mode', 'Clear All Sessions, Please restart the app.');
      return;
    }

    setTapCount(newCount);
  };
  
  return (
    <Image
      source={require('../assets/logo.png')}
      style={styles.logo}
      onPress={handleLogoPress}
    />
  );
}   

const styles = StyleSheet.create({
  logo: {
    width: 80,
    height: 80,
    marginBottom: 12,
  },
});
